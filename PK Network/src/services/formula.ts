/**
 * PK Network: Soft-Coded Formula Engine & Dependency Logic
 * Supports:
 *   - Aggregations: MAX, MIN, SUM, AVG, COUNT, ROW
 *   - Math: ROUND, ROUNDUP, ROUNDDOWN, FLOOR, CEIL, ABS, MOD, SQRT, POWER
 *   - Logic: IF, IFS, AND, OR, NOT
 *   - String: CONCAT, UPPER, LOWER, LEN, TRIM, LEFT, RIGHT, MID
 *   - Date: TODAY, NOW, YEAR, MONTH, DAY, DATE
 *   - Dependency references: [col_slug]
 */

export interface FormulaPreset {
  id: string;
  name: string;
  formula: string;
  notes: string;
  category: 'scalar' | 'text' | 'date' | 'logic';
}

export const SYSTEM_FORMULA_PRESETS: FormulaPreset[] = [
  { id: 'f_auto_inc', name: 'Auto-Increment ID', formula: '=MAX(idx) + 1', notes: 'Finds maximum integer in column and adds 1', category: 'scalar' },
  { id: 'f_count_inc', name: 'Continuous Count', formula: '=COUNT() + 1', notes: 'Total records count + 1 for sequential numbering', category: 'scalar' },
  { id: 'f_sum_col', name: 'Sum of Column', formula: '=SUM(col)', notes: 'Sum of all numeric values in a column', category: 'scalar' },
  { id: 'f_avg_round', name: 'Rounded Average', formula: '=ROUND(AVG(score), 2)', notes: 'Calculates mean average rounded to 2 decimal places', category: 'scalar' },
  { id: 'f_prefix_code', name: 'Auto Prefix Code', formula: '=CONCAT("CODE-", COUNT() + 1)', notes: 'Generates prefixed code with sequence counter', category: 'text' },
  { id: 'f_today', name: 'Current Date', formula: '=TODAY()', notes: 'Injects current ISO date YYYY-MM-DD', category: 'date' },
  { id: 'f_now', name: 'Current Timestamp', formula: '=NOW()', notes: 'Injects current date and time YYYY-MM-DD HH:MM:SS', category: 'date' },
  { id: 'f_condition', name: 'Conditional Logic', formula: '=IF([status] == "VIP", 100, 0)', notes: 'Inspects another field on the row to compute value', category: 'logic' },
];

export function extractDependencies(formula: string): string[] {
  const matches = formula.match(/\[([a-zA-Z0-9_]+)\]/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.slice(1, -1)))];
}

export function sanitizeFormula(formula: string): string {
  let expr = String(formula || '').trim();
  if (expr.startsWith('=')) {
    expr = expr.substring(1).trim();
  }

  // Count(*) support
  expr = expr.replace(/count\s*\(\s*\*\s*\)/gi, 'COUNT()');

  // Replace [column_name] references
  expr = expr.replace(/\[([a-zA-Z0-9_]+)\]/g, '(__row["$1"] !== undefined ? __row["$1"] : 0)');

  // Normalize Excel functions
  const fns = [
    'max', 'min', 'sum', 'avg', 'average', 'count', 'counta', 'row',
    'round', 'roundup', 'rounddown', 'floor', 'ceil', 'ceiling', 'abs', 'mod', 'sqrt', 'power', 'pow',
    'if', 'ifs', 'and', 'or', 'not',
    'concat', 'concatenate', 'upper', 'lower', 'len', 'trim', 'left', 'right', 'mid', 'text',
    'today', 'now', 'year', 'month', 'day', 'date',
    'coalesce', 'isblank', 'isnumber'
  ];
  const fnRegex = new RegExp(`\\b(${fns.join('|')})\\s*\\(`, 'gi');
  expr = expr.replace(fnRegex, (_, fn) => `${fn.toUpperCase()}(`);

  // Replace power ^
  expr = expr.replace(/\^/g, '**');

  // Replace = comparison with ==
  expr = expr.replace(/(?<![=<>!])=(?!=)/g, '==');

  // Replace <> with !=
  expr = expr.replace(/<>/g, '!=');

  return expr;
}

export function evaluateFormula(
  formula: string,
  records: any[] = [],
  currentRow: Record<string, any> = {},
  columnSlug?: string
): any {
  if (!formula || !String(formula).trim().startsWith('=')) {
    return formula;
  }

  const expr = sanitizeFormula(formula);
  const safeRecords = Array.isArray(records) ? records : [];
  const safeRow = currentRow && typeof currentRow === 'object' ? currentRow : {};

  const flattenNums = (args: any[]): number[] => {
    return args
      .flat(Infinity)
      .map((v) => (typeof v === 'string' && !isNaN(Number(v)) && v.trim() !== '' ? Number(v) : v))
      .filter((v): v is number => typeof v === 'number' && !isNaN(v));
  };

  const getColValues = (slug: string) => safeRecords.map((r) => r[slug]);

  const scope: Record<string, any> = {
    __row: safeRow,

    MAX: (...args: any[]) => {
      let nums: number[] = [];
      if (args.length === 1 && typeof args[0] === 'string' && !args[0].startsWith('=')) {
        nums = flattenNums(getColValues(args[0]));
      } else {
        nums = flattenNums(args);
      }
      return nums.length > 0 ? Math.max(...nums) : 0;
    },

    MIN: (...args: any[]) => {
      let nums: number[] = [];
      if (args.length === 1 && typeof args[0] === 'string' && !args[0].startsWith('=')) {
        nums = flattenNums(getColValues(args[0]));
      } else {
        nums = flattenNums(args);
      }
      return nums.length > 0 ? Math.min(...nums) : 0;
    },

    SUM: (...args: any[]) => {
      let nums: number[] = [];
      if (args.length === 1 && typeof args[0] === 'string' && !args[0].startsWith('=')) {
        nums = flattenNums(getColValues(args[0]));
      } else {
        nums = flattenNums(args);
      }
      return nums.reduce((s, n) => s + n, 0);
    },

    AVG: (...args: any[]) => {
      let nums: number[] = [];
      if (args.length === 1 && typeof args[0] === 'string' && !args[0].startsWith('=')) {
        nums = flattenNums(getColValues(args[0]));
      } else {
        nums = flattenNums(args);
      }
      return nums.length > 0 ? nums.reduce((s, n) => s + n, 0) / nums.length : 0;
    },
    AVERAGE: (...args: any[]) => scope.AVG(...args),

    COUNT: (...args: any[]) => {
      if (args.length === 0) return safeRecords.length;
      return args.flat(Infinity).filter((v) => v !== null && v !== undefined && v !== '').length;
    },
    COUNTA: (...args: any[]) => scope.COUNT(...args),
    ROW: () => safeRecords.length + 1,

    ROUND: (n: any, decimals = 0) => {
      const f = Math.pow(10, decimals);
      return Math.round(Number(n || 0) * f) / f;
    },
    ROUNDUP: (n: any, decimals = 0) => {
      const f = Math.pow(10, decimals);
      return Math.ceil(Number(n || 0) * f) / f;
    },
    ROUNDDOWN: (n: any, decimals = 0) => {
      const f = Math.pow(10, decimals);
      return Math.floor(Number(n || 0) * f) / f;
    },
    FLOOR: (n: any) => Math.floor(Number(n || 0)),
    CEIL: (n: any) => Math.ceil(Number(n || 0)),
    ABS: (n: any) => Math.abs(Number(n || 0)),
    MOD: (n: any, d: any) => Number(n || 0) % Number(d || 1),
    SQRT: (n: any) => Math.sqrt(Number(n || 0)),
    POWER: (b: any, exp: any) => Math.pow(Number(b || 0), Number(exp || 1)),

    IF: (cond: any, ifTrue: any, ifFalse: any = null) => (Boolean(cond) ? ifTrue : ifFalse),
    AND: (...args: any[]) => args.flat(Infinity).every(Boolean),
    OR: (...args: any[]) => args.flat(Infinity).some(Boolean),
    NOT: (arg: any) => !Boolean(arg),

    CONCAT: (...args: any[]) => args.flat(Infinity).join(''),
    CONCATENATE: (...args: any[]) => scope.CONCAT(...args),
    UPPER: (s: any) => String(s || '').toUpperCase(),
    LOWER: (s: any) => String(s || '').toLowerCase(),
    LEN: (s: any) => String(s || '').length,
    TRIM: (s: any) => String(s || '').trim(),
    LEFT: (s: any, n = 1) => String(s || '').slice(0, n),
    RIGHT: (s: any, n = 1) => String(s || '').slice(-n),

    TODAY: () => new Date().toISOString().split('T')[0],
    NOW: () => {
      const d = new Date();
      return `${d.toISOString().split('T')[0]} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    },
    YEAR: (d?: any) => (d ? new Date(d) : new Date()).getFullYear(),
    MONTH: (d?: any) => (d ? new Date(d) : new Date()).getMonth() + 1,
    DAY: (d?: any) => (d ? new Date(d) : new Date()).getDate(),
  };

  // Populate direct column variables if formula references them directly (e.g. MAX(idx))
  if (columnSlug) {
    scope[columnSlug] = getColValues(columnSlug);
  }
  for (const k of Object.keys(safeRow)) {
    if (!scope[k]) {
      scope[k] = safeRow[k];
    }
  }

  try {
    const fn = new Function(...Object.keys(scope), `return (${expr});`);
    return fn(...Object.values(scope));
  } catch (err: any) {
    return `#ERR: ${err.message}`;
  }
}

/**
 * Automatically recalculate dependent formula columns on a record
 */
export function recalculateRecordFormulas(
  record: Record<string, any>,
  columns: { slug: string; metadata?: { default_option?: string; formula?: string } }[],
  allRecords: any[] = []
): Record<string, any> {
  const updated = { ...record };

  for (const col of columns) {
    const form = col.metadata?.formula || col.metadata?.default_option;
    if (form && String(form).trim().startsWith('=')) {
      // If it contains row references [some_col] or is a dynamic calculated formula
      const deps = extractDependencies(form);
      if (deps.length > 0 || form.includes('SUM') || form.includes('AVG') || form.includes('COUNT')) {
        const res = evaluateFormula(form, allRecords, updated, col.slug);
        if (typeof res !== 'string' || !res.startsWith('#ERR')) {
          updated[col.slug] = res;
        }
      }
    }
  }

  return updated;
}
