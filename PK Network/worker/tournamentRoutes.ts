import { Hono } from 'hono';
import { TursoClient } from './turso';
import { ensureTournamentInfrastructure } from './tournament';

const DOWNSTREAM_MAP: Record<string, string> = {
  l1: 'l9', l2: 'l9',
  l3: 'l10', l4: 'l10',
  l5: 'l11', l6: 'l11',
  l7: 'l12', l8: 'l12',
  l9: 'l13', l10: 'l13',
  l11: 'l14', l12: 'l14',
  l13: 'l15', l14: 'l15',
  l15: 'champion',
  r1: 'r9', r2: 'r9',
  r3: 'r10', r4: 'r10',
  r5: 'r11', r6: 'r11',
  r7: 'r12', r8: 'r12',
  r9: 'r13', r10: 'r13',
  r11: 'r14', r12: 'r14',
  r13: 'r15', r14: 'r15',
  r15: 'champion'
};

export function registerTournamentRoutes(app: Hono<{ Bindings: any }>, getTurso: (c: any) => TursoClient) {
  // GET: Fetch tournament list and active tournament details
  app.get('/api/hazard/tournament', async (c) => {
    try {
      const turso = getTurso(c);
      await ensureTournamentInfrastructure(turso);

      const targetId = c.req.query('id');
      const listRes = await turso.execute('SELECT id, title, status, created_at FROM tournaments ORDER BY created_at DESC;');
      const tournaments = listRes.rows;

      let tournament = null;
      if (targetId) {
        const trnRes = await turso.execute('SELECT * FROM tournaments WHERE id = ?;', [targetId]);
        tournament = trnRes.rows[0] || null;
      }
      if (!tournament && tournaments.length > 0) {
        const trnRes = await turso.execute('SELECT * FROM tournaments ORDER BY created_at DESC LIMIT 1;');
        tournament = trnRes.rows[0] || null;
      }

      const evasRes = await turso.execute('SELECT id, eva_codex, name, tournament_name, alias, affiliate, hazard_rank, hazard_level, hair_color FROM evas ORDER BY id ASC;');
      const imagesRes = await turso.execute('SELECT id, eva, code, avatars, cards, portraits, scenes, notes FROM character_images;');

      return c.json({
        success: true,
        tournament,
        tournaments,
        evas: evasRes.rows,
        images: imagesRes.rows
      });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // POST: Assign contender directly to a slot with cascading invalidation
  app.post('/api/hazard/tournament/slot', async (c) => {
    try {
      const turso = getTurso(c);
      const { tournamentId, slot, evaId } = await c.req.json();

      if (!tournamentId || !slot) {
        return c.json({ success: false, error: 'tournamentId and slot are required' }, 400);
      }

      const currentRes = await turso.execute('SELECT * FROM tournaments WHERE id = ?;', [tournamentId]);
      if (currentRes.rows.length === 0) {
        return c.json({ success: false, error: 'Tournament not found' }, 404);
      }
      const current = currentRes.rows[0];
      const oldEvaId = current[slot];

      const updates: string[] = [`"${slot}" = ?`];
      const args: any[] = [evaId || null];

      // Recursively clear downstream slots if the previous contender had advanced
      if (oldEvaId && oldEvaId !== evaId) {
        let nextSlot: string | undefined = DOWNSTREAM_MAP[slot];
        while (nextSlot) {
          if (current[nextSlot] === oldEvaId) {
            updates.push(`"${nextSlot}" = NULL`);
          }
          nextSlot = DOWNSTREAM_MAP[nextSlot];
        }
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      args.push(tournamentId);

      const sql = `UPDATE tournaments SET ${updates.join(', ')} WHERE id = ?;`;
      await turso.execute(sql, args);

      return c.json({ success: true, message: `Slot ${slot} updated` });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // POST: Update tournament title
  app.post('/api/hazard/tournament/title', async (c) => {
    try {
      const turso = getTurso(c);
      const { tournamentId, title } = await c.req.json();

      if (!tournamentId || !title?.trim()) {
        return c.json({ success: false, error: 'tournamentId and title are required' }, 400);
      }

      await turso.execute('UPDATE tournaments SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;', [
        title.trim(),
        tournamentId
      ]);

      return c.json({ success: true, message: 'Tournament title updated' });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // POST: Create a new tournament row
  app.post('/api/hazard/tournament/create', async (c) => {
    try {
      const turso = getTurso(c);
      const body = await c.req.json().catch(() => ({}));

      const countRes = await turso.execute('SELECT COUNT(*) as cnt FROM tournaments;');
      const count = Number(countRes.rows[0]?.cnt || 0) + 1;
      const year = new Date().getFullYear();
      const id = `TRN-${year}-${String(count).padStart(3, '0')}`;
      const title = body.title?.trim() || `Tournament #${count}`;

      await turso.execute(`
        INSERT INTO tournaments (
          id, title, status, champion,
          l1, l2, l3, l4, l5, l6, l7, l8,
          l9, l10, l11, l12, l13, l14, l15,
          r1, r2, r3, r4, r5, r6, r7, r8,
          r9, r10, r11, r12, r13, r14, r15,
          scores_json
        ) VALUES (
          ?, ?, 'open', NULL,
          NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
          NULL, NULL, NULL, NULL, NULL, NULL, NULL,
          NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
          NULL, NULL, NULL, NULL, NULL, NULL, NULL,
          '{}'
        );
      `, [id, title]);

      return c.json({ success: true, id, title });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // POST: Advance match winner
  app.post('/api/hazard/tournament/advance', async (c) => {
    try {
      const turso = getTurso(c);
      const body = await c.req.json();
      const { tournamentId, targetSlot, winnerId, isGrandFinals, scoresJson, isCompleted } = body;

      if (!tournamentId) return c.json({ success: false, error: 'tournamentId is required' }, 400);

      const updates: string[] = ['updated_at = CURRENT_TIMESTAMP'];
      const args: any[] = [];

      if (targetSlot) {
        updates.push(`"${targetSlot}" = ?`);
        args.push(winnerId);
      }
      if (isGrandFinals) {
        updates.push(`champion = ?`);
        args.push(winnerId);
      }
      updates.push(`status = '${isCompleted ? 'completed' : 'in_progress'}'`);

      if (scoresJson) {
        updates.push(`scores_json = ?`);
        args.push(typeof scoresJson === 'string' ? scoresJson : JSON.stringify(scoresJson));
      }

      args.push(tournamentId);
      await turso.execute(`UPDATE tournaments SET ${updates.join(', ')} WHERE id = ?;`, args);

      return c.json({ success: true, message: 'Match advanced' });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // POST: Reset tournament bracket back to Round of 16
  app.post('/api/hazard/tournament/reset', async (c) => {
    try {
      const turso = getTurso(c);
      const body = await c.req.json().catch(() => ({}));
      const tournamentId = body.tournamentId || 'TRN-2026-001';

      await turso.execute(`
        UPDATE tournaments SET
          l9 = NULL, l10 = NULL, l11 = NULL, l12 = NULL,
          l13 = NULL, l14 = NULL, l15 = NULL,
          r9 = NULL, r10 = NULL, r11 = NULL, r12 = NULL,
          r13 = NULL, r14 = NULL, r15 = NULL,
          champion = NULL,
          status = 'open',
          scores_json = '{}',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?;
      `, [tournamentId]);

      return c.json({ success: true, message: 'Tournament reset' });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 500);
    }
  });
}
