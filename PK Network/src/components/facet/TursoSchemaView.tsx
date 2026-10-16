import React, { useState } from 'react';
import { Database, Layers, Sparkles, ExternalLink, Copy, Check, ArrowRight, ShieldCheck } from 'lucide-react';

interface TursoSchemaViewProps {
  onSwitchToPk: () => void;
}

const TURSO_SQL_DDL = `-- 1. Conditions Table (Natural Reality Predicates)
CREATE TABLE IF NOT EXISTS conditions (
  id TEXT PRIMARY KEY,
  natural_question TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  default_state INTEGER DEFAULT 0
);

-- 2. Prompt Groups Table (Conditioning Bridges)
CREATE TABLE IF NOT EXISTS prompt_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  selection_mode TEXT DEFAULT 'single',
  depends_on_conditions TEXT DEFAULT '[]',
  brings_about_conditions TEXT DEFAULT '[]'
);

-- 3. Prompts Table (Tokens & Media Metadata)
CREATE TABLE IF NOT EXISTS prompts (
  id TEXT PRIMARY KEY,
  tag TEXT NOT NULL,
  name TEXT NOT NULL,
  group_id TEXT NOT NULL REFERENCES prompt_groups(id),
  image_url TEXT,
  wiki_url TEXT,
  description TEXT,
  extra_tokens TEXT DEFAULT '[]',
  specific_brings_about TEXT DEFAULT '[]'
);`;

export const TursoSchemaView: React.FC<TursoSchemaViewProps> = ({ onSwitchToPk }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(TURSO_SQL_DDL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', height: '100%', overflowY: 'auto' }}>
      {/* Executive Card */}
      <div
        style={{
          backgroundColor: '#0a0f1d',
          borderRadius: '12px',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={20} color="#38bdf8" />
            <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#f8fafc', margin: 0, letterSpacing: '0.3px' }}>
              Turso SQLite SSOT & Main Root UI Integration
            </h2>
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, maxWidth: '780px', lineHeight: 1.5 }}>
            In accordance with the Manager's canonical invariant, data entry, sorting, foreign relations, and schema
            iteration occur directly through the <strong>Main Root UI (?app=pk)</strong> rather than cramped sandbox views.
          </p>
        </div>

        <button
          onClick={onSwitchToPk}
          style={{
            minHeight: '48px',
            padding: '0 20px',
            borderRadius: '8px',
            backgroundColor: '#38bdf8',
            color: '#030712',
            border: 'none',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)',
            flexShrink: 0,
          }}
        >
          Open Main Root UI (?app=pk)
          <ArrowRight size={16} />
        </button>
      </div>

      {/* 3 Tables Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {/* Table 1: conditions */}
        <div style={{ backgroundColor: '#0e162a', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Database size={16} color="#38bdf8" />
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#38bdf8' }}>Table 1: conditions</span>
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '12px' }}>
            Simple, natural language boolean reality predicates. Pure deterministic IF / ELSE.
          </div>
          <div style={{ background: '#020617', padding: '10px', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace', color: '#e2e8f0' }}>
            id (PK, slug)<br />
            natural_question (TEXT)<br />
            description (TEXT)<br />
            category (TEXT)<br />
            default_state (INTEGER: 0|1)
          </div>
        </div>

        {/* Table 2: prompt_groups */}
        <div style={{ backgroundColor: '#0e162a', borderRadius: '10px', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Layers size={16} color="#c084fc" />
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#c084fc' }}>Table 2: prompt_groups</span>
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '12px' }}>
            Bridging clusters defining preconditions (depends_on) and postconditions (brings_about).
          </div>
          <div style={{ background: '#020617', padding: '10px', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace', color: '#e2e8f0' }}>
            id (PK, slug)<br />
            name (TEXT)<br />
            category (TEXT)<br />
            selection_mode ('single'|'multiple')<br />
            depends_on_conditions (JSON)<br />
            brings_about_conditions (JSON)
          </div>
        </div>

        {/* Table 3: prompts */}
        <div style={{ backgroundColor: '#0e162a', borderRadius: '10px', border: '1px solid rgba(236, 72, 153, 0.2)', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={16} color="#f472b6" />
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#f472b6' }}>Table 3: prompts</span>
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '12px' }}>
            Atomic prompt tokens with authentic 720p Danbooru media references and wiki links.
          </div>
          <div style={{ background: '#020617', padding: '10px', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace', color: '#e2e8f0' }}>
            id (PK, slug)<br />
            tag (TEXT Danbooru token)<br />
            name (TEXT)<br />
            group_id (FK ➔ prompt_groups.id)<br />
            image_url (TEXT CDN)<br />
            wiki_url (TEXT documentation)
          </div>
        </div>
      </div>

      {/* SQL DDL Snippet Box */}
      <div style={{ backgroundColor: '#0a0f1d', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: '#0e162a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#f1f5f9' }}>
            SQL Migration Definition for Turso Cloud SQLite
          </span>
          <button
            onClick={handleCopy}
            style={{
              padding: '4px 12px',
              borderRadius: '6px',
              background: copied ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              color: copied ? '#34d399' : '#e2e8f0',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied SQL' : 'Copy DDL'}
          </button>
        </div>
        <pre style={{ margin: 0, padding: '16px', background: '#020617', color: '#38bdf8', fontSize: '11.5px', fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.5 }}>
          {TURSO_SQL_DDL}
        </pre>
      </div>
    </div>
  );
};
