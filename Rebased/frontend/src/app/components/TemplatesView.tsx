import React, { useState } from 'react';
import { useTriggerStore } from '../../store/useTriggerStore';
import { HazardTemplate } from '../../types/schema';
import {
  Bookmark,
  BookmarkPlus,
  Play,
  Trash2,
  Save,
  Search,
  Tag,
  Layers,
  Calendar,
  RefreshCw,
  FileCode,
  Dices,
  Check,
  Unlock,
  Key,
} from 'lucide-react';

interface TemplatesViewProps {
  onOpenSaveModal: () => void;
  onApplyAndNavigate: (template: HazardTemplate) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  onOpenSaveModal,
  onApplyAndNavigate,
}) => {
  const {
    templates,
    activeTemplate,
    loadTemplates,
    deleteTemplate,
    updateActiveTemplate,
    isTemplatesLoading,
    isSaving,
    folders,
  } = useTriggerStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Extract all categories
  const categories = Array.from(
    new Set(templates.map((t) => t.category || 'General').filter(Boolean))
  );

  // Filter templates
  const filteredTemplates = templates.filter((tpl) => {
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tpl.description && tpl.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tpl.tags && tpl.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory =
      selectedCategory === 'all' || (tpl.category || 'General') === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (tpl: HazardTemplate) => {
    if (confirm(`Are you sure you want to delete template "${tpl.name}"?`)) {
      setDeletingId(tpl.id);
      await deleteTemplate(tpl);
      setDeletingId(null);
    }
  };

  // Helper to count component stats for a template
  const getTemplateStats = (tpl: HazardTemplate) => {
    let fixedCount = 0;
    let randomCount = 0;
    const activeKeys: { folder: string; file: string; key: string }[] = [];

    for (const [relPath, key] of Object.entries(tpl.selections)) {
      if (!key) continue;
      if (key === '__RANDOM__') {
        randomCount++;
      } else {
        fixedCount++;
      }

      const parts = relPath.split('/');
      const fileName = parts.pop() || relPath;
      const folderName = parts.join('/') || 'Root';
      activeKeys.push({ folder: folderName, file: fileName, key });
    }

    return {
      fixedCount,
      randomCount,
      total: fixedCount + randomCount,
      activeKeys,
    };
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-hazard-card/90 border border-hazard-border rounded-3xl shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-hazard-gold/10 border border-hazard-gold/30 text-hazard-gold">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-hazard-textBright uppercase tracking-wider">
              Template Catalog & Combos
            </h2>
            <p className="text-xs text-hazard-textMuted font-mono">
              Saved Prompt Configurations in <code className="text-hazard-cyan">Hazard_Trigger_Data/Templates/</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadTemplates()}
            title="Reload Templates from Vault"
            className="p-2.5 text-hazard-textMuted hover:text-hazard-gold bg-hazard-void border border-hazard-border rounded-xl transition hover:border-hazard-gold/50"
          >
            <RefreshCw className={`w-4 h-4 ${isTemplatesLoading ? 'animate-spin text-hazard-gold' : ''}`} />
          </button>

          <button
            onClick={onOpenSaveModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-hazard-gold to-hazard-goldGlow text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-hazard-glow hover:brightness-110 active:scale-95 transition"
          >
            <BookmarkPlus className="w-4 h-4" />
            <span>Save Current as New Template</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-hazard-card/50 border border-hazard-border rounded-2xl">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-hazard-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates by name, tags, or description..."
            className="w-full pl-10 pr-4 py-2 bg-hazard-void border border-hazard-border focus:border-hazard-gold focus:outline-none rounded-xl text-xs text-hazard-textBright placeholder:text-hazard-textMuted/40 transition"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition select-none ${
              selectedCategory === 'all'
                ? 'bg-hazard-gold text-black shadow-sm'
                : 'bg-hazard-void border border-hazard-border text-hazard-textMuted hover:text-white'
            }`}
          >
            All ({templates.length})
          </button>
          {categories.map((cat) => {
            const count = templates.filter((t) => (t.category || 'General') === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition select-none ${
                  selectedCategory === cat
                    ? 'bg-hazard-gold text-black shadow-sm'
                    : 'bg-hazard-void border border-hazard-border text-hazard-textMuted hover:text-white'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-hazard-border rounded-3xl bg-hazard-card/20 flex flex-col items-center justify-center gap-3">
          <Bookmark className="w-10 h-10 text-hazard-textMuted/40" />
          <p className="text-sm text-hazard-textBright font-bold">No templates found.</p>
          <p className="text-xs text-hazard-textMuted max-w-sm">
            {searchQuery
              ? 'Try changing your search query or category filter.'
              : 'Save your first combo as a reusable template to build an armada of prompt archetypes.'}
          </p>
          <button
            onClick={onOpenSaveModal}
            className="mt-2 flex items-center gap-2 px-4 py-2 bg-hazard-gold/20 border border-hazard-gold/40 text-hazard-gold text-xs font-bold rounded-xl hover:bg-hazard-gold/30 transition"
          >
            <BookmarkPlus className="w-4 h-4" />
            <span>Create First Template</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((tpl) => {
            const isCurrentlyActive = activeTemplate?.id === tpl.id;
            const stats = getTemplateStats(tpl);
            const formattedDate = new Date(tpl.updatedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={tpl.id}
                className={`flex flex-col justify-between p-6 rounded-3xl border transition-all duration-200 bg-hazard-card/90 shadow-sm ${
                  isCurrentlyActive
                    ? 'border-hazard-gold shadow-hazard-glow ring-1 ring-hazard-gold/50'
                    : 'border-hazard-border hover:border-hazard-gold/40 hover:bg-hazard-card'
                }`}
              >
                {/* Card Header */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-xl ${
                          isCurrentlyActive
                            ? 'bg-hazard-gold text-black'
                            : 'bg-hazard-void border border-hazard-border text-hazard-gold'
                        }`}
                      >
                        <Bookmark className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-hazard-textBright leading-tight">
                          {tpl.name}
                        </h3>
                        {tpl.category && (
                          <span className="text-[10px] uppercase tracking-wider text-hazard-cyan font-bold">
                            {tpl.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Active Indicator Badge */}
                    {isCurrentlyActive && (
                      <span className="px-2.5 py-1 rounded-full bg-hazard-gold/20 border border-hazard-gold/50 text-hazard-gold text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {tpl.description ? (
                    <p className="text-xs text-hazard-textMuted line-clamp-2 leading-relaxed">
                      {tpl.description}
                    </p>
                  ) : (
                    <p className="text-xs text-hazard-textMuted/40 italic">
                      No description provided
                    </p>
                  )}

                  {/* Tags & Niche Unlock Keys */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {tpl.unlockLockedAll && (
                      <span
                        title="Unlocks all niche locked options in gacha draws for this template"
                        className="px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-[10px] font-mono font-bold flex items-center gap-1"
                      >
                        <Unlock className="w-2.5 h-2.5" />
                        <span>All Niche Unlocked</span>
                      </span>
                    )}

                    {tpl.unlockKeys && tpl.unlockKeys.length > 0 && (
                      <span
                        title={`Unlocks niche keys: ${tpl.unlockKeys.join(', ')}`}
                        className="px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-[10px] font-mono flex items-center gap-1"
                      >
                        <Key className="w-2.5 h-2.5" />
                        <span>Keys: {tpl.unlockKeys.join(', ')}</span>
                      </span>
                    )}

                    {tpl.tags && tpl.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md bg-hazard-void border border-hazard-border text-hazard-purple text-[10px] font-mono"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Stats Pill */}
                  <div className="flex items-center gap-3 pt-2 text-[11px] font-mono text-hazard-textMuted border-t border-hazard-border/50">
                    <div className="flex items-center gap-1 text-hazard-textBright">
                      <Layers className="w-3.5 h-3.5 text-hazard-cyan" />
                      <span>{stats.fixedCount} Fixed</span>
                    </div>

                    {stats.randomCount > 0 && (
                      <div className="flex items-center gap-1 text-hazard-purple font-bold">
                        <Dices className="w-3.5 h-3.5" />
                        <span>{stats.randomCount} Random</span>
                      </div>
                    )}

                    <div className="ml-auto flex items-center gap-1 text-hazard-textMuted/60 text-[10px]">
                      <Calendar className="w-3 h-3" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between gap-2 pt-5 mt-4 border-t border-hazard-border/60">
                  <div className="flex items-center gap-1.5">
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(tpl)}
                      disabled={deletingId === tpl.id}
                      title="Delete this template file from vault"
                      className="p-2 text-hazard-textMuted hover:text-hazard-crimson hover:bg-hazard-crimson/10 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Load & Apply Button */}
                    <button
                      onClick={() => onApplyAndNavigate(tpl)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-hazard-gold to-hazard-goldGlow text-black font-bold text-xs rounded-xl shadow-hazard-glow hover:brightness-110 active:scale-95 transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>{isCurrentlyActive ? 'Re-Apply' : 'Load Template'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
