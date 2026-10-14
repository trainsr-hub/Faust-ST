import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { TursoClient } from './turso';

export interface Env {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
  APP_AUTH_KEY?: string;
  ASSETS?: any;
}

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for development
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization', 'X-App-Key'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Helper to obtain Turso client from context
function getTurso(c: any): TursoClient {
  const envObj = c.env || {};
  const globalProc = typeof process !== 'undefined' ? process : null;
  const url = envObj.TURSO_DATABASE_URL || (globalProc?.env?.TURSO_DATABASE_URL ?? '');
  const token = envObj.TURSO_AUTH_TOKEN || (globalProc?.env?.TURSO_AUTH_TOKEN ?? '');

  if (!url || !token) {
    throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required');
  }
  return new TursoClient(url, token);
}

// Initial schemas to seed if database is clean
const DEFAULT_SCHEMAS: Record<string, any> = {
  tables: {
    table_name: 'tables',
    columns: [
      { name: 'Table ID (Slug)', slug: 'id', type: 'hex_id', metadata: { prefix: '' } },
      { name: 'Natural Language Name', slug: 'name', type: 'text_single', metadata: {} },
      { name: 'Parent Table', slug: 'parent_id', type: 'relation_single', metadata: { target: 'tables' } },
      { name: 'Order', slug: 'order_index', type: 'int_scalar', metadata: { default_option: '=MAX(order_index) + 1' } },
      { name: 'Icon Slug', slug: 'icon', type: 'text_single', metadata: {} },
      { name: 'Description', slug: 'description', type: 'text_multi', metadata: {} }
    ]
  },
  containers: {
    table_name: 'containers',
    columns: [
      { name: 'Container ID', slug: 'id', type: 'hex_id', metadata: { prefix: 'CONT' } },
      { name: 'Name', slug: 'name', type: 'text_single', metadata: {} },
      { name: 'Type', slug: 'type', type: 'enum_single', metadata: { options: ['intellect', 'personal', 'author', 'anime', 'Writer', 'persona'] } },
      { name: 'Notes', slug: 'notes', type: 'text_multi', metadata: {} },
      { name: 'Default Tags', slug: 'default_tags', type: 'enum_multi', metadata: { options: ['core', 'daily', 'quote', 'system'] } }
    ]
  },
  specifics: {
    table_name: 'specifics',
    columns: [
      { name: 'Specific ID', slug: 'id', type: 'hex_id', metadata: { prefix: 'SPEC' } },
      { name: 'Collection Name', slug: 'name', type: 'text_single', metadata: {} },
      { name: 'Container', slug: 'container_id', type: 'relation_single', metadata: { target: 'containers' } },
      { name: 'Category', slug: 'category', type: 'enum_single', metadata: { options: ['insight', 'diary', 'thought', 'book', 'poem', 'writing', 'music'] } },
      { name: 'Notes', slug: 'notes', type: 'text_multi', metadata: {} },
      { name: 'Default Tags', slug: 'default_tags', type: 'enum_multi', metadata: { options: ['fav', 'core', 'archive'] } },
      { name: 'Default Usages', slug: 'default_usage_ids', type: 'relation_multi', metadata: { target: 'usages' } },
      { name: 'Date / Era', slug: 'date', type: 'text_single', metadata: {} }
    ]
  },
  themes: {
    table_name: 'themes',
    columns: [
      { name: 'Theme ID', slug: 'id', type: 'hex_id', metadata: { prefix: 'THME' } },
      { name: 'Theme Name', slug: 'name', type: 'text_single', metadata: {} },
      { name: 'Parent Theme', slug: 'child_of', type: 'relation_single', metadata: { target: 'themes' } },
      { name: 'Notes', slug: 'notes', type: 'text_multi', metadata: {} }
    ]
  },
  usages: {
    table_name: 'usages',
    columns: [
      { name: 'Usage ID', slug: 'id', type: 'hex_id', metadata: { prefix: 'USAG' } },
      { name: 'Usage Name', slug: 'name', type: 'text_single', metadata: {} },
      { name: 'Description', slug: 'description', type: 'text_multi', metadata: {} },
      { name: 'Icon', slug: 'icon', type: 'text_single', metadata: {} },
      { name: 'Conflicting Usages', slug: 'conflicts_with', type: 'relation_multi', metadata: { target: 'usages' } }
    ]
  },
  quotes: {
    table_name: 'quotes',
    columns: [
      { name: 'Quote ID', slug: 'id', type: 'hex_id', metadata: { prefix: 'QUOT' } },
      { name: 'Index Number', slug: 'idx', type: 'int_scalar', metadata: { default_option: '=MAX(idx) + 1' } },
      { name: 'Quote Content', slug: 'main_content', type: 'text_multi', metadata: {} },
      { name: 'Context & Attribution', slug: 'context', type: 'text_multi', metadata: {} },
      { name: 'Date Added', slug: 'date', type: 'text_single', metadata: { default_option: '=TODAY()' } },
      { name: 'Specific Source', slug: 'specific_id', type: 'relation_single', metadata: { target: 'specifics' } },
      { name: 'Themes', slug: 'theme_ids', type: 'relation_multi', metadata: { target: 'themes' } },
      { name: 'Usages', slug: 'usage_ids', type: 'relation_multi', metadata: { target: 'usages' } },
      { name: 'Preference Tags', slug: 'preference', type: 'enum_multi', metadata: { options: ['starred', 'favorite', 'essential'] } },
      { name: 'Average Score', slug: 'average_score', type: 'float_scalar', metadata: {} }
    ]
  }
};

// Ensure system schema table exists in Turso
async function ensureSchemaTable(turso: TursoClient) {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS _schema_definitions (
      table_name TEXT PRIMARY KEY,
      schema_json TEXT NOT NULL,
      updated_at TEXT
    );
  `);
}

// Ensure system tables registry exists and is seeded with core tables
async function ensureTablesTable(turso: TursoClient) {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS tables (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parent_id TEXT,
      order_index INTEGER DEFAULT 0,
      icon TEXT,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  try {
    const countRes = await turso.execute('SELECT COUNT(*) as cnt FROM tables;');
    const count = Number(countRes.rows[0]?.cnt || 0);
    if (count === 0) {
      const defaultTables = [
        { id: 'tables', name: 'System Tables', parent_id: null, order_index: 0, icon: 'database', description: 'Master registry of data tables' },
        { id: 'containers', name: 'Containers', parent_id: null, order_index: 1, icon: 'box', description: 'High-level knowledge boundaries and intellect sources' },
        { id: 'specifics', name: 'Specific Collections', parent_id: 'containers', order_index: 2, icon: 'layers', description: 'Books, essays, dialogues, and collections' },
        { id: 'quotes', name: 'Quotes & Excerpts', parent_id: 'specifics', order_index: 3, icon: 'quote', description: 'Curated atomic excerpts, aphorisms, and insights' },
        { id: 'themes', name: 'Themes & Taxonomies', parent_id: null, order_index: 4, icon: 'tag', description: 'Core semantic themes and philosophical threads' },
        { id: 'usages', name: 'Contextual Usages', parent_id: null, order_index: 5, icon: 'compass', description: 'Practical situational contexts and utility vectors' },
        { id: 'projects', name: 'Projects & Initiatives', parent_id: null, order_index: 6, icon: 'folder', description: 'Active engineering and philosophical projects' },
        { id: 'users', name: 'System Operators', parent_id: null, order_index: 7, icon: 'users', description: 'Authorized operators and autonomous personas' },
      ];

      for (const dt of defaultTables) {
        await turso.execute(
          'INSERT OR REPLACE INTO tables (id, name, parent_id, order_index, icon, description) VALUES (?, ?, ?, ?, ?, ?);',
          [dt.id, dt.name, dt.parent_id, dt.order_index, dt.icon, dt.description]
        );
      }
    }
  } catch (e) {
    console.warn('ensureTablesTable seed error:', e);
  }
}

// Ensure table_groups system table exists and is seeded with core groups
async function ensureGroupsTable(turso: TursoClient) {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS table_groups (
      id TEXT PRIMARY KEY,
      natural_name TEXT NOT NULL,
      sub_group_of TEXT,
      order_index INTEGER DEFAULT 0,
      icon TEXT DEFAULT 'folder',
      description TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Ensure tables table has group_id column
  try {
    const info = await turso.execute('PRAGMA table_info(tables);');
    const cols = new Set(info.rows.map((r: any) => r.name));
    if (!cols.has('group_id')) {
      await turso.execute('ALTER TABLE tables ADD COLUMN group_id TEXT REFERENCES table_groups(id) ON DELETE SET NULL;');
    }
  } catch (e) {
    console.warn('group_id migration check error:', e);
  }

  // Seed default groups if empty
  try {
    const countRes = await turso.execute('SELECT COUNT(*) as cnt FROM table_groups;');
    const count = Number(countRes.rows[0]?.cnt || 0);
    if (count === 0) {
      const defaultGroups = [
        { id: 'grp_knowledge', natural_name: 'Knowledge Base', sub_group_of: null, order_index: 1, icon: 'library', description: 'Core intellect sources and knowledge vaults' },
        { id: 'grp_literature', natural_name: 'Literature & Insights', sub_group_of: 'grp_knowledge', order_index: 2, icon: 'book-open', description: 'Collections, authors, and atomic excerpts' },
        { id: 'grp_taxonomies', natural_name: 'Taxonomies & Vectors', sub_group_of: null, order_index: 3, icon: 'tags', description: 'Themes, tags, and situational usages' },
        { id: 'grp_operations', natural_name: 'Operations & Systems', sub_group_of: null, order_index: 4, icon: 'cpu', description: 'Active engineering projects and operator profiles' },
      ];

      for (const g of defaultGroups) {
        await turso.execute(
          'INSERT OR REPLACE INTO table_groups (id, natural_name, sub_group_of, order_index, icon, description) VALUES (?, ?, ?, ?, ?, ?);',
          [g.id, g.natural_name, g.sub_group_of, g.order_index, g.icon, g.description]
        );
      }

      // Assign initial tables to default groups
      await turso.execute("UPDATE tables SET group_id = 'grp_literature' WHERE id IN ('containers', 'specifics', 'quotes');");
      await turso.execute("UPDATE tables SET group_id = 'grp_taxonomies' WHERE id IN ('themes', 'usages');");
      await turso.execute("UPDATE tables SET group_id = 'grp_operations' WHERE id IN ('projects', 'users');");
    }
  } catch (e) {
    console.warn('ensureGroupsTable seed error:', e);
  }
}

// Map column atomic type to SQLite column DDL
function getSqlType(type: string): string {
  switch (type) {
    case 'hex_id': return 'TEXT PRIMARY KEY';
    case 'int_scalar': return 'INTEGER';
    case 'float_scalar': return 'REAL';
    case 'boolean': return 'INTEGER DEFAULT 0';
    default: return 'TEXT';
  }
}

// Auth Middleware
app.use('/api/*', async (c, next) => {
  const expectedKey = c.env?.APP_AUTH_KEY;
  if (!expectedKey) {
    return next();
  }
  // Public verification and health check bypass
  if ((c.req.path === '/api/health' || c.req.path === '/api/auth/verify') && c.req.method === 'GET') {
    return next();
  }
  const authHeader = 
    c.req.header('X-App-Key') || 
    c.req.header('Authorization')?.replace(/^Bearer\s+/i, '') || 
    c.req.query('key');

  if (!authHeader || authHeader !== expectedKey) {
    return c.json({ success: false, error: 'Unauthorized: Invalid or missing X-App-Key' }, 401);
  }
  return next();
});

// API: Auth verify endpoint (0ms Edge memory validation, zero DB hit)
app.get('/api/auth/verify', (c) => {
  const expectedKey = c.env?.APP_AUTH_KEY;
  if (!expectedKey) {
    return c.json({ success: true, required: false, message: 'Auth not required' });
  }
  const key = 
    c.req.header('X-App-Key') || 
    c.req.header('Authorization')?.replace(/^Bearer\s+/i, '') || 
    c.req.query('key');

  if (key && key === expectedKey) {
    return c.json({ success: true, required: true, authorized: true });
  }
  return c.json({ success: false, required: true, authorized: false, error: 'Invalid passcode' }, 401);
});

// API: Health check
app.get('/api/health', async (c) => {
  try {
    const turso = getTurso(c);
    const result = await turso.execute('SELECT 1 as alive;');
    return c.json({
      success: true,
      status: 'connected',
      engine: 'Turso Cloud SQLite Edge',
      timestamp: new Date().toISOString(),
      alive: result.rows[0]?.alive === 1
    });
  } catch (err: any) {
    return c.json({ success: false, status: 'error', error: err.message }, 500);
  }
});

// API: Get all schemas and table metadata
app.get('/api/tables', async (c) => {
  try {
    const turso = getTurso(c);
    await ensureSchemaTable(turso);
    await ensureTablesTable(turso);
    await ensureGroupsTable(turso);

    const res = await turso.execute('SELECT table_name, schema_json FROM _schema_definitions;');
    const tables: Record<string, any> = {};

    for (const r of res.rows) {
      if (!r.schema_json) {
        tables[r.table_name] = DEFAULT_SCHEMAS[r.table_name] || null;
        continue;
      }

      let parsed = r.schema_json;
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed);
          if (typeof parsed === 'string') {
            try { parsed = JSON.parse(parsed); } catch {}
          }
        } catch (e) {
          console.error(`[Worker] Failed to parse schema_json for table ${r.table_name}:`, e);
          parsed = DEFAULT_SCHEMAS[r.table_name] || null;
        }
      }

      tables[r.table_name] = parsed;
    }

    // Ensure all DEFAULT_SCHEMAS exist in _schema_definitions
    for (const [tname, schema] of Object.entries(DEFAULT_SCHEMAS)) {
      if (!tables[tname]) {
        try {
          await turso.execute(
            'INSERT OR REPLACE INTO _schema_definitions (table_name, schema_json, updated_at) VALUES (?, ?, ?);',
            [tname, JSON.stringify(schema), new Date().toISOString()]
          );
          tables[tname] = schema;
        } catch {}
      }
    }

    // Load sovereign metadata registry
    const metaRes = await turso.execute('SELECT * FROM tables ORDER BY order_index ASC;');
    const metadata = metaRes.rows;

    // Load table groups
    const groupsRes = await turso.execute('SELECT * FROM table_groups ORDER BY order_index ASC;');
    const groups = groupsRes.rows;

    // Ensure every table in metadata has at least a valid basic schema
    for (const m of metadata) {
      if (!tables[m.id] || !tables[m.id].columns || tables[m.id].columns.length === 0) {
        const prefix = m.id.slice(0, 4).toUpperCase();
        tables[m.id] = {
          table_name: m.id,
          columns: [
            { name: `${m.name || m.id} ID`, slug: 'id', type: 'hex_id', metadata: { prefix } },
            { name: 'Name', slug: 'name', type: 'text_single', metadata: {} },
            { name: 'Notes', slug: 'notes', type: 'text_multi', metadata: {} },
          ]
        };
      }
    }

    return c.json({ success: true, tables, metadata, groups });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// API: Get all groups
app.get('/api/groups', async (c) => {
  try {
    const turso = getTurso(c);
    await ensureGroupsTable(turso);
    const res = await turso.execute('SELECT * FROM table_groups ORDER BY order_index ASC;');
    return c.json({ success: true, groups: res.rows });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// API: Create group or sub-group
app.post('/api/groups', async (c) => {
  try {
    const body = await c.req.json();
    const turso = getTurso(c);
    const rawId = String(body.id || body.natural_name || '').toLowerCase();
    const cleanId = rawId.replace(/[^a-z0-9_]/g, '_').replace(/^_+|_+$/g, '') || `grp_${Date.now()}`;
    const naturalName = body.natural_name || body.name || 'Untitled Group';
    const subGroupOf = body.sub_group_of || null;

    const maxOrder = await turso.execute('SELECT MAX(order_index) as m FROM table_groups;');
    const nextOrder = Number(maxOrder.rows[0]?.m || 0) + 1;

    await turso.execute(
      'INSERT OR REPLACE INTO table_groups (id, natural_name, sub_group_of, order_index, icon, description) VALUES (?, ?, ?, ?, ?, ?);',
      [cleanId, naturalName, subGroupOf, nextOrder, body.icon || 'folder', body.description || '']
    );

    return c.json({
      success: true,
      group: {
        id: cleanId,
        natural_name: naturalName,
        sub_group_of: subGroupOf,
        order_index: nextOrder,
        icon: body.icon || 'folder'
      }
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// API: Update group metadata
app.patch('/api/groups/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const updates = body.updates || body;
    const turso = getTurso(c);

    const allowed = ['natural_name', 'sub_group_of', 'order_index', 'icon', 'description'];
    const keys = Object.keys(updates).filter(k => allowed.includes(k));
    if (keys.length === 0) return c.json({ success: true });

    const setClause = keys.map(k => `"${k}" = ?`).join(', ');
    const values = [...keys.map(k => updates[k]), id];

    await turso.execute(`UPDATE table_groups SET ${setClause} WHERE id = ?;`, values);
    return c.json({ success: true, message: `Group ${id} updated` });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// API: Delete group
app.delete('/api/groups/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const turso = getTurso(c);

    await turso.execute('UPDATE table_groups SET sub_group_of = NULL WHERE sub_group_of = ?;', [id]);
    await turso.execute('UPDATE tables SET group_id = NULL WHERE group_id = ?;', [id]);
    await turso.execute('DELETE FROM table_groups WHERE id = ?;', [id]);

    return c.json({ success: true, message: `Group ${id} deleted and unlinked` });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// API: Update table metadata via Project Logic (Rename natural name, change parent selector, assign group)
app.patch('/api/table/:name/meta', async (c) => {
  try {
    const name = c.req.param('name');
    const body = await c.req.json();
    const turso = getTurso(c);

    const updates = body.updates || body;
    const allowed = ['name', 'parent_id', 'group_id', 'order_index', 'icon', 'description'];
    const keys = Object.keys(updates).filter(k => allowed.includes(k));
    if (keys.length === 0) {
      return c.json({ success: true, message: 'No valid metadata fields to update' });
    }

    const setClause = keys.map(k => `"${k}" = ?`).join(', ');
    const values = [...keys.map(k => updates[k]), name];

    await turso.execute(`UPDATE tables SET ${setClause} WHERE id = ?;`, values);
    return c.json({ success: true, message: `Table metadata for ${name} updated` });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// API: Create new table via Project Logic (Atomic Provisioning)
app.post('/api/tables/new', async (c) => {
  try {
    const body = await c.req.json();
    const turso = getTurso(c);
    const rawId = String(body.id || body.name || '').toLowerCase();
    const cleanId = rawId.replace(/[^a-z0-9_]/g, '_').replace(/^_+|_+$/g, '');
    if (!cleanId) {
      return c.json({ success: false, error: 'Table ID must contain alphanumeric characters' }, 400);
    }
    const displayName = body.name || (cleanId.charAt(0).toUpperCase() + cleanId.slice(1).replace(/_/g, ' '));
    const parentId = body.parent_id || null;

    // 1. Create physical SQLite table
    await turso.execute(`CREATE TABLE IF NOT EXISTS "${cleanId}" (id TEXT PRIMARY KEY);`);

    // 2. Register initial schema
    const prefix = cleanId.slice(0, 4).toUpperCase();
    const initialSchema = {
      table_name: cleanId,
      columns: [
        { name: `${displayName} ID`, slug: 'id', type: 'hex_id', metadata: { prefix } },
        { name: 'Name', slug: 'name', type: 'text_single', metadata: {} },
        { name: 'Notes', slug: 'notes', type: 'text_multi', metadata: {} },
      ]
    };
    await turso.execute(
      'INSERT OR REPLACE INTO _schema_definitions (table_name, schema_json, updated_at) VALUES (?, ?, ?);',
      [cleanId, JSON.stringify(initialSchema), new Date().toISOString()]
    );

    // 3. Register in tables metadata registry
    const maxOrderRes = await turso.execute('SELECT MAX(order_index) as m FROM tables;');
    const nextOrder = Number(maxOrderRes.rows[0]?.m || 0) + 1;
    const groupId = body.group_id || null;
    await turso.execute(
      'INSERT OR REPLACE INTO tables (id, name, parent_id, group_id, order_index, icon) VALUES (?, ?, ?, ?, ?, ?);',
      [cleanId, displayName, parentId, groupId, nextOrder, body.icon || 'box']
    );

    return c.json({
      success: true,
      table: {
        id: cleanId,
        name: displayName,
        parent_id: parentId,
        group_id: groupId,
        order_index: nextOrder,
        schema: initialSchema
      }
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// API: Delete table via Project Logic
app.delete('/api/table/:name', async (c) => {
  try {
    const name = c.req.param('name');
    if (name === 'tables') {
      return c.json({ success: false, error: 'Cannot delete the master System Tables registry' }, 400);
    }
    const turso = getTurso(c);

    // 1. Drop physical table
    await turso.execute(`DROP TABLE IF EXISTS "${name}";`);

    // 2. Delete schema definition
    await turso.execute('DELETE FROM _schema_definitions WHERE table_name = ?;', [name]);

    // 3. Unregister from tables registry
    await turso.execute('DELETE FROM tables WHERE id = ?;', [name]);

    // 4. Reparent any orphan child tables to NULL
    await turso.execute('UPDATE tables SET parent_id = NULL WHERE parent_id = ?;', [name]);

    return c.json({ success: true, message: `Table ${name} dropped and unlinked` });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// API: Save or Update table schema and auto-sync DDL to Turso
app.post('/api/table/:name', async (c) => {
  try {
    const name = c.req.param('name');
    const body = await c.req.json();
    const schema = body.table || body;
    const turso = getTurso(c);

    await ensureSchemaTable(turso);

    // Save schema definition
    await turso.execute(
      'INSERT OR REPLACE INTO _schema_definitions (table_name, schema_json, updated_at) VALUES (?, ?, ?);',
      [name, JSON.stringify(schema), new Date().toISOString()]
    );

    // Create table if not exists
    if (schema.columns && schema.columns.length > 0) {
      const colDefs = schema.columns.map((col: any) => `${col.slug} ${getSqlType(col.type)}`);
      await turso.execute(`CREATE TABLE IF NOT EXISTS "${name}" (${colDefs.join(', ')});`);

      // Attempt to add missing columns if table already exists
      const info = await turso.execute(`PRAGMA table_info("${name}");`);
      const existingCols = new Set(info.rows.map((r: any) => r.name));
      for (const col of schema.columns) {
        if (!existingCols.has(col.slug) && col.type !== 'hex_id') {
          try {
            await turso.execute(`ALTER TABLE "${name}" ADD COLUMN ${col.slug} ${getSqlType(col.type)};`);
          } catch (e) {
            // Ignore if column already exists
          }
        }
      }
    }

    return c.json({ success: true, message: `Table ${name} synchronized successfully` });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// API: Get records for a table
app.get('/api/records/:name', async (c) => {
  try {
    const name = c.req.param('name');
    const turso = getTurso(c);

    // Make sure table exists
    try {
      const res = await turso.execute(`SELECT * FROM "${name}";`);
      return c.json({ success: true, records: res.rows, count: res.rows.length });
    } catch (e: any) {
      // Table doesn't exist yet, return empty list
      return c.json({ success: true, records: [], count: 0 });
    }
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// API: Insert record into a table
app.post('/api/records/:name', async (c) => {
  try {
    const name = c.req.param('name');
    const payload = await c.req.json();
    const record = payload.record || payload;
    const turso = getTurso(c);

    // Lifecycle hook for registering a new data table via the 'tables' table
    if (name === 'tables') {
      const rawId = String(record.id || record.name || '').toLowerCase();
      const cleanId = rawId.replace(/[^a-z0-9_]/g, '_').replace(/^_+|_+$/g, '');
      if (!cleanId) {
        return c.json({ success: false, error: 'Table ID must contain alphanumeric characters' }, 400);
      }
      record.id = cleanId;
      if (!record.name) {
        record.name = cleanId.charAt(0).toUpperCase() + cleanId.slice(1).replace(/_/g, ' ');
      }

      // Automatically initialize physical SQLite table on Turso Cloud
      await turso.execute(`CREATE TABLE IF NOT EXISTS "${cleanId}" (id TEXT PRIMARY KEY);`);

      // Automatically register default initial schema definition if not already present
      const schemaCheck = await turso.execute('SELECT table_name FROM _schema_definitions WHERE table_name = ?;', [cleanId]);
      if (schemaCheck.rows.length === 0) {
        const prefix = cleanId.slice(0, 4).toUpperCase();
        const initialSchema = {
          table_name: cleanId,
          columns: [
            { name: `${record.name} ID`, slug: 'id', type: 'hex_id', metadata: { prefix } },
            { name: 'Name', slug: 'name', type: 'text_single', metadata: {} },
            { name: 'Notes', slug: 'notes', type: 'text_multi', metadata: {} },
          ]
        };
        await turso.execute(
          'INSERT OR REPLACE INTO _schema_definitions (table_name, schema_json, updated_at) VALUES (?, ?, ?);',
          [cleanId, JSON.stringify(initialSchema), new Date().toISOString()]
        );
      }
    }

    // Check existing columns in the physical table
    const tableInfo = await turso.execute(`PRAGMA table_info("${name}");`);
    const validCols = new Set(tableInfo.rows.map((r: any) => r.name));

    // Handle auto formula default if table has 'idx' column
    if (validCols.has('idx')) {
      if (record.idx === undefined || record.idx === null || record.idx === '') {
        try {
          const maxRes = await turso.execute(`SELECT MAX(idx) as m FROM "${name}";`);
          const maxVal = maxRes.rows[0]?.m;
          record.idx = (maxVal !== null && maxVal !== undefined) ? Number(maxVal) + 1 : 1;
        } catch {}
      }
    }

    // Set 'date' default ONLY if the table physically contains a 'date' column
    if (validCols.has('date') && !record.date && name !== 'tables') {
      record.date = new Date().toISOString().split('T')[0];
    }

    // Auto ID generator if not provided (for non-tables)
    if (!record.id) {
      const raw = name.replace(/[^a-zA-Z0-9]/g, '');
      const prefix = raw.padEnd(4, 'X').slice(0, 4).toUpperCase();
      const timeHex = Date.now().toString(16).padStart(12, '0').slice(-12).toUpperCase();
      record.id = `${prefix}${timeHex}`;
    }

    // Filter record keys to ONLY those columns that actually exist physically in the table
    const keys = Object.keys(record).filter((k) => validCols.has(k));
    if (keys.length === 0) {
      keys.push('id');
    }
    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map((k) => record[k]);

    const sql = `INSERT OR REPLACE INTO "${name}" (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${placeholders});`;
    await turso.execute(sql, values);

    return c.json({ success: true, record });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// API: Update record in a table
app.put('/api/records/:name/:id', async (c) => {
  try {
    const name = c.req.param('name');
    const id = c.req.param('id');
    const payload = await c.req.json();
    const updates = payload.record || payload;
    const turso = getTurso(c);

    // Check existing columns in the physical table
    const tableInfo = await turso.execute(`PRAGMA table_info("${name}");`);
    const validCols = new Set(tableInfo.rows.map((r: any) => r.name));

    delete updates.id; // Do not overwrite ID in SET
    const keys = Object.keys(updates).filter((k) => validCols.has(k));
    if (keys.length === 0) {
      return c.json({ success: true, message: 'No matching fields to update' });
    }

    const setClause = keys.map((k) => `"${k}" = ?`).join(', ');
    const values = [...keys.map((k) => updates[k]), id];

    const sql = `UPDATE "${name}" SET ${setClause} WHERE id = ?;`;
    await turso.execute(sql, values);

    return c.json({ success: true, message: 'Record updated', id });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// API: Delete record
app.delete('/api/records/:name/:id', async (c) => {
  try {
    const name = c.req.param('name');
    const id = c.req.param('id');
    const turso = getTurso(c);

    if (name === 'tables') {
      if (id === 'tables') {
        return c.json({ success: false, error: 'Cannot delete the master System Tables registry' }, 400);
      }
      try {
        await turso.execute(`DROP TABLE IF EXISTS "${id}";`);
        await turso.execute(`DELETE FROM _schema_definitions WHERE table_name = ?;`, [id]);
      } catch (e) {
        console.warn(`Clean up for dropped table ${id} encountered error:`, e);
      }
    }

    await turso.execute(`DELETE FROM "${name}" WHERE id = ?;`, [id]);
    return c.json({ success: true, message: 'Record deleted', id });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

export default app;
