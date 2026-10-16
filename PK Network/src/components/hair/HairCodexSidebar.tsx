import React from 'react';
import { Layers, Folder, ChevronRight, Hash } from 'lucide-react';
import { CategorySummary } from '../../services/hairCodexService';

interface HairCodexSidebarProps {
  categories: CategorySummary[];
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  onSelectSubcategory: (sub: string | null) => void;
  totalItems: number;
}

export const HairCodexSidebar: React.FC<HairCodexSidebarProps> = ({
  categories,
  selectedCategory,
  selectedSubcategory,
  onSelectCategory,
  onSelectSubcategory,
  totalItems,
}) => {
  const isAllSelected = !selectedCategory && !selectedSubcategory;

  const handleSelectAll = () => {
    onSelectCategory(null);
    onSelectSubcategory(null);
  };

  const handleSelectCat = (catName: string) => {
    if (selectedCategory === catName && !selectedSubcategory) {
      onSelectCategory(null);
    } else {
      onSelectCategory(catName);
      onSelectSubcategory(null);
    }
  };

  const handleSelectSub = (catName: string, subName: string) => {
    onSelectCategory(catName);
    onSelectSubcategory(subName);
  };

  return (
    <aside className="hair-codex-sidebar">
      {/* All Traits Filter */}
      <button
        onClick={handleSelectAll}
        className="prompt-action-btn secondary"
        style={{
          minHeight: '36px',
          justifyContent: 'space-between',
          padding: '0 0.65rem',
          background: isAllSelected ? 'rgba(236, 72, 153, 0.18)' : 'transparent',
          borderColor: isAllSelected ? '#ec4899' : 'transparent',
          color: isAllSelected ? '#ec4899' : 'var(--text-secondary, #94a3b8)',
          fontWeight: isAllSelected ? 600 : 400,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '12px' }}>
          <Layers size={14} />
          <span>All Traits</span>
        </div>
        <span
          style={{
            fontSize: '10.5px',
            fontFamily: 'var(--font-mono)',
            padding: '1px 6px',
            borderRadius: '999px',
            background: isAllSelected ? '#ec4899' : 'rgba(255,255,255,0.06)',
            color: isAllSelected ? '#ffffff' : 'var(--text-dim)',
          }}
        >
          {totalItems}
        </span>
      </button>

      <div style={{ height: '1px', background: 'var(--border-light, rgba(255,255,255,0.08))', margin: '0.35rem 0' }} />

      {/* Categories & Subcategories List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {categories.map((cat) => {
          const isCatActive = selectedCategory === cat.name;

          return (
            <div key={cat.name} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {/* Category Root Button */}
              <button
                onClick={() => handleSelectCat(cat.name)}
                className="prompt-action-btn secondary"
                style={{
                  minHeight: '34px',
                  justifyContent: 'space-between',
                  padding: '0 0.5rem',
                  background: isCatActive && !selectedSubcategory ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  borderColor: isCatActive && !selectedSubcategory ? '#38bdf8' : 'transparent',
                  color: isCatActive ? '#38bdf8' : 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '11.5px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Folder size={13} color={isCatActive ? '#38bdf8' : 'var(--text-dim)'} />
                  <span>{cat.name}</span>
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-dim)',
                  }}
                >
                  {cat.count}
                </span>
              </button>

              {/* Subcategories */}
              <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '0.85rem', gap: '1px' }}>
                {cat.subcategories.map((sub) => {
                  const isSubActive = selectedCategory === cat.name && selectedSubcategory === sub.name;

                  return (
                    <button
                      key={sub.name}
                      onClick={() => handleSelectSub(cat.name, sub.name)}
                      style={{
                        minHeight: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 0.45rem',
                        background: isSubActive ? 'rgba(236, 72, 153, 0.15)' : 'transparent',
                        borderRadius: '5px',
                        border: '1px solid',
                        borderColor: isSubActive ? '#ec4899' : 'transparent',
                        color: isSubActive ? '#ec4899' : 'var(--text-secondary, #94a3b8)',
                        cursor: 'pointer',
                        fontSize: '11px',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden' }}>
                        <ChevronRight size={10} color={isSubActive ? '#ec4899' : 'var(--text-dim)'} />
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {sub.name}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '9.5px',
                          fontFamily: 'var(--font-mono)',
                          color: isSubActive ? '#ec4899' : 'var(--text-dim)',
                          marginLeft: '4px',
                          flexShrink: 0,
                        }}
                      >
                        {sub.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
