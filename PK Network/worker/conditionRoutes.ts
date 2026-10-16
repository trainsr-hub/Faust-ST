import { Hono } from 'hono';
import { TursoClient } from './turso';

export async function ensureConditionInfrastructure(turso: TursoClient) {
  // 1. DDL for conditions table
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS conditions (
      id TEXT PRIMARY KEY,
      natural_question TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      default_state INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // 2. DDL for prompt_groups table
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS prompt_groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      selection_mode TEXT DEFAULT 'single',
      depends_on_conditions TEXT DEFAULT '[]',
      brings_about_conditions TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // 3. DDL for prompts table
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS prompts (
      id TEXT PRIMARY KEY,
      tag TEXT NOT NULL,
      name TEXT NOT NULL,
      group_id TEXT NOT NULL,
      image_url TEXT,
      wiki_url TEXT,
      description TEXT,
      extra_tokens TEXT DEFAULT '[]',
      specific_brings_about TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // 4. Ensure ontology group in table_groups
  try {
    await turso.execute(`
      INSERT OR IGNORE INTO table_groups (id, natural_name, sub_group_of, order_index, icon, description)
      VALUES ('grp_ontology', 'Hair & Trait Ontology', NULL, 5, 'sparkles', '3-Tier Relational Condition Architecture');
    `);

    // Register tables in master tables registry
    await turso.execute(`
      INSERT OR REPLACE INTO tables (id, name, parent_id, order_index, icon, description, group_id)
      VALUES 
        ('conditions', 'Conditions (Predicates)', NULL, 1, 'help-circle', 'Natural reality conditions and state flags', 'grp_ontology'),
        ('prompt_groups', 'Prompt Groups (Bridges)', NULL, 2, 'layers', 'Conditioning bridges defining preconditions & postconditions', 'grp_ontology'),
        ('prompts', 'Prompts (Tokens & CDN)', NULL, 3, 'sparkles', 'Atomic prompt tokens with authentic Danbooru CDN media', 'grp_ontology');
    `);
  } catch (e) {
    console.warn('ensureConditionInfrastructure table registration note:', e);
  }
}

export function registerConditionRoutes(app: Hono<any>, getTurso: (c: any) => TursoClient) {
  // GET all conditions, groups, and prompts in one call
  app.get('/api/condition-studio/all', async (c) => {
    try {
      const turso = getTurso(c);
      await ensureConditionInfrastructure(turso);

      const [cRes, gRes, pRes] = await Promise.all([
        turso.execute('SELECT * FROM conditions ORDER BY category, natural_question;'),
        turso.execute('SELECT * FROM prompt_groups ORDER BY category, name;'),
        turso.execute('SELECT * FROM prompts ORDER BY name;'),
      ]);

      const conditions = cRes.rows.map((r: any) => ({
        id: r.id,
        naturalQuestion: r.natural_question,
        description: r.description || '',
        category: r.category,
        defaultState: Boolean(r.default_state),
      }));

function parseJsonSafe(val: any, fallback: any = []): any {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  if (typeof val === 'string') {
    if (val.trim() === '[object Object]' || val.trim() === '') return fallback;
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed === 'string') {
        try { return JSON.parse(parsed); } catch { return parsed; }
      }
      return parsed;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

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
        imageUrl: r.image_url || '',
        wikiUrl: r.wiki_url || '',
        description: r.description || '',
        extraTokens: parseJsonSafe(r.extra_tokens, []),
        specificBringsAbout: parseJsonSafe(r.specific_brings_about, []),
      }));

      return c.json({ success: true, conditions, groups, prompts });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // POST Create / Update Condition
  app.post('/api/condition-studio/condition', async (c) => {
    try {
      const turso = getTurso(c);
      const b = await c.req.json();
      if (!b.id || !b.naturalQuestion || !b.category) {
        return c.json({ success: false, error: 'id, naturalQuestion, and category are required' }, 400);
      }
      await turso.execute(
        `INSERT OR REPLACE INTO conditions (id, natural_question, description, category, default_state)
         VALUES (?, ?, ?, ?, ?);`,
        [b.id, b.naturalQuestion, b.description || '', b.category, b.defaultState ? 1 : 0]
      );
      return c.json({ success: true, condition: b });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // DELETE Condition
  app.delete('/api/condition-studio/condition/:id', async (c) => {
    try {
      const turso = getTurso(c);
      const id = c.req.param('id');
      await turso.execute('DELETE FROM conditions WHERE id = ?;', [id]);
      return c.json({ success: true, id });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // POST Create / Update Group
  app.post('/api/condition-studio/group', async (c) => {
    try {
      const turso = getTurso(c);
      const b = await c.req.json();
      if (!b.id || !b.name || !b.category) {
        return c.json({ success: false, error: 'id, name, and category are required' }, 400);
      }
      await turso.execute(
        `INSERT OR REPLACE INTO prompt_groups 
         (id, name, category, description, selection_mode, depends_on_conditions, brings_about_conditions)
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
      return c.json({ success: true, group: b });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // DELETE Group
  app.delete('/api/condition-studio/group/:id', async (c) => {
    try {
      const turso = getTurso(c);
      const id = c.req.param('id');
      await turso.execute('DELETE FROM prompts WHERE group_id = ?;', [id]);
      await turso.execute('DELETE FROM prompt_groups WHERE id = ?;', [id]);
      return c.json({ success: true, id });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // POST Create / Update Prompt
  app.post('/api/condition-studio/prompt', async (c) => {
    try {
      const turso = getTurso(c);
      const b = await c.req.json();
      if (!b.id || !b.tag || !b.name || !b.groupId) {
        return c.json({ success: false, error: 'id, tag, name, and groupId are required' }, 400);
      }
      await turso.execute(
        `INSERT OR REPLACE INTO prompts 
         (id, tag, name, group_id, image_url, wiki_url, description, extra_tokens, specific_brings_about)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          b.id,
          b.tag,
          b.name,
          b.groupId,
          b.imageUrl || '',
          b.wikiUrl || '',
          b.description || '',
          JSON.stringify(b.extraTokens || []),
          JSON.stringify(b.specificBringsAbout || []),
        ]
      );
      return c.json({ success: true, prompt: b });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // DELETE Prompt
  app.delete('/api/condition-studio/prompt/:id', async (c) => {
    try {
      const turso = getTurso(c);
      const id = c.req.param('id');
      await turso.execute('DELETE FROM prompts WHERE id = ?;', [id]);
      return c.json({ success: true, id });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // POST Seed Initial Authentic Records
  app.post('/api/condition-studio/seed', async (c) => {
    try {
      const turso = getTurso(c);
      await ensureConditionInfrastructure(turso);

      const conditions = [
        ['has_bangs', 'Have bangs / fringe?', 'Front hair covering or framing forehead/browline', 'Front', 0],
        ['has_parting', 'Have parted fringe/hair?', 'Bangs or front hairline split into distinct sections', 'Front', 0],
        ['forehead_exposed', 'Forehead exposed / bare?', 'Browline and forehead completely visible with no fringe', 'Front', 1],
        ['has_sidelocks', 'Have temple sidelocks?', 'Side strands framing cheekbones and ears', 'Framing', 0],
        ['hair_tied_up', 'Hair tied up or gathered?', 'Hair pulled up into ponytail, bun, braids, or updo', 'Coiffure', 0],
        ['has_braids', 'Have braids present?', 'Plaited or braided hair strands', 'Coiffure', 0],
        ['has_twintails', 'Have bilateral twintails?', 'Dual hair bunches tied on left and right sides', 'Coiffure', 0],
        ['has_buns', 'Have hair bun(s) / odango?', 'Coiled hair chignon or buns', 'Coiffure', 0],
        ['long_hair', 'Hair is long (chest+)?', 'Length extends beyond shoulder blades to chest or waist', 'Length', 0],
        ['short_hair', 'Hair is short (chin-)?', 'Cropped bob or pixie cut above collarbone', 'Length', 0],
      ];

      for (const [id, q, desc, cat, def] of conditions) {
        await turso.execute(
          `INSERT OR REPLACE INTO conditions (id, natural_question, description, category, default_state)
           VALUES (?, ?, ?, ?, ?);`,
          [id, q, desc, cat, def]
        );
      }

      const groups = [
        ['fringe_cut', 'Bangs Fringe Cut', 'Front Facial', 'The horizontal edge profile of the forehead fringe', 'single', '[]', JSON.stringify([{ conditionId: 'has_bangs', setValue: true }, { conditionId: 'forehead_exposed', setValue: false }])],
        ['bangs_parting', 'Bangs Parting Topology', 'Front Facial', 'How the fringe divides across the brow', 'single', JSON.stringify([{ conditionId: 'has_bangs', expectedValue: true }]), JSON.stringify([{ conditionId: 'has_parting', setValue: true }])],
        ['forehead_accents', 'Forehead Center Accents', 'Front Facial', 'Specific center strands (center flap, center drop)', 'single', JSON.stringify([{ conditionId: 'has_bangs', expectedValue: true }, { conditionId: 'has_parting', expectedValue: true }]), '[]'],
        ['side_framing', 'Cheek & Temple Framing', 'Framing', 'Vertical strands framing the face', 'single', '[]', JSON.stringify([{ conditionId: 'has_sidelocks', setValue: true }])],
        ['tied_coiffure', 'Tied Updo Coiffure', 'Coiffure', 'Primary hair gathering: ponytails, buns, braids', 'single', '[]', JSON.stringify([{ conditionId: 'hair_tied_up', setValue: true }])],
        ['braid_variations', 'Braid Styling Variations', 'Coiffure', 'Detailed braid configurations and weaves', 'single', JSON.stringify([{ conditionId: 'has_braids', expectedValue: true }]), JSON.stringify([{ conditionId: 'hair_tied_up', setValue: true }])],
      ];

      for (const [id, name, cat, desc, mode, dep, brg] of groups) {
        await turso.execute(
          `INSERT OR REPLACE INTO prompt_groups (id, name, category, description, selection_mode, depends_on_conditions, brings_about_conditions)
           VALUES (?, ?, ?, ?, ?, ?, ?);`,
          [id, name, cat, desc, mode, dep, brg]
        );
      }

      const prompts = [
        ['blunt_bangs', 'blunt bangs', 'Blunt Bangs', 'fringe_cut', 'https://cdn.donmai.us/720x720/40/7a/407a8b53ac0a9d693afd922d0d38425d.webp', 'https://danbooru.donmai.us/wiki_pages/blunt_bangs', 'Straight-across cut fringe across browline', '[]', '[]'],
        ['choppy_bangs', 'choppy bangs', 'Choppy Bangs', 'fringe_cut', 'https://cdn.donmai.us/720x720/79/bc/79bc1828aa39634879a890697faff958.webp', 'https://danbooru.donmai.us/wiki_pages/choppy_bangs', 'Textured, jagged fringe tips with natural variation', '[]', '[]'],
        ['wispy_bangs', 'wispy bangs', 'Wispy Bangs', 'fringe_cut', 'https://cdn.donmai.us/720x720/a5/6a/a56ad961ce25bcea6300912762e74cb4.webp', 'https://danbooru.donmai.us/wiki_pages/wispy_bangs', 'Thin see-through air bangs revealing forehead behind', '[]', '[]'],
        ['parted_bangs', 'parted bangs', 'Parted Bangs', 'bangs_parting', 'https://cdn.donmai.us/720x720/9d/d3/9dd38a1c8be4dd1cce1647cf0982f2f4.webp', 'https://danbooru.donmai.us/wiki_pages/parted_bangs', 'Single parting exposing part of the forehead', '[]', '[]'],
        ['double_parted_bangs', 'double-parted bangs', 'Double-Parted Bangs', 'bangs_parting', 'https://cdn.donmai.us/720x720/6e/b7/6eb7e93e3bf31f38e6b7988987592b2a.webp', 'https://danbooru.donmai.us/wiki_pages/double-parted_bangs', 'Fringe parted at both left and right temple lines', '[]', '[]'],
        ['center_flap_bangs', 'center-flap bangs', 'Center-Flap Bangs', 'forehead_accents', 'https://cdn.donmai.us/720x720/d7/37/d7373a9f5abfa67e6cccf38cf4016958.webp', 'https://danbooru.donmai.us/wiki_pages/centerflap_bangs', 'Rectangular center flap hanging over forehead between dual partings', '[]', '[]'],
        ['hair_between_eyes', 'hair between eyes', 'Hair Between Eyes', 'forehead_accents', 'https://cdn.donmai.us/720x720/42/a5/42a58b9b55e47c9a2dcb0c2e0c8970fa.webp', 'https://danbooru.donmai.us/wiki_pages/hair_between_eyes', 'Single slender center strand falling directly between eyebrows', '[]', '[]'],
        ['sidelocks', 'sidelocks', 'Sidelocks', 'side_framing', 'https://cdn.donmai.us/720x720/ba/cd/bacd3ff32f506a8004f4ee2ed4215aae.webp', 'https://danbooru.donmai.us/wiki_pages/sidelocks', 'Distinct hair strands dangling forward in front of ears', '[]', '[]'],
        ['drill_sidelocks', 'drill sidelocks', 'Drill Sidelocks', 'side_framing', 'https://cdn.donmai.us/720x720/28/1c/281caa5b45210c11b529dc8ad6ec9e8b.webp', 'https://danbooru.donmai.us/wiki_pages/drill_sidelocks', 'Sidelocks curled into tight spiral ojou-sama drills', '[]', '[]'],
        ['high_ponytail', 'high ponytail', 'High Ponytail', 'tied_coiffure', 'https://cdn.donmai.us/720x720/67/90/6790036120193ca82936b06b098c1cb4.webp', 'https://danbooru.donmai.us/wiki_pages/high_ponytail', 'Single gathered hair bunch tied high on crown', '[]', '[]'],
        ['twin_braids', 'twin braids', 'Twin Braids', 'tied_coiffure', 'https://cdn.donmai.us/720x720/ad/7e/ad7e88312fc480ff6dad121672342f8f.webp', 'https://danbooru.donmai.us/wiki_pages/twin_braids', 'Two separate braided plaits descending on both sides', '[]', JSON.stringify([{ conditionId: 'has_braids', setValue: true }, { conditionId: 'has_twintails', setValue: true }])],
        ['side_braid', 'side braid', 'Side Braid', 'braid_variations', 'https://cdn.donmai.us/720x720/cd/c0/cdc08ed7fba287131e3595488baf003d.webp', 'https://danbooru.donmai.us/wiki_pages/side_braid', 'Single plait resting over one shoulder', '[]', '[]'],
        ['crown_braid', 'crown braid', 'Crown Braid', 'braid_variations', 'https://cdn.donmai.us/720x720/d7/53/d753dbf6ce6d22dff06c25e10f195f7b.webp', 'https://danbooru.donmai.us/wiki_pages/crown_braid', 'Continuous braid wrapped coronet-style around head circumference', '[]', '[]'],
      ];

      for (const [id, tag, name, gid, img, wiki, desc, ext, brg] of prompts) {
        await turso.execute(
          `INSERT OR REPLACE INTO prompts (id, tag, name, group_id, image_url, wiki_url, description, extra_tokens, specific_brings_about)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [id, tag, name, gid, img, wiki, desc, ext, brg]
        );
      }

      return c.json({ success: true, seeded: { conditions: conditions.length, groups: groups.length, prompts: prompts.length } });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 500);
    }
  });
}
