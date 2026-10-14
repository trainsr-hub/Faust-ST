import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Check, Trash2, ListPlus, Plus, Sparkles } from 'lucide-react';

interface TopologyBulkPromptModalProps {
  isOpen: boolean;
  groupKey: string;
  fieldKey?: string;
  initialPrompts: string[];
  suggestions?: string[];
  onClose: () => void;
  onSave: (prompts: string[]) => void;
}

export const TopologyBulkPromptModal: React.FC<TopologyBulkPromptModalProps> = ({
  isOpen,
  groupKey,
  fieldKey = 'tokens',
  initialPrompts = [],
  suggestions = [],
  onClose,
  onSave,
}) => {
  const [rawText, setRawText] = useState('');
  const [previewList, setPreviewList] = useState<string[]>([]);
  const [quickAddInput, setQuickAddInput] = useState('');
  const [selectedSuggestIndex, setSelectedSuggestIndex] = useState(0);
  const [showSuggestDropdown, setShowSuggestDropdown] = useState(false);
  const suggestInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setRawText(initialPrompts.join(', '));
      setPreviewList(initialPrompts);
      setQuickAddInput('');
      setShowSuggestDropdown(false);
    }
  }, [isOpen, initialPrompts]);

  const parseTextToTags = (text: string): string[] => {
    const items = text
      .split(/[,\n]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    return Array.from(new Set(items));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setRawText(text);
    setPreviewList(parseTextToTags(text));
  };

  // Filtered autosuggest suggestions for quick add input
  const filteredSuggestions = useMemo(() => {
    const q = quickAddInput.trim().toLowerCase();
    if (!q) return [];
    return suggestions
      .filter((s) => s.toLowerCase().includes(q) && !previewList.includes(s))
      .slice(0, 8);
  }, [quickAddInput, suggestions, previewList]);

  // Suggested tokens pool for quick addition
  const recommendedSuggestions = useMemo(() => {
    return suggestions
      .filter((s) => !previewList.includes(s))
      .slice(0, 10);
  }, [suggestions, previewList]);

  const handleAddToken = (token: string) => {
    const cleanToken = token.trim();
    if (!cleanToken || previewList.includes(cleanToken)) return;

    const updated = [...previewList, cleanToken];
    setPreviewList(updated);
    setRawText(updated.join(', '));
    setQuickAddInput('');
    setShowSuggestDropdown(false);
  };

  const handleRemoveToken = (indexToRemove: number) => {
    const updated = previewList.filter((_, idx) => idx !== indexToRemove);
    setPreviewList(updated);
    setRawText(updated.join(', '));
  };

  const handleQuickAddKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestDropdown && filteredSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestIndex((prev) => (prev + 1) % filteredSuggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestIndex((prev) => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        handleAddToken(filteredSuggestions[selectedSuggestIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setShowSuggestDropdown(false);
        return;
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (quickAddInput.trim()) {
        handleAddToken(quickAddInput.trim());
      }
    }
  };

  const handleSave = () => {
    const cleaned = parseTextToTags(rawText);
    onSave(cleaned);
    onClose();
  };

  const handleClear = () => {
    setRawText('');
    setPreviewList([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#12141c] border border-hazard-border w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-hazard-border bg-hazard-card/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-hazard-gold/10 border border-hazard-gold/30 flex items-center justify-center text-hazard-gold">
              <ListPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-hazard-textBright">
                Batch {fieldKey} Editor
              </h3>
              <p className="text-xs text-hazard-textMuted font-mono">
                Row: <span className="text-hazard-gold">{groupKey}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-hazard-textMuted hover:text-white hover:bg-hazard-cardHover rounded-xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          {/* Quick Add with Autosuggest Input */}
          <div className="relative flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-hazard-cyan uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quick Add Single Token (with Autosuggest)</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  ref={suggestInputRef}
                  type="text"
                  value={quickAddInput}
                  onChange={(e) => {
                    setQuickAddInput(e.target.value);
                    setShowSuggestDropdown(true);
                    setSelectedSuggestIndex(0);
                  }}
                  onFocus={() => setShowSuggestDropdown(true)}
                  onKeyDown={handleQuickAddKeyDown}
                  placeholder="Type to search global tokens or enter new token..."
                  className="w-full bg-hazard-card/90 border border-hazard-border rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder:text-hazard-textMuted/50 focus:outline-none focus:border-hazard-cyan"
                />

                {/* Floating Autosuggest Dropdown */}
                {showSuggestDropdown && filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#161922] border border-hazard-cyan/40 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
                    {filteredSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddToken(suggestion)}
                        onMouseEnter={() => setSelectedSuggestIndex(idx)}
                        className={`w-full text-left px-3.5 py-2 text-xs font-mono flex items-center justify-between transition ${
                          idx === selectedSuggestIndex
                            ? 'bg-hazard-cyan/20 text-hazard-cyan font-bold'
                            : 'text-hazard-textBright hover:bg-hazard-cardHover'
                        }`}
                      >
                        <span>{suggestion}</span>
                        <span className="text-[10px] text-hazard-textMuted font-sans">suggested</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (quickAddInput.trim()) {
                    handleAddToken(quickAddInput.trim());
                  }
                }}
                disabled={!quickAddInput.trim()}
                className="px-3.5 py-2 bg-hazard-cyan/20 border border-hazard-cyan/40 hover:bg-hazard-cyan/30 text-hazard-cyan text-xs font-bold rounded-xl transition flex items-center gap-1 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Quick Click Recommendations (if available) */}
          {recommendedSuggestions.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono text-hazard-textMuted">Recommended from schema:</span>
              <div className="flex flex-wrap gap-1.5">
                {recommendedSuggestions.map((rec, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddToken(rec)}
                    className="px-2 py-0.5 rounded-lg text-[11px] font-mono bg-hazard-void border border-hazard-border text-hazard-textMuted hover:text-hazard-cyan hover:border-hazard-cyan/40 hover:bg-hazard-cardHover transition flex items-center gap-1"
                  >
                    <span>+</span>
                    <span>{rec}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Raw Textarea */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-hazard-textMuted uppercase tracking-wider">
              Batch Paste or Edit Values (Comma or Newline Separated)
            </label>
            <textarea
              value={rawText}
              onChange={handleTextChange}
              rows={4}
              placeholder="e.g. value_1, value_2, value_3"
              className="w-full bg-hazard-card/90 border border-hazard-border rounded-2xl p-3.5 text-xs font-mono text-white placeholder:text-hazard-textMuted/50 focus:outline-none focus:border-hazard-gold resize-y custom-scrollbar leading-relaxed"
            />
          </div>

          {/* Parsed Preview Tags */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-hazard-textMuted uppercase tracking-wider">
                Parsed Tokens ({previewList.length})
              </span>
              {previewList.length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex items-center gap-1 text-[11px] text-hazard-crimson hover:underline"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All
                </button>
              )}
            </div>

            <div className="min-h-[70px] max-h-40 overflow-y-auto p-3 bg-black/40 border border-hazard-border/60 rounded-2xl flex flex-wrap gap-1.5 custom-scrollbar">
              {previewList.length === 0 ? (
                <span className="text-xs text-hazard-textMuted/50 italic py-2">
                  No tokens entered yet. Type or paste comma-separated values above.
                </span>
              ) : (
                previewList.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-hazard-cardHover text-hazard-gold border border-hazard-gold/30 group"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveToken(i)}
                      className="text-hazard-textMuted hover:text-hazard-crimson transition opacity-60 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-hazard-border bg-hazard-card/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-hazard-textMuted hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-hazard-gold to-hazard-goldGlow text-black font-bold text-xs rounded-xl shadow-hazard-glow hover:scale-[1.02] transition active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Apply {previewList.length} Items</span>
          </button>
        </div>
      </div>
    </div>
  );
};
