// path: src/core/api.ts

import type { ApiRequest, ApiResponse } from './types'

const API_BASE = 'http://localhost:8080'
const PROJECT_ID = 'universe_25'

/**
 * Single reusable function for all backend communication.
 * Every call goes through POST /api/v1/execute.
 */
export async function execute<T = unknown>(
  tier: string,
  action: string,
  key?: string,
  data?: unknown,
): Promise<ApiResponse<T>> {
  const body: ApiRequest = {
    project_id: PROJECT_ID,
    tier,
    order: { action, ...(key && { key }), ...(data !== undefined && { data }) },
  }

  const res = await fetch(`${API_BASE}/api/v1/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `API error ${res.status}`)
  }

  return res.json()
}
