// =============================================================================
// [SERVICES API GATEWAY - UNIFIED ORDER EXECUTION]
// =============================================================================

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

const API_BASE_URL = 'http://localhost:8080/api/v1/execute';

export async function executeOrder<T = unknown>(
  payload: BackendRequestPayload
): Promise<BackendResponse<T>> {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP Error ${response.status}`);
  }

  return response.json();
}
