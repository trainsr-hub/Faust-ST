import React, { useState, useEffect } from 'react';
import { HairCondition, PromptGroup, ConditionPrompt, ConditionRule, ConditionMutation } from '../../../types/conditionStudio';
import { X, Check, Image as ImageIcon, Trash2, Plus } from 'lucide-react';

interface ConditionDrawerProps {
  condition: HairCondition | null;
  onSave: (condition: HairCondition) => void;
  onClose: () => void;
}

export const ConditionEditorDrawer: React.FC<ConditionDrawerProps> = ({ condition, onSave, onClose }) => {
  const [id, setId] = useState(condition?.id || '');
  const [naturalName, setNaturalName] = useState(condition?.naturalName || '');
  const [category, setCategory] = useState(condition?.category || 'Front');
  const [description, setDescription] = useState(condition?.description || '');
  const [defaultState, setDefaultState] = useState(condition?.defaultState ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !naturalName.trim()) return;
    onSave({
      id: id.trim().toLowerCase().replace(/\s+/g, '_'),
      naturalName: naturalName.trim(),
      category: category as any,
      description: description.trim(),
      defaultState,
    });
  };

  return (
    <div style={overlayStyle}>
      <div style={drawerCardStyle}>
        <div style={drawerHeaderStyle}>
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#38bdf8' }}>
            {condition ? 'Edit Condition (Predicate)' : '+ New Condition (Predicate)'}
          </span>
          <button onClick={onClose} className="btn icon-only" style={{ width: '32px', height: '32px' }}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} style={formStyle}>
          <div>
            <label style={labelStyle}>Machine ID (Slug)</label>
            <input
              style={inputStyle}
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="e.g. has_bangs, forehead_exposed"
              disabled={Boolean(condition)}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Natural Language Question</label>
            <input
              style={inputStyle}
              value={naturalName}
              onChange={(e) => setNaturalName(e.target.value)}
              placeholder="e.g. Have bangs / fringe?"
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value as any)}>
                <option value="Front">Front</option>
                <option value="Framing">Framing</option>
                <option value="Coiffure">Coiffure</option>
                <option value="Length">Length</option>
                <option value="Texture">Texture</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Default State</label>
              <button
                type="button"
                onClick={() => setDefaultState((prev) => !prev)}
                style={{
                  ...inputStyle,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  backgroundColor: defaultState ? '#38bdf8' : 'rgba(255,255,255,0.05)',
                  color: defaultState ? '#030712' : '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                {defaultState ? 'TRUE (Active by default)' : 'FALSE (Inactive by default)'}
              </button>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Physical Description / Scope</label>
            <input
              style={inputStyle}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Visual or physical meaning of this condition"
            />
          </div>
          <button type="submit" style={saveBtnStyle}>
            <Check size={16} /> Save Condition to Turso SQLite
          </button>
        </form>
      </div>
    </div>
  );
};

interface PromptDrawerProps {
  prompt: ConditionPrompt | null;
  groupId: string;
  groups: PromptGroup[];
  onSave: (prompt: ConditionPrompt) => void;
  onClose: () => void;
}

export const PromptEditorDrawer: React.FC<PromptDrawerProps> = ({ prompt, groupId, groups, onSave, onClose }) => {
  const [id, setId] = useState(prompt?.id || '');
  const [tag, setTag] = useState(prompt?.tag || '');
  const [name, setName] = useState(prompt?.name || '');
  const [targetGroupId, setTargetGroupId] = useState(prompt?.groupId || groupId);
  const [imageUrl, setImageUrl] = useState(prompt?.imageUrl || '');
  const [wikiUrl, setWikiUrl] = useState(prompt?.wikiUrl || '');
  const [description, setDescription] = useState(prompt?.description || '');
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [imageUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tag.trim() || !name.trim()) return;
    const finalId = id.trim() || tag.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_');
    onSave({
      id: finalId,
      tag: tag.trim(),
      name: name.trim(),
      groupId: targetGroupId,
      imageUrl: imageUrl.trim(),
      wikiUrl: wikiUrl.trim(),
      description: description.trim(),
    });
  };

  return (
    <div style={overlayStyle}>
      <div style={{ ...drawerCardStyle, maxWidth: '580px' }}>
        <div style={drawerHeaderStyle}>
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#ec4899' }}>
            {prompt ? 'Edit Prompt Token' : '+ Add Prompt Token'}
          </span>
          <button onClick={onClose} className="btn icon-only" style={{ width: '32px', height: '32px' }}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Danbooru Tag Token</label>
              <input
                style={inputStyle}
                value={tag}
                onChange={(e) => {
                  setTag(e.target.value);
                  if (!name) setName(e.target.value);
                }}
                placeholder="e.g. blunt bangs"
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Display Name</label>
              <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Blunt Straight Bangs" required />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Parent Group</label>
            <select style={inputStyle} value={targetGroupId} onChange={(e) => setTargetGroupId(e.target.value)}>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.category})</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Danbooru 720p CDN Image URL</label>
            <input style={inputStyle} value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://cdn.donmai.us/720x720/..." />
          </div>
          {/* Live Image Test Preview */}
          <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {imageUrl && !imgError ? (
              <img
                src={imageUrl}
                alt="Preview"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '11px' }}>
                <ImageIcon size={16} /> {imgError ? 'Image failed to load (Check URL)' : 'Enter Image URL above for live test preview'}
              </div>
            )}
          </div>
          <div>
            <label style={labelStyle}>Wiki URL</label>
            <input style={inputStyle} value={wikiUrl} onChange={(e) => setWikiUrl(e.target.value)} placeholder="https://danbooru.donmai.us/wiki_pages/..." />
          </div>
          <div>
            <label style={labelStyle}>Visual Definition</label>
            <input style={inputStyle} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Physical explanation of fringe/strand behavior" />
          </div>
          <button type="submit" style={{ ...saveBtnStyle, backgroundColor: '#ec4899', borderColor: '#ec4899' }}>
            <Check size={16} /> Save Prompt Token to Turso SQLite
          </button>
        </form>
      </div>
    </div>
  );
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(2, 6, 23, 0.85)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
  padding: '16px',
};

const drawerCardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '520px',
  backgroundColor: '#0a0f1d',
  borderRadius: '14px',
  border: '1px solid rgba(56, 189, 248, 0.3)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  maxHeight: '90vh',
};

const drawerHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 20px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  background: '#0e162a',
};

const formStyle: React.CSSProperties = {
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
  overflowY: 'auto',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  color: '#94a3b8',
  marginBottom: '6px',
  letterSpacing: '0.3px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '48px',
  backgroundColor: '#020617',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '8px',
  padding: '0 14px',
  color: '#f8fafc',
  fontSize: '13px',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
};

const saveBtnStyle: React.CSSProperties = {
  minHeight: '50px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: '#38bdf8',
  color: '#030712',
  fontSize: '13px',
  fontWeight: 800,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  marginTop: '8px',
  boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)',
};
