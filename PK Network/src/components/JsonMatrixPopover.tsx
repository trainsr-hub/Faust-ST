import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Image as ImageIcon, Check, X, AlertCircle, Sparkles } from 'lucide-react';
import { calculatePopoverPosition } from '../services/popoverPosition';

export interface JsonMatrixPopoverProps {
  columnName: string;
  initialValue: any;
  anchorRect: DOMRect | null;
  onCommit: (parsed: any) => Promise<void>;
  onClose: () => void;
}

export const JsonMatrixPopover: React.FC<JsonMatrixPopoverProps> = ({
  columnName,
  initialValue,
  anchorRect,
  onCommit,
  onClose,
}) => {
  const [draftText, setDraftText] = useState<string>('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const text = typeof initialValue === 'object' && initialValue !== null
      ? JSON.stringify(initialValue, null, 2)
      : String(initialValue ?? '');
    setDraftText(text);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }, 40);
  }, [initialValue]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [onClose]);

  const validation = useMemo(() => {
    if (!draftText.trim()) return { isValid: true, parsed: {} };
    try {
      const parsed = JSON.parse(draftText);
      return { isValid: true, parsed };
    } catch (e: any) {
      return { isValid: false, error: e.message };
    }
  }, [draftText]);

  const handleApply = async () => {
    if (!validation.isValid) return;
    await onCommit(validation.parsed);
  };

  const handleFormat = () => {
    if (validation.isValid) {
      setDraftText(JSON.stringify(validation.parsed, null, 2));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleApply();
    }
  };

  const popoverPos = calculatePopoverPosition(anchorRect, 360, 340);

  return (
    <div
      ref={popoverRef}
      style={{
        ...popoverPos.style,
        zIndex: 9999,
        background: 'var(--bg-card, #0f172a)',
        border: '1px solid var(--border-light, #334155)',
        borderRadius: 'var(--radius-md, 8px)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.55)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 0.75rem',
          borderBottom: '1px solid var(--border-light, #334155)',
          background: 'var(--bg-canvas, #090d16)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ImageIcon size={13} style={{ color: 'var(--accent, #38bdf8)' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary, #f8fafc)' }}>
            {columnName}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-dim, #94a3b8)', cursor: 'pointer', padding: '2px' }}
        >
          <X size={14} />
        </button>
      </div>

      <div style={{ padding: '0.6rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <textarea
          ref={textareaRef}
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='{\n  "default": ["https://..."]\n}'
          style={{
            width: '100%',
            height: '160px',
            resize: 'none',
            background: '#020617',
            border: validation.isValid ? '1px solid #1e293b' : '1px solid #e11d48',
            borderRadius: '6px',
            color: '#f1f5f9',
            fontFamily: 'ui-monospace, monospace',
            fontSize: '11.5px',
            lineHeight: 1.45,
            padding: '0.5rem',
            outline: 'none',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.45rem 0.65rem',
          borderTop: '1px solid var(--border-light, #334155)',
          background: 'var(--bg-canvas, #090d16)',
          fontSize: '11px',
        }}
      >
        <div>
          {validation.isValid ? (
            <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Check size={12} /> Valid JSON
            </span>
          ) : (
            <span style={{ color: '#f43f5e', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }} title={validation.error}>
              <AlertCircle size={12} /> Syntax error
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            type="button"
            className="btn"
            onClick={handleFormat}
            disabled={!validation.isValid}
            style={{ fontSize: '11px', padding: '0.2rem 0.5rem', minHeight: '26px' }}
            title="Format JSON"
          >
            <Sparkles size={11} /> Format
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleApply}
            disabled={!validation.isValid}
            style={{ fontSize: '11px', padding: '0.2rem 0.65rem', minHeight: '26px' }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
