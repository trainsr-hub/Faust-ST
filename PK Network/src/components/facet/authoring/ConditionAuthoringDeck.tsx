import React, { useState } from 'react';
import { HairCondition, PromptGroup, ConditionPrompt } from '../../../types/conditionStudio';
import { Plus, Edit2, Trash2, ExternalLink, Image as ImageIcon, Layers, HelpCircle, Sparkles } from 'lucide-react';
import { ConditionEditorDrawer, PromptEditorDrawer } from './EntityEditorDrawers';
import {
  sectionCardStyle,
  sectionHeaderStyle,
  conditionItemCardStyle,
  groupContainerStyle,
  promptCardStyle,
  badgeStyle,
  rulePillStyle,
  primaryAddBtnStyle,
  iconBtnStyle,
  inputSelectStyle,
} from './authoringStyles';

interface ConditionAuthoringDeckProps {
  conditions: HairCondition[];
  groups: PromptGroup[];
  prompts: ConditionPrompt[];
  onSaveCondition: (condition: HairCondition) => Promise<void>;
  onDeleteCondition: (id: string) => Promise<void>;
  onSavePrompt: (prompt: ConditionPrompt) => Promise<void>;
  onDeletePrompt: (id: string) => Promise<void>;
  onSaveGroup: (group: PromptGroup) => Promise<void>;
  onDeleteGroup: (id: string) => Promise<void>;
}

export const ConditionAuthoringDeck: React.FC<ConditionAuthoringDeckProps> = ({
  conditions,
  groups,
  prompts,
  onSaveCondition,
  onDeleteCondition,
  onSavePrompt,
  onDeletePrompt,
}) => {
  const [editingCondition, setEditingCondition] = useState<HairCondition | null | 'NEW'>(null);
  const [editingPrompt, setEditingPrompt] = useState<{ prompt: ConditionPrompt | null; groupId: string } | null>(null);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('All');

  const filteredGroups = selectedGroupFilter === 'All' ? groups : groups.filter((g) => g.id === selectedGroupFilter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%', overflowY: 'auto', paddingRight: '8px' }}>
      {/* ─── SECTION 1: CONDITIONS REALITY PREDICATES ─── */}
      <section style={sectionCardStyle}>
        <div style={sectionHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HelpCircle size={18} color="#38bdf8" />
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                1. Conditions Master Registry (Reality Predicates)
              </h3>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                Boolean anatomical states evaluated deterministically. Zero hard-coding — editable in real-time.
              </p>
            </div>
          </div>
          <button onClick={() => setEditingCondition('NEW')} style={primaryAddBtnStyle}>
            <Plus size={15} /> + New Condition
          </button>
        </div>

        {/* Conditions Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '10px', padding: '16px' }}>
          {conditions.map((c) => (
            <div key={c.id} style={conditionItemCardStyle}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#f1f5f9' }}>{c.naturalName}</span>
                  <span style={badgeStyle}>{c.category}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8' }}>{c.id}</span>
                  <span style={{ fontSize: '10px', color: c.defaultState ? '#34d399' : '#64748b' }}>
                    Default: {c.defaultState ? 'TRUE' : 'FALSE'}
                  </span>
                </div>
                {c.description && (
                  <span style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.2 }}>{c.description}</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button onClick={() => setEditingCondition(c)} className="btn icon-only" style={iconBtnStyle} title="Edit Condition">
                  <Edit2 size={13} />
                </button>
                <button onClick={() => onDeleteCondition(c.id)} className="btn icon-only" style={{ ...iconBtnStyle, color: '#f87171' }} title="Delete Condition">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION 2: PROMPT GROUPS & TOKENS ─── */}
      <section style={sectionCardStyle}>
        <div style={sectionHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={18} color="#c084fc" />
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                2. Prompt Groups & Token Media Matrix
              </h3>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                Groups govern unlock rules (depends on) and mutations (brings about). Add, edit, or remove prompt tokens.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <select
              style={{ ...inputSelectStyle, minHeight: '36px', padding: '0 10px', fontSize: '11.5px' }}
              value={selectedGroupFilter}
              onChange={(e) => setSelectedGroupFilter(e.target.value)}
            >
              <option value="All">All Groups ({groups.length})</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
        </div>

        {/* Groups List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
          {filteredGroups.map((g) => {
            const groupPrompts = prompts.filter((p) => p.groupId === g.id);
            return (
              <div key={g.id} style={groupContainerStyle}>
                {/* Group Top Meta */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#c084fc' }}>{g.name}</span>
                    <span style={badgeStyle}>{g.category}</span>
                    <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>({g.id})</span>
                  </div>
                  <button
                    onClick={() => setEditingPrompt({ prompt: null, groupId: g.id })}
                    style={{ ...primaryAddBtnStyle, backgroundColor: '#ec4899', borderColor: '#ec4899' }}
                  >
                    <Plus size={13} /> + Add Prompt to Group
                  </button>
                </div>

                {/* Rules Summary Pill Bar */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px', fontSize: '10.5px' }}>
                  <div style={rulePillStyle}>
                    <strong style={{ color: '#94a3b8' }}>Requires:</strong>{' '}
                    {g.dependsOnConditions.length > 0 ? (
                      g.dependsOnConditions.map((d) => `${d.conditionId} == ${d.expectedValue}`).join(', ')
                    ) : (
                      <span style={{ color: '#34d399' }}>None (Root group)</span>
                    )}
                  </div>
                  <div style={rulePillStyle}>
                    <strong style={{ color: '#94a3b8' }}>Asserts:</strong>{' '}
                    {g.bringsAboutConditions.length > 0 ? (
                      g.bringsAboutConditions.map((b) => `${b.conditionId} = ${b.setValue}`).join(', ')
                    ) : (
                      <span style={{ color: '#64748b' }}>None</span>
                    )}
                  </div>
                </div>

                {/* Prompts Cards inside Group */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '12px' }}>
                  {groupPrompts.map((p) => (
                    <div key={p.id} style={promptCardStyle}>
                      <div style={{ width: '100%', height: '110px', borderRadius: '6px', overflow: 'hidden', background: '#020617', position: 'relative' }}>
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '10px' }}>
                            <ImageIcon size={16} />
                          </div>
                        )}
                        <div style={{ position: 'absolute', top: '6px', right: '6px', display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => setEditingPrompt({ prompt: p, groupId: g.id })}
                            className="btn icon-only"
                            style={{ ...iconBtnStyle, background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(4px)' }}
                            title="Edit Prompt Token"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => onDeletePrompt(p.id)}
                            className="btn icon-only"
                            style={{ ...iconBtnStyle, background: 'rgba(2, 6, 23, 0.85)', color: '#f87171', backdropFilter: 'blur(4px)' }}
                            title="Delete Prompt Token"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>{p.name}</span>
                          {p.wikiUrl && (
                            <a href={p.wikiUrl} target="_blank" rel="noreferrer" style={{ color: '#64748b' }}>
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                        <span style={{ fontSize: '10px', color: '#38bdf8', fontFamily: 'monospace' }}>{p.tag}</span>
                        {p.description && <span style={{ fontSize: '9.5px', color: '#94a3b8', lineHeight: 1.2 }}>{p.description}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Condition Editor Modal */}
      {editingCondition && (
        <ConditionEditorDrawer
          condition={editingCondition === 'NEW' ? null : editingCondition}
          onSave={async (c) => {
            await onSaveCondition(c);
            setEditingCondition(null);
          }}
          onClose={() => setEditingCondition(null)}
        />
      )}

      {/* Prompt Editor Modal */}
      {editingPrompt && (
        <PromptEditorDrawer
          prompt={editingPrompt.prompt}
          groupId={editingPrompt.groupId}
          groups={groups}
          onSave={async (p) => {
            await onSavePrompt(p);
            setEditingPrompt(null);
          }}
          onClose={() => setEditingPrompt(null)}
        />
      )}
    </div>
  );
};


