const ns = 'http://www.w3.org/2000/svg';

function node(name, attributes = {}) {
  const element = document.createElementNS(ns, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function add(parent, name, attributes) {
  const element = node(name, attributes);
  parent.append(element);
  return element;
}

function hairBaseBackPath(baseId) {
  const basePaths = {
    'hair-base-long-straight': 'M57 255 C29 154 42 68 118 41 C198 18 245 79 228 267 L199 289 L190 110 C164 78 80 77 58 113 Z',
    'hair-base-long-wavy': 'M55 265 C20 160 35 70 115 40 C200 10 250 85 235 280 C218 268 200 260 190 275 L185 115 C160 75 78 75 56 115 Z',
    'hair-base-short-bob': 'M58 180 C34 128 48 61 116 42 C185 23 236 69 230 147 L222 222 L191 211 L181 102 C164 76 76 76 57 109 Z',
    'hair-base-mid-bob': 'M58 200 C34 135 48 65 116 42 C185 23 236 69 230 170 L222 240 L191 220 L181 108 C164 76 76 76 57 109 Z',
    'hair-base-wolf-cut': 'M58 190 C30 130 50 60 120 45 C190 20 240 70 220 150 L210 160 L195 120 C180 90 100 90 70 120 Z',
    'hair-base-pixie-crop': 'M58 135 C37 100 55 50 116 38 C177 26 215 68 199 125 L186 130 L180 95 C155 72 87 70 59 105 Z'
  };
  return basePaths[baseId] || basePaths['hair-base-long-straight'];
}

function hairBaseFringePath(baseId) {
  // All bases use the same fringe/bangs path for now
  return 'M58 121 C51 72 84 42 121 43 C169 42 198 74 188 118 C172 99 161 79 148 72 L145 115 L122 72 L106 115 L86 74 L78 117 Z';
}

function hairPartPath(partId) {
  const partPaths = {
    'hair-part-bangs': 'M58 121 C51 72 84 42 121 43 C169 42 198 74 188 118 C172 99 161 79 148 72 L145 115 L122 72 L106 115 L86 74 L78 117 Z',
    'hair-part-side-swept-bangs': 'M60 110 C50 70 90 40 130 45 C170 40 200 80 190 130 L180 140 L150 100 L120 110 Z',
    'hair-part-sidelocks': 'M70 130 Q80 90 90 130 M170 130 Q160 90 150 130',
    'hair-part-ahoge': 'M122 80 Q125 50 128 80 Q125 100 122 80 Z'
  };
  return partPaths[partId] || '';
}

function renderEyes(group, state) {
  const eyeY = 146;
  const eyeX = [90, 154];
  const iris = state.eyes.iris;

  eyeX.forEach((x) => {
    const eyeWhite = add(group, 'ellipse', { cx: x, cy: eyeY, rx: 16, ry: 18, fill: '#fffaf9', stroke: '#3b2631', 'stroke-width': 4 });

    if (iris === 'round') {
      // Round iris
      add(group, 'ellipse', { cx: x, cy: eyeY + 2, rx: 12, ry: 12, fill: state.eyes.color });
      add(group, 'ellipse', { cx: x, cy: eyeY + 3, rx: 8, ry: 8, fill: '#252035' });
    } else if (iris === 'split') {
      // Split iris (vertical slit like snake eye)
      add(group, 'ellipse', { cx: x, cy: eyeY + 2, rx: 12, ry: 12, fill: state.eyes.color });
      // Vertical slit pupil
      add(group, 'rect', { x: x - 2, y: eyeY - 4, width: 4, height: 8, fill: '#252035' });
    }

    // Eye highlights
    add(group, 'circle', { cx: x - 3, cy: eyeY - 3, r: 3.5, fill: '#fff' });
    add(group, 'circle', { cx: x + 3, cy: eyeY + 6, r: 1.8, fill: '#fff' });

    // Eyelash curve
    add(group, 'path', { d: `M${x - 13} ${eyeY - 18} Q${x} ${eyeY - 28} ${x + 13} ${eyeY - 18}`, fill: 'none', stroke: '#3b2631', 'stroke-width': 5, 'stroke-linecap': 'round' });
  });
}

export function renderCharacter(target, state) {
  target.replaceChildren();
  const svg = node('svg', { viewBox: '0 0 244 330', role: 'img', 'aria-label': `Portrait of ${state.name || 'an anime character'}`, class: 'portrait-svg' });
  const defs = add(svg, 'defs');
  const gradient = add(defs, 'linearGradient', { id: 'portraitBackdrop', x1: '0', y1: '0', x2: '1', y2: '1' });
  add(gradient, 'stop', { offset: '0%', 'stop-color': '#ffe3ed' });
  add(gradient, 'stop', { offset: '100%', 'stop-color': '#d9e8ff' });
  add(svg, 'rect', { width: 244, height: 330, rx: 26, fill: 'url(#portraitBackdrop)' });
  add(svg, 'circle', { cx: 34, cy: 43, r: 20, fill: '#fff8d5', opacity: .75 });
  add(svg, 'circle', { cx: 211, cy: 291, r: 30, fill: '#d8caff', opacity: .55 });

  /* hair (back layer) */
  const hairBack = add(svg, 'g');
  add(hairBack, 'path', { d: hairBaseBackPath(state.hair.base), fill: state.hair.color, stroke: '#3b2631', 'stroke-width': 4, 'stroke-linejoin': 'round' });

  /* neck / shoulders */
  add(svg, 'path', { d: 'M71 280 Q75 242 100 236 L143 236 Q169 242 173 280', fill: '#fff8fb', stroke: '#3b2631', 'stroke-width': 4 });

  /* face */
  add(svg, 'path', { d: 'M77 120 Q79 72 122 69 Q166 72 168 120 L163 187 Q156 225 122 232 Q88 225 81 187 Z', fill: state.skin.color, stroke: '#3b2631', 'stroke-width': 4, 'stroke-linejoin': 'round' });
  /* ears */
  add(svg, 'path', { d: 'M161 170 Q177 162 176 180 Q174 197 160 196', fill: state.skin.color, stroke: '#3b2631', 'stroke-width': 4 });
  add(svg, 'path', { d: 'M83 170 Q67 162 68 180 Q70 197 84 196', fill: state.skin.color, stroke: '#3b2631', 'stroke-width': 4 });
  /* nose */
  add(svg, 'path', { d: 'M102 178 Q122 190 142 178', fill: 'none', stroke: state.skin.shade, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: .65 });

  /* face features group */
  const face = add(svg, 'g');
  renderEyes(face, state);
  add(face, 'path', { d: 'M116 163 L111 179 L120 180', fill: 'none', stroke: state.skin.shade, 'stroke-width': 3, 'stroke-linecap': 'round' });
  add(face, 'ellipse', { cx: 84, cy: 181, rx: 12, ry: 6, fill: '#ef91a5', opacity: .27 });
  add(face, 'ellipse', { cx: 160, cy: 181, rx: 12, ry: 6, fill: '#ef91a5', opacity: .27 });
  /* neutral mouth */
  add(face, 'path', { d: 'M108 198 Q122 205 136 198', fill: 'none', stroke: state.skin.shade, 'stroke-width': 4, 'stroke-linecap': 'round' });

  /* fringe / bangs (front hair layer) */
  const fringe = add(svg, 'g');
  add(fringe, 'path', { d: 'M58 121 C51 72 84 42 121 43 C169 42 198 74 188 118 C172 99 161 79 148 72 L145 115 L122 72 L106 115 L86 74 L78 117 Z', fill: state.hair.color, stroke: '#3b2631', 'stroke-width': 4, 'stroke-linejoin': 'round' });

  /* hair parts (additive overlay layer) */
  const partsGroup = add(svg, 'g');
  const activeParts = state.hair.parts || [];
  activeParts.forEach((partId) => {
    const partPath = hairPartPath(partId);
    if (partPath) {
      add(partsGroup, 'path', { d: partPath, fill: state.hair.color, stroke: '#3b2631', 'stroke-width': 4, 'stroke-linejoin': 'round' });
    }
  });

  target.append(svg);
}
