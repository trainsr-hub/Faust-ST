import React, { useState, useMemo } from 'react';
import { X, Search, Plus, Check } from 'lucide-react';
import { DANBOORU_HAIR_ITEMS } from '../../../services/hairGraphData';
import { GraphNode } from '../../../types/hairGraph';

interface GraphPaletteDrawerProps {
  isOpen: boolean;
  activeNodeIds: Set<string>;
  onClose: () => void;
  onSpawnNode: (item: any) => void;
}

export const GraphPaletteDrawer: React.FC<GraphPaletteDrawerProps> = ({
  isOpen,
  activeNodeIds,
  onClose,
  onSpawnNode,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const set = new Set<string>();
    DANBOORU_HAIR_ITEMS.forEach((it: any) => {
      if (it.subcategory) set.add(it.subcategory);
      else if (it.category) set.add(it.category);
    });
    return Array.from(set).sort();
  }, []);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return DANBOORU_HAIR_ITEMS.filter((it: any) => {
      const matchSearch =
        !q ||
        it.tag.toLowerCase().includes(q) ||
        (it.description && it.description.toLowerCase().includes(q));
      const matchCat =
        selectedCategory === 'all' ||
        it.subcategory === selectedCategory ||
        it.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [search, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '60px',
        left: '16px',
        width: '320px',
        maxHeight: 'calc(100% - 90px)',
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid var(--border-light, rgba(255, 255, 255, 0.12))',
        borderRadius: '10px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: '13px', color: '#f8fafc' }}>
          Trait Palette ({filteredItems.length})
        </span>
        <button
          className="btn icon-only"
          onClick={onClose}
          style={{ width: '24px', height: '24px', padding: 0 }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Search Input */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(2, 6, 23, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            padding: '4px 8px',
          }}
        >
          <Search size={13} color="var(--text-dim)" />
          <input
            type="text"
            placeholder="Search trait (e.g. kishimen)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: '12px',
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          padding: '6px 12px',
          overflowX: 'auto',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <button
          onClick={() => setSelectedCategory('all')}
          style={{
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '10.5px',
            border: '1px solid',
            borderColor: selectedCategory === 'all' ? '#f43f5e' : 'rgba(255, 255, 255, 0.1)',
            background: selectedCategory === 'all' ? 'rgba(244, 63, 94, 0.2)' : 'transparent',
            color: selectedCategory === 'all' ? '#fb7185' : 'var(--text-secondary)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          All
        </button>
        {categories.slice(0, 10).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '10.5px',
              border: '1px solid',
              borderColor: selectedCategory === cat ? '#f43f5e' : 'rgba(255, 255, 255, 0.1)',
              background: selectedCategory === cat ? 'rgba(244, 63, 94, 0.2)' : 'transparent',
              color: selectedCategory === cat ? '#fb7185' : 'var(--text-secondary)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Trait List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
        {filteredItems.map((it: any) => {
          const slug = it.slug || it.id || it.tag.replace(' ', '_');
          const isSpawned = activeNodeIds.has(slug);
          return (
            <div
              key={slug}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                borderRadius: '6px',
                background: 'rgba(30, 41, 59, 0.4)',
                marginBottom: '4px',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                {it.imageUrl && (
                  <img
                    src={it.imageUrl}
                    alt={it.tag}
                    style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover' }}
                  />
                )}
                <div style={{ overflow: 'hidden' }}>
                  <div
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: '#f8fafc',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {it.tag}
                  </div>
                  <div style={{ fontSize: '9.5px', color: 'var(--text-tertiary)' }}>
                    {it.subcategory || it.category}
                  </div>
                </div>
              </div>

              <button
                className="btn icon-only"
                style={{
                  width: '26px',
                  height: '26px',
                  padding: 0,
                  flexShrink: 0,
                  background: isSpawned ? 'rgba(34, 197, 94, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                  color: isSpawned ? '#4ade80' : '#38bdf8',
                  borderColor: isSpawned ? 'rgba(34, 197, 94, 0.4)' : 'rgba(56, 189, 248, 0.4)',
                }}
                title={isSpawned ? 'Already on Canvas' : 'Spawn on Canvas'}
                onClick={() => onSpawnNode(it)}
              >
                {isSpawned ? <Check size={12} /> : <Plus size={13} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
