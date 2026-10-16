import React, { useState } from 'react';
import { Copy, Check, RotateCcw, Sparkles } from 'lucide-react';

interface SynthesizedPromptDockProps {
  synthesizedPrompt: string;
  selectedCount: number;
  activeConditionCount: number;
  onReset: () => void;
}

export const SynthesizedPromptDock: React.FC<SynthesizedPromptDockProps> = ({
  synthesizedPrompt,
  selectedCount,
  activeConditionCount,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!synthesizedPrompt) return;
    navigator.clipboard.writeText(synthesizedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer
      style={{
        minHeight: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        background: 'rgba(5, 10, 24, 0.98)',
        borderTop: '1px solid rgba(56, 189, 248, 0.3)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.6)',
        zIndex: 50,
        gap: '16px',
        flexShrink: 0,
      }}
    >
      {/* Left: Telemetry Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={16} color="#38bdf8" />
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '0.3px' }}>
            SYNTHESIZED PROMPT
          </span>
        </div>
        <span style={{ fontSize: '10.5px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
          {selectedCount} Selected Tokens
        </span>
        <span style={{ fontSize: '10.5px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
          {activeConditionCount} Predicates Asserted
        </span>
      </div>

      {/* Center: Live Prompt String Box */}
      <div
        style={{
          flex: 1,
          minHeight: '44px',
          background: 'rgba(2, 6, 23, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '8px',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          fontFamily: 'monospace',
          fontSize: '12px',
          color: synthesizedPrompt ? '#38bdf8' : '#64748b',
        }}
      >
        {synthesizedPrompt || 'Select prompt tokens above to synthesize Danbooru tags...'}
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={handleCopy}
          disabled={!synthesizedPrompt}
          style={{
            minHeight: '42px',
            padding: '0 16px',
            borderRadius: '6px',
            border: '1px solid',
            borderColor: copied ? '#34d399' : '#38bdf8',
            backgroundColor: copied ? 'rgba(52, 211, 153, 0.2)' : 'rgba(56, 189, 248, 0.2)',
            color: copied ? '#34d399' : '#38bdf8',
            fontSize: '12px',
            fontWeight: 700,
            cursor: synthesizedPrompt ? 'pointer' : 'not-allowed',
            opacity: synthesizedPrompt ? 1 : 0.4,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy Prompt'}
        </button>

        <button
          onClick={onReset}
          style={{
            minHeight: '42px',
            padding: '0 12px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            backgroundColor: 'transparent',
            color: '#94a3b8',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          title="Reset to default initial conditions"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>
    </footer>
  );
};
