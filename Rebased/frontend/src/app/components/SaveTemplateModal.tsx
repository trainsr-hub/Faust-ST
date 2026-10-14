import React, { useState } from 'react';
import { useTriggerStore } from '../../store/useTriggerStore';
import { Bookmark, X, Save, Tag, Layers, Lock, Unlock, Key } from 'lucide-react';

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({ isOpen, onClose }) => {
  const { saveCurrentAsTemplate, isSaving, activeTemplate, unlockLockedAll: currentUnlockAll, unlockKeys: currentUnlockKeys } = useTriggerStore();
  const [name, setName] = useState(activeTemplate?.name ? `${activeTemplate.name} (Copy)` : '');
  const [description, setDescription] = useState(activeTemplate?.description || '');
  const [category, setCategory] = useState(activeTemplate?.category || 'General');
  const [tagsInput, setTagsInput] = useState(activeTemplate?.tags?.join(', ') || '');
  const [unlockLockedAll, setUnlockLockedAll] = useState<boolean>(activeTemplate?.unlockLockedAll ?? currentUnlockAll ?? false);
  const [unlockKeysInput, setUnlockKeysInput] = useState<string>(activeTemplate?.unlockKeys?.join(', ') || currentUnlockKeys?.join(', ') || '');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Template name is required');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const unlockKeys = unlockKeysInput
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const saved = await saveCurrentAsTemplate(
      name,
      description,
      category,
      tags,
      unlockLockedAll,
      unlockKeys
    );

    if (saved) {
      onClose();
    } else {
      setError('Failed to save template to disk');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-hazard-card border border-hazard-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-hazard-border/80 bg-hazard-card/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-hazard-gold/10 border border-hazard-gold/30 text-hazard-gold">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-hazard-textBright">
                Save Current Combo as Template
              </h3>
              <p className="text-xs text-hazard-textMuted font-mono">
                Persist choices & lock keys into <code className="text-hazard-cyan">Hazard_Trigger_Data/Templates/</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-hazard-textMuted hover:text-white rounded-xl hover:bg-hazard-cardHover transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 flex flex-col gap-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-hazard-crimson/20 border border-hazard-crimson/50 text-hazard-crimson text-xs rounded-xl font-mono">
              {error}
            </div>
          )}

          {/* Template Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-hazard-textBright flex items-center gap-1.5">
              <span>Template Name</span>
              <span className="text-hazard-crimson">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Solo POV Cyberpunk Eva"
              className="w-full px-4 py-2.5 bg-hazard-void border border-hazard-border focus:border-hazard-gold focus:outline-none rounded-xl text-sm text-hazard-textBright font-medium placeholder:text-hazard-textMuted/40 transition"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-hazard-textBright flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-hazard-cyan" />
              <span>Category / Archetype</span>
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Character, Cinematic, Niche, NSFW"
              className="w-full px-4 py-2.5 bg-hazard-void border border-hazard-border focus:border-hazard-cyan focus:outline-none rounded-xl text-sm text-hazard-textBright font-medium placeholder:text-hazard-textMuted/40 transition"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-hazard-textBright">
              Description & Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional overview of the aesthetic, subject constraints, or scene framing..."
              className="w-full px-4 py-2 bg-hazard-void border border-hazard-border focus:border-hazard-gold focus:outline-none rounded-xl text-xs text-hazard-textBright placeholder:text-hazard-textMuted/40 resize-none transition"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-hazard-textBright flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-hazard-purple" />
              <span>Tags (comma-separated)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="solo, pov, cyberpunk, neon, eva"
              className="w-full px-4 py-2.5 bg-hazard-void border border-hazard-border focus:border-hazard-purple focus:outline-none rounded-xl text-xs font-mono text-hazard-textBright placeholder:text-hazard-textMuted/40 transition"
            />
          </div>

          {/* Lock / Niche Key Gacha Unlocking Section */}
          <div className="p-4 rounded-2xl bg-hazard-void/80 border border-hazard-border flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-hazard-gold">
              <Key className="w-4 h-4 text-hazard-gold" />
              <span>Niche Gacha-Lock Key Access</span>
            </div>
            <p className="text-[11px] text-hazard-textMuted font-mono">
              Gacha-locked options are excluded from all normal templates. Setting unlocking keys here allows this template to roll those niche options in gacha.
            </p>

            {/* Unlock All Checkbox */}
            <label className="flex items-center gap-2.5 text-xs text-hazard-textBright cursor-pointer select-none">
              <input
                type="checkbox"
                checked={unlockLockedAll}
                onChange={(e) => setUnlockLockedAll(e.target.checked)}
                className="w-4 h-4 rounded border-hazard-border text-hazard-gold focus:ring-0 focus:outline-none bg-hazard-void cursor-pointer"
              />
              <span className="font-bold flex items-center gap-1.5">
                <Unlock className="w-3.5 h-3.5 text-hazard-cyan" />
                <span>Unlock All Gacha-Locked Options for this Template</span>
              </span>
            </label>

            {/* Custom Unlock Domain Keys */}
            {!unlockLockedAll && (
              <div className="flex flex-col gap-1 pt-1">
                <label className="text-[11px] font-mono text-hazard-textMuted">
                  Specific Unlock Keys (comma-separated, e.g. <code className="text-hazard-cyan">niche, extreme, custom</code>):
                </label>
                <input
                  type="text"
                  value={unlockKeysInput}
                  onChange={(e) => setUnlockKeysInput(e.target.value)}
                  placeholder="niche, extreme, fetish, dark_fantasy"
                  className="w-full px-3 py-1.5 bg-hazard-card border border-hazard-border focus:border-hazard-gold focus:outline-none rounded-xl text-xs font-mono text-hazard-textBright placeholder:text-hazard-textMuted/40 transition"
                />
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-hazard-border/80 mt-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-hazard-textMuted hover:text-white rounded-xl hover:bg-hazard-cardHover transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-hazard-gold to-hazard-goldGlow text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-hazard-glow hover:brightness-110 active:scale-95 disabled:opacity-50 transition"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Template'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
