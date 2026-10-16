import { TableSchema, TableRecord, TableGroup, TableMetaRecord, TableState } from '../types';

export const API_BASE = ''; // Same origin in Cloudflare Workers or proxied by Vite in dev

export function getAuthKey(): string {
  return localStorage.getItem('pk_app_auth_key') || '';
}

export function setAuthKey(key: string): void {
  if (key) {
    localStorage.setItem('pk_app_auth_key', key);
  } else {
    localStorage.removeItem('pk_app_auth_key');
  }
}

/**
 * Checks URL query string (?key=...) or hash (#key=...) for 1-click magic link auth.
 * Automatically persists to localStorage and cleans the URL without reloading.
 */
export function checkUrlKey(): string | null {
  if (typeof window === 'undefined') return null;
  
  const url = new URL(window.location.href);
  const keyParam = url.searchParams.get('key') || url.searchParams.get('auth');
  
  if (keyParam) {
    setAuthKey(keyParam.trim());
    url.searchParams.delete('key');
    url.searchParams.delete('auth');
    const cleanUrl = url.pathname + (url.searchParams.toString() ? '?' + url.searchParams.toString() : '') + url.hash;
    window.history.replaceState({}, document.title, cleanUrl);
    return keyParam.trim();
  }

  // Also check hash #key=...
  if (window.location.hash.startsWith('#key=')) {
    const hashKey = window.location.hash.replace('#key=', '').trim();
    if (hashKey) {
      setAuthKey(hashKey);
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      return hashKey;
    }
  }

  return null;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  const authKey = getAuthKey();
  if (authKey) {
    headers.set('X-App-Key', authKey);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent('pk_auth_required'));
    }
    const errMsg = typeof data.error === 'object' ? JSON.stringify(data.error) : (data.error || `HTTP error ${res.status}`);
    throw new Error(errMsg);
  }
  return data;
}

export const api = {
  verifyAuth: async (candidateKey?: string): Promise<{ success: boolean; required: boolean; authorized?: boolean }> => {
    const key = candidateKey !== undefined ? candidateKey : getAuthKey();
    const res = await fetch(`${API_BASE}/api/auth/verify`, {
      headers: {
        'Content-Type': 'application/json',
        'X-App-Key': key,
      },
    });
    if (res.status === 401) {
      return { success: false, required: true, authorized: false };
    }
    const data = await res.json().catch(() => ({ success: false }));
    return data;
  },
  checkHealth: async (): Promise<{ status: string; engine: string }> => {
    return request('/api/health');
  },

  getTables: async (): Promise<{
    tables: Record<string, TableSchema>;
    metadata?: TableMetaRecord[];
    groups?: TableGroup[];
    states?: Record<string, TableState>;
  }> => {
    return request('/api/tables');
  },

  getTableState: async (tableName: string): Promise<{ success: boolean; state: TableState | null }> => {
    return request(`/api/states/${encodeURIComponent(tableName)}`);
  },

  saveTableState: async (tableName: string, state: Partial<TableState>): Promise<{ success: boolean; state: TableState }> => {
    return request(`/api/states/${encodeURIComponent(tableName)}`, {
      method: 'POST',
      body: JSON.stringify(state),
    });
  },

  getGroups: async (): Promise<{ success: boolean; groups: TableGroup[] }> => {
    return request('/api/groups');
  },

  createGroup: async (payload: { id?: string; natural_name: string; sub_group_of?: string | null; icon?: string }): Promise<{ success: boolean; group: TableGroup }> => {
    return request('/api/groups', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateGroup: async (id: string, updates: Partial<TableGroup>): Promise<{ success: boolean }> => {
    return request(`/api/groups/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ updates }),
    });
  },

  deleteGroup: async (id: string): Promise<{ success: boolean }> => {
    return request(`/api/groups/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  updateTableMeta: async (tableName: string, updates: Partial<TableMetaRecord>): Promise<{ success: boolean; message: string }> => {
    return request(`/api/table/${encodeURIComponent(tableName)}/meta`, {
      method: 'PATCH',
      body: JSON.stringify({ updates }),
    });
  },

  createNewTable: async (payload: { id?: string; name: string; parent_id?: string | null; group_id?: string | null; icon?: string }): Promise<{ success: boolean; table: any }> => {
    return request('/api/tables/new', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteTable: async (tableName: string): Promise<{ success: boolean; message: string }> => {
    return request(`/api/table/${encodeURIComponent(tableName)}`, {
      method: 'DELETE',
    });
  },

  saveTableSchema: async (tableName: string, schema: TableSchema): Promise<{ success: boolean; message: string }> => {
    return request(`/api/table/${encodeURIComponent(tableName)}`, {
      method: 'POST',
      body: JSON.stringify({ table: schema }),
    });
  },

  getRecords: async (tableName: string): Promise<{ records: TableRecord[]; count: number }> => {
    return request(`/api/records/${encodeURIComponent(tableName)}`);
  },

  createRecord: async (tableName: string, record: Partial<TableRecord>): Promise<{ record: TableRecord }> => {
    return request(`/api/records/${encodeURIComponent(tableName)}`, {
      method: 'POST',
      body: JSON.stringify({ record }),
    });
  },

  updateRecord: async (tableName: string, id: string, record: Partial<TableRecord>): Promise<{ success: boolean }> => {
    return request(`/api/records/${encodeURIComponent(tableName)}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ record }),
    });
  },

  deleteRecord: async (tableName: string, id: string): Promise<{ success: boolean }> => {
    return request(`/api/records/${encodeURIComponent(tableName)}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};
