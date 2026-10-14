import React, { useState, useMemo } from 'react';
import { Search, X, Layers, FolderPlus } from 'lucide-react';
import { TableGroup, TableMetaRecord, TableSchema } from '../types';
import { OutlinerGroupNode } from './OutlinerGroupNode';
import { OutlinerTableNode } from './OutlinerTableNode';

interface WorkspaceOutlinerProps {
  isOpen: boolean;
  onClose: () => void;
  groups: TableGroup[];
  tables: Record<string, TableSchema>;
  tableMetadata: TableMetaRecord[];
  activeTable: string;
  onSelectTable: (id: string) => void;
  onAddTable: (groupId?: string) => void;
  onAddGroup: (parentGroupId?: string) => void;
  onMoveTable?: (tableId: string, targetGroupId: string | null) => Promise<void>;
  onMoveGroup?: (groupId: string, targetParentGroupId: string | null) => Promise<void>;
  recordCounts: Record<string, number>;
  isMobile: boolean;
}

export const WorkspaceOutliner: React.FC<WorkspaceOutlinerProps> = ({
  isOpen,
  onClose,
  groups,
  tables,
  tableMetadata,
  activeTable,
  onSelectTable,
  onAddTable,
  onAddGroup,
  onMoveTable,
  onMoveGroup,
  recordCounts,
  isMobile,
}) => {
  const [search, setSearch] = useState<string>('');
  const [draggedItem, setDraggedItem] = useState<{ type: 'table' | 'group'; id: string } | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    groups.forEach((g) => (init[g.id] = true));
    return init;
  });

  const toggleGroup = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isDescendantOf = (candidateId: string, potentialAncestorId: string): boolean => {
    if (candidateId === potentialAncestorId) return true;
    let curr = groups.find((g) => g.id === candidateId);
    while (curr && curr.sub_group_of) {
      const parentId = curr.sub_group_of;
      if (parentId === potentialAncestorId) return true;
      curr = groups.find((g) => g.id === parentId);
    }
    return false;
  };

  const handleDragStartTable = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'table', id }));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem({ type: 'table', id });
  };

  const handleDragStartGroup = (e: React.DragEvent, id: string) => {
    e.stopPropagation();
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'group', id }));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem({ type: 'group', id });
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverTarget(null);
  };

  const handleDragOverGroup = (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedItem?.type === 'group') {
      if (draggedItem.id === targetGroupId || isDescendantOf(targetGroupId, draggedItem.id)) {
        e.dataTransfer.dropEffect = 'none';
        return;
      }
    }
    e.dataTransfer.dropEffect = 'move';
    if (dragOverTarget !== targetGroupId) setDragOverTarget(targetGroupId);
  };

  const handleDropOnGroup = async (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTarget(null);
    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return;
    const payload = JSON.parse(raw);

    if (payload.type === 'table') {
      await onMoveTable?.(payload.id, targetGroupId);
      setExpandedGroups((prev) => ({ ...prev, [targetGroupId]: true }));
    } else if (payload.type === 'group' && payload.id !== targetGroupId) {
      if (!isDescendantOf(targetGroupId, payload.id)) {
        await onMoveGroup?.(payload.id, targetGroupId);
        setExpandedGroups((prev) => ({ ...prev, [targetGroupId]: true }));
      }
    }
  };

  const handleDropOnRoot = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverTarget(null);
    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return;
    const payload = JSON.parse(raw);

    if (payload.type === 'table') {
      await onMoveTable?.(payload.id, null);
    } else if (payload.type === 'group') {
      await onMoveGroup?.(payload.id, null);
    }
  };

  // Filtered queries
  const metaMap = useMemo(() => new Map(tableMetadata.map((m) => [m.id, m])), [tableMetadata]);
  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();
    const tableList = Object.keys(tables).filter((id) => id !== 'tables');
    if (!query) return { tables: tableList, matchedGroups: new Set(groups.map((g) => g.id)) };

    const matchingTables = tableList.filter((id) => {
      const name = metaMap.get(id)?.name || id;
      return name.toLowerCase().includes(query) || id.toLowerCase().includes(query);
    });
    const matchedGroups = new Set<string>();
    groups.forEach((g) => {
      if (g.natural_name.toLowerCase().includes(query)) matchedGroups.add(g.id);
    });
    matchingTables.forEach((tId) => {
      const gId = metaMap.get(tId)?.group_id;
      if (gId) matchedGroups.add(gId);
    });
    return { tables: matchingTables, matchedGroups };
  }, [tables, search, metaMap, groups]);

  if (!isOpen && isMobile) return null;

  const rootGroups = groups.filter((g) => !g.sub_group_of);
  const assignedTableIds = new Set(tableMetadata.filter((m) => m.group_id).map((m) => m.id));
  const ungroupedTables = filteredData.tables.filter((tId) => !assignedTableIds.has(tId));
  const isRootDropTarget = dragOverTarget === '__root__';

  const content = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-canvas)',
      borderRight: '1px solid var(--border-table)',
      width: isMobile ? '280px' : isOpen ? '260px' : '0px',
      minWidth: isMobile ? '280px' : isOpen ? '260px' : '0px',
      overflow: 'hidden',
      transition: 'width 0.2s ease, min-width 0.2s ease',
      zIndex: isMobile ? 1100 : 10,
    }}>
      {/* Header */}
      <div style={{ padding: '0.75rem 0.9rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={16} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Workspace Outliner</span>
        </div>
        {isMobile && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Search Input */}
      <div style={{ padding: '0.55rem 0.85rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-sm, 6px)', padding: '0.35rem 0.6rem' }}>
          <Search size={13} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search outliner..."
            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '12px', width: '100%' }}
          />
        </div>
      </div>

      {/* Tree Content & Root Drop Target */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          if (dragOverTarget !== '__root__') setDragOverTarget('__root__');
        }}
        onDragLeave={() => {
          if (dragOverTarget === '__root__') setDragOverTarget(null);
        }}
        onDrop={handleDropOnRoot}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.5rem',
          scrollbarWidth: 'thin',
          background: isRootDropTarget ? 'rgba(var(--accent-rgb, 99, 102, 241), 0.04)' : 'transparent',
          border: isRootDropTarget ? '1px dashed var(--accent)' : '1px solid transparent',
          borderRadius: 'var(--radius-sm)',
          margin: '0.3rem',
          transition: 'all 0.15s ease',
        }}
      >
        {rootGroups.map((g) => (
          <OutlinerGroupNode
            key={g.id}
            group={g}
            depth={0}
            groups={groups}
            tableMetadata={tableMetadata}
            activeTable={activeTable}
            expandedGroups={expandedGroups}
            dragOverTarget={dragOverTarget}
            draggedItem={draggedItem}
            search={search}
            filteredTableIds={filteredData.tables}
            matchedGroupIds={filteredData.matchedGroups}
            recordCounts={recordCounts}
            onToggleGroup={toggleGroup}
            onSelectTable={onSelectTable}
            onAddTable={onAddTable}
            onDragStartTable={handleDragStartTable}
            onDragStartGroup={handleDragStartGroup}
            onDragEnd={handleDragEnd}
            onDragOverGroup={handleDragOverGroup}
            onDragLeaveGroup={() => dragOverTarget === g.id && setDragOverTarget(null)}
            onDropOnGroup={handleDropOnGroup}
          />
        ))}

        {ungroupedTables.length > 0 && (
          <div style={{ marginTop: '0.65rem', paddingTop: '0.45rem', borderTop: '1px dashed var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', padding: '0.25rem 0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Ungrouped Tables
            </div>
            {ungroupedTables.map((tId) => (
              <OutlinerTableNode
                key={tId}
                id={tId}
                depth={0}
                isActive={tId === activeTable}
                meta={metaMap.get(tId)}
                count={recordCounts[tId]}
                onSelect={onSelectTable}
                onDragStart={handleDragStartTable}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '0.55rem 0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => onAddGroup()}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.35rem', padding: '0.45rem 0.6rem', borderRadius: 'var(--radius-sm)',
            border: '1px dashed var(--border-mid)', background: 'transparent',
            color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer',
          }}
          title="Create a new root group"
        >
          <FolderPlus size={13} />
          <span>New Group</span>
        </button>
      </div>
    </div>
  );

  if (!isMobile) return content;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(3px)', zIndex: 1100, display: 'flex' }}>
      {content}
      <div style={{ flex: 1 }} onClick={onClose} />
    </div>
  );
};
