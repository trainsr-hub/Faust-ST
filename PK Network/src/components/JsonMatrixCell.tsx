import React, { useState, useMemo } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { JsonMatrixPopover } from './JsonMatrixPopover';

export interface JsonMatrixCellProps {
  value: any;
  columnName: string;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onCommitEdit: (value: any, shouldClose?: boolean) => Promise<void>;
  anchorRect?: DOMRect | null;
}

export function isImageUrl(url: any): boolean {
  if (typeof url !== 'string') return false;
  const s = url.trim().toLowerCase();
  return (
    s.startsWith('http://') ||
    s.startsWith('https://') ||
    s.startsWith('data:image/') ||
    s.startsWith('blob:') ||
    s.includes('dicebear') ||
    s.includes('unsplash') ||
    /\.(png|jpe?g|svg|webp|gif|avif)(\?.*)?$/i.test(s)
  );
}

export function parseAsObject(val: any): Record<string, any> | null {
  if (!val) return null;
  if (typeof val === 'object' && !Array.isArray(val)) return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
          return parsed;
        }
      } catch {}
    }
  }
  return null;
}

export const JsonMatrixCell: React.FC<JsonMatrixCellProps> = ({
  value,
  columnName,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onCommitEdit,
  anchorRect,
}) => {
  const parsedObj = useMemo(() => parseAsObject(value), [value]);
  const [hoveredPreview, setHoveredPreview] = useState<{ url: string; key: string } | null>(null);

  // Extract display items from object
  const items = useMemo(() => {
    if (!parsedObj) return [];
    return Object.entries(parsedObj).map(([key, val]) => {
      let firstUrl = '';
      let count = 0;
      if (Array.isArray(val)) {
        count = val.length;
        firstUrl = val.find((v) => isImageUrl(v)) || '';
      } else if (isImageUrl(val)) {
        count = 1;
        firstUrl = String(val);
      }
      return {
        key,
        isImg: Boolean(firstUrl),
        url: firstUrl,
        count,
        rawText: typeof val === 'object' ? JSON.stringify(val) : String(val ?? ''),
      };
    });
  }, [parsedObj]);

  return (
    <>
      <div
        onClick={onStartEdit}
        style={{
          width: '100%',
          minHeight: '28px',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.35rem',
          cursor: 'pointer',
          padding: '0.1rem 0',
        }}
        title="Click to view or edit visual matrix / JSON"
      >
        {items.length === 0 ? (
          <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>—</span>
        ) : (
          items.map((item) => (
            <div
              key={item.key}
              onMouseEnter={() => item.isImg && setHoveredPreview({ url: item.url, key: item.key })}
              onMouseLeave={() => setHoveredPreview(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.15rem 0.45rem 0.15rem 0.25rem',
                borderRadius: 'var(--radius-sm)',
                background: item.isImg ? 'rgba(56, 189, 248, 0.09)' : 'var(--bg-canvas)',
                border: item.isImg ? '1px solid rgba(56, 189, 248, 0.22)' : '1px solid var(--border-light)',
                fontSize: '11px',
                lineHeight: 1.2,
                transition: 'all 0.15s ease',
              }}
            >
              {item.isImg ? (
                <img
                  src={item.url}
                  alt={item.key}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '3px',
                    objectFit: 'cover',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: '#0f172a',
                    flexShrink: 0,
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <ImageIcon size={11} style={{ opacity: 0.5, flexShrink: 0 }} />
              )}
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: item.isImg ? 'var(--accent)' : 'var(--text-secondary)' }}>
                {item.key}
              </span>
              {item.count > 1 && (
                <span style={{ fontSize: '9.5px', color: 'var(--text-dim)', fontWeight: 500 }}>
                  ({item.count})
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Floating Hover Thumbnail Preview */}
      {hoveredPreview && !isEditing && (
        <div
          style={{
            position: 'fixed',
            zIndex: 9999,
            bottom: '24px',
            right: '24px',
            background: '#090d16',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '10px',
            padding: '6px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8)',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <img
            src={hoveredPreview.url}
            alt={hoveredPreview.key}
            style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '6px' }}
          />
          <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--accent)', textAlign: 'center' }}>
            {hoveredPreview.key}
          </span>
        </div>
      )}

      {/* Popover JSON / Matrix Editor */}
      {isEditing && (
        <JsonMatrixPopover
          columnName={columnName}
          initialValue={parsedObj || value}
          anchorRect={anchorRect || null}
          onCommit={(parsed) => onCommitEdit(parsed, true)}
          onClose={onCancelEdit}
        />
      )}
    </>
  );
};
