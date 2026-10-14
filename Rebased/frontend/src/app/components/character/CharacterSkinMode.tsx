import React, { useState, useMemo } from 'react';
import { Shirt, Sparkles, Layers, Copy, Check, Search, Plus, Trash2, Eye, EyeOff, BookOpen, RefreshCw } from 'lucide-react';
import { App } from 'obsidian';

export interface SkinPreset {
  display_name: string;
  prompt: string;
  subjects?: number[];
}

export interface CharacterSkinModeProps {
  app: App;
  characterId: string;
  activeVariantKey: string;
  outfitPrompt: string;
  onOutfitPromptChange: (prompt: string) => void;
  layerToggles: Record<string, boolean>;
  onToggleLayer: (layerKey: string) => void;
  onResetLayers: () => void;
  skinPresets: Record<string, SkinPreset>;
  isLoadingSkins: boolean;
  onRefreshPresets: () => void;
}

export const LAYER_KEYWORDS: Record<string, string[]> = {
  headwear: ['hat', 'deerstalker', 'cap', 'beret', 'headband', 'ribbon', 'hairclip', 'hairpin', 'tiara', 'crown', 'hood', 'veil', 'helmet', 'visor', 'hair ornament', 'hair bow', 'beanie'],
  neckwear: ['choker', 'tie', 'necktie', 'bowtie', 'scarf', 'collar', 'necklace', 'pendant', 'neckerchief'],
  outerwear: ['capelet', 'cape', 'cloak', 'vest', 'jacket', 'coat', 'cardigan', 'sweater', 'hoodie', 'blazer', 'shawl', 'robe', 'trench', 'trenchcoat', 'poncho', 'overcoat', 'windbreaker'],
  tops: ['shirt', 'white shirt', 'collared shirt', 'open shirt', 'blouse', 'corset', 'tank top', 'camisole', 't-shirt', 'crop top', 'tube top', 'halterneck', 'chemise', 'undershirt', 'sleeveless shirt'],
  bottoms: ['skirt', 'pleated skirt', 'shorts', 'pants', 'trousers', 'jeans', 'bloomers', 'hotpants', 'slacks', 'leggings', 'miniskirt'],
  legwear: ['thighhigh', 'thighhighs', 'single thighhigh', 'socks', 'tights', 'stockings', 'leg warmers', 'pantyhose', 'kneehighs', 'ankle socks', 'crew socks'],
  footwear: ['boots', 'shoes', 'heels', 'sneakers', 'sandals', 'loafers', 'slippers', 'ankle boots'],
  underwear: ['underwear', 'bra', 'panties', 'lingerie', 'thong', 'lace bra', 'black panties', 'black bra', 'white panties'],
  props: ['cane', 'watch', 'pocket watch', 'glasses', 'monocle', 'bag', 'backpack', 'weapon', 'sword', 'gun', 'umbrella', 'fan', 'book', 'staff'],
};

export const LAYER_CONFIG: Array<{ key: string; label: string; icon: string }> = [
  { key: 'headwear', label: 'Headwear', icon: '🎩' },
  { key: 'neckwear', label: 'Neckwear', icon: '🧣' },
  { key: 'outerwear', label: 'Outerwear', icon: '🧥' },
  { key: 'tops', label: 'Tops', icon: '👔' },
  { key: 'bottoms', label: 'Bottoms', icon: '👗' },
  { key: 'legwear', label: 'Legwear', icon: '🧦' },
  { key: 'footwear', label: 'Footwear', icon: '👢' },
  { key: 'underwear', label: 'Underwear', icon: '👙' },
  { key: 'props', label: 'Props & Acc', icon: '🪄' },
];

export const CharacterSkinMode: React.FC<CharacterSkinModeProps> = ({
  characterId,
  activeVariantKey,
  outfitPrompt,
  onOutfitPromptChange,
  layerToggles,
  onToggleLayer,
  onResetLayers,
  skinPresets,
  isLoadingSkins,
  onRefreshPresets,
}) => {
  const [skinSearch, setSkinSearch] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Decompose outfitPrompt into tokens and classify tokens per layer
  const { rawTokens, compiledTokens, layerTokenCounts } = useMemo(() => {
    const tokens = outfitPrompt
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const counts: Record<string, number> = {};
    LAYER_CONFIG.forEach((l) => (counts[l.key] = 0));

    // Determine which layer a token belongs to
    const classifyToken = (tok: string): string | null => {
      const lower = tok.toLowerCase();
      for (const [layerKey, keywords] of Object.entries(LAYER_KEYWORDS)) {
        if (keywords.some((kw) => lower.includes(kw))) {
          return layerKey;
        }
      }
      return null;
    };

    // Count tokens per layer
    tokens.forEach((t) => {
      const layer = classifyToken(t);
      if (layer && counts[layer] !== undefined) {
        counts[layer]++;
      }
    });

    // Filter tokens according to layer toggles
    const activeTokens = tokens.filter((t) => {
      const layer = classifyToken(t);
      if (!layer) return true; // Unclassified tokens remain active
      return layerToggles[layer] !== false;
    });

    return {
      rawTokens: tokens,
      compiledTokens: activeTokens,
      layerTokenCounts: counts,
    };
  }, [outfitPrompt, layerToggles]);

  const compiledPromptString = compiledTokens.join(', ');

  const handleCopyCompiled = async () => {
    if (!compiledPromptString) return;
    try {
      await navigator.clipboard.writeText(compiledPromptString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApplyPreset = (presetPrompt: string) => {
    onOutfitPromptChange(presetPrompt);
  };

  const handleAppendPreset = (presetPrompt: string) => {
    const existing = outfitPrompt.trim();
    if (!existing) {
      onOutfitPromptChange(presetPrompt);
    } else {
      const newTokens = presetPrompt
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      const currentTokens = new Set(
        existing.split(',').map((t) => t.trim().toLowerCase())
      );
      const toAppend = newTokens.filter((t) => !currentTokens.has(t.toLowerCase()));
      if (toAppend.length > 0) {
        onOutfitPromptChange(`${existing}, ${toAppend.join(', ')}`);
      }
    }
  };

  // Filter skin presets by search
  const filteredPresets = useMemo(() => {
    const query = skinSearch.trim().toLowerCase();
    if (!query) return Object.entries(skinPresets);
    return Object.entries(skinPresets).filter(([key, preset]) => {
      return (
        key.toLowerCase().includes(query) ||
        preset.display_name.toLowerCase().includes(query) ||
        preset.prompt.toLowerCase().includes(query)
      );
    });
  }, [skinPresets, skinSearch]);

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-150 font-sans">
      {/* Overview Metadata Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-hazard-card border-2 border-hazard-border shadow-lg flex flex-wrap items-center justify-between gap-4 font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Shirt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black text-hazard-textBright uppercase">
                {characterId || 'UNNAMED'}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold">
                Skin Variant: {activeVariantKey}
              </span>
            </div>
            <p className="text-xs text-hazard-textMuted mt-0.5">
              Wardrobe Architecture, Apparel Layer Matrix & Vault Skin Presets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-hazard-textMuted font-mono px-3 py-1.5 rounded-xl bg-hazard-void/80 border border-hazard-border">
            Active Tokens: <strong className="text-hazard-cyan">{compiledTokens.length}</strong> / {rawTokens.length}
          </span>
        </div>
      </div>

      {/* SECTION 1: RAW OUTFIT PROMPT EDITOR (NOTCH-GRADE EXCLUSIVE ZONE) */}
      <div className="flex flex-col gap-3 p-6 rounded-3xl bg-hazard-card border-2 border-hazard-border shadow-lg">
        <div className="flex items-center justify-between gap-2 pb-1 border-b border-hazard-border/50 font-mono">
          <div className="flex items-center gap-2.5">
            <Shirt className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-extrabold uppercase tracking-wider text-hazard-textBright">
              Variant Outfit Prompt
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {outfitPrompt && (
              <button
                type="button"
                onClick={() => onOutfitPromptChange('')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-hazard-textMuted hover:text-red-400 bg-hazard-void border border-hazard-border transition cursor-pointer"
                title="Clear Outfit Prompt"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Exclusive Zone Container */}
        <div
          className="hazard-exclusive-zone cursor-text"
          onClick={(e) => {
            e.stopPropagation();
            const ta = e.currentTarget.querySelector('textarea');
            if (ta) ta.focus();
          }}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2e4168]/70">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <span>👗</span>
              <span>Wardrobe Attire String</span>
            </span>
            <span className="text-[11px] font-mono text-hazard-textMuted font-bold">
              {rawTokens.length} tags
            </span>
          </div>

          <textarea
            value={outfitPrompt}
            onChange={(e) => onOutfitPromptChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            placeholder="e.g. deerstalker, plaid capelet, brown vest, white shirt, brown pleated skirt, single thighhigh, brown boots..."
            rows={3}
            className="hazard-exclusive-textarea font-mono text-sm leading-relaxed"
          />
        </div>
      </div>

      {/* SECTION 2: 9-TIER APPAREL LAYER MATRIX & TOGGLES */}
      <div className="flex flex-col gap-4 p-6 rounded-3xl bg-hazard-card border-2 border-hazard-border shadow-lg font-mono">
        <div className="flex items-center justify-between gap-2 pb-1 border-b border-hazard-border/50">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-hazard-gold" />
            <h3 className="text-base font-extrabold uppercase tracking-wider text-hazard-textBright">
              Apparel Layer Decomposition
            </h3>
          </div>
          <button
            type="button"
            onClick={onResetLayers}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-hazard-gold bg-hazard-gold/10 hover:bg-hazard-gold/20 border border-hazard-gold/30 transition cursor-pointer"
          >
            <span>Enable All Layers</span>
          </button>
        </div>

        <p className="text-xs text-hazard-textMuted -mt-1">
          Toggle layers on or off to dynamically include or strip attire components during prompt generation.
        </p>

        {/* 9-Layer Matrix Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {LAYER_CONFIG.map((layer) => {
            const isEnabled = layerToggles[layer.key] !== false;
            const tokenCount = layerTokenCounts[layer.key] || 0;

            return (
              <button
                key={layer.key}
                type="button"
                onClick={() => onToggleLayer(layer.key)}
                className={`flex flex-col p-3.5 rounded-2xl border transition-all text-left cursor-pointer group select-none ${
                  isEnabled
                    ? 'bg-hazard-void/80 border-hazard-gold/40 hover:border-hazard-gold shadow-sm'
                    : 'bg-hazard-void/30 border-hazard-border/40 opacity-50 hover:opacity-75'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-lg">{layer.icon}</span>
                  <div className="flex items-center gap-1">
                    {isEnabled ? (
                      <Eye className="w-3.5 h-3.5 text-hazard-gold" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-hazard-textMuted" />
                    )}
                  </div>
                </div>

                <span
                  className={`text-xs font-bold uppercase tracking-wider truncate ${
                    isEnabled ? 'text-hazard-textBright' : 'text-hazard-textMuted line-through'
                  }`}
                >
                  {layer.label}
                </span>

                <div className="flex items-center justify-between gap-1 mt-2 pt-1 border-t border-hazard-border/40 text-[11px]">
                  <span className="text-hazard-textMuted">Matched:</span>
                  <span
                    className={`font-black ${
                      tokenCount > 0 ? 'text-hazard-gold' : 'text-hazard-textMuted/50'
                    }`}
                  >
                    {tokenCount}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: VAULT WARDROBE PRESETS (Eva_Skin.json) */}
      <div className="flex flex-col gap-4 p-6 rounded-3xl bg-hazard-card border-2 border-hazard-border shadow-lg font-mono">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-hazard-border/50">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-hazard-cyan" />
            <h3 className="text-base font-extrabold uppercase tracking-wider text-hazard-textBright">
              Vault Wardrobe Presets
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-hazard-cyan/15 border border-hazard-cyan/30 text-hazard-cyan font-bold">
              Eva_Skin.json
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-hazard-void border border-hazard-border focus-within:border-hazard-cyan transition">
              <Search className="w-3.5 h-3.5 text-hazard-textMuted" />
              <input
                type="text"
                value={skinSearch}
                onChange={(e) => setSkinSearch(e.target.value)}
                placeholder="Filter presets..."
                className="bg-transparent text-xs text-hazard-textBright placeholder:text-hazard-textMuted/40 outline-none border-0 w-36 sm:w-48"
              />
            </div>

            <button
              type="button"
              onClick={onRefreshPresets}
              disabled={isLoadingSkins}
              className="p-2 rounded-xl bg-hazard-void border border-hazard-border hover:border-hazard-cyan/40 text-hazard-textMuted hover:text-hazard-cyan transition cursor-pointer"
              title="Reload Presets"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSkins ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Presets Grid */}
        {filteredPresets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto pr-1">
            {filteredPresets.map(([presetKey, preset]) => (
              <div
                key={presetKey}
                className="flex flex-col justify-between gap-3 p-4 rounded-2xl bg-hazard-void/70 border border-hazard-border hover:border-purple-500/50 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-hazard-textBright group-hover:text-purple-300 transition truncate">
                      {preset.display_name || presetKey}
                    </span>
                    <span className="text-[10px] text-hazard-textMuted/60 uppercase">
                      {presetKey}
                    </span>
                  </div>
                  <p className="text-[11px] text-hazard-textMuted/80 line-clamp-2 mt-1.5 font-sans leading-relaxed">
                    {preset.prompt}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-hazard-border/40">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(preset.prompt)}
                    className="flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold text-purple-300 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 transition text-center cursor-pointer"
                  >
                    Apply As Outfit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAppendPreset(preset.prompt)}
                    className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-bold text-hazard-gold bg-hazard-gold/10 hover:bg-hazard-gold/20 border border-hazard-gold/30 transition cursor-pointer"
                    title="Append tags to current outfit"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Append</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-hazard-textMuted italic bg-hazard-void/40 rounded-2xl border border-hazard-border">
            {isLoadingSkins ? 'Loading presets from Eva_Skin.json...' : 'No wardrobe presets found matching query.'}
          </div>
        )}
      </div>

      {/* SECTION 4: COMPILED OUTFIT PROMPT PREVIEW */}
      <div className="flex flex-col gap-3 p-6 rounded-3xl bg-hazard-card border-2 border-hazard-border shadow-lg font-mono">
        <div className="flex items-center justify-between gap-2 pb-1 border-b border-hazard-border/50">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-hazard-gold" />
            <h3 className="text-base font-extrabold uppercase tracking-wider text-hazard-textBright">
              Compiled Outfit Master Prompt
            </h3>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded bg-hazard-gold/15 border border-hazard-gold/30 text-hazard-gold font-bold">
            {compiledTokens.length} Active Tags
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-hazard-void border border-hazard-border font-mono text-xs sm:text-sm text-hazard-cyan leading-relaxed select-all min-h-[64px] flex items-center">
          {compiledPromptString || (
            <span className="text-hazard-textMuted/40 italic">
              No outfit tokens active or all layers disabled.
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-xs text-hazard-textMuted">
            Tags corresponding to disabled apparel layers above are automatically filtered out.
          </span>
          <button
            type="button"
            onClick={handleCopyCompiled}
            disabled={!compiledPromptString}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              copied
                ? 'bg-emerald-500 text-black shadow-hazard-glow'
                : 'bg-hazard-gold text-black hover:bg-hazard-goldGlow'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Outfit Prompt</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
