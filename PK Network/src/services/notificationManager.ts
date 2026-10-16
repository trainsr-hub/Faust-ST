export type NotificationActionType = 'saved' | 'changed' | 'deleted' | 'info' | 'error';

export interface ActionNotification {
  id: string;
  type: NotificationActionType;
  title: string;
  details?: string;
  timestamp: Date;
}

/**
 * Creates a structured notification object.
 */
export function createNotification(
  type: NotificationActionType,
  title: string,
  details?: string
): ActionNotification {
  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    title,
    details,
    timestamp: new Date(),
  };
}

/**
 * Formats a short display label for a record given its available fields.
 */
export function formatRecordSummary(record?: Record<string, any> | null, fallbackId?: string): string {
  if (!record) return fallbackId ? `#${fallbackId}` : '';
  const label = record.name ?? record.title ?? record.headline ?? record.main_content ?? record.slug ?? record.id;
  return String(label || fallbackId || '').slice(0, 30);
}

/**
 * Formats a value for display in notifications.
 */
export function formatValueForDisplay(val: any, maxLength = 28): string {
  if (val === null || val === undefined || val === '') return 'empty';
  if (Array.isArray(val)) {
    const joined = val.join(', ');
    return joined.length > maxLength ? `${joined.slice(0, maxLength)}...` : joined;
  }
  const s = String(val);
  return s.length > maxLength ? `${s.slice(0, maxLength)}...` : s;
}
