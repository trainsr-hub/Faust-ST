import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Table as TableIcon,
  Plus,
  Search,
  X,
  Layers,
  FolderPlus
} from 'lucide-react';
import { TableGroup, TableMetaRecord, TableSchema } from '../types';

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
  recordCounts,
  isMobile,
}) => {
  const [search, setSearch] = useState<string>('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    // Default all root groups to expanded
    const init: Record<string, boolean> = {};
    groups.forEach((g) => (init[g.id] = true));
    return init;
  });

  const toggleGroup = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const metaMap = useMemo(() => {
    const map = new Map<string, TableMetaRecord>();
    tableMetadata.forEach((m) => map.set(m.id, m));
    return map;
  }, [tableMetadata]);

  // Filter tables and groups by search query
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

    // Also include groups of matching tables
    matchingTables.forEach((tId) => {
      const gId = metaMap.get(tId)?.group_id;
      if (gId) matchedGroups.add(gId);
    });

    return { tables: matchingTables, matchedGroups };
  }, [tables, search, metaMap, groups]);

  if (!isOpen && isMobile) return null;

  // Render a single table item node
  const renderTableNode = (id: string, depth = 0) => {
    const isActive = id === activeTable;
    const meta = metaMap.get(id);
    const displayName = meta?.name || id;
    const count = recordCounts[id];

    return (
      <div
        key={id}
        onClick={() => {
          onSelectTable(id);
          if (isMobile) onClose();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.45rem 0.6rem',
          paddingLeft: `${0.8 + depth * 0.9}rem`,
          borderRadius: 'var(--radius-sm, 6px)',
          background: isActive ? 'var(--accent-bg)' : 'transparent',
          color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: isActive ? 600 : 400,
          borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
          transition: 'all 0.12s ease',
        }}
        title={`Table: ${displayName} (${id})`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
          <TableIcon size={14} style={{ opacity: isActive ? 1 : 0.6, flexShrink: 0 }} />
          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {displayName}
          </span>
        </div>
        {count !== undefined && (
          <span style={{
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            padding: '0.05rem 0.35rem',
            borderRadius: 'var(--radius-full)',
            background: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
            color: isActive ? '#fff' : 'var(--text-dim)',
          }}>
            {count}
          </span>
        )}
      </div>
    );
  };

  // Render a group and its nested sub-groups & tables
  const renderGroupNode = (group: TableGroup, depth = 0) => {
    const isExpanded = Boolean(expandedGroups[group.id] || search);
    const subGroups = groups.filter((g) => g.sub_group_of === group.id);
    const groupTables = filteredData.tables.filter((tId) => metaMap.get(tId)?.group_id === group.id);

    if (search && !filteredData.matchedGroups.has(group.id) && groupTables.length === 0) {
      return null;
    }

    return (
      <div key={group.id} style={{ marginBottom: '0.2rem' }}>
        {/* Group Header */}
        <div
          onClick={(e) => toggleGroup(group.id, e)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.45rem 0.6rem',
            paddingLeft: `${0.4 + depth * 0.9}rem`,
            borderRadius: 'var(--radius-sm, 6px)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '12.5px',
            fontWeight: 600,
            userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            {isExpanded ? <ChevronDown size={13} style={{ opacity: 0.6 }} /> : <ChevronRight size={13} style={{ opacity: 0.6 }} />}
            {isExpanded ? <FolderOpen size={14} style={{ color: 'var(--accent)' }} /> : <Folder size={14} style={{ color: 'var(--accent)' }} />}
            <span>{group.natural_name}</span>
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

        {/* Group Children (Sub-Groups & Tables) */}
        {isExpanded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            {subGroups.map((sg) => renderGroupNode(sg, depth + 1))}
            {groupTables.map((tId) => renderTableNode(tId, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Top-level root groups
  const rootGroups = groups.filter((g) => !g.sub_group_of);
  // Ungrouped tables
  const assignedTableIds = new Set(tableMetadata.filter((m) => m.group_id).map((m) => m.id));
  const ungroupedTables = filteredData.tables.filter((tId) => !assignedTableIds.has(tId));

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
      {/* Outliner Header */}
      <div style={{
        padding: '0.75rem 0.9rem',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={16} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
            Workspace Outliner
          </span>
        </div>
        {isMobile && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Search Input */}
      <div style={{ padding: '0.6rem 0.9rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-mid)',
          borderRadius: 'var(--radius-sm, 6px)',
          padding: '0.35rem 0.6rem',
        }}>
          <Search size={13} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tables & groups..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '12px',
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* Tree Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0.6rem 0.5rem',
        scrollbarWidth: 'thin',
      }}>
        {rootGroups.map((g) => renderGroupNode(g, 0))}

        {ungroupedTables.length > 0 && (
          <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', padding: '0.3rem 0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Ungrouped Tables
            </div>
            {ungroupedTables.map((tId) => renderTableNode(tId, 0))}
          </div>
        )}
      </div>

      {/* Bottom Group Controls */}
      <div style={{
        padding: '0.6rem 0.9rem',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        gap: '0.5rem',
      }}>
        <button
          onClick={() => onAddGroup()}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px dashed var(--border-mid)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            cursor: 'pointer',
          }}
          title="Create a new top-level group"
        >
          <FolderPlus size={13} />
          <span>New Group</span>
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(3px)',
        zIndex: 1100,
        display: 'flex',
      }}>
        {content}
        <div style={{ flex: 1 }} onClick={onClose} />
      </div>
    );
  }

  return content;
};
