import React from 'react';
import { User, Tag, Award, Sparkles, Brain, MessageSquare, ShieldAlert, Link2, Info, Globe, Search, ChevronDown, ChevronRight, X, FileText, RotateCcw } from 'lucide-react';
import { TagListEditor } from './TagListEditor';
import { WorldManager, WorldFile, WorldTreeNode, AssociationResolution, WorldNode } from '../../../utils/worldManager';

export interface CharacterInfoModeProps {
  characterId: string;
  activeVariantKey: string;
  // Nomenclature
  names: string[];
  onNamesChange: (names: string[]) => void;
  nicknames: string[];
  onNicknamesChange: (nicknames: string[]) => void;
  aliases: string[];
  onAliasesChange: (aliases: string[]) => void;
  // Taxonomy
  archetype: string[];
  onArchetypeChange: (archetype: string[]) => void;
  personalityTropes: string[];
  onPersonalityTropesChange: (tropes: string[]) => void;
  addressment: string[];
  onAddressmentChange: (addressment: string[]) => void;
  // Hazard Rating
  hazardScore: number;
  onHazardScoreChange: (score: number) => void;
  // World & Association Hierarchy
  worldFiles: WorldFile[];
  activeWorldFile: WorldFile | null;
  selectedWorldId: string;
  onWorldFileChange: (worldId: string) => void;
  selectedPath: string[];
  flattenedNodes: WorldTreeNode[];
  searchResults: WorldTreeNode[];
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  isSearchFocused: boolean;
  onSearchFocusedChange: (focused: boolean) => void;
  collapsedPaths: Set<string>;
  onToggleCollapse: (pathStr: string, e?: React.MouseEvent) => void;
  onSelectHeaderNode: (path: string[], depth: number) => void;
  onSelectSearchResult: (node: WorldTreeNode) => void;
  onClearSelection: () => void;
  associationResolution: AssociationResolution;
  // Associated World / Faction (legacy - bound from selection above)
  currentAssociate: string[];
}

export const CharacterInfoMode: React.FC<CharacterInfoModeProps> = ({
  characterId,
  activeVariantKey,
  names,
  onNamesChange,
  nicknames,
  onNicknamesChange,
  aliases,
  onAliasesChange,
  archetype,
  onArchetypeChange,
  personalityTropes,
  onPersonalityTropesChange,
  addressment,
  onAddressmentChange,
  hazardScore,
  onHazardScoreChange,
  // World & Association Hierarchy
  worldFiles,
  activeWorldFile,
  selectedWorldId,
  onWorldFileChange,
  selectedPath,
  flattenedNodes,
  searchResults,
  searchQuery,
  onSearchQueryChange,
  isSearchFocused,
  onSearchFocusedChange,
  collapsedPaths,
  onToggleCollapse,
  onSelectHeaderNode,
  onSelectSearchResult,
  onClearSelection,
  associationResolution,
  currentAssociate,
}) => {
  // Hazard Score visual categorization
  const getHazardBadge = (score: number) => {
    if (score <= 2) return { label: 'Class I - Minimal Risk', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (score <= 4) return { label: 'Class II - Moderate Hazard', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
    if (score <= 6) return { label: 'Class III - Severe Entity', color: 'text-hazard-gold bg-hazard-gold/10 border-hazard-gold/30' };
    if (score <= 8) return { label: 'Class IV - Catastrophic', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' };
    return { label: 'Class V - Apollyon Threat', color: 'text-red-400 bg-red-500/10 border-red-500/30' };
  };

  const hazardInfo = getHazardBadge(hazardScore);

// World Tree Rendering Functions (moved from CharacterReconstructorView.tsx)
const depthStyles = [
  {
    prefixColor: 'text-hazard-gold font-black',
    activeText: 'text-hazard-gold font-black',
    idleText: 'text-hazard-textBright font-extrabold',
    activeBg: 'bg-hazard-gold/15 border-hazard-gold shadow-hazard-glow',
    idleBg: 'bg-hazard-void/80 hover:bg-hazard-card hover:border-hazard-gold/50 border-hazard-border/80',
    lineColor: 'border-hazard-gold/30',
  },
  {
    prefixColor: 'text-hazard-cyan font-black',
    activeText: 'text-hazard-cyan font-black',
    idleText: 'text-hazard-textBright font-bold',
    activeBg: 'bg-hazard-cyan/15 border-hazard-cyan shadow-sm',
    idleBg: 'bg-hazard-void/80 hover:bg-hazard-card hover:border-hazard-cyan/50 border-hazard-border/80',
    lineColor: 'border-hazard-cyan/30',
  },
  {
    prefixColor: 'text-hazard-purple font-black',
    activeText: 'text-hazard-purple font-black',
    idleText: 'text-hazard-textBright font-semibold',
    activeBg: 'bg-hazard-purple/15 border-hazard-purple shadow-sm',
    idleBg: 'bg-hazard-void/80 hover:bg-hazard-card hover:border-hazard-purple/50 border-hazard-border/80',
    lineColor: 'border-hazard-purple/30',
  },
  {
    prefixColor: 'text-emerald-400 font-black',
    activeText: 'text-emerald-400 font-black',
    idleText: 'text-hazard-textBright font-medium',
    activeBg: 'bg-emerald-500/15 border-emerald-400 shadow-sm',
    idleBg: 'bg-hazard-void/80 hover:bg-hazard-card hover:border-emerald-400/50 border-hazard-border/80',
    lineColor: 'border-emerald-400/30',
  },
];

const renderHeaderNode = (
  key: string,
  nodeObj: WorldNode,
  currentPath: string[],
  depth: number
) => {
  const path = [...currentPath, key];
  const pathStr = path.join('/');
  const allChildKeys = WorldManager.getChildKeys(nodeObj);
  const hasChildren = allChildKeys.length > 0;
  const isCollapsed = collapsedPaths.has(pathStr);

  const isExactMatch = selectedPath.join('/') === pathStr;
  const isAncestor = selectedPath.slice(0, path.length).join('/') === pathStr;
  const isSelected = isExactMatch || isAncestor;

  const selectedChildKey = selectedPath[depth + 1];
  const visibleChildKeys = (selectedChildKey && allChildKeys.includes(selectedChildKey))
    ? [selectedChildKey]
    : allChildKeys;

  const style = depthStyles[depth] || depthStyles[depthStyles.length - 1];
  const headerPrefix = '#'.repeat(depth + 1);
  const prtVal = typeof nodeObj?._prt_ === 'string' ? nodeObj._prt_.trim() : null;

  return (
    <div key={key} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelectHeaderNode(path, depth);
          }}
          className={`min-h-[50px] px-4 py-2.5 rounded-2xl border-2 transition-all flex items-center gap-3 cursor-pointer group shadow-sm ${
            isSelected ? style.activeBg : style.idleBg
          }`}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => onToggleCollapse(pathStr, e)}
              className="p-1 -ml-1 rounded-lg hover:bg-black/30 text-hazard-textMuted hover:text-hazard-textBright transition shrink-0"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-hazard-gold/80 group-hover:text-hazard-gold transition-transform" />
              ) : (
                <ChevronDown className="w-4 h-4 text-hazard-gold/80 group-hover:text-hazard-gold transition-transform" />
              )}
            </button>
          ) : (
            <span className="w-4 h-4 shrink-0" />
          )}

          <span className={`text-base select-none shrink-0 ${style.prefixColor}`}>
            {headerPrefix}
          </span>

          <span
            className={`text-sm md:text-base tracking-wide whitespace-nowrap ${
              isSelected ? style.activeText : style.idleText
            }`}
          >
            {key}
          </span>

          {prtVal && (
            <span
              className={`text-[11px] px-2.5 py-0.5 rounded-lg border font-mono select-all ml-1 ${
                isSelected
                  ? 'bg-black/40 border-current/40 text-current'
                  : 'bg-hazard-void text-hazard-textMuted border-hazard-border group-hover:text-hazard-textBright'
              }`}
            >
              {prtVal}
            </span>
          )}

          {isExactMatch && (
            <span className="ml-auto text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md bg-hazard-gold text-black shadow-sm shrink-0">
              Selected
            </span>
          )}
        </div>
      </div>

      {hasChildren && !isCollapsed && (
        <div className={`flex flex-col gap-2 pl-6 ml-4 border-l-2 ${style.lineColor} transition-all`}>
          {visibleChildKeys.map((childKey) =>
            renderHeaderNode(childKey, nodeObj[childKey], path, depth + 1)
          )}
        </div>
      )}
    </div>
  );
};

const renderMarkdownIndexTree = () => {
  if (!activeWorldFile?.data) {
    return (
      <div className="p-8 text-center text-hazard-textMuted/60 italic font-mono text-sm">
        No hierarchy data found in selected World file.
      </div>
    );
  }

  const allRootKeys = WorldManager.getChildKeys(activeWorldFile.data);

  if (allRootKeys.length === 0) {
    return (
      <div className="p-8 text-center text-hazard-textMuted/60 italic font-mono text-sm">
        World file is empty.
      </div>
    );
  }

  const selectedRootKey = selectedPath[0];
  const visibleRootKeys = (selectedRootKey && allRootKeys.includes(selectedRootKey))
    ? [selectedRootKey]
    : allRootKeys;

  return (
    <div className="flex flex-col gap-3 font-mono">
      {visibleRootKeys.map((rootKey) =>
        renderHeaderNode(rootKey, activeWorldFile.data[rootKey], [], 0)
      )}
    </div>
  );
};

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-150 font-sans">
      {/* Overview Metadata Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-hazard-card border-2 border-hazard-border shadow-lg flex flex-wrap items-center justify-between gap-4 font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-hazard-cyan/10 border border-hazard-cyan/30 text-hazard-cyan">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black text-hazard-textBright uppercase">
                {characterId || 'UNNAMED'}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded bg-hazard-gold/15 border border-hazard-gold/30 text-hazard-gold font-bold">
                Variant: {activeVariantKey}
              </span>
            </div>
            <p className="text-xs text-hazard-textMuted mt-0.5">
              Identity Nomenclature, Narrative Taxonomy & Classification
            </p>
          </div>
        </div>

        {/* Bound Associate Readout */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-hazard-void/80 border border-hazard-border">
          <Link2 className="w-4 h-4 text-hazard-cyan shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] text-hazard-textMuted uppercase font-bold tracking-wider">
              Bound Associate
            </span>
            <span className="text-xs font-bold text-hazard-cyan truncate max-w-[200px]">
              {currentAssociate.length > 0 ? currentAssociate.join(', ') : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: WORLD & ASSOCIATION HIERARCHY (MOVED TO FIRST POSITION) */}
      <div className="flex flex-col gap-6 p-6 rounded-3xl bg-hazard-card border-2 border-hazard-border shadow-lg">
        {/* Top Control Bar: World File Selector + Search */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-hazard-border/80">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌐</span>
            <div>
              <h3 className="text-base md:text-lg font-extrabold uppercase tracking-wider text-hazard-textBright font-mono">
                World & Association Index
              </h3>
              <p className="text-xs text-hazard-textMuted font-mono">
                Select terminal leaf node to bind as variant associate. Inherited prompts flow to DNA Prompt mode.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* World JSON File Selector */}
            <div className="flex items-center gap-2 bg-hazard-void px-3 py-2 rounded-2xl border-2 border-hazard-border hover:border-hazard-gold/60 transition flex-1 sm:flex-initial">
              <Globe className="w-4 h-4 text-hazard-gold shrink-0" />
              <select
                value={selectedWorldId}
                onChange={(e) => onWorldFileChange(e.target.value)}
                className="bg-transparent text-sm md:text-base font-mono font-bold text-hazard-textBright focus:outline-none cursor-pointer pr-2"
              >
                {worldFiles.map((wf) => (
                  <option key={wf.id} value={wf.id} className="bg-hazard-card text-hazard-textBright font-mono">
                    {wf.fileName}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Reset Selection Button */}
            {selectedPath.length > 0 && (
              <button
                type="button"
                onClick={onClearSelection}
                title="Deselect All & Reveal All Root Branches"
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-mono font-bold text-hazard-textMuted hover:text-hazard-crimson bg-hazard-void border border-hazard-border hover:border-hazard-crimson/50 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Instant Search Bar to Jump Directly to Deep Headers */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative cursor-default"
        >
          <div
            onClick={() => {
              const input = document.getElementById('world-index-search-input-info');
              input?.focus();
            }}
            className="search-bar-monolith bg-hazard-void border-2 border-hazard-border focus-within:border-hazard-gold focus-within:ring-4 focus-within:ring-hazard-gold/15 rounded-2xl transition cursor-text gap-3.5 shadow-md"
          >
            <Search className="w-6 h-6 text-hazard-gold shrink-0 pointer-events-none" />
            <input
              id="world-index-search-input-info"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onFocus={() => onSearchFocusedChange(true)}
              placeholder="Search headers at any level (e.g. HoloMyth, Hololive, Vtuber)..."
              className="search-input-command font-mono text-base md:text-lg text-hazard-textBright placeholder-hazard-textMuted/50 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSearchQueryChange('');
                }}
                className="p-2 rounded-xl text-hazard-textMuted hover:text-white hover:bg-white/10 shrink-0 cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown List */}
          {searchQuery.trim().length > 0 && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 p-2 bg-hazard-card border-2 border-hazard-gold rounded-2xl shadow-2xl max-h-64 overflow-y-auto font-mono flex flex-col gap-1 backdrop-blur-md">
              <div className="px-3 py-1.5 text-[11px] uppercase font-extrabold text-hazard-gold border-b border-hazard-border">
                Matching Headers ({searchResults.length})
              </div>
              {searchResults.map((res) => (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => onSelectSearchResult(res)}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-hazard-gold/20 flex items-center justify-between gap-3 text-sm transition group cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-hazard-gold font-bold">{res.headerPrefix}</span>
                    <span className="text-hazard-textBright font-semibold group-hover:text-white truncate">
                      {res.key}
                    </span>
                    <span className="text-xs text-hazard-textMuted/60 truncate">({res.id})</span>
                  </div>
                  {res.prt && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-black/40 border border-hazard-gold/30 text-hazard-gold shrink-0">
                      {res.prt}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* The Hierarchical Markdown Headers Outline View */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="p-4 sm:p-6 rounded-2xl bg-hazard-void/60 border border-hazard-border/80 cursor-default"
        >
          {renderMarkdownIndexTree()}
        </div>

        {/* Inherited Prompts Summary Bar */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex flex-wrap items-center gap-2.5 p-3.5 rounded-2xl bg-hazard-void border border-hazard-border font-mono text-xs md:text-sm cursor-default"
        >
          <span className="text-hazard-textMuted font-bold uppercase tracking-wider text-[11px] shrink-0 flex items-center gap-1.5">
            <span>✨</span>
            <span>Inherited World Prompts:</span>
          </span>
          <span className="text-hazard-cyan font-bold break-words select-all">
            {associationResolution.assembledPrompt ? (
              `"${associationResolution.assembledPrompt}"`
            ) : (
              <span className="text-hazard-textMuted/40 italic">None</span>
            )}
          </span>
        </div>
      </div>

      {/* SECTION 2: NOMENCLATURE & ALIASES */}
      <div className="flex flex-col gap-4 p-6 rounded-3xl bg-hazard-card border-2 border-hazard-border shadow-lg">
        <div className="flex items-center justify-between gap-2 pb-1 border-b border-hazard-border/50">
          <div className="flex items-center gap-2.5">
            <Tag className="w-5 h-5 text-hazard-cyan" />
            <h3 className="text-base font-extrabold uppercase tracking-wider text-hazard-textBright font-mono">
              Nomenclature & Identifiers
            </h3>
          </div>
          <span className="text-xs text-hazard-textMuted font-mono">
            names • nicknames • aliases
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TagListEditor
            title="Primary Names"
            subtitle="names"
            tags={names}
            onChange={onNamesChange}
            placeholder="Add name (Enter or comma)..."
            badgeTheme="cyan"
            icon={<User className="w-4 h-4 text-hazard-cyan" />}
          />
          <TagListEditor
            title="Nicknames"
            subtitle="nicknames"
            tags={nicknames}
            onChange={onNicknamesChange}
            placeholder="Add nickname..."
            badgeTheme="cyan"
            icon={<Tag className="w-4 h-4 text-hazard-cyan" />}
          />
          <TagListEditor
            title="Aliases & Titles"
            subtitle="aliases"
            tags={aliases}
            onChange={onAliasesChange}
            placeholder="Add alias or title..."
            badgeTheme="cyan"
            icon={<Award className="w-4 h-4 text-hazard-cyan" />}
          />
        </div>
      </div>

      {/* SECTION 3: TAXONOMY & BEHAVIORAL PROFILE */}
      <div className="flex flex-col gap-4 p-6 rounded-3xl bg-hazard-card border-2 border-hazard-border shadow-lg">
        <div className="flex items-center justify-between gap-2 pb-1 border-b border-hazard-border/50">
          <div className="flex items-center gap-2.5">
            <Brain className="w-5 h-5 text-hazard-gold" />
            <h3 className="text-base font-extrabold uppercase tracking-wider text-hazard-textBright font-mono">
              Taxonomy & Character Tropes
            </h3>
          </div>
          <span className="text-xs text-hazard-textMuted font-mono">
            archetype • personalityTropes • addressment
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TagListEditor
            title="Archetypes"
            subtitle="archetype"
            tags={archetype}
            onChange={onArchetypeChange}
            placeholder="e.g. Detective, Gamer, Time Traveler..."
            badgeTheme="gold"
            icon={<Sparkles className="w-4 h-4 text-hazard-gold" />}
          />
          <TagListEditor
            title="Personality Tropes"
            subtitle="personalityTropes"
            tags={personalityTropes}
            onChange={onPersonalityTropesChange}
            placeholder="e.g. Gremlin, Analytical, Tsundere..."
            badgeTheme="gold"
            icon={<Brain className="w-4 h-4 text-hazard-gold" />}
          />
          <TagListEditor
            title="Addressment & Speech"
            subtitle="addressment"
            tags={addressment}
            onChange={onAddressmentChange}
            placeholder="e.g. Watashi, Ame-chan, Detective..."
            badgeTheme="gold"
            icon={<MessageSquare className="w-4 h-4 text-hazard-gold" />}
          />
        </div>
      </div>

      {/* SECTION 4: THREAT LEVEL & HAZARD RATING */}
      <div className="flex flex-col gap-4 p-6 rounded-3xl bg-hazard-card border-2 border-hazard-border shadow-lg font-mono">
        <div className="flex items-center justify-between gap-2 pb-1 border-b border-hazard-border/50">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-extrabold uppercase tracking-wider text-hazard-textBright">
              Hazard Rating & Threat Level
            </h3>
          </div>
          <span className={`text-xs px-3 py-1 rounded-xl border font-bold ${hazardInfo.color}`}>
            {hazardInfo.label}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-hazard-void/60 border border-hazard-border">
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-hazard-card border border-hazard-border shrink-0 min-w-[120px]">
            <span className="text-[11px] text-hazard-textMuted uppercase font-bold">Hazard Score</span>
            <span className="text-3xl font-black text-hazard-gold mt-1">
              {Number(hazardScore).toFixed(1)}
            </span>
          </div>

          <div className="flex-1 w-full flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-hazard-textMuted font-bold">
              <span>0.0 (Harmless)</span>
              <span>5.0 (Moderate Anomaly)</span>
              <span>10.0 (Cataclysmic)</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={hazardScore}
              onChange={(e) => onHazardScoreChange(parseFloat(e.target.value) || 0)}
              className="w-full h-2 bg-hazard-card rounded-lg appearance-none cursor-pointer accent-hazard-gold"
            />
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-hazard-card/50 border border-hazard-border text-xs text-hazard-textMuted">
          <Info className="w-4 h-4 text-hazard-cyan shrink-0 mt-0.5" />
          <span>
            <strong>Note on Association:</strong> The <code className="text-hazard-cyan">associate</code> property is automatically bound to the terminal leaf node selected in the <strong>World & Association Index</strong> above. The inherited prompt flows into <strong>DNA Prompt</strong> mode.
          </span>
        </div>
      </div>
    </div>
  );
};
