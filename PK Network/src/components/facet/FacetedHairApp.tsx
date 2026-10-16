import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sparkles, Database, Sun, Moon, Layers, Zap, Edit3, Gamepad2, RefreshCw } from 'lucide-react';
import { PromptGroupMindmap } from './mindmap/PromptGroupMindmap';
import { GroupConditionMindmap } from './mindmap/GroupConditionMindmap';
import { ConditionAuthoringDeck } from './authoring/ConditionAuthoringDeck';
import { ConditionPlayground } from './ConditionPlayground';
import { SynthesizedPromptDock } from './SynthesizedPromptDock';
import { ConditionEditorDrawer, PromptEditorDrawer } from './authoring/EntityEditorDrawers';
import { conditionLiveApi } from '../../services/conditionLiveApi';
import { buildInitialConditions } from '../../services/conditionEngine';
import { HairCondition, PromptGroup, ConditionPrompt } from '../../types/conditionStudio';
import { MindmapNode, MindmapEdge } from '../../services/mindmapLayout';
import { ActionToast } from '../ActionToast';
import { ActionNotification, createNotification } from '../../services/notificationManager';

interface FacetedHairAppProps {
  onSwitchToPk: () => void;
  onSwitchToHazard: () => void;
  onSwitchToPrompt: () => void;
  onSwitchToHair: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export type FacetMode = 'mindmap_prompts' | 'mindmap_conditions' | 'authoring' | 'playground';

export const FacetedHairApp: React.FC<FacetedHairAppProps> = ({
  onSwitchToPk, onSwitchToHazard, onSwitchToPrompt, onSwitchToHair, theme, onToggleTheme,
}) => {
  const [activeMode, setActiveMode] = useState<FacetMode>('mindmap_prompts');
  const [conditions, setConditions] = useState<HairCondition[]>([]);
  const [groups, setGroups] = useState<PromptGroup[]>([]);
  const [prompts, setPrompts] = useState<ConditionPrompt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Playground state
  const [selectedPromptIds, setSelectedPromptIds] = useState<Set<string>>(new Set());
  const [activeConditions, setActiveConditions] = useState<Record<string, boolean>>({});
  const [notifications, setNotifications] = useState<ActionNotification[]>([]);

  // Modal edit states
  const [editingCondition, setEditingCondition] = useState<HairCondition | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<{ prompt: ConditionPrompt | null; groupId: string } | null>(null);

  const notify = useCallback((type: any, title: string, details?: string) => {
    const notif = createNotification(type, title, details);
    setNotifications((prev) => [notif, ...prev.slice(0, 2)]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== notif.id)), 3200);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await conditionLiveApi.fetchAll();
      setConditions(data.conditions);
      setGroups(data.groups);
      setPrompts(data.prompts);
      setActiveConditions(buildInitialConditions(data.conditions));
    } catch (err: any) {
      notify('error', 'Sync Note', err.message);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { loadData(); }, [loadData]);

  // Mindmap 1: Re-parent prompt to target group
  const handleAssignPromptToGroup = useCallback(async (promptId: string, targetGroupId: string) => {
    const p = prompts.find((item) => item.id === promptId);
    const g = groups.find((item) => item.id === targetGroupId);
    if (!p || !g || p.groupId === targetGroupId) return;

    const updated = { ...p, groupId: targetGroupId };
    setPrompts((prev) => prev.map((item) => (item.id === promptId ? updated : item)));
    notify('saved', `Mapped to "${g.name}"`, `${p.name} (${p.tag}) re-parented`);
    try {
      await conditionLiveApi.savePrompt(updated);
    } catch (e: any) {
      notify('error', 'Map Save Failed', e.message);
    }
  }, [prompts, groups, notify]);

  // Mindmap 1: Slicing line unlinks prompt
  const handleUnlinkPromptFromGroup = useCallback(async (promptId: string) => {
    const p = prompts.find((item) => item.id === promptId);
    if (!p) return;
    notify('deleted', `Severed Prompt Link`, `${p.name} unlinked from group`);
  }, [prompts, notify]);

  // Mindmap 2: Connect Condition & Group
  const handleAddRule = useCallback(async (source: MindmapNode, target: MindmapNode) => {
    if (source.type === 'condition' && target.type === 'group') {
      const g = groups.find((item) => item.id === target.id);
      if (!g) return;
      const exists = (g.dependsOnConditions || []).some((r) => r.conditionId === source.id);
      if (exists) return;
      const updated = {
        ...g,
        dependsOnConditions: [...(g.dependsOnConditions || []), { conditionId: source.id, expectedValue: true }],
      };
      setGroups((prev) => prev.map((item) => (item.id === g.id ? updated : item)));
      notify('saved', `Precondition Added`, `${g.name} requires ${source.title} = TRUE`);
      await conditionLiveApi.saveGroup(updated);
    } else if (source.type === 'group' && target.type === 'condition') {
      const g = groups.find((item) => item.id === source.id);
      if (!g) return;
      const exists = (g.bringsAboutConditions || []).some((r) => r.conditionId === target.id);
      if (exists) return;
      const updated = {
        ...g,
        bringsAboutConditions: [...(g.bringsAboutConditions || []), { conditionId: target.id, setValue: true }],
      };
      setGroups((prev) => prev.map((item) => (item.id === g.id ? updated : item)));
      notify('saved', `Postcondition Added`, `${g.name} asserts ${target.title} = TRUE`);
      await conditionLiveApi.saveGroup(updated);
    }
  }, [groups, notify]);

  // Mindmap 2: Laser slice rule
  const handleRemoveRule = useCallback(async (edge: MindmapEdge) => {
    if (edge.edgeType === 'depends_on') {
      const g = groups.find((item) => item.id === edge.targetId);
      if (!g) return;
      const updated = {
        ...g,
        dependsOnConditions: (g.dependsOnConditions || []).filter((r) => r.conditionId !== edge.sourceId),
      };
      setGroups((prev) => prev.map((item) => (item.id === g.id ? updated : item)));
      notify('deleted', 'Rule Severed', `Removed precondition ${edge.sourceId} on ${g.name}`);
      await conditionLiveApi.saveGroup(updated);
    } else if (edge.edgeType === 'brings_about') {
      const g = groups.find((item) => item.id === edge.sourceId);
      if (!g) return;
      const updated = {
        ...g,
        bringsAboutConditions: (g.bringsAboutConditions || []).filter((r) => r.conditionId !== edge.targetId),
      };
      setGroups((prev) => prev.map((item) => (item.id === g.id ? updated : item)));
      notify('deleted', 'Rule Severed', `Removed assertion ${edge.targetId} from ${g.name}`);
      await conditionLiveApi.saveGroup(updated);
    }
  }, [groups, notify]);

  // Synthesized prompt string for playground
  const synthesizedPrompt = useMemo(() => {
    const promptMap = new Map(prompts.map((p) => [p.id, p]));
    return Array.from(selectedPromptIds).map((id) => promptMap.get(id)?.tag).filter(Boolean).join(', ');
  }, [selectedPromptIds, prompts]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#030712', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* ─── MASTER TOP NAVIGATION BAR ─── */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', background: 'rgba(5, 10, 24, 0.95)', borderBottom: '1px solid rgba(56, 189, 248, 0.25)', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)', zIndex: 40, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: 900, color: '#38bdf8', letterSpacing: '0.6px' }}>✦ CONDITION MINDMAP</span>
            <span style={{ fontSize: '9.5px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.3)', fontWeight: 800 }}>MAPPING ARCHITECT</span>
          </div>
          <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button onClick={onSwitchToPk} className="btn" style={{ fontSize: '11px', padding: '3px 8px', color: '#38bdf8' }}>Main Root UI (?app=pk)</button>
            <button onClick={onSwitchToPrompt} className="btn" style={{ fontSize: '11px', padding: '3px 8px' }}>Prompt Studio (?app=prompt)</button>
            <button onClick={onSwitchToHair} className="btn" style={{ fontSize: '11px', padding: '3px 8px', color: '#fbbf24' }}>Hair Codex (?app=hair)</button>
            <button onClick={onSwitchToHazard} className="btn" style={{ fontSize: '11px', padding: '3px 8px' }}>Hazard Arena (?app=hazard)</button>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.8)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <button onClick={() => setActiveMode('mindmap_prompts')} style={{ ...tabBtnStyle, backgroundColor: activeMode === 'mindmap_prompts' ? '#c084fc' : 'transparent', color: activeMode === 'mindmap_prompts' ? '#030712' : '#94a3b8' }}>
              🗺️ Prompts ➔ Groups
            </button>
            <button onClick={() => setActiveMode('mindmap_conditions')} style={{ ...tabBtnStyle, backgroundColor: activeMode === 'mindmap_conditions' ? '#38bdf8' : 'transparent', color: activeMode === 'mindmap_conditions' ? '#030712' : '#94a3b8' }}>
              ⚡ Groups ➔ Conditions
            </button>
            <button onClick={() => setActiveMode('authoring')} style={{ ...tabBtnStyle, backgroundColor: activeMode === 'authoring' ? '#ec4899' : 'transparent', color: activeMode === 'authoring' ? '#f8fafc' : '#94a3b8' }}>
              ✏️ Cards ({prompts.length})
            </button>
            <button onClick={() => setActiveMode('playground')} style={{ ...tabBtnStyle, backgroundColor: activeMode === 'playground' ? '#10b981' : 'transparent', color: activeMode === 'playground' ? '#030712' : '#94a3b8' }}>
              🎮 Playground
            </button>
          </div>

          <button onClick={loadData} className="btn icon-only" style={{ width: '30px', height: '30px', padding: 0 }} title="Sync with Turso"><RefreshCw size={13} className={loading ? 'spin' : ''} /></button>
          <button onClick={onToggleTheme} className="btn icon-only" style={{ width: '30px', height: '30px', padding: 0 }} title="Theme">{theme === 'dark' ? <Sun size={14} color="#f59e0b" /> : <Moon size={14} color="#38bdf8" />}</button>
        </div>
      </header>

      {/* ─── ACTIVE MINDMAP VIEW CONTENT ─── */}
      <main style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {activeMode === 'mindmap_prompts' ? (
          <PromptGroupMindmap
            groups={groups}
            prompts={prompts}
            onAssignPromptToGroup={handleAssignPromptToGroup}
            onUnlinkPromptFromGroup={handleUnlinkPromptFromGroup}
            onEditPrompt={(p) => setEditingPrompt({ prompt: p, groupId: p.groupId })}
            onEditGroup={() => {}}
          />
        ) : activeMode === 'mindmap_conditions' ? (
          <GroupConditionMindmap
            conditions={conditions}
            groups={groups}
            onAddRule={handleAddRule}
            onRemoveRule={handleRemoveRule}
            onEditCondition={(c) => setEditingCondition(c)}
            onEditGroup={() => {}}
          />
        ) : activeMode === 'authoring' ? (
          <div style={{ padding: '14px 18px', height: '100%', overflowY: 'auto' }}>
            <ConditionAuthoringDeck
              conditions={conditions}
              groups={groups}
              prompts={prompts}
              onSaveCondition={async (c) => { await conditionLiveApi.saveCondition(c); await loadData(); }}
              onDeleteCondition={async (id) => { await conditionLiveApi.deleteCondition(id); await loadData(); }}
              onSaveGroup={async (g) => { await conditionLiveApi.saveGroup(g); await loadData(); }}
              onDeleteGroup={async (id) => { await conditionLiveApi.deleteGroup(id); await loadData(); }}
              onSavePrompt={async (p) => { await conditionLiveApi.savePrompt(p); await loadData(); }}
              onDeletePrompt={async (id) => { await conditionLiveApi.deletePrompt(id); await loadData(); }}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1, overflow: 'hidden', padding: '14px 18px' }}>
              <ConditionPlayground
                conditions={conditions}
                groups={groups}
                prompts={prompts}
                selectedPromptIds={selectedPromptIds}
                setSelectedPromptIds={setSelectedPromptIds}
                activeConditions={activeConditions}
                setActiveConditions={setActiveConditions}
              />
            </div>
            <SynthesizedPromptDock
              synthesizedPrompt={synthesizedPrompt}
              selectedCount={selectedPromptIds.size}
              activeConditionCount={Object.values(activeConditions).filter(Boolean).length}
              onReset={() => { setSelectedPromptIds(new Set()); setActiveConditions(buildInitialConditions(conditions)); }}
            />
          </div>
        )}
      </main>

      {/* Editor Drawers */}
      {editingCondition && (
        <ConditionEditorDrawer
          condition={editingCondition}
          onSave={async (c) => { await conditionLiveApi.saveCondition(c); setEditingCondition(null); await loadData(); }}
          onClose={() => setEditingCondition(null)}
        />
      )}
      {editingPrompt && (
        <PromptEditorDrawer
          prompt={editingPrompt.prompt}
          groupId={editingPrompt.groupId}
          groups={groups}
          onSave={async (p) => { await conditionLiveApi.savePrompt(p); setEditingPrompt(null); await loadData(); }}
          onClose={() => setEditingPrompt(null)}
        />
      )}

      <ActionToast notifications={notifications} onDismiss={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))} />
    </div>
  );
};

const tabBtnStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  padding: '4px 11px',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};
