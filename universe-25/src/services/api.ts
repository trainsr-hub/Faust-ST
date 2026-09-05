// path: src/services/api.ts
// =============================================================================
// [SERVICES API GATEWAY - UNIFIED DELEGATE TO CORE API]
// =============================================================================

import { execute as coreExecute, API_BASE, DEFAULT_PROJECT_ID } from '../core/api';

export interface BackendOrder {
  action: string;
  key?: string;
  data?: unknown;
  [key: string]: unknown;
}

export interface BackendRequestPayload {
  project_id: string;
  tier: string;
  order: BackendOrder;
}

export interface BackendResponse<T = unknown> {
  status?: string;
  data: T;
  detail?: string;
}

export { API_BASE, DEFAULT_PROJECT_ID };

/**
 * Delegated executeOrder function ensuring single source of truth for network operations.
 */
export async function executeOrder<T = unknown>(
  payload: BackendRequestPayload
): Promise<BackendResponse<T>> {
  const { project_id, tier, order } = payload;
  const res = await coreExecute<T>(
    tier,
    order.action,
    order.key,
    order.data,
    project_id
  );
  return {
    status: res.status,
    data: (res.data as T),
    detail: res.message,
  };
}
