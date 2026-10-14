export type AtomicFieldType =
  | 'hex_id'
  | 'text_single'
  | 'text_multi'
  | 'int_scalar'
  | 'float_scalar'
  | 'boolean'
  | 'enum_single'
  | 'enum_multi'
  | 'relation_single'
  | 'relation_multi';

export interface ColumnMetadata {
  prefix?: string;
  options?: string[];
  target?: string;
  default_option?: string;
  [key: string]: any;
}

export interface ColumnDefinition {
  name: string;
  slug: string;
  type: AtomicFieldType;
  metadata?: ColumnMetadata;
}

export interface TableSchema {
  table_name: string;
  columns: ColumnDefinition[];
}

export interface TableRecord {
  id: string;
  [key: string]: any;
}

export interface TableGroup {
  id: string;
  natural_name: string;
  sub_group_of?: string | null;
  order_index?: number;
  icon?: string;
  description?: string;
  created_at?: string;
}

export interface TableMetaRecord {
  id: string;
  name: string;
  parent_id?: string | null;
  group_id?: string | null;
  order_index?: number;
  icon?: string;
  description?: string;
}

export interface FieldTypeMeta {
  category: 'pk' | 'text' | 'scalar' | 'boolean' | 'enum' | 'rel';
  icon: string;
  title: string;
  sql: string;
}

export const FIELD_TYPES: Record<AtomicFieldType, FieldTypeMeta> = {
  hex_id:          { category: 'pk',      icon: '🔑', title: 'Hex ID',          sql: 'TEXT PRIMARY KEY' },
  text_single:     { category: 'text',    icon: '📝', title: 'Text (single)',    sql: 'TEXT' },
  text_multi:      { category: 'text',    icon: '📋', title: 'Text (multi)',     sql: 'TEXT' },
  int_scalar:      { category: 'scalar',  icon: '🔢', title: 'Integer',         sql: 'INTEGER' },
  float_scalar:    { category: 'scalar',  icon: '🔢', title: 'Float',           sql: 'REAL' },
  boolean:         { category: 'boolean', icon: '🔘', title: 'Boolean',         sql: 'INTEGER DEFAULT 0' },
  enum_single:     { category: 'enum',    icon: '🏷️', title: 'Enum (single)',   sql: 'TEXT' },
  enum_multi:      { category: 'enum',    icon: '🏷️', title: 'Enum (multi)',    sql: 'TEXT (JSON)' },
  relation_single: { category: 'rel',     icon: '🔗', title: 'Relation (→1)',   sql: 'TEXT' },
  relation_multi:  { category: 'rel',     icon: '🔗', title: 'Relation (→N)',   sql: 'TEXT (JSON)' },
};
