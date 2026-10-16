import React from 'react';
import { ColumnDefinition, TableRecord } from '../types';
import { RELATION_FILTER_PRESETS, getRelationFilterStats } from '../services/relationFilter';

export interface RelationColumnConfigProps {
  draftTarget: string;
  setDraftTarget: (val: string) => void;
  draftTargetField: string;
  setDraftTargetField: (val: string) => void;
  draftFilterRule: string;
  setDraftFilterRule?: (val: string) => void;
  targetRecords?: TableRecord[];
  targetColumns?: ColumnDefinition[];
  draftSecondaryTarget?: string;
  setDraftSecondaryTarget?: (val: string) => void;
  draftSecondaryTargetField?: string;
  setDraftSecondaryTargetField?: (val: string) => void;
  draftSecondaryFilterRule?: string;
  setDraftSecondaryFilterRule?: (val: string) => void;
  secondaryTargetRecords?: TableRecord[];
  secondaryTargetColumns?: ColumnDefinition[];
  availableTables: string[];
}

export const RelationColumnConfig: React.FC<RelationColumnConfigProps> = ({
  draftTarget, setDraftTarget, draftTargetField, setDraftTargetField,
  draftFilterRule = '', setDraftFilterRule, targetRecords = [], targetColumns = [],
  draftSecondaryTarget = '', setDraftSecondaryTarget,
  draftSecondaryTargetField = '', setDraftSecondaryTargetField,
  draftSecondaryFilterRule = '', setDraftSecondaryFilterRule,
  secondaryTargetRecords = [], secondaryTargetColumns = [], availableTables,
}) => {
  const pStats = getRelationFilterStats(targetRecords, draftFilterRule);
  const sStats = draftSecondaryTarget ? getRelationFilterStats(secondaryTargetRecords, draftSecondaryFilterRule) : null;
  const totalCombined = pStats.matched + (sStats ? sStats.matched : 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      {/* 1. Primary Target Table */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '0.3rem' }}>
          Primary Target Table
        </label>
        <select
          className="input-base" style={{ width: '100%', minHeight: '42px' }}
          value={draftTarget} onChange={(e) => setDraftTarget(e.target.value)}
        >
          {availableTables.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Primary Target Field */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '0.3rem' }}>
          Primary Display Field (Label)
        </label>
        {targetColumns && targetColumns.length > 0 ? (
          <select
            className="input-base" style={{ width: '100%', minHeight: '42px' }}
            value={draftTargetField} onChange={(e) => setDraftTargetField(e.target.value)}
          >
            <option value="">-- Auto-detect (name / title / natural_question / id) --</option>
            {targetColumns.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name} ({c.slug})</option>
            ))}
          </select>
        ) : (
          <input
            className="input-base" style={{ width: '100%', minHeight: '42px', fontFamily: 'var(--font-mono)' }}
            placeholder="e.g. name, title, natural_question"
            value={draftTargetField} onChange={(e) => setDraftTargetField(e.target.value)}
          />
        )}
      </div>

      {/* Primary Filter Rule */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '0.3rem' }}>
          Primary Filter Rule
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.4rem' }}>
          {RELATION_FILTER_PRESETS.map((preset) => (
            <button
              key={preset.id} type="button" className={`btn ${(draftFilterRule || '') === preset.rule ? 'primary' : ''}`}
              style={{ padding: '0.2rem 0.5rem', fontSize: '11px', minHeight: '28px' }}
              onClick={() => setDraftFilterRule?.(preset.rule)} title={preset.description}
            >
              <span>{preset.icon}</span><span>{preset.name}</span>
            </button>
          ))}
        </div>
        <input
          className="input-base" style={{ width: '100%', minHeight: '38px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
          placeholder="only_leaf, only_root, or =[status] == 'active'"
          value={draftFilterRule} onChange={(e) => setDraftFilterRule?.(e.target.value)}
        />
      </div>

      {/* 2. Secondary Target Table (Dual-Table Enlarged Pool) */}
      <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)' }}>
            ✦ Secondary Target Table (Dual-Reference)
          </label>
          <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontStyle: 'italic' }}>Enlarged Pool</span>
        </div>
        <select
          className="input-base" style={{ width: '100%', minHeight: '42px', marginBottom: '0.6rem' }}
          value={draftSecondaryTarget} onChange={(e) => setDraftSecondaryTarget?.(e.target.value)}
        >
          <option value="">-- None (Single Table Only) --</option>
          {availableTables.map((t) => (
            <option key={t} value={t}>{t} {t === draftTarget ? '(Self/Same Table)' : ''}</option>
          ))}
        </select>

        {draftSecondaryTarget && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.4rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
                Secondary Display Field
              </label>
              {secondaryTargetColumns && secondaryTargetColumns.length > 0 ? (
                <select
                  className="input-base" style={{ width: '100%', minHeight: '40px' }}
                  value={draftSecondaryTargetField} onChange={(e) => setDraftSecondaryTargetField?.(e.target.value)}
                >
                  <option value="">-- Auto-detect (name / title / tag / id) --</option>
                  {secondaryTargetColumns.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name} ({c.slug})</option>
                  ))}
                </select>
              ) : (
                <input
                  className="input-base" style={{ width: '100%', minHeight: '40px', fontFamily: 'var(--font-mono)' }}
                  placeholder="e.g. name, tag, natural_question"
                  value={draftSecondaryTargetField} onChange={(e) => setDraftSecondaryTargetField?.(e.target.value)}
                />
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
                Secondary Filter Rule
              </label>
              <input
                className="input-base" style={{ width: '100%', minHeight: '38px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                placeholder="only_leaf, only_root, or =[active] == 1"
                value={draftSecondaryFilterRule} onChange={(e) => setDraftSecondaryFilterRule?.(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Combined Option Pool Preview */}
      <div style={{
        padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-canvas)',
        border: '1px solid var(--border-light)', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '0.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-tertiary)' }}>Primary Pool ({draftTarget || '—'}):</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px' }}>
            <strong style={{ color: 'var(--accent)' }}>{pStats.matched}</strong> / {pStats.total}
          </span>
        </div>
        {draftSecondaryTarget && sStats && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-tertiary)' }}>Secondary Pool ({draftSecondaryTarget}):</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px' }}>
              <strong style={{ color: 'var(--tag-purple-text, #c084fc)' }}>{sStats.matched}</strong> / {sStats.total}
            </span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '0.3rem', marginTop: '0.2rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Total Enlarged Pool:</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)', fontSize: '12.5px' }}>
            {totalCombined} options available
          </span>
        </div>
      </div>
    </div>
  );
};
