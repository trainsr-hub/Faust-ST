import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { HairViewMode, HairCodexItem } from '../../types/hairCodex';
import { FacetCodexHeader } from './FacetCodexHeader';
import { FacetLinkageSubToolbar } from './FacetLinkageSubToolbar';
import { HairCodexSidebar } from '../hair/HairCodexSidebar';
import { FacetCodexCard } from './FacetCodexCard';
import { HairCodexRelationshipTree } from '../hair/HairCodexRelationshipTree';
import { FacetCodexInspectorModal } from './FacetCodexInspectorModal';
import { HairLinkageViewport } from '../hair/linkage/HairLinkageViewport';
import { DiscardedPoolDrawer } from '../hair/linkage/DiscardedPoolDrawer';
import { ActionToast } from '../ActionToast';
import { createNotification, ActionNotification } from '../../services/notificationManager';
import { getAllTransitiveDependentCounts } from '../../services/linkageLayout';
import {
  FacetNodeData,
  loadCachedFacetState,
  fetchLiveFacetState,
  saveCachedFacetState,
  connectFacetNodes,
  disconnectFacetNodes,
  buildFacetTreeRoots,
} from '../../services/facetLiveDataService';
import '../../styles/hairCodex.css';

interface FacetCodexAppProps {
  onSwitchToPk: () => void;
  onSwitchToHazard: () => void;
  onSwitchToPrompt: () => void;
  onSwitchToHair: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const FacetCodexApp: React.FC<FacetCodexAppProps> = ({
  onSwitchToPk, onSwitchToHazard, onSwitchToPrompt, onSwitchToHair, theme, onToggleTheme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [hasImageOnly, setHasImageOnly] = useState(false);
  const [hasParentOnly, setHasParentOnly] = useState(false);
  const [viewMode, setViewMode] = useState<HairViewMode>('graph');
  const [selectedInspectorItem, setSelectedInspectorItem] = useState<FacetNodeData | null>(null);
  const [notifications, setNotifications] = useState<ActionNotification[]>([]);
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [isDiscardedDrawerOpen, setIsDiscardedDrawerOpen] = useState(false);

  // Cached instant state + live sync
  const [cachedState] = useState(() => loadCachedFacetState());
  const [nodeDb, setNodeDb] = useState<Record<string, FacetNodeData>>(() => cachedState?.nodes || {});
  const [categories, setCategories] = useState<string[]>(() => cachedState?.categories || []);
  const [subcategories, setSubcategories] = useState<string[]>(() => cachedState?.subcategories || []);
  const [discardedIds, setDiscardedIds] = useState<Set<string>>(new Set());

  const notify = useCallback((type: any, title: string, details?: string) => {
    const notif = createNotification(type, title, details);
    setNotifications((prev) => [notif, ...prev.slice(0, 2)]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== notif.id)), 3200);
  }, []);

  // Fetch live state from isolated tempt tables
  const reloadLiveState = useCallback(async () => {
    try {
      const live = await fetchLiveFacetState(discardedIds);
      setNodeDb(live.nodes);
      setCategories(live.categories);
      setSubcategories(live.subcategories);
    } catch (e: any) {
      notify('error', 'Live Sync Failed', e.message || 'Could not reach tempt database');
    }
  }, [discardedIds, notify]);

  useEffect(() => {
    reloadLiveState();
    const handleFocus = () => reloadLiveState();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [reloadLiveState]);

  const handleCopyTag = useCallback((tag: string) => {
    navigator.clipboard?.writeText(tag).catch(() => {});
    notify('saved', `Copied: "${tag}"`, 'Ready to paste into prompt');
  }, [notify]);

  const handleConnect = useCallback((sourceId: string, targetId: string) => {
    const { nextDb, isCycle } = connectFacetNodes(nodeDb, sourceId, targetId);
    if (isCycle) return notify('error', 'Cycle Prevented', 'Circular dependency loop forbidden.');
    setNodeDb(nextDb);
    saveCachedFacetState({ nodes: nextDb, groups: [], categories, subcategories });
    const sName = nextDb[sourceId]?.name || nextDb[sourceId]?.tag || sourceId;
    const tName = nextDb[targetId]?.name || nextDb[targetId]?.tag || targetId;
    notify('saved', `${sName} ➔ ${tName}`, 'Tempt dependency linked & saved to Turso');
  }, [nodeDb, categories, subcategories, notify]);

  const handleDisconnect = useCallback((sourceId: string, targetId: string) => {
    const { nextDb } = disconnectFacetNodes(nodeDb, sourceId, targetId);
    setNodeDb(nextDb);
    saveCachedFacetState({ nodes: nextDb, groups: [], categories, subcategories });
    const sName = nodeDb[sourceId]?.name || nodeDb[sourceId]?.tag || sourceId;
    const tName = nodeDb[targetId]?.name || nodeDb[targetId]?.tag || targetId;
    notify('deleted', 'Disconnected', `${sName} ↛ ${tName}`);
  }, [nodeDb, categories, subcategories, notify]);

  const handleDiscardNode = useCallback((id: string) => {
    setDiscardedIds((prev) => new Set([...prev, id]));
    setNodeDb((prev) => {
      if (!prev[id]) return prev;
      return { ...prev, [id]: { ...prev[id], isDiscarded: true } };
    });
    notify('deleted', `Hidden: "${nodeDb[id]?.tag || id}"`, 'Moved to Discarded Pool');
  }, [nodeDb, notify]);

  const handleRestoreNode = useCallback((id: string) => {
    setDiscardedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setNodeDb((prev) => {
      if (!prev[id]) return prev;
      return { ...prev, [id]: { ...prev[id], isDiscarded: false } };
    });
    notify('saved', `Restored: "${nodeDb[id]?.tag || id}"`, 'Restored to facet canvas');
  }, [nodeDb, notify]);

  const handleRestoreAll = useCallback(() => {
    setDiscardedIds(new Set());
    setNodeDb((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => { next[k] = { ...next[k], isDiscarded: false }; });
      return next;
    });
    notify('saved', 'Restored All', 'All hidden traits restored on facet canvas');
  }, [notify]);

  const transitiveCounts = useMemo(() => getAllTransitiveDependentCounts(nodeDb), [nodeDb]);
  const treeRoots = useMemo(() => buildFacetTreeRoots(nodeDb), [nodeDb]);
  const discardedNodes = useMemo(() => Object.values(nodeDb).filter((n) => Boolean(n.isDiscarded)), [nodeDb]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return Object.values(nodeDb).filter((item) => {
      if (item.isDiscarded) return false;
      if (selectedCategory && item.category !== selectedCategory) return false;
      if (selectedSubcategory && item.subcategory !== selectedSubcategory) return false;
      if (hasImageOnly && !item.image) return false;
      if (hasParentOnly && (item.dependOn || []).length === 0) return false;
      if (q && !item.tag.toLowerCase().includes(q) && !item.name.toLowerCase().includes(q) && !item.id.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => (transitiveCounts.get(b.id) || 0) - (transitiveCounts.get(a.id) || 0) || a.tag.localeCompare(b.tag));
  }, [nodeDb, searchQuery, selectedCategory, selectedSubcategory, hasImageOnly, hasParentOnly, transitiveCounts]);

  // Sidebar category grouping
  const sidebarCategories = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    Object.values(nodeDb).forEach((n) => {
      if (!n.isDiscarded && n.category && n.subcategory) {
        if (!map.has(n.category)) map.set(n.category, new Map());
        const subMap = map.get(n.category)!;
        subMap.set(n.subcategory, (subMap.get(n.subcategory) || 0) + 1);
      }
    });

    return Array.from(map.entries()).map(([catName, subMap]) => {
      const subs = Array.from(subMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name));
      const totalCount = subs.reduce((sum, s) => sum + s.count, 0);
      return { name: catName, count: totalCount, subcategories: subs };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [nodeDb]);

  return (
    <div className="hair-codex-root">
      <FacetCodexHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        hasImageOnly={hasImageOnly}
        onToggleImageOnly={() => setHasImageOnly((v) => !v)}
        hasParentOnly={hasParentOnly}
        onToggleParentOnly={() => setHasParentOnly((v) => !v)}
        totalCount={Object.keys(nodeDb).length}
        filteredCount={filteredItems.length}
        onSwitchToPk={onSwitchToPk}
        onSwitchToHazard={onSwitchToHazard}
        onSwitchToPrompt={onSwitchToPrompt}
        onSwitchToHair={onSwitchToHair}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      {viewMode === 'graph' && (
        <FacetLinkageSubToolbar
          selectedSubcategory={selectedSubcategory}
          onSelectSubcategory={setSelectedSubcategory}
          allSubcategories={subcategories}
          orientation={orientation}
          onToggleOrientation={() => setOrientation((v) => (v === 'horizontal' ? 'vertical' : 'horizontal'))}
          onResetCanonical={reloadLiveState}
          discardedCount={discardedNodes.length}
          onOpenDiscarded={() => setIsDiscardedDrawerOpen(true)}
          onOpenCreateTagless={() => notify('info', 'Sandbox Mode', 'Prompts managed via Tempt DataGrid')}
          onSwitchToHair={onSwitchToHair}
        />
      )}

      <div className="hair-codex-body">
        {viewMode !== 'graph' && (
          <HairCodexSidebar
            categories={sidebarCategories}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onSelectCategory={setSelectedCategory}
            onSelectSubcategory={setSelectedSubcategory}
            totalItems={Object.keys(nodeDb).length}
          />
        )}

        <main className="hair-codex-content" style={{ padding: viewMode === 'graph' ? 0 : undefined }}>
          {viewMode === 'graph' ? (
            <HairLinkageViewport
              database={nodeDb}
              orientation={orientation}
              searchQuery={searchQuery}
              subcategoryFilter={selectedSubcategory}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onSelectNode={(node) => setSelectedInspectorItem(node as FacetNodeData)}
              onCopyTag={handleCopyTag}
              onDiscardNode={handleDiscardNode}
            />
          ) : viewMode === 'grid' ? (
            <div className="hair-card-grid">
              {filteredItems.map((item) => (
                <FacetCodexCard
                  key={item.id}
                  item={item}
                  linkingCount={transitiveCounts.get(item.id) || 0}
                  onSelect={setSelectedInspectorItem}
                  onCopyTag={handleCopyTag}
                />
              ))}
            </div>
          ) : (
            <HairCodexRelationshipTree
              treeRoots={treeRoots}
              onSelect={(item) => nodeDb[item.id] && setSelectedInspectorItem(nodeDb[item.id])}
              onCopyTag={handleCopyTag}
            />
          )}
        </main>
      </div>

      <FacetCodexInspectorModal
        item={selectedInspectorItem}
        database={nodeDb}
        onClose={() => setSelectedInspectorItem(null)}
        onCopyTag={handleCopyTag}
        onDiscard={handleDiscardNode}
        isDiscarded={selectedInspectorItem ? Boolean(nodeDb[selectedInspectorItem.id]?.isDiscarded) : false}
        onRestore={handleRestoreNode}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onSelectNode={setSelectedInspectorItem}
      />

      <DiscardedPoolDrawer
        isOpen={isDiscardedDrawerOpen}
        discardedNodes={discardedNodes}
        onClose={() => setIsDiscardedDrawerOpen(false)}
        onRestoreNode={handleRestoreNode}
        onRestoreAll={handleRestoreAll}
      />

      <ActionToast notifications={notifications} onDismiss={() => {}} />
    </div>
  );
};
