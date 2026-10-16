import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { HairViewMode, HairCodexFilter, HairCodexItem } from '../../types/hairCodex';
import { getCodexCategories, filterCodexItems, filterAndSortCodexGrid, buildRelationshipTree } from '../../services/hairCodexService';
import { HAIR_CODEX_ITEMS } from '../../services/hairCodexData';
import { HairCodexHeader } from './HairCodexHeader';
import { HairCodexSidebar } from './HairCodexSidebar';
import { HairCodexCard } from './HairCodexCard';
import { HairCodexRelationshipTree } from './HairCodexRelationshipTree';
import { HairCodexInspectorModal } from './HairCodexInspectorModal';
import { HairLinkageViewport } from './linkage/HairLinkageViewport';
import { DiscardedPoolDrawer } from './linkage/DiscardedPoolDrawer';
import { HairLinkageSubToolbar } from './linkage/HairLinkageSubToolbar';
import { CreateTaglessNodeModal } from './linkage/CreateTaglessNodeModal';
import {
  loadLinkageDatabase,
  saveLinkageDatabase,
  addLinkage,
  removeLinkage,
  getInitialLinkageDatabase,
  setNodeDiscarded,
  restoreAllNodes,
  createTaglessNode,
  updateNodeLabel,
  deleteNode,
  getAllTransitiveDependentCounts,
} from '../../services/hairLinkageService';
import { LinkageNodeData } from '../../services/linkageLayout';
import { ActionToast } from '../ActionToast';
import { createNotification, ActionNotification } from '../../services/notificationManager';
import '../../styles/hairCodex.css';

interface HairCodexAppProps {
  onSwitchToPk: () => void;
  onSwitchToHazard: () => void;
  onSwitchToPrompt: () => void;
  onSwitchToFacet?: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const HairCodexApp: React.FC<HairCodexAppProps> = ({
  onSwitchToPk, onSwitchToHazard, onSwitchToPrompt, onSwitchToFacet, theme, onToggleTheme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [hasImageOnly, setHasImageOnly] = useState(false);
  const [hasParentOnly, setHasParentOnly] = useState(false);
  const [viewMode, setViewMode] = useState<HairViewMode>('graph');
  const [selectedInspectorItem, setSelectedInspectorItem] = useState<HairCodexItem | null>(null);
  const [notifications, setNotifications] = useState<ActionNotification[]>([]);

  // Project-Linkage Engine State
  const [linkageDb, setLinkageDb] = useState<Record<string, LinkageNodeData>>(() => loadLinkageDatabase());
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [isDiscardedDrawerOpen, setIsDiscardedDrawerOpen] = useState(false);
  const [isCreateTaglessOpen, setIsCreateTaglessOpen] = useState(false);
  const [conceptParentChildId, setConceptParentChildId] = useState<string | null>(null);

  useEffect(() => {
    saveLinkageDatabase(linkageDb);
  }, [linkageDb]);

  const notify = useCallback((type: any, title: string, details?: string) => {
    const notif = createNotification(type, title, details);
    setNotifications((prev) => [notif, ...prev.slice(0, 2)]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== notif.id)), 3200);
  }, []);

  const handleCopyTag = useCallback(
    (tag: string) => {
      navigator.clipboard?.writeText(tag).catch(() => {});
      notify('saved', `Copied: "${tag}"`, 'Ready to paste into prompt');
    },
    [notify]
  );

  const categories = useMemo(() => getCodexCategories(), []);
  const treeRoots = useMemo(() => buildRelationshipTree(), []);
  const allSubcategories = useMemo(() => {
    const set = new Set<string>();
    Object.values(linkageDb).forEach((n) => n.subcategory && set.add(n.subcategory));
    return Array.from(set).sort();
  }, [linkageDb]);

  const filter: HairCodexFilter = useMemo(
    () => ({ searchQuery, selectedCategory, selectedSubcategory, hasImageOnly, hasParentOnly }),
    [searchQuery, selectedCategory, selectedSubcategory, hasImageOnly, hasParentOnly]
  );

  const transitiveCounts = useMemo(() => getAllTransitiveDependentCounts(linkageDb), [linkageDb]);
  const sortedGridItems = useMemo(
    () => filterAndSortCodexGrid(filter, linkageDb, transitiveCounts),
    [filter, linkageDb, transitiveCounts]
  );

  // Linkage Connection Handler (A => B: B is dependent on A)
  const handleConnect = useCallback((sourceId: string, targetId: string) => {
    const { nextDb, isCycle } = addLinkage(linkageDb, sourceId, targetId);
    if (isCycle) return notify('error', 'Cycle Prevented', 'Circular dependency loop forbidden.');
    setLinkageDb(nextDb);
    notify('saved', `${linkageDb[sourceId]?.tag || sourceId} ➔ ${linkageDb[targetId]?.tag || targetId}`, 'Linkage connected');
  }, [linkageDb, notify]);

  const handleDisconnect = useCallback((sourceId: string, targetId: string) => {
    setLinkageDb(removeLinkage(linkageDb, sourceId, targetId));
    notify('deleted', 'Disconnected', `${linkageDb[sourceId]?.tag || sourceId} ↛ ${linkageDb[targetId]?.tag || targetId}`);
  }, [linkageDb, notify]);

  const handleResetCanonical = useCallback(() => {
    const canonical = getInitialLinkageDatabase();
    setLinkageDb(canonical);
    notify('info', 'Canonical Reset', 'Restored official Danbooru inheritance linkages');
  }, [notify]);

  const discardedNodes = useMemo(
    () => Object.values(linkageDb).filter((node) => Boolean(node.isDiscarded)),
    [linkageDb]
  );

  const handleDiscardNode = useCallback((id: string) => {
    setLinkageDb((prev) => setNodeDiscarded(prev, id, true));
    notify('deleted', `Hidden: "${linkageDb[id]?.tag || id}"`, 'Trait moved to Discarded Pool');
  }, [linkageDb, notify]);

  const handleRestoreNode = useCallback((id: string) => {
    setLinkageDb((prev) => setNodeDiscarded(prev, id, false));
    notify('saved', `Restored: "${linkageDb[id]?.tag || id}"`, 'Trait restored to canvas');
  }, [linkageDb, notify]);

  const handleRestoreAll = useCallback(() => {
    setLinkageDb((prev) => restoreAllNodes(prev));
    notify('saved', 'Restored All', 'All hidden traits are visible on canvas again');
  }, [notify]);

  const handleSpawnConceptParent = useCallback((childId: string) => {
    setConceptParentChildId(childId);
    setIsCreateTaglessOpen(true);
  }, []);

  const handleCreateTaglessNode = useCallback(
    (label: string, subcategory: string) => {
      const { nextDb, newId } = createTaglessNode(linkageDb, label, subcategory);
      let finalDb = nextDb;
      if (conceptParentChildId && nextDb[conceptParentChildId]) {
        const { nextDb: linkedDb } = addLinkage(nextDb, newId, conceptParentChildId);
        finalDb = linkedDb;
        const childLabel = linkageDb[conceptParentChildId]?.customLabel || linkageDb[conceptParentChildId]?.tag || conceptParentChildId;
        notify('saved', `Created Concept: "${label}"`, `Linked as parent of "${childLabel}"`);
      } else {
        notify('saved', `Created Concept: "${label}"`, 'Placed into mindmap');
      }
      setLinkageDb(finalDb);
      setConceptParentChildId(null);
    },
    [linkageDb, conceptParentChildId, notify]
  );

  const handleUpdateLabel = useCallback(
    (id: string, newLabel: string) => {
      setLinkageDb((prev) => updateNodeLabel(prev, id, newLabel));
      notify('saved', 'Renamed Concept', `New label: "${newLabel}"`);
    },
    [notify]
  );

  const handleDeleteNode = useCallback(
    (id: string) => {
      const targetLabel = linkageDb[id]?.customLabel || linkageDb[id]?.tag || id;
      setLinkageDb((prev) => deleteNode(prev, id));
      notify('deleted', 'Deleted Concept', `"${targetLabel}" removed from mindmap`);
    },
    [linkageDb, notify]
  );

  return (
    <div className="hair-codex-root">
      <HairCodexHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        hasImageOnly={hasImageOnly}
        onToggleImageOnly={() => setHasImageOnly((prev) => !prev)}
        hasParentOnly={hasParentOnly}
        onToggleParentOnly={() => setHasParentOnly((prev) => !prev)}
        totalCount={HAIR_CODEX_ITEMS.length}
        filteredCount={sortedGridItems.length}
        onSwitchToPk={onSwitchToPk}
        onSwitchToHazard={onSwitchToHazard}
        onSwitchToPrompt={onSwitchToPrompt}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      {/* Sub-toolbar for Linkage View */}
      {viewMode === 'graph' && (
        <HairLinkageSubToolbar
          selectedSubcategory={selectedSubcategory}
          onSelectSubcategory={setSelectedSubcategory}
          allSubcategories={allSubcategories}
          orientation={orientation}
          onToggleOrientation={() => setOrientation((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'))}
          onResetCanonical={handleResetCanonical}
          discardedCount={discardedNodes.length}
          onOpenDiscarded={() => setIsDiscardedDrawerOpen(true)}
          onOpenCreateTagless={() => setIsCreateTaglessOpen(true)}
          onSwitchToFacet={onSwitchToFacet}
        />
      )}

      <div className="hair-codex-body">
        {viewMode !== 'graph' && (
          <HairCodexSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onSelectCategory={setSelectedCategory}
            onSelectSubcategory={setSelectedSubcategory}
            totalItems={HAIR_CODEX_ITEMS.length}
          />
        )}

        <main className="hair-codex-content" style={{ padding: viewMode === 'graph' ? 0 : undefined }}>
          {viewMode === 'graph' ? (
            <HairLinkageViewport
              database={linkageDb}
              orientation={orientation}
              searchQuery={searchQuery}
              subcategoryFilter={selectedSubcategory}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onSelectNode={(node) => setSelectedInspectorItem(node as any)}
              onCopyTag={handleCopyTag}
              onDiscardNode={handleDiscardNode}
              onSpawnConceptParent={handleSpawnConceptParent}
            />
          ) : viewMode === 'grid' ? (
            <div className="hair-card-grid">
              {sortedGridItems.map((item) => (
                <HairCodexCard
                  key={item.id}
                  item={item}
                  linkingCount={transitiveCounts.get(item.id) || 0}
                  onSelect={setSelectedInspectorItem}
                  onCopyTag={handleCopyTag}
                />
              ))}
            </div>
          ) : (
            <HairCodexRelationshipTree treeRoots={treeRoots} onSelect={setSelectedInspectorItem} onCopyTag={handleCopyTag} />
          )}
        </main>
      </div>

      <HairCodexInspectorModal
        item={selectedInspectorItem}
        database={linkageDb}
        onClose={() => setSelectedInspectorItem(null)}
        onCopyTag={handleCopyTag}
        onDiscard={handleDiscardNode}
        isDiscarded={selectedInspectorItem ? Boolean(linkageDb[selectedInspectorItem.id]?.isDiscarded) : false}
        onRestore={handleRestoreNode}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onUpdateLabel={handleUpdateLabel}
        onDeleteNode={handleDeleteNode}
      />

      <DiscardedPoolDrawer
        isOpen={isDiscardedDrawerOpen}
        discardedNodes={discardedNodes}
        onClose={() => setIsDiscardedDrawerOpen(false)}
        onRestoreNode={handleRestoreNode}
        onRestoreAll={handleRestoreAll}
      />

      <CreateTaglessNodeModal
        isOpen={isCreateTaglessOpen}
        defaultSubcategory={conceptParentChildId ? linkageDb[conceptParentChildId]?.subcategory : selectedSubcategory}
        parentOfNodeTag={conceptParentChildId ? (linkageDb[conceptParentChildId]?.customLabel || linkageDb[conceptParentChildId]?.tag) : null}
        onClose={() => {
          setIsCreateTaglessOpen(false);
          setConceptParentChildId(null);
        }}
        onCreate={handleCreateTaglessNode}
      />

      <ActionToast notifications={notifications} onDismiss={() => {}} />
    </div>
  );
};
