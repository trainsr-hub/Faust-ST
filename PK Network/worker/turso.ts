/**
 * Turso Cloud SQLite HTTP Pipeline API v2 Client
 * Runs in any Edge Runtime / Cloudflare Worker using native standard fetch().
 */

export interface TursoValue {
  type: 'null' | 'integer' | 'float' | 'text' | 'blob';
  value?: string | number | null;
  base64?: string;
}

export interface TursoStatement {
  sql: string;
  args?: any[] | Record<string, any>;
}

export interface TursoQueryResult {
  columns: string[];
  rows: Record<string, any>[];
  affectedRowCount: number;
  lastInsertRowid?: string;
}

export class TursoClient {
  private dbUrl: string;
  private authToken: string;

  constructor(dbUrl: string, authToken: string) {
    let cleanUrl = dbUrl.trim();
    if (cleanUrl.startsWith('libsql://')) {
      cleanUrl = 'https://' + cleanUrl.slice('libsql://'.length);
    }
    this.dbUrl = cleanUrl.replace(/\/+$/, '');
    this.authToken = authToken.trim();
  }

  private formatArg(val: any): TursoValue {
    if (val === null || val === undefined) {
      return { type: 'null' };
    }
    if (typeof val === 'number') {
      if (Number.isInteger(val)) {
        return { type: 'integer', value: val.toString() };
      }
      return { type: 'float', value: val };
    }
    if (typeof val === 'boolean') {
      return { type: 'integer', value: val ? '1' : '0' };
    }
    if (typeof val === 'object') {
      return { type: 'text', value: JSON.stringify(val) };
    }
    return { type: 'text', value: String(val) };
  }

  private parseTursoRow(cols: { name: string }[], row: TursoValue[]): Record<string, any> {
    const item: Record<string, any> = {};
    for (let i = 0; i < cols.length; i++) {
      const colName = cols[i].name;
      const cell = row[i];
      if (!cell || cell.type === 'null') {
        item[colName] = null;
      } else if (cell.type === 'integer') {
        const num = Number(cell.value);
        item[colName] = Number.isSafeInteger(num) ? num : cell.value;
      } else if (cell.type === 'float') {
        item[colName] = cell.value;
      } else {
        // text or blob
        const valStr = String(cell.value ?? '');
        // Auto parse JSON array or object if applicable
        if ((valStr.startsWith('[') && valStr.endsWith(']')) || (valStr.startsWith('{') && valStr.endsWith('}'))) {
          try {
            item[colName] = JSON.parse(valStr);
          } catch {
            item[colName] = valStr;
          }
        } else {
          item[colName] = valStr;
        }
      }
    }
    return item;
  }

  async execute(sql: string, args: any[] = []): Promise<TursoQueryResult> {
    const formattedArgs = args.map((a) => this.formatArg(a));
    const payload = {
      requests: [
        {
          type: 'execute',
          stmt: {
            sql,
            ...(formattedArgs.length > 0 ? { args: formattedArgs } : {}),
          },
        },
        { type: 'close' },
      ],
    };

    const resp = await fetch(`${this.dbUrl}/v2/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Turso HTTP Error (${resp.status}): ${errText}`);
    }

    const data: any = await resp.json();
    const execResult = data.results?.[0];

    if (!execResult || execResult.type === 'error') {
      const msg = execResult?.error?.message || 'Turso execution failed';
      throw new Error(`Turso Error: ${msg}`);
    }

    const result = execResult.response?.result;
    if (!result) {
      return { columns: [], rows: [], affectedRowCount: 0 };
    }

    const cols: { name: string }[] = result.cols || [];
    const rawRows: TursoValue[][] = result.rows || [];
    const parsedRows = rawRows.map((r) => this.parseTursoRow(cols, r));

    return {
      columns: cols.map((c) => c.name),
      rows: parsedRows,
      affectedRowCount: result.affected_row_count || 0,
      lastInsertRowid: result.last_insert_rowid,
    };
  }

  async batch(statements: { sql: string; args?: any[] }[]): Promise<TursoQueryResult[]> {
    const requests = statements.map((s) => ({
      type: 'execute',
      stmt: {
        sql: s.sql,
        ...(s.args && s.args.length > 0 ? { args: s.args.map((a) => this.formatArg(a)) } : {}),
      },
    }));
    requests.push({ type: 'close' } as any);

    const resp = await fetch(`${this.dbUrl}/v2/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Turso Batch Error (${resp.status}): ${errText}`);
    }

    const data: any = await resp.json();
    return (data.results || [])
      .filter((r: any) => r.type === 'ok' && r.response?.type === 'execute')
      .map((r: any) => {
        const res = r.response.result;
        const cols: { name: string }[] = res.cols || [];
        const rawRows: TursoValue[][] = res.rows || [];
        return {
          columns: cols.map((c) => c.name),
          rows: rawRows.map((row) => this.parseTursoRow(cols, row)),
          affectedRowCount: res.affected_row_count || 0,
          lastInsertRowid: res.last_insert_rowid,
        };
      });
  }
}
