import { TursoClient } from './turso';

export { registerTournamentRoutes } from './tournamentRoutes';

export const TOURNAMENT_COLUMNS = [
  { name: 'Tournament ID', slug: 'id', type: 'hex_id', metadata: { prefix: 'TRN' } },
  { name: 'Tournament Title', slug: 'title', type: 'text_single', metadata: {} },
  { name: 'Status', slug: 'status', type: 'enum_single', metadata: { options: ['open', 'in_progress', 'completed'] } },
  { name: 'Champion', slug: 'champion', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  // West Wing Slots
  { name: 'Slot L1', slug: 'l1', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Slot L2', slug: 'l2', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Slot L3', slug: 'l3', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Slot L4', slug: 'l4', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Slot L5', slug: 'l5', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Slot L6', slug: 'l6', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Slot L7', slug: 'l7', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Slot L8', slug: 'l8', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Slot L9 (QF)', slug: 'l9', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Slot L10 (QF)', slug: 'l10', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Slot L11 (QF)', slug: 'l11', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Slot L12 (QF)', slug: 'l12', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Slot L13 (SF)', slug: 'l13', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Slot L14 (SF)', slug: 'l14', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Slot L15 (Finals)', slug: 'l15', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  // East Wing Slots
  { name: 'Slot R1', slug: 'r1', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Slot R2', slug: 'r2', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Slot R3', slug: 'r3', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Slot R4', slug: 'r4', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Slot R5', slug: 'r5', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Slot R6', slug: 'r6', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Slot R7', slug: 'r7', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Slot R8', slug: 'r8', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Slot R9 (QF)', slug: 'r9', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Slot R10 (QF)', slug: 'r10', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Slot R11 (QF)', slug: 'r11', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Slot R12 (QF)', slug: 'r12', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Slot R13 (SF)', slug: 'r13', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Slot R14 (SF)', slug: 'r14', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Slot R15 (Finals)', slug: 'r15', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Scores JSON', slug: 'scores_json', type: 'text_multi', metadata: {} },
];

export const CHARACTER_IMAGES_COLUMNS = [
  { name: 'Image ID', slug: 'id', type: 'hex_id', metadata: { prefix: 'IMG' } },
  { name: 'Eva Contender', slug: 'eva', type: 'relation_single', metadata: { target: 'evas', target_field: 'name' } },
  { name: 'Contender Code', slug: 'code', type: 'text_single', metadata: {} },
  { name: 'Avatars (Icons)', slug: 'avatars', type: 'text_multi', metadata: {} },
  { name: 'Cards (Battle)', slug: 'cards', type: 'text_multi', metadata: {} },
  { name: 'Portraits (Full Body)', slug: 'portraits', type: 'text_multi', metadata: {} },
  { name: 'Scenes (Climax/Lore)', slug: 'scenes', type: 'text_multi', metadata: {} },
  { name: 'Notes', slug: 'notes', type: 'text_multi', metadata: {} },
];

export async function ensureTournamentInfrastructure(turso: TursoClient) {
  // 1. DDL for tournaments table
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      champion TEXT,
      l1 TEXT, l2 TEXT, l3 TEXT, l4 TEXT,
      l5 TEXT, l6 TEXT, l7 TEXT, l8 TEXT,
      l9 TEXT, l10 TEXT, l11 TEXT, l12 TEXT,
      l13 TEXT, l14 TEXT,
      l15 TEXT,
      r1 TEXT, r2 TEXT, r3 TEXT, r4 TEXT,
      r5 TEXT, r6 TEXT, r7 TEXT, r8 TEXT,
      r9 TEXT, r10 TEXT, r11 TEXT, r12 TEXT,
      r13 TEXT, r14 TEXT,
      r15 TEXT,
      scores_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. DDL for character_images 2D matrix
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS character_images (
      id TEXT PRIMARY KEY,
      eva TEXT,
      code TEXT,
      avatars JSON NOT NULL DEFAULT '{}',
      cards JSON DEFAULT '{}',
      portraits JSON DEFAULT '{}',
      scenes JSON DEFAULT '{}',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Register 'tournaments' and 'character_images' in tables registry
  try {
    await turso.execute(`
      INSERT OR IGNORE INTO tables (id, name, group_id, order_index, icon, description)
      VALUES ('tournaments', 'Tournaments', 'gallery', 1, 'trophy', 'Hazard Championship Arena Mirrored Tournament Board');
    `);
    await turso.execute(`
      INSERT OR IGNORE INTO tables (id, name, group_id, order_index, icon, description)
      VALUES ('character_images', 'Character Images', 'gallery', 2, 'image', 'Contender Image Vault and Multi-Template Matrix');
    `);
  } catch (e) {
    console.warn('Register tables warning:', e);
  }

  // 4. Register schemas in _schema_definitions only if missing
  try {
    const existingSchema = await turso.execute(`SELECT table_name FROM _schema_definitions WHERE table_name = 'tournaments';`);
    if (existingSchema.rows.length === 0) {
      await turso.execute(`
        INSERT INTO _schema_definitions (table_name, schema_json, updated_at)
        VALUES ('tournaments', ?, CURRENT_TIMESTAMP);
      `, [JSON.stringify({ table_name: 'tournaments', columns: TOURNAMENT_COLUMNS })]);
    }

    const existingImgSchema = await turso.execute(`SELECT table_name FROM _schema_definitions WHERE table_name = 'character_images';`);
    if (existingImgSchema.rows.length === 0) {
      await turso.execute(`
        INSERT INTO _schema_definitions (table_name, schema_json, updated_at)
        VALUES ('character_images', ?, CURRENT_TIMESTAMP);
      `, [JSON.stringify({ table_name: 'character_images', columns: CHARACTER_IMAGES_COLUMNS })]);
    }
  } catch (e) {
    console.warn('Register schema warning:', e);
  }

  // 5. Seed character_images mock table if empty
  try {
    const imgCountRes = await turso.execute('SELECT COUNT(*) as cnt FROM character_images;');
    const imgCount = Number(imgCountRes.rows[0]?.cnt || 0);
    if (imgCount === 0) {
      const evasForImg = await turso.execute('SELECT id, name, eva_codex FROM evas ORDER BY id ASC LIMIT 16;');
      for (const e of evasForImg.rows) {
        const rawName = Array.isArray(e.name) ? e.name[0] : (e.name || 'Contender');
        const codex = e.eva_codex || 'EVA';
        const imgId = `IMG-${e.id.slice(4, 12)}`;
        const seedParam = encodeURIComponent(rawName);

        const avatarsJson = JSON.stringify({
          default: [`https://api.dicebear.com/7.x/bottts/svg?seed=${seedParam}`],
          cyber: [`https://api.dicebear.com/7.x/identicon/svg?seed=${seedParam}`]
        });
        const cardsJson = JSON.stringify({
          tcg_foil: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80']
        });
        const portraitsJson = JSON.stringify({
          full_body: ['https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80']
        });
        const scenesJson = JSON.stringify({
          Eva_Display_Ecstasy: ['https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80']
        });

        await turso.execute(`
          INSERT INTO character_images (id, eva, code, avatars, cards, portraits, scenes, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `, [
          imgId,
          e.id,
          codex,
          avatarsJson,
          cardsJson,
          portraitsJson,
          scenesJson,
          `Visual Matrix Vault for ${rawName}`
        ]);
      }
    }
  } catch (e) {
    console.warn('Seed character_images error:', e);
  }

  // 6. Check if tournament exists; seed TRN-2026-001 if empty
  try {
    const countRes = await turso.execute('SELECT COUNT(*) as cnt FROM tournaments;');
    const count = Number(countRes.rows[0]?.cnt || 0);
    if (count === 0) {
      const evasRes = await turso.execute('SELECT id, name, tournament_name FROM evas ORDER BY id ASC LIMIT 16;');
      const evaIds = evasRes.rows.map((r: any) => r.id);

      const slots: Record<string, string | null> = {};
      for (let i = 1; i <= 8; i++) slots[`l${i}`] = evaIds[i - 1] || null;
      for (let i = 1; i <= 8; i++) slots[`r${i}`] = evaIds[8 + i - 1] || null;

      await turso.execute(`
        INSERT INTO tournaments (
          id, title, status, champion,
          l1, l2, l3, l4, l5, l6, l7, l8,
          l9, l10, l11, l12, l13, l14, l15,
          r1, r2, r3, r4, r5, r6, r7, r8,
          r9, r10, r11, r12, r13, r14, r15,
          scores_json
        ) VALUES (
          'TRN-2026-001', 'Hazard All-Stars Season 1', 'open', NULL,
          ?, ?, ?, ?, ?, ?, ?, ?,
          NULL, NULL, NULL, NULL, NULL, NULL, NULL,
          ?, ?, ?, ?, ?, ?, ?, ?,
          NULL, NULL, NULL, NULL, NULL, NULL, NULL,
          '{}'
        );
      `, [
        slots.l1, slots.l2, slots.l3, slots.l4, slots.l5, slots.l6, slots.l7, slots.l8,
        slots.r1, slots.r2, slots.r3, slots.r4, slots.r5, slots.r6, slots.r7, slots.r8
      ]);
    }
  } catch (e) {
    console.warn('Seed tournament error:', e);
  }
}
