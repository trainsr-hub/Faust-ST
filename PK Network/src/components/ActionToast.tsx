import React from 'react';
import { CheckCircle2, Edit3, Trash2, AlertCircle, Info, X } from 'lucide-react';
import { ActionNotification } from '../services/notificationManager';

interface ActionToastProps {
  notifications: ActionNotification[];
  onDismiss: (id: string) => void;
}

export const ActionToast: React.FC<ActionToastProps> = ({ notifications, onDismiss }) => {
  if (notifications.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '4.25rem',
        right: '1.25rem',
        zIndex: 99998,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem',
        maxWidth: '380px',
        width: 'calc(100vw - 2.5rem)',
        pointerEvents: 'none',
      }}
    >
      {notifications.map((n) => {
        const isSaved = n.type === 'saved';
        const isDeleted = n.type === 'deleted';
        const isChanged = n.type === 'changed';
        const isError = n.type === 'error';

        const iconColor = isError || isDeleted ? 'var(--danger)' : isSaved ? 'var(--success)' : 'var(--accent)';
        const borderColor = isError
          ? 'rgba(239, 68, 68, 0.4)'
          : isDeleted
          ? 'rgba(239, 68, 68, 0.3)'
          : isSaved
          ? 'rgba(16, 185, 129, 0.3)'
          : 'var(--border-mid)';

        return (
          <div
            key={n.id}
            style={{
              pointerEvents: 'auto',
              background: 'var(--bg-card)',
              border: `1px solid ${borderColor}`,
              boxShadow: 'var(--shadow-lg), 0 4px 16px rgba(0, 0, 0, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '0.55rem 0.75rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.55rem',
              backdropFilter: 'blur(10px)',
              animation: 'toastIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ marginTop: '2px', flexShrink: 0 }}>
              {isDeleted && <Trash2 size={15} color={iconColor} />}
              {isChanged && <Edit3 size={15} color={iconColor} />}
              {isSaved && <CheckCircle2 size={15} color={iconColor} />}
              {isError && <AlertCircle size={15} color={iconColor} />}
              {!isDeleted && !isChanged && !isSaved && !isError && <Info size={15} color={iconColor} />}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: '9.5px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      background: isDeleted || isError ? 'rgba(239, 68, 68, 0.15)' : isSaved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                      color: iconColor,
                    }}
                  >
                    {n.type}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={n.title}
                  >
                    {n.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onDismiss(n.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-tertiary)',
                    padding: '0 2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Dismiss"
                >
                  <X size={12} />
                </button>
              </div>

              {n.details && (
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    marginTop: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={n.details}
                >
                  {n.details}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
