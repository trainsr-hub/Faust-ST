import React, { useState, useMemo } from 'react';
import { ExternalLink, Copy, Check, Sparkles, Layers, Sliders, Info, Zap } from 'lucide-react';
import { CompositeHairstyleDeconstruction } from '../../types/facetOntology';
import { COMPOSITE_DECONSTRUCTIONS } from '../../services/facetOntologyData';

interface AtomicDeconstructorViewProps {
  onCopyPrompt: (prompt: string) => void;
}

export const AtomicDeconstructorView: React.FC<AtomicDeconstructorViewProps> = ({ onCopyPrompt }) => {
  const [selectedTag, setSelectedTag] = useState<string>(COMPOSITE_DECONSTRUCTIONS[0].tag);
  const [copied, setCopied] = useState(false);

  // Interactive Synthesizer State
  const [synthParting, setSynthParting] = useState<string>('double-parted bangs');
  const [synthFringe, setSynthFringe] = useState<string>('blunt bangs');
  const [synthLength, setSynthLength] = useState<string>('medium hair');
  const [synthUpdo, setSynthUpdo] = useState<string>('none');
  const [synthTexture, setSynthTexture] = useState<string>('straight hair');

  const activeComposite = useMemo(
    () => COMPOSITE_DECONSTRUCTIONS.find((c) => c.tag === selectedTag) || COMPOSITE_DECONSTRUCTIONS[0],
    [selectedTag]
  );

  const compiledPrompt = useMemo(() => {
    const tokens: string[] = [];
    if (synthParting !== 'none') tokens.push(synthParting);
    if (synthFringe !== 'none') tokens.push(synthFringe);
    if (synthLength !== 'none') tokens.push(synthLength);
    if (synthTexture !== 'none') tokens.push(synthTexture);
    if (synthUpdo !== 'none') tokens.push(synthUpdo);

    // Check if this matches a known composite tag
    const isCenterFlap = synthParting === 'double-parted bangs' && synthFringe === 'blunt bangs';
    const isHimeCut = synthFringe === 'blunt bangs' && synthLength.includes('long') && synthTexture === 'straight hair';

    if (isCenterFlap) tokens.unshift('center-flap bangs');
    if (isHimeCut) tokens.unshift('hime cut');

    return Array.from(new Set(tokens)).join(', ');
  }, [synthParting, synthFringe, synthLength, synthUpdo, synthTexture]);

  const handleCopy = (text: string) => {
    onCopyPrompt(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'row', height: '100%', overflow: 'hidden', backgroundColor: '#05070f' }}>
      {/* Left Sidebar: Catalog of Composite Hairstyle Cases */}
      <div
        style={{
          width: '320px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(10, 15, 30, 0.95)',
          borderRight: '1px solid rgba(56, 189, 248, 0.2)',
          boxSizing: 'border-box',
          flexShrink: 0,
        }}
      >
        <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a855f7', fontWeight: 700, fontSize: '13px' }}>
            <Layers size={16} />
            <span>COMPOSITE HAIRSTYLES</span>
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', marginTop: '3px' }}>
            Multi-dimensional traits deconstructed into atomic condition tags
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {COMPOSITE_DECONSTRUCTIONS.map((item) => {
            const isSelected = item.tag === selectedTag;
            return (
              <div
                key={item.tag}
                onClick={() => setSelectedTag(item.tag)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  backgroundColor: isSelected ? 'rgba(168, 85, 247, 0.2)' : 'rgba(15, 23, 42, 0.65)',
                  border: isSelected ? '1.5px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.tag}
                    style={{ width: '44px', height: '44px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{ width: '44px', height: '44px', borderRadius: '4px', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={16} color="#a855f7" />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? '#e9d5ff' : '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.tag}
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.55)', marginTop: '2px' }}>
                    {item.subcategory} • {item.atomicConditions.length} atomic conditions
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Right Panel: Deconstruction Analysis & Interactive Synthesizer */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '20px 24px', gap: '20px' }}>
        {/* Active Composite Deconstruction Inspector */}
        <div style={{ background: 'rgba(15, 23, 42, 0.85)', borderRadius: '10px', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '16px 20px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          {activeComposite.imageUrl && (
            <div style={{ width: '130px', height: '130px', aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <img src={activeComposite.imageUrl} alt={activeComposite.tag} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                {activeComposite.tag}
              </div>
              <a
                href={activeComposite.wikiUrl}
                target="_blank"
                rel="noreferrer"
                className="btn"
                style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: '#38bdf8', padding: '3px 8px' }}
              >
                <ExternalLink size={12} />
                <span>Danbooru Wiki</span>
              </a>
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {activeComposite.description}
            </div>

            {/* Atomic Conditions Grid */}
            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#a855f7', letterSpacing: '0.5px' }}>
                ATOMIC CONDITION KEYWORDS (ORTHOGONAL ROOTS):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                {activeComposite.atomicConditions.map((cond, idx) => (
                  <div key={idx} style={{ background: 'rgba(2, 6, 23, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '6px 10px' }}>
                    <div style={{ fontSize: '9.5px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                      {cond.dimensionLabel}
                    </div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#e2e8f0', marginTop: '2px' }}>
                      {cond.value}
                    </div>
                    <div style={{ fontSize: '10px', color: '#38bdf8', marginTop: '3px', fontFamily: 'monospace' }}>
                      ➔ tag: <span style={{ textDecoration: 'underline' }}>{cond.impliedTag}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prompt compilation strip */}
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(2, 6, 23, 0.9)', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>Synthesized Tokens:</span>
              <span style={{ fontSize: '12px', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 700, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeComposite.synthesizedPrompt}
              </span>
              <button onClick={() => handleCopy(activeComposite.synthesizedPrompt)} className="btn" style={{ fontSize: '11px', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Atomic Synthesizer Matrix */}
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={16} color="#fbbf24" />
              <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#fbbf24' }}>INTERACTIVE ATOMIC SYNTHESIZER</span>
              <span style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>(Pick orthogonal conditions ➔ Match composite tag)</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {/* Dimension 1: Parting */}
            <div>
              <label style={{ fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                1. Parting Topology
              </label>
              <select value={synthParting} onChange={(e) => setSynthParting(e.target.value)} className="btn" style={{ width: '100%', fontSize: '11px', padding: '4px 8px', background: 'rgba(2, 6, 23, 0.8)' }}>
                <option value="none">None / Default</option>
                <option value="middle part">Middle Part</option>
                <option value="side part">Side Part</option>
                <option value="double-parted bangs">Double-parted (Temples)</option>
                <option value="parted bangs">General Parted Bangs</option>
              </select>
            </div>

            {/* Dimension 2: Fringe Cut */}
            <div>
              <label style={{ fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                2. Fringe Cut Edge
              </label>
              <select value={synthFringe} onChange={(e) => setSynthFringe(e.target.value)} className="btn" style={{ width: '100%', fontSize: '11px', padding: '4px 8px', background: 'rgba(2, 6, 23, 0.8)' }}>
                <option value="none">None / Forehead Bare</option>
                <option value="blunt bangs">Blunt Straight Fringe</option>
                <option value="swept bangs">Swept Bangs</option>
                <option value="asymmetrical bangs">Asymmetrical Bangs</option>
                <option value="fanged bangs">Fanged Bangs</option>
                <option value="wispy bangs">Wispy Bangs</option>
              </select>
            </div>

            {/* Dimension 3: Length */}
            <div>
              <label style={{ fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                3. Length Tier
              </label>
              <select value={synthLength} onChange={(e) => setSynthLength(e.target.value)} className="btn" style={{ width: '100%', fontSize: '11px', padding: '4px 8px', background: 'rgba(2, 6, 23, 0.8)' }}>
                <option value="short hair">Short Hair</option>
                <option value="medium hair">Medium Hair</option>
                <option value="long hair">Long Hair</option>
                <option value="very long hair">Very Long Hair</option>
              </select>
            </div>

            {/* Dimension 4: Fiber Texture */}
            <div>
              <label style={{ fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                4. Fiber Texture
              </label>
              <select value={synthTexture} onChange={(e) => setSynthTexture(e.target.value)} className="btn" style={{ width: '100%', fontSize: '11px', padding: '4px 8px', background: 'rgba(2, 6, 23, 0.8)' }}>
                <option value="straight hair">Straight Hair</option>
                <option value="wavy hair">Wavy Hair</option>
                <option value="curly hair">Curly Hair</option>
                <option value="drill hair">Drill Hair</option>
                <option value="messy hair">Messy Hair</option>
              </select>
            </div>

            {/* Dimension 5: Updo */}
            <div>
              <label style={{ fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                5. Coiffure Updo
              </label>
              <select value={synthUpdo} onChange={(e) => setSynthUpdo(e.target.value)} className="btn" style={{ width: '100%', fontSize: '11px', padding: '4px 8px', background: 'rgba(2, 6, 23, 0.8)' }}>
                <option value="none">Hair Down (Loose)</option>
                <option value="ponytail">Ponytail</option>
                <option value="twintails">Twintails</option>
                <option value="braid">Braid</option>
                <option value="hair bun">Hair Bun</option>
              </select>
            </div>
          </div>

          {/* Compiled Output Banner */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(2, 6, 23, 0.95)', border: '1.5px solid #fbbf24', borderRadius: '8px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
              <span style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 700 }}>SYNTHESIZED ATOMIC PROMPT:</span>
              <span style={{ fontSize: '13px', color: '#ffffff', fontFamily: 'monospace', fontWeight: 700 }}>{compiledPrompt}</span>
            </div>
            <button onClick={() => handleCopy(compiledPrompt)} className="btn primary" style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Prompt'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
