import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export const HexIdCell: React.FC<{ value: any }> = ({ value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value) {
      navigator.clipboard.writeText(String(value));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div
      onClick={handleCopy}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontFamily: 'var(--font-mono)',
        color: 'var(--accent)',
        fontWeight: 600,
        fontSize: '12px',
        cursor: 'pointer',
        padding: '0.2rem 0.4rem',
        borderRadius: 'var(--radius-sm)',
        background: copied ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
        transition: 'all 0.15s ease',
      }}
      title="Click to copy ID"
    >
      <span>{value || '—'}</span>
      {copied ? <Check size={12} color="var(--success)" /> : <Copy size={11} style={{ opacity: 0.5 }} />}
    </div>
  );
};
