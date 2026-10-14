import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

export interface TagListEditorProps {
  title: string;
  subtitle?: string;
  tags: string[];
  onChange: (newTags: string[]) => void;
  placeholder?: string;
  badgeTheme?: 'gold' | 'cyan' | 'purple' | 'emerald';
  icon?: React.ReactNode;
}

export const TagListEditor: React.FC<TagListEditorProps> = ({
  title,
  subtitle,
  tags = [],
  onChange,
  placeholder = 'Add new tag...',
  badgeTheme = 'gold',
  icon,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const raw = inputValue.trim();
    if (!raw) return;
    const parts = raw
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const existingLower = new Set(tags.map((t) => t.toLowerCase()));
    const toAdd = parts.filter((p) => !existingLower.has(p.toLowerCase()));

    if (toAdd.length > 0) {
      onChange([...tags, ...toAdd]);
    }
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const themeClasses = {
    gold: {
      border: 'border-hazard-gold/40 focus-within:border-hazard-gold',
      badge: 'bg-hazard-gold/15 text-hazard-gold border-hazard-gold/40 hover:border-hazard-gold',
      btn: 'bg-hazard-gold text-black hover:bg-hazard-goldGlow',
    },
    cyan: {
      border: 'border-hazard-cyan/40 focus-within:border-hazard-cyan',
      badge: 'bg-hazard-cyan/15 text-hazard-cyan border-hazard-cyan/40 hover:border-hazard-cyan',
      btn: 'bg-hazard-cyan text-black hover:bg-cyan-400',
    },
    purple: {
      border: 'border-purple-500/40 focus-within:border-purple-500',
      badge: 'bg-purple-500/15 text-purple-300 border-purple-500/40 hover:border-purple-400',
      btn: 'bg-purple-500 text-white hover:bg-purple-600',
    },
    emerald: {
      border: 'border-emerald-500/40 focus-within:border-emerald-500',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:border-emerald-400',
      btn: 'bg-emerald-500 text-black hover:bg-emerald-400',
    },
  }[badgeTheme];

  return (
    <div className="flex flex-col gap-2.5 p-4 sm:p-5 rounded-2xl bg-hazard-void/60 border border-hazard-border font-mono">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-hazard-textBright">
            {title}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-hazard-card border border-hazard-border text-hazard-textMuted font-bold">
            {tags.length}
          </span>
        </div>
        {subtitle && (
          <span className="text-[11px] text-hazard-textMuted hidden sm:inline">{subtitle}</span>
        )}
      </div>

      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-hazard-card border transition-all ${themeClasses.border}`}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-xs sm:text-sm text-hazard-textBright placeholder:text-hazard-textMuted/40 outline-none border-0 p-1"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${themeClasses.btn}`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 min-h-[32px] pt-1">
        {tags.length > 0 ? (
          tags.map((tag, idx) => (
            <span
              key={`${tag}-${idx}`}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition group select-all ${themeClasses.badge}`}
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="hover:text-red-400 p-0.5 rounded transition cursor-pointer"
                title={`Remove ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        ) : (
          <span className="text-xs text-hazard-textMuted/40 italic">No entries defined yet.</span>
        )}
      </div>
    </div>
  );
};
