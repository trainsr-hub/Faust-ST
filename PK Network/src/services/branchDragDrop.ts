import { TableRecord } from '../types';
import { HierarchicalRecord, HeadingSortCandidate, extractFirstRelationId } from './headingSort';

export interface BranchDropResult {
  updatedField?: { slug: string; value: any };
  reorderedRecords: TableRecord[];
}

/**
 * Resolves record reordering and branch migration when dragging & dropping rows.
 */
export function resolveBranchDrop(
  draggedItem: HierarchicalRecord,
  targetItem: HierarchicalRecord,
  records: TableRecord[],
  headingSortActive: boolean,
  activeCandidate: HeadingSortCandidate | null,
  dragPosition: 'top' | 'bottom' | null
): BranchDropResult {
  const draggedId = draggedItem.record.id;
  const targetId = targetItem.record.id;

  // 1. Calculate reordered records list
  const nextRecords = [...records];
  const draggedIndexInRecords = nextRecords.findIndex((r) => r.id === draggedId);
  const targetIndexInRecords = nextRecords.findIndex(
    (r) => r.id === (targetItem.isHeaderNode ? targetItem.parentId : targetId)
  );

  if (draggedIndexInRecords !== -1) {
    const [moved] = nextRecords.splice(draggedIndexInRecords, 1);
    const insertAt = targetIndexInRecords !== -1
      ? (dragPosition === 'bottom' ? targetIndexInRecords + 1 : targetIndexInRecords)
      : nextRecords.length;
    nextRecords.splice(Math.max(0, insertAt), 0, moved);
  }

  // 2. If heading sort is off or no candidate, return pure reorder
  if (!headingSortActive || !activeCandidate) {
    return { reorderedRecords: nextRecords };
  }

  // 3. Heading Sort is Active: Calculate new relation / parent field
  let updatedField: { slug: string; value: any } | undefined;

  if (activeCandidate.isSelf) {
    // Direct self-relation (e.g. parent_id or child_of)
    const parentColSlug = activeCandidate.targetSelfRelColSlug || activeCandidate.column.slug;
    let newParentId: string | null = null;

    if (targetItem.isParent && (dragPosition === null || dragPosition === 'bottom')) {
      newParentId = targetItem.record.id;
    } else {
      newParentId = targetItem.parentId;
    }

    if (newParentId === draggedId) newParentId = null;

    if (draggedItem.record[parentColSlug] !== newParentId) {
      updatedField = { slug: parentColSlug, value: newParentId };
    }
  } else {
    // Foreign self-relation (e.g. quotes relating to themes)
    const relCol = activeCandidate.column;
    let targetEntityId: string | null = null;

    if (targetItem.isHeaderNode) {
      const rawHeaderId = targetItem.record.id;
      const stripped = rawHeaderId.startsWith('__header_') ? rawHeaderId.slice(9) : rawHeaderId;
      targetEntityId = stripped === 'unassigned' ? null : stripped;
    } else {
      const parentId = targetItem.parentId;
      if (parentId) {
        const stripped = parentId.startsWith('__header_') ? parentId.slice(9) : parentId;
        targetEntityId = stripped === 'unassigned' ? null : stripped;
      } else {
        targetEntityId = extractFirstRelationId(targetItem.record[relCol.slug]);
      }
    }

    const currentFirstId = extractFirstRelationId(draggedItem.record[relCol.slug]);
    if (currentFirstId !== targetEntityId) {
      let nextVal: any = targetEntityId;
      if (relCol.type === 'relation_multi') {
        const rawCurrent = draggedItem.record[relCol.slug];
        if (targetEntityId === null) {
          nextVal = [];
        } else if (Array.isArray(rawCurrent)) {
          nextVal = [targetEntityId, ...rawCurrent.slice(1).filter((x) => x !== targetEntityId)];
        } else {
          nextVal = [targetEntityId];
        }
      }
      updatedField = { slug: relCol.slug, value: nextVal };
    }
  }

  if (updatedField) {
    const movedInNext = nextRecords.find((r) => r.id === draggedId);
    if (movedInNext) {
      movedInNext[updatedField.slug] = updatedField.value;
    }
  }

  return { updatedField, reorderedRecords: nextRecords };
}
