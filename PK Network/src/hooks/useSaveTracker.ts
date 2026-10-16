import { useState, useMemo, useCallback } from 'react';
import { TableSchema, ColumnDefinition, TableRecord, TableMetaRecord } from '../types';
import { UnsavedChangeGroup } from '../components/SaveStatusNotification';
import { computeSchemaDiff } from '../services/changeTracker';
import { api } from '../services/api';

interface UseSaveTrackerOptions {
  tables: Record<string, TableSchema>;
  setTables: React.Dispatch<React.SetStateAction<Record<string, TableSchema>>>;
  tableMetadata: TableMetaRecord[];
  showToast: (msg: string) => void;
}

export function useSaveTracker({
  tables,
  setTables,
  tableMetadata,
  showToast,
}: UseSaveTrackerOptions) {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(() => new Date());
  const [draftSchemas, setDraftSchemas] = useState<Record<string, ColumnDefinition[]>>({});
  const [draftReorders, setDraftReorders] = useState<Record<string, TableRecord[]>>({});

  // Compute all unsaved changes across tables in real-time
  const unsavedChanges: UnsavedChangeGroup[] = useMemo(() => {
    const groups: UnsavedChangeGroup[] = [];

    // 1. Schema diffs
    for (const [tblName, cols] of Object.entries(draftSchemas)) {
      const origCols = tables[tblName]?.columns || [];
      const diff = computeSchemaDiff(cols, origCols);
      if (diff.isDirty && diff.summaryList.length > 0) {
        const meta = tableMetadata.find((m) => m.id === tblName);
        groups.push({
          type: 'schema',
          tableName: tblName,
          tableDisplayName: meta?.name || tblName,
          items: diff.summaryList,
        });
      }
    }

    return groups;
  }, [draftSchemas, tables, tableMetadata]);

  const handleColumnsChange = useCallback(
    (tableName: string, newCols: ColumnDefinition[]) => {
      const origCols = tables[tableName]?.columns || [];
      const diff = computeSchemaDiff(newCols, origCols);
      setDraftSchemas((prev) => {
        if (!diff.isDirty) {
          const next = { ...prev };
          delete next[tableName];
          return next;
        }
        return { ...prev, [tableName]: newCols };
      });
    },
    [tables]
  );

  const handleReorderRecords = useCallback(
    (tableName: string, newRecords: TableRecord[], originalRecords: TableRecord[]) => {
      // Check if order actually changed
      const orderChanged =
        newRecords.length !== originalRecords.length ||
        newRecords.some((r, i) => r.id !== originalRecords[i]?.id);

      setDraftReorders((prev) => {
        if (!orderChanged) {
          const next = { ...prev };
          delete next[tableName];
          return next;
        }
        return { ...prev, [tableName]: newRecords };
      });
    },
    []
  );

  const saveTable = useCallback(
    async (tableName: string, overrideColumns?: ColumnDefinition[]): Promise<boolean> => {
      setIsSaving(true);
      try {
        const colsToSave = overrideColumns || draftSchemas[tableName];
        if (colsToSave) {
          await api.saveTableSchema(tableName, {
            table_name: tableName,
            columns: colsToSave,
          });
          setTables((prev) => ({
            ...prev,
            [tableName]: { table_name: tableName, columns: colsToSave },
          }));
          setDraftSchemas((prev) => {
            const next = { ...prev };
            delete next[tableName];
            return next;
          });
        }

        const draftRecs = draftReorders[tableName];
        const schemaCols = tables[tableName]?.columns || [];
        if (draftRecs && schemaCols.some((c) => c.slug === 'idx')) {
          for (let i = 0; i < draftRecs.length; i++) {
            const r = draftRecs[i];
            const newIdx = i + 1;
            if (r.idx !== newIdx) {
              await api.updateRecord(tableName, r.id, { idx: newIdx });
            }
          }
          setDraftReorders((prev) => {
            const next = { ...prev };
            delete next[tableName];
            return next;
          });
        }

        setLastSavedTime(new Date());
        showToast(`Saved "${tableName}" schema to Turso Cloud`);
        return true;
      } catch (e: any) {
        showToast(`Save failed: ${e.message}`);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [draftSchemas, draftReorders, tables, setTables, showToast]
  );

  const saveAll = useCallback(async (): Promise<void> => {
    setIsSaving(true);
    try {
      // Save all dirty schemas
      for (const [tblName, cols] of Object.entries(draftSchemas)) {
        await api.saveTableSchema(tblName, {
          table_name: tblName,
          columns: cols,
        });
        setTables((prev) => ({
          ...prev,
          [tblName]: { table_name: tblName, columns: cols },
        }));
      }

      // Save all dirty reorders
      for (const [tblName, recs] of Object.entries(draftReorders)) {
        const schemaCols = tables[tblName]?.columns || [];
        if (schemaCols.some((c) => c.slug === 'idx')) {
          for (let i = 0; i < recs.length; i++) {
            const r = recs[i];
            const newIdx = i + 1;
            if (r.idx !== newIdx) {
              await api.updateRecord(tblName, r.id, { idx: newIdx });
            }
          }
        }
      }

      setDraftSchemas({});
      setDraftReorders({});
      setLastSavedTime(new Date());
      showToast('All changes saved to Turso Cloud');
    } catch (e: any) {
      showToast(`Save error: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [draftSchemas, draftReorders, tables, setTables, showToast]);

  const discardAll = useCallback(() => {
    setDraftSchemas({});
    setDraftReorders({});
    showToast('Discarded all unsaved changes');
  }, [showToast]);

  // Safe tab switching auto-save
  const autoSaveBeforeTabSwitch = useCallback(
    async (outgoingTable: string): Promise<boolean> => {
      const hasDirtySchema = Boolean(draftSchemas[outgoingTable]);
      const hasDirtyReorder = Boolean(draftReorders[outgoingTable]);

      if (!hasDirtySchema && !hasDirtyReorder) return false;

      setIsSaving(true);
      try {
        if (hasDirtySchema) {
          const cols = draftSchemas[outgoingTable];
          await api.saveTableSchema(outgoingTable, {
            table_name: outgoingTable,
            columns: cols,
          });
          setTables((prev) => ({
            ...prev,
            [outgoingTable]: { table_name: outgoingTable, columns: cols },
          }));
          setDraftSchemas((prev) => {
            const next = { ...prev };
            delete next[outgoingTable];
            return next;
          });
        }

        if (hasDirtyReorder) {
          const recs = draftReorders[outgoingTable];
          const schemaCols = tables[outgoingTable]?.columns || [];
          if (schemaCols.some((c) => c.slug === 'idx')) {
            for (let i = 0; i < recs.length; i++) {
              const r = recs[i];
              const newIdx = i + 1;
              if (r.idx !== newIdx) {
                await api.updateRecord(outgoingTable, r.id, { idx: newIdx });
              }
            }
          }
          setDraftReorders((prev) => {
            const next = { ...prev };
            delete next[outgoingTable];
            return next;
          });
        }

        setLastSavedTime(new Date());
        showToast(`Auto-saved "${outgoingTable}" before switching tab`);
        return true;
      } catch (e: any) {
        showToast(`Auto-save warning: ${e.message}`);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [draftSchemas, draftReorders, tables, setTables, showToast]
  );

  return {
    isSaving,
    setIsSaving,
    lastSavedTime,
    setLastSavedTime,
    draftSchemas,
    draftReorders,
    unsavedChanges,
    handleColumnsChange,
    handleReorderRecords,
    saveTable,
    saveAll,
    discardAll,
    autoSaveBeforeTabSwitch,
  };
}
