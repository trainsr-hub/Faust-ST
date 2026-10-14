import React, { useState } from 'react';
import { useTriggerStore } from '../../store/useTriggerStore';
import { HazardTemplate } from '../../types/schema';
import {
  Bookmark,
  BookmarkPlus,
  Save,
  Unlink,
  ChevronDown,
  Sparkles,
  Check,
  FolderOpen,
} from 'lucide-react';

interface TemplateBarProps {
  onOpenSaveModal: () => void;
  onNavigateToTemplates: () => void;
}

export const TemplateBar: React.FC<TemplateBarProps> = ({
  onOpenSaveModal,
  onNavigateToTemplates,
}) => {
  const {
    templates,
    activeTemplate,
    applyTemplate,
    updateActiveTemplate,
    detachActiveTemplate,
    isSaving,
  } = useTriggerStore();

  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleUpdate = async () => {
    await updateActiveTemplate();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 1500);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 px-5 bg-hazard-card/90 border border-hazard-border rounded-2xl shadow-sm backdrop-blur-md">
      {/* Left: Active Template Status Pill & Quick Switcher */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-hazard-gold" />
          <span className="text-xs font-bold uppercase tracking-wider text-hazard-textBright">
            Template:
          </span>
        </div>

        {/* Status Badge */}
        {activeTemplate ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-hazard-gold/10 border border-hazard-gold/40 text-hazard-gold shadow-hazard-glow">
            <span className="w-2 h-2 rounded-full bg-hazard-gold animate-pulse" />
            <strong className="text-xs font-bold">{activeTemplate.name}</strong>
            {activeTemplate.category && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-hazard-card text-hazard-textBright font-mono">
                {activeTemplate.category}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-hazard-void border border-hazard-border text-hazard-textMuted text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-hazard-textMuted/50" />
            <span>Custom Combo (Auto-Saved)</span>
          </div>
        )}

        {/* Quick Switcher Select Dropdown */}
        {templates.length > 0 && (
          <div className="relative inline-block">
            <select
              value={activeTemplate?.id || ''}
              onChange={(e) => {
                const selected = templates.find((t) => t.id === e.target.value);
                if (selected) {
                  applyTemplate(selected);
                } else if (e.target.value === '__custom__') {
                  detachActiveTemplate();
                }
              }}
              className="appearance-none pl-3 pr-8 py-1.5 bg-hazard-void border border-hazard-border rounded-xl text-xs font-medium text-hazard-textBright focus:border-hazard-gold focus:outline-none hover:border-hazard-gold/50 cursor-pointer transition"
            >
              <option value="" disabled>
                -- Switch Template --
              </option>
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name} {tpl.category ? `(${tpl.category})` : ''}
                </option>
              ))}
              {activeTemplate && (
                <option value="__custom__">-- Detach to Custom --</option>
              )}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-hazard-textMuted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* If Active Template: Overwrite / Save Changes Button */}
        {activeTemplate && (
          <>
            <button
              onClick={handleUpdate}
              disabled={isSaving}
              title="Overwrite and save current choices to active template file"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-hazard-gold/20 border border-hazard-gold/50 text-hazard-gold hover:bg-hazard-gold/30 hover:border-hazard-gold text-xs font-bold rounded-xl shadow-sm transition active:scale-95"
            >
              {savedFeedback ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{savedFeedback ? 'Saved!' : 'Save Changes'}</span>
            </button>

            <button
              onClick={detachActiveTemplate}
              title="Detach from template to edit as independent custom combo"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-hazard-card hover:bg-hazard-cardHover text-hazard-textMuted hover:text-white border border-hazard-border rounded-xl text-xs transition"
            >
              <Unlink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Detach</span>
            </button>
          </>
        )}

        {/* Save As New Template Button */}
        <button
          onClick={onOpenSaveModal}
          title="Save current choices as a new reusable Template in Hazard_Trigger_Data/Templates/"
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-hazard-cyan/80 to-hazard-cyan text-black font-bold text-xs rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition"
        >
          <BookmarkPlus className="w-4 h-4" />
          <span>Save New Template</span>
        </button>

        {/* Browse All Templates Tab */}
        <button
          onClick={onNavigateToTemplates}
          title="Open Templates Catalog Manager"
          className="p-2 text-hazard-textMuted hover:text-hazard-gold bg-hazard-card border border-hazard-border rounded-xl hover:border-hazard-gold/50 transition"
        >
          <FolderOpen className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
