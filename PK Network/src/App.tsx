import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TableTabs } from './components/TableTabs';
import { SchemaView } from './components/SchemaView';
import { DataGrid } from './components/DataGrid';
import { MobileCardView } from './components/MobileCardView';
import { MobileRecordDrawer } from './components/MobileRecordDrawer';
import { AuthModal } from './components/AuthModal';
import { VaultGate } from './components/VaultGate';
import { TableSettingsModal } from './components/TableSettingsModal';
import { NewTableModal } from './components/NewTableModal';
import { TableSchema, TableRecord } from './types';
import { api, getAuthKey, checkUrlKey } from './services/api';

export const App: React.FC = () => {
  const [mode, setMode] = useState<'schema' | 'data'>('data');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [tables, setTables] = useState<Record<string, TableSchema>>({});
  const [activeTableName, setActiveTableName] = useState<string>('quotes');
  const [records, setRecords] = useState<TableRecord[]>([]);
  const [recordCounts, setRecordCounts] = useState<Record<string, number>>({});
  const [tableMetadata, setTableMetadata] = useState<TableRecord[]>([]);
  const [relationOptions, setRelationOptions] = useState<Record<string, { id: string; label: string }[]>>({});

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  // Auth & Lock State
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [initialUrlKey, setInitialUrlKey] = useState<string>('');

  // Drawer & Modals
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<TableRecord | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [tableSettingsOpen, setTableSettingsOpen] = useState<boolean>(false);
  const [newTableModalOpen, setNewTableModalOpen] = useState<boolean>(false);

  // Responsive Hook
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  // Pure RAM lazy-loader for foreign relation options (0ms initial startup, zero waterfall)
  const ensureRelationLoaded = async (targetTable?: string) => {
    if (!targetTable || relationOptions[targetTable]) return;
    try {
      const res = await api.getRecords(targetTable);
      if (res.records) {
        const opts = res.records.slice(0, 100).map((r) => {
          const label = r.name || r.main_content || r.title || r.id;
          return { id: r.id, label: String(label).slice(0, 36) };
        });
        setRelationOptions((prev) => ({ ...prev, [targetTable]: opts }));
      }
    } catch {
      // Soft-fail for missing table
    }
  };

  const loadRecords = async (tableName: string) => {
    try {
      const res = await api.getRecords(tableName);
      setRecords(res.records || []);
      setRecordCounts((prev) => ({ ...prev, [tableName]: res.count || res.records?.length || 0 }));
    } catch (e: any) {
      console.warn('Error loading records for table:', tableName, e);
      setRecords([]);
    }
  };

  // Fast single-query startup (zero multi-table waterfall)
  const refreshAll = async () => {
    setIsSyncing(true);
    try {
      const health = await api.checkHealth().catch(() => null);
      setIsConnected(Boolean(health && health.status === 'connected'));

      const tablesRes = await api.getTables();
      if (tablesRes.tables && Object.keys(tablesRes.tables).length > 0) {
        setTables(tablesRes.tables);

        // Populate sovereign metadata registry
        if (tablesRes.metadata && tablesRes.metadata.length > 0) {
          setTableMetadata(tablesRes.metadata);
        } else {
          try {
            const metaRes = await api.getRecords('tables');
            if (metaRes.records) setTableMetadata(metaRes.records);
          } catch {}
        }

        const tableKeys = Object.keys(tablesRes.tables);
        const dataKeys = tableKeys.filter((k) => k !== 'tables');
        const targetTable = tableKeys.includes(activeTableName)
          ? activeTableName
          : dataKeys[0] || tableKeys[0];
        setActiveTableName(targetTable);
        // Only load records for the active table
        await loadRecords(targetTable);
      }
      showToast('Turso database synchronized');
    } catch (err: any) {
      console.error(err);
      setIsConnected(false);
      showToast(`API: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const checkAuthAndLoad = async () => {
    setIsSyncing(true);
    try {
      const auth = await api.verifyAuth();
      if (auth.required && !auth.authorized) {
        setIsLocked(true);
        setIsSyncing(false);
        return;
      }
      setIsLocked(false);
      await refreshAll();
    } catch {
      setIsLocked(true);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const magicKey = checkUrlKey();
    if (magicKey) setInitialUrlKey(magicKey);
    checkAuthAndLoad();

    const handleAuthRequired = () => setIsLocked(true);
    window.addEventListener('pk_auth_required', handleAuthRequired);
    return () => window.removeEventListener('pk_auth_required', handleAuthRequired);
  }, []);

  const handleSelectTable = async (name: string) => {
    setActiveTableName(name);
    await loadRecords(name);
  };

  // Project Logic: Create table
  const handleCreateNewTable = async (newTable: { id: string; name: string; parent_id: string | null }) => {
    try {
      const res = await api.createNewTable(newTable);
      if (res.table) {
        setTables((prev) => ({ ...prev, [newTable.id]: res.table.schema }));
        setTableMetadata((prev) => [...prev, { id: newTable.id, name: newTable.name, parent_id: newTable.parent_id }]);
        setActiveTableName(newTable.id);
        await loadRecords(newTable.id);
        showToast(`Created table "${newTable.name}"`);
      }
    } catch (e: any) {
      showToast(`Creation failed: ${e.message}`);
      throw e;
    }
  };

  // Project Logic: Update table metadata (natural name, parent selector)
  const handleUpdateTableSettings = async (updates: { name: string; parent_id: string | null }) => {
    try {
      await api.updateTableMeta(activeTableName, updates);
      setTableMetadata((prev) =>
        prev.map((m) => (m.id === activeTableName ? { ...m, ...updates } : m))
      );
      showToast(`Saved settings for "${updates.name}"`);
    } catch (e: any) {
      showToast(`Update failed: ${e.message}`);
      throw e;
    }
  };

  // Project Logic: Delete table
  const handleDeleteTable = async (tableName: string) => {
    try {
      await api.deleteTable(tableName);
      setTables((prev) => {
        const next = { ...prev };
        delete next[tableName];
        return next;
      });
      setTableMetadata((prev) => prev.filter((m) => m.id !== tableName));
      showToast(`Deleted table "${tableName}"`);
      const remaining = Object.keys(tables).filter((k) => k !== tableName && k !== 'tables');
      if (remaining.length > 0) {
        setActiveTableName(remaining[0]);
        await loadRecords(remaining[0]);
      }
    } catch (e: any) {
      showToast(`Delete failed: ${e.message}`);
      throw e;
    }
  };

  const handleSaveSchema = async (updated: TableSchema) => {
    setIsSaving(true);
    try {
      await api.saveTableSchema(updated.table_name, updated);
      setTables((prev) => ({ ...prev, [updated.table_name]: updated }));
      showToast(`Saved schema for "${updated.table_name}" to Turso Cloud`);
    } catch (e: any) {
      showToast(`Failed to save schema: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // RAM-First Optimistic Save with Field-Level Dirty Diff
  const handleSaveRecord = async (formData: Partial<TableRecord>) => {
    setIsSaving(true);
    try {
      if (formData.id && records.some((r) => r.id === formData.id)) {
        // Extract only changed dirty fields to avoid overwriting concurrent edits
        const existing = records.find((r) => r.id === formData.id);
        const dirtyDiff: Record<string, any> = {};
        for (const k of Object.keys(formData)) {
          if (formData[k] !== existing?.[k]) {
            dirtyDiff[k] = formData[k];
          }
        }
        // Update in RAM immediately (0ms)
        setRecords((prev) => prev.map((r) => (r.id === formData.id ? { ...r, ...formData } : r)));
        if (activeTableName === 'tables') {
          setTableMetadata((prev) => prev.map((m) => (m.id === formData.id ? { ...m, ...formData } : m)));
        }
        
        // Push only dirty diff to Turso
        if (Object.keys(dirtyDiff).length > 0) {
          await api.updateRecord(activeTableName, formData.id, dirtyDiff);
        }
        showToast(`Updated record #${formData.id}`);
      } else {
        const res = await api.createRecord(activeTableName, formData);
        setRecords((prev) => [res.record, ...prev]);
        setRecordCounts((prev) => ({ ...prev, [activeTableName]: (prev[activeTableName] || 0) + 1 }));
        if (activeTableName === 'tables') {
          setTableMetadata((prev) => [...prev, res.record]);
          // Pull new schema definition created on backend
          const fresh = await api.getTables();
          if (fresh.tables) setTables(fresh.tables);
        }
        showToast('Created new record on Turso Cloud');
      }
    } catch (e: any) {
      showToast(`Save failed: ${e.message}`);
      throw e;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    // Optimistic deletion in RAM
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setRecordCounts((prev) => ({ ...prev, [activeTableName]: Math.max(0, (prev[activeTableName] || 1) - 1) }));
    if (activeTableName === 'tables') {
      setTableMetadata((prev) => prev.filter((m) => m.id !== id));
      setTables((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
    try {
      await api.deleteRecord(activeTableName, id);
      showToast(`Deleted record #${id}`);
    } catch (e: any) {
      showToast(`Delete failed: ${e.message}`);
      await loadRecords(activeTableName);
    }
  };

  // Discrete Field-Level Inline Update
  const handleInlineUpdate = async (id: string, field: string, value: any) => {
    // 0ms RAM update
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    if (activeTableName === 'tables') {
      setTableMetadata((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
    }
    try {
      // Send discrete field diff to Turso
      await api.updateRecord(activeTableName, id, { [field]: value });
    } catch (e: any) {
      showToast(`Update failed: ${e.message}`);
      await loadRecords(activeTableName);
    }
  };

  const currentSchema = tables[activeTableName] || { table_name: activeTableName, columns: [] };

  const openDrawerForRecord = (record: TableRecord | null) => {
    setSelectedRecord(record);
    // Lazily load relations required by this table's schema only when drawer opens
    currentSchema.columns
      .filter((c) => (c.type === 'relation_single' || c.type === 'relation_multi') && c.metadata?.target)
      .forEach((c) => ensureRelationLoaded(c.metadata?.target));
    setDrawerOpen(true);
  };

  return (
    <div className="app-container">
      <Header
        mode={mode}
        setMode={setMode}
        isConnected={isConnected}
        isSyncing={isSyncing}
        onSync={refreshAll}
        onOpenAuth={() => setAuthModalOpen(true)}
        hasAuthKey={Boolean(getAuthKey())}
        theme={theme}
        toggleTheme={toggleTheme}
        onNewRecord={() => openDrawerForRecord(null)}
        isMobile={isMobile}
      />

      <TableTabs
        tables={tables}
        activeTable={activeTableName}
        onSelectTable={handleSelectTable}
        onAddTable={() => setNewTableModalOpen(true)}
        onOpenTableSettings={() => setTableSettingsOpen(true)}
        recordCounts={recordCounts}
        tableMetadata={tableMetadata}
      />

      <main style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {mode === 'schema' ? (
          <SchemaView
            schema={currentSchema}
            availableTables={Object.keys(tables)}
            onSaveSchema={handleSaveSchema}
            isSaving={isSaving}
            isMobile={isMobile}
          />
        ) : isMobile ? (
          <MobileCardView
            schema={currentSchema}
            records={records}
            onSelectRecord={(r) => openDrawerForRecord(r)}
            onNewRecord={() => openDrawerForRecord(null)}
            onDeleteRecord={handleDeleteRecord}
            isLoading={isSyncing}
          />
        ) : (
          <DataGrid
            schema={currentSchema}
            records={records}
            onSelectRecord={(r) => openDrawerForRecord(r)}
            onNewRecord={() => openDrawerForRecord(null)}
            onDeleteRecord={handleDeleteRecord}
            onInlineUpdate={handleInlineUpdate}
            onReorderRecords={(newRecs) => setRecords(newRecs)}
            isLoading={isSyncing}
            relationOptions={relationOptions}
            onEnsureRelation={ensureRelationLoaded}
          />
        )}
      </main>

      <MobileRecordDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        schema={currentSchema}
        record={selectedRecord}
        onSave={handleSaveRecord}
        onDelete={handleDeleteRecord}
        isSaving={isSaving}
        relationOptions={relationOptions}
      />

      <TableSettingsModal
        isOpen={tableSettingsOpen}
        onClose={() => setTableSettingsOpen(false)}
        tableId={activeTableName}
        tableMeta={tableMetadata.find((m) => m.id === activeTableName)}
        availableTables={tableMetadata}
        onSave={handleUpdateTableSettings}
        onDelete={handleDeleteTable}
      />

      <NewTableModal
        isOpen={newTableModalOpen}
        onClose={() => setNewTableModalOpen(false)}
        availableTables={tableMetadata}
        onCreate={handleCreateNewTable}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSaved={refreshAll}
      />

      {isLocked && (
        <VaultGate
          initialKey={initialUrlKey}
          onUnlocked={() => {
            setIsLocked(false);
            refreshAll();
            showToast('Vault unlocked. Edge connected.');
          }}
        />
      )}

      {toast && (
        <div className="toast-container">
          <div className="toast">{toast}</div>
        </div>
      )}
    </div>
  );
};
