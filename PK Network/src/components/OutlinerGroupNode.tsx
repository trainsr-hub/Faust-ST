import React from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus, GripVertical } from 'lucide-react';
import { TableGroup, TableMetaRecord } from '../types';
import { OutlinerTableNode } from './OutlinerTableNode';

interface OutlinerGroupNodeProps {
  group: TableGroup;
  depth: number;
  groups: TableGroup[];
  tableMetadata: TableMetaRecord[];
  activeTable: string;
  expandedGroups: Record<string, boolean>;
  dragOverTarget: string | null;
  draggedItem: { type: 'table' | 'group'; id: string } | null;
  search: string;
  filteredTableIds: string[];
  matchedGroupIds: Set<string>;
  recordCounts: Record<string, number>;
  onToggleGroup: (id: string, e: React.MouseEvent) => void;
  onSelectTable: (id: string) => void;
  onAddTable: (groupId: string) => void;
  onDragStartTable: (e: React.DragEvent, id: string) => void;
  onDragStartGroup: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onDragOverGroup: (e: React.DragEvent, id: string) => void;
  onDragLeaveGroup: (e: React.DragEvent, id: string) => void;
  onDropOnGroup: (e: React.DragEvent, targetGroupId: string) => void;
}

export const OutlinerGroupNode: React.FC<OutlinerGroupNodeProps> = ({
  group,
  depth,
  groups,
  tableMetadata,
  activeTable,
  expandedGroups,
  dragOverTarget,
  draggedItem,
  search,
  filteredTableIds,
  matchedGroupIds,
  recordCounts,
  onToggleGroup,
  onSelectTable,
  onAddTable,
  onDragStartTable,
  onDragStartGroup,
  onDragEnd,
  onDragOverGroup,
  onDragLeaveGroup,
  onDropOnGroup,
}) => {
  const metaMap = React.useMemo(() => {
    const map = new Map<string, TableMetaRecord>();
    tableMetadata.forEach((m) => map.set(m.id, m));
    return map;
  }, [tableMetadata]);

  const isExpanded = Boolean(expandedGroups[group.id] || search);
  const subGroups = groups.filter((g) => g.sub_group_of === group.id);
  const groupTables = filteredTableIds.filter((tId) => metaMap.get(tId)?.group_id === group.id);

  if (search && !matchedGroupIds.has(group.id) && groupTables.length === 0) {
    return null;
  }

  const isDropTarget = dragOverTarget === group.id;
  const isBeingDragged = draggedItem?.type === 'group' && draggedItem.id === group.id;

  return (
    <div
      style={{
        marginBottom: '0.2rem',
        opacity: isBeingDragged ? 0.4 : 1,
        transition: 'opacity 0.15s ease',
      }}
    >
      {/* Folder Header */}
      <div
        draggable
        onDragStart={(e) => onDragStartGroup(e, group.id)}
        onDragEnd={onDragEnd}
        onDragOver={(e) => onDragOverGroup(e, group.id)}
        onDragLeave={(e) => onDragLeaveGroup(e, group.id)}
        onDrop={(e) => onDropOnGroup(e, group.id)}
        onClick={(e) => onToggleGroup(group.id, e)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.42rem 0.55rem',
          paddingLeft: `${0.4 + depth * 0.85}rem`,
          borderRadius: 'var(--radius-sm, 6px)',
          color: 'var(--text-primary)',
          cursor: 'grab',
          fontSize: '12.5px',
          fontWeight: 600,
          userSelect: 'none',
          background: isDropTarget ? 'var(--accent-bg)' : 'transparent',
          border: isDropTarget ? '1px dashed var(--accent)' : '1px solid transparent',
          transition: 'all 0.12s ease',
        }}
        title={`Group: ${group.natural_name} - Drag to nest or drop items here`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden' }}>
          <GripVertical size={11} style={{ opacity: 0.3, flexShrink: 0 }} />
          {isExpanded ? <ChevronDown size={13} style={{ opacity: 0.6 }} /> : <ChevronRight size={13} style={{ opacity: 0.6 }} />}
          {isExpanded ? <FolderOpen size={14} style={{ color: 'var(--accent)' }} /> : <Folder size={14} style={{ color: 'var(--accent)' }} />}
          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {group.natural_name}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddTable(group.id);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            padding: '0.15rem',
            display: 'flex',
            alignItems: 'center',
          }}
          title={`Add table inside ${group.natural_name}`}
        >
          <Plus size={13} />
        </button>
      </div>

      {/* Children: Sub-Groups & Tables */}
      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.08rem' }}>
          {subGroups.map((sg) => (
            <OutlinerGroupNode
              key={sg.id}
              group={sg}
              depth={depth + 1}
              groups={groups}
              tableMetadata={tableMetadata}
              activeTable={activeTable}
              expandedGroups={expandedGroups}
              dragOverTarget={dragOverTarget}
              draggedItem={draggedItem}
              search={search}
              filteredTableIds={filteredTableIds}
              matchedGroupIds={matchedGroupIds}
              recordCounts={recordCounts}
              onToggleGroup={onToggleGroup}
              onSelectTable={onSelectTable}
              onAddTable={onAddTable}
              onDragStartTable={onDragStartTable}
              onDragStartGroup={onDragStartGroup}
              onDragEnd={onDragEnd}
              onDragOverGroup={onDragOverGroup}
              onDragLeaveGroup={onDragLeaveGroup}
              onDropOnGroup={onDropOnGroup}
            />
          ))}
          {groupTables.map((tId) => (
            <OutlinerTableNode
              key={tId}
              id={tId}
              depth={depth + 1}
              isActive={tId === activeTable}
              meta={metaMap.get(tId)}
              count={recordCounts[tId]}
              onSelect={onSelectTable}
              onDragStart={onDragStartTable}
              onDragEnd={onDragEnd}
            />
          ))}
        </div>
      )}
    </div>
  );
};
