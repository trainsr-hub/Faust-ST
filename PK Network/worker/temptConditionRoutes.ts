import { Hono } from 'hono';
import { TursoClient } from './turso';
import { ensureTemptConditionInfrastructure } from './temptInfrastructure';

function parseJsonSafe(val: any, fallback: any = []): any {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  if (typeof val === 'string') {
    if (val.trim() === '[object Object]' || val.trim() === '') return fallback;
    try {
      const parsed = JSON.parse(val);
      return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export function registerTemptConditionRoutes(app: Hono<any>, getTurso: (c: any) => TursoClient) {
  // GET all tempt records
  app.get('/api/condition-studio/tempt/all', async (c) => {
    try {
      const turso = getTurso(c);
      await ensureTemptConditionInfrastructure(turso);

      const [cRes, gRes, pRes] = await Promise.all([
        turso.execute('SELECT * FROM tempt_conditions ORDER BY category, natural_question;'),
        turso.execute('SELECT * FROM tempt_prompt_groups ORDER BY category, name;'),
        turso.execute('SELECT * FROM tempt_prompts ORDER BY name;'),
      ]);

      const conditions = cRes.rows.map((r: any) => ({
        id: r.id,
        naturalQuestion: r.natural_question,
        description: r.description || '',
        category: r.category,
        defaultState: Boolean(r.default_state),
      }));

      const groups = gRes.rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        category: r.category,
        description: r.description || '',
        selectionMode: r.selection_mode || 'single',
        dependsOnConditions: parseJsonSafe(r.depends_on_conditions, []),
        bringsAboutConditions: parseJsonSafe(r.brings_about_conditions, []),
      }));

      const prompts = pRes.rows.map((r: any) => ({
        id: r.id,
        tag: r.tag,
        name: r.name,
        groupId: r.group_id,
        imageUrl: r.image_url || undefined,
        wikiUrl: r.wiki_url || undefined,
        description: r.description || '',
        extraTokens: parseJsonSafe(r.extra_tokens, []),
        specificBringsAbout: parseJsonSafe(r.specific_brings_about, []),
        length: parseJsonSafe(r.length, []),
        dependOn: parseJsonSafe(r.depend_on, []),
      }));

      return c.json({ success: true, conditions, groups, prompts });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // POST / update prompt
  app.post('/api/condition-studio/tempt/prompt', async (c) => {
    try {
      const turso = getTurso(c);
      const b = await c.req.json();
      await turso.execute(
        `INSERT OR REPLACE INTO tempt_prompts (id, tag, name, group_id, image_url, wiki_url, description, extra_tokens, specific_brings_about, length, depend_on)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          b.id,
          b.tag,
          b.name || b.tag,
          b.groupId || 'forehead_accents',
          b.imageUrl || null,
          b.wikiUrl || null,
          b.description || '',
          JSON.stringify(b.extraTokens || []),
          JSON.stringify(b.specificBringsAbout || []),
          JSON.stringify(b.length || []),
          JSON.stringify(b.dependOn || []),
        ]
      );
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // PUT / update depend_on linkage for a single prompt
  app.put('/api/condition-studio/tempt/prompt/:id/depend-on', async (c) => {
    try {
      const turso = getTurso(c);
      const id = c.req.param('id');
      const { dependOn } = await c.req.json();
      await turso.execute(
        'UPDATE tempt_prompts SET depend_on = ? WHERE id = ?;',
        [JSON.stringify(dependOn || []), id]
      );
      return c.json({ success: true, id, dependOn });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // DELETE prompt
  app.delete('/api/condition-studio/tempt/prompt/:id', async (c) => {
    try {
      const turso = getTurso(c);
      const id = c.req.param('id');
      await turso.execute('DELETE FROM tempt_prompts WHERE id = ?;', [id]);
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // POST / update condition
  app.post('/api/condition-studio/tempt/condition', async (c) => {
    try {
      const turso = getTurso(c);
      const b = await c.req.json();
      await turso.execute(
        `INSERT OR REPLACE INTO tempt_conditions (id, natural_question, description, category, default_state)
         VALUES (?, ?, ?, ?, ?);`,
        [b.id, b.naturalQuestion, b.description || '', b.category, b.defaultState ? 1 : 0]
      );
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // DELETE condition
  app.delete('/api/condition-studio/tempt/condition/:id', async (c) => {
    try {
      const turso = getTurso(c);
      const id = c.req.param('id');
      await turso.execute('DELETE FROM tempt_conditions WHERE id = ?;', [id]);
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // POST / update group
  app.post('/api/condition-studio/tempt/group', async (c) => {
    try {
      const turso = getTurso(c);
      const b = await c.req.json();
      await turso.execute(
        `INSERT OR REPLACE INTO tempt_prompt_groups (id, name, category, description, selection_mode, depends_on_conditions, brings_about_conditions)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [
          b.id,
          b.name,
          b.category,
          b.description || '',
          b.selectionMode || 'single',
          JSON.stringify(b.dependsOnConditions || []),
          JSON.stringify(b.bringsAboutConditions || []),
        ]
      );
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // DELETE group
  app.delete('/api/condition-studio/tempt/group/:id', async (c) => {
    try {
      const turso = getTurso(c);
      const id = c.req.param('id');
      await turso.execute('DELETE FROM tempt_prompt_groups WHERE id = ?;', [id]);
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // Re-clone master tables into tempt tables on demand
  app.post('/api/condition-studio/tempt/clone-from-master', async (c) => {
    try {
      const turso = getTurso(c);
      await turso.execute('DELETE FROM tempt_conditions;');
      await turso.execute('DELETE FROM tempt_prompt_groups;');
      await turso.execute('DELETE FROM tempt_prompts;');
      await turso.execute(`
        INSERT OR IGNORE INTO tempt_conditions (id, natural_question, description, category, default_state, created_at)
        SELECT id, natural_question, description, category, default_state, created_at FROM conditions;
      `);
      await turso.execute(`
        INSERT OR IGNORE INTO tempt_prompt_groups (id, name, category, description, selection_mode, depends_on_conditions, brings_about_conditions, created_at)
        SELECT id, name, category, description, selection_mode, depends_on_conditions, brings_about_conditions, created_at FROM prompt_groups;
      `);
      await turso.execute(`
        INSERT OR IGNORE INTO tempt_prompts (id, tag, name, group_id, image_url, wiki_url, description, extra_tokens, specific_brings_about, created_at)
        SELECT id, tag, name, group_id, image_url, wiki_url, description, extra_tokens, specific_brings_about, created_at FROM prompts;
      `);
      return c.json({ success: true, message: 'Tempt tables freshly re-cloned from master ontology' });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 500);
    }
  });
}
