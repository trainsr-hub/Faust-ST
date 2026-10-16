import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Loader2, Save, RotateCcw, ChevronUp, ChevronDown, Trash2, Edit3, Clock } from 'lucide-react';
import { formatSyncTime } from '../services/changeTracker';
import { ActionNotification } from '../services/notificationManager';

export interface UnsavedChangeGroup {
  type: 'schema' | 'record' | 'reorder';
  tableName: string;
  tableDisplayName: string;
  items: string[];
}

interface SaveStatusNotificationProps {
  isSaving: boolean;
  isSyncing: boolean;
  lastSavedTime: Date | null;
  unsavedChanges: UnsavedChangeGroup[];
  recentActivity?: ActionNotification[];
  lastAction?: ActionNotification | null;
  onSaveAll: () => Promise<void>;
  onDiscardAll?: () => void;
}

export const SaveStatusNotification: React.FC<SaveStatusNotificationProps> = ({
  isSaving,
  isSyncing,
  lastSavedTime,
  unsavedChanges,
  recentActivity = [],
  lastAction,
  onSaveAll,
  onDiscardAll,
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [showSavedPill, setShowSavedPill] = useState<boolean>(true);
  const totalChangeCount = unsavedChanges.reduce((sum, g) => sum + g.items.length, 0);
  const isDirty = totalChangeCount > 0;

  // Auto-expand when changes occur
  useEffect(() => {
    if (isDirty) setExpanded(true);
  }, [isDirty]);

  // Keep pill visible when an action occurs
  useEffect(() => {
    if (lastAction) setShowSavedPill(true);
  }, [lastAction]);

  useEffect(() => {
    if (!isDirty && !isSaving && !isSyncing) {
      setShowSavedPill(true);
      const timer = setTimeout(() => setShowSavedPill(false), 12000);
      return () => clearTimeout(timer);
    } else {
      setShowSavedPill(true);
    }
  }, [isDirty, isSaving, isSyncing, lastSavedTime]);

  // Global Ctrl+S hotkey
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (isDirty && !isSaving) onSaveAll();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDirty, isSaving, onSaveAll]);

  const isVisible = isDirty || isSaving || isSyncing || showSavedPill || Boolean(lastAction);
  const isRecentAction = Boolean(lastAction && (Date.now() - lastAction.timestamp.getTime() < 5000));

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.25rem',
        right: '1.25rem',
        zIndex: 9999,
        maxWidth: '430px',
        minWidth: isDirty ? '320px' : '260px',
        fontFamily: 'var(--font-sans)',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      {/* Expanded Change Details Card */}
      {expanded && (
        <div
          style={{
            marginBottom: '0.5rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-mid)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {/* Card Header */}
          <div
            style={{
              padding: '0.6rem 0.9rem',
              background: 'var(--bg-canvas)',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              {isDirty ? (
                <>
                  <AlertTriangle size={15} color="var(--warning)" />
                  <span style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--text-primary)' }}>
                    {totalChangeCount} Unsaved Change{totalChangeCount > 1 ? 's' : ''}
                  </span>
                </>
              ) : (
                <>
                  <Clock size={15} color="var(--accent)" />
                  <span style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--text-primary)' }}>
                    Activity & Save History
                  </span>
                </>
              )}
            </div>
            <button
              className="btn icon-only"
              onClick={() => setExpanded(false)}
              title="Minimize panel"
              style={{ width: '24px', height: '24px', minHeight: '24px' }}
            >
              <ChevronDown size={14} />
            </button>
          </div>

          {/* List of Unsaved Changes */}
          {isDirty && (
            <div style={{ maxHeight: '160px', overflowY: 'auto', padding: '0.65rem 0.9rem' }}>
              {unsavedChanges.map((group, gIdx) => (
                <div key={gIdx} style={{ marginBottom: gIdx < unsavedChanges.length - 1 ? '0.6rem' : 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {group.tableDisplayName} ({group.type})
                  </div>
                  <ul style={{ margin: '0.2rem 0 0 0', paddingLeft: '1.1rem', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {group.items.map((item, iIdx) => (
                      <li key={iIdx} style={{ margin: '0.15rem 0' }}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Actions for Dirty State */}
          {isDirty && (
            <div style={{ padding: '0.6rem 0.9rem', background: 'var(--bg-canvas)', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '0.5rem' }}>
              {onDiscardAll && (
                <button className="btn" onClick={onDiscardAll} disabled={isSaving} style={{ flex: 1, minHeight: '38px', fontSize: '12px' }}>
                  <RotateCcw size={13} style={{ marginRight: '0.35rem' }} /><span>Discard</span>
                </button>
              )}
              <button className="btn primary" onClick={onSaveAll} disabled={isSaving} style={{ flex: 2, minHeight: '38px', fontSize: '12px', fontWeight: 600 }}>
                {isSaving ? <Loader2 size={13} className="spin" style={{ marginRight: '0.35rem' }} /> : <Save size={13} style={{ marginRight: '0.35rem' }} />}
                <span>{isSaving ? 'Saving...' : 'Save All (Ctrl+S)'}</span>
              </button>
            </div>
          )}

          {/* Recent Activity Section */}
          {recentActivity.length > 0 && (
            <div style={{ padding: '0.6rem 0.9rem', borderTop: isDirty ? '1px solid var(--border-light)' : 'none', background: 'var(--bg-card)' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                Recent Operations
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '140px', overflowY: 'auto' }}>
                {recentActivity.slice(0, 5).map((act) => (
                  <div key={act.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', fontSize: '11.5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                      {act.type === 'deleted' ? <Trash2 size={12} color="var(--danger)" /> : act.type === 'changed' ? <Edit3 size={12} color="var(--accent)" /> : <CheckCircle2 size={12} color="var(--success)" />}
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={act.title}>
                        {act.title}
                      </span>
                    </div>
                    {act.details && (
                      <span style={{ fontSize: '10px', color: 'var(--text-dim)', flexShrink: 0 }}>
                        {act.details}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Persistent Status Bar / Pill */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem',
          padding: '0.45rem 0.85rem', borderRadius: 'var(--radius-pill, 9999px)', background: 'var(--bg-card)',
          border: isDirty ? '1px solid var(--warning)' : '1px solid var(--border-mid)',
          boxShadow: isDirty ? '0 0 14px rgba(245, 158, 11, 0.25)' : 'var(--shadow-md)',
          cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.2s ease', fontSize: '12px',
        }}
        title="Click to view activity and save status"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
          {isSaving || isSyncing ? (
            <Loader2 size={13} className="spin" color="var(--accent)" />
          ) : isDirty ? (
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)', display: 'inline-block', boxShadow: '0 0 6px var(--warning)' }} />
          ) : isRecentAction && lastAction ? (
            lastAction.type === 'deleted' ? <Trash2 size={13} color="var(--danger)" /> : lastAction.type === 'changed' ? <Edit3 size={13} color="var(--accent)" /> : <CheckCircle2 size={13} color="var(--success)" />
          ) : (
            <CheckCircle2 size={14} color="var(--success)" />
          )}

          <span style={{ fontWeight: 500, color: isDirty ? 'var(--warning)' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isSaving
              ? 'Saving to Turso Cloud...'
              : isSyncing
              ? 'Syncing database...'
              : isDirty
              ? `${totalChangeCount} Unsaved Change${totalChangeCount > 1 ? 's' : ''}`
              : isRecentAction && lastAction
              ? lastAction.title
              : 'All changes saved'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
          {isDirty ? (
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>(Ctrl+S)</span>
          ) : (
            <span style={{ fontSize: '10.5px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              {formatSyncTime(lastSavedTime)}
            </span>
          )}
          {expanded ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
        </div>
      </div>
    </div>
  );
};
