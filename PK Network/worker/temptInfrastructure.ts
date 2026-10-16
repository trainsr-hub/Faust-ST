import { TursoClient } from './turso';

export async function ensureTemptConditionInfrastructure(turso: TursoClient) {
  // DDL for tempt tables
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS tempt_conditions (
      id TEXT PRIMARY KEY,
      natural_question TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      default_state INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS tempt_prompt_groups (
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

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS tempt_prompts (
      id TEXT PRIMARY KEY,
      tag TEXT NOT NULL,
      name TEXT NOT NULL,
      group_id TEXT NOT NULL,
      image_url TEXT,
      wiki_url TEXT,
      description TEXT,
      extra_tokens TEXT DEFAULT '[]',
      specific_brings_about TEXT DEFAULT '[]',
      length TEXT DEFAULT '[]',
      depend_on TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  try {
    await turso.execute(`
      INSERT OR IGNORE INTO table_groups (id, natural_name, sub_group_of, order_index, icon, description)
      VALUES ('grp_tempt', 'Tempt Sandbox', NULL, 15, 'flask-conical', 'Isolated clone tables for Facet experimentation');
    `);

    await turso.execute(`
      INSERT OR REPLACE INTO tables (id, name, parent_id, order_index, icon, description, group_id)
      VALUES 
        ('tempt_conditions', 'Tempt Conditions (Predicates)', NULL, 1, 'help-circle', 'Natural reality conditions (Tempt)', 'grp_tempt'),
        ('tempt_prompt_groups', 'Tempt Prompt Groups (Bridges)', NULL, 2, 'layers', 'Conditioning bridges (Tempt)', 'grp_tempt'),
        ('tempt_prompts', 'Tempt Prompts (Tokens & CDN)', NULL, 3, 'sparkles', 'Atomic prompt tokens (Tempt)', 'grp_tempt');
    `);

    // Use INSERT OR IGNORE so Manager's customized columns are never overwritten
    const condSchema = JSON.stringify({
      table_name: 'tempt_conditions',
      columns: [
        { name: 'Condition ID', slug: 'id', type: 'hex_id', metadata: {} },
        { name: 'Natural Question', slug: 'natural_question', type: 'text_single', metadata: {} },
        { name: 'Category', slug: 'category', type: 'text_single', metadata: {} },
        { name: 'Description', slug: 'description', type: 'text_multi', metadata: {} },
        { name: 'Default State (True?)', slug: 'default_state', type: 'boolean', metadata: {} },
      ],
    });
    const grpSchema = JSON.stringify({
      table_name: 'tempt_prompt_groups',
      columns: [
        { name: 'Group ID', slug: 'id', type: 'hex_id', metadata: {} },
        { name: 'Group Name', slug: 'name', type: 'text_single', metadata: {} },
        { name: 'Category', slug: 'category', type: 'text_single', metadata: {} },
        { name: 'Description', slug: 'description', type: 'text_multi', metadata: {} },
        { name: 'Preconditions (Depends On)', slug: 'depends_on_conditions', type: 'text_multi', metadata: {} },
        { name: 'Postconditions (Brings About)', slug: 'brings_about_conditions', type: 'text_multi', metadata: {} },
      ],
    });
    const promptSchema = JSON.stringify({
      table_name: 'tempt_prompts',
      columns: [
        { name: 'Prompt ID', slug: 'id', type: 'hex_id', metadata: {} },
        { name: 'Prompt Tag', slug: 'tag', type: 'text_single', metadata: {} },
        { name: 'Length', slug: 'length', type: 'relation_multi', metadata: { target: 'hair_length', target_field: 'name' } },
        { name: 'Depend On', slug: 'depend_on', type: 'relation_multi', metadata: { target: 'tempt_prompts', target_field: 'tag', secondary_target: 'tempt_prompt_groups', secondary_target_field: 'name' } },
        { name: 'Wiki Reference URL', slug: 'wiki_url', type: 'text_single', metadata: {} },
        { name: 'Image Preview URL', slug: 'image_url', type: 'text_single', metadata: {} },
      ],
    });

    await turso.execute('INSERT OR IGNORE INTO _schema_definitions (table_name, schema_json, updated_at) VALUES (?, ?, datetime(\'now\'));', ['tempt_conditions', condSchema]);
    await turso.execute('INSERT OR IGNORE INTO _schema_definitions (table_name, schema_json, updated_at) VALUES (?, ?, datetime(\'now\'));', ['tempt_prompt_groups', grpSchema]);
    await turso.execute('INSERT OR IGNORE INTO _schema_definitions (table_name, schema_json, updated_at) VALUES (?, ?, datetime(\'now\'));', ['tempt_prompts', promptSchema]);
  } catch (e) {
    console.warn('ensureTemptConditionInfrastructure note:', e);
  }
}
