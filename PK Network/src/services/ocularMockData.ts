import { EyeColorItem, IrisShapeItem, OcularState } from '../types/ocular';

export const MOCK_EYE_COLORS: EyeColorItem[] = [
  { id: 'blue', name: 'Blue', hex: '#2563eb', promptToken: 'blue eyes' },
  { id: 'red', name: 'Red', hex: '#dc2626', promptToken: 'red eyes' },
  { id: 'green', name: 'Green', hex: '#16a34a', promptToken: 'green eyes' },
  { id: 'purple', name: 'Purple', hex: '#9333ea', promptToken: 'purple eyes' },
  { id: 'yellow', name: 'Yellow / Gold', hex: '#eab308', promptToken: 'yellow eyes' },
  { id: 'pink', name: 'Pink', hex: '#ec4899', promptToken: 'pink eyes' },
  { id: 'aqua', name: 'Aqua / Cyan', hex: '#06b6d4', promptToken: 'aqua eyes' },
  { id: 'brown', name: 'Brown / Amber', hex: '#92400e', promptToken: 'brown eyes' },
  { id: 'grey', name: 'Grey / Silver', hex: '#6b7280', promptToken: 'grey eyes' },
  { id: 'black', name: 'Black', hex: '#1f2937', promptToken: 'black eyes' },
  { id: 'orange', name: 'Orange', hex: '#ea580c', promptToken: 'orange eyes' },
  { id: 'white', name: 'White', hex: '#f8fafc', promptToken: 'white eyes' },
];

export const MOCK_IRIS_SHAPES: IrisShapeItem[] = [
  { id: 'round', name: 'Round (Standard)', promptToken: '', iconSymbol: '●' },
  { id: 'slit', name: 'Slit / Cat', promptToken: 'slit pupils, cat eyes', iconSymbol: '▮' },
  { id: 'heart', name: 'Heart', promptToken: 'heart-shaped pupils', iconSymbol: '♥' },
  { id: 'star', name: 'Star', promptToken: 'star-shaped pupils', iconSymbol: '★' },
  { id: 'diamond', name: 'Diamond', promptToken: 'diamond-shaped pupils', iconSymbol: '◆' },
  { id: 'cross', name: 'Cross', promptToken: 'cross-shaped pupils', iconSymbol: '✚' },
  { id: 'glowing', name: 'Glowing Ring', promptToken: 'glowing eyes, ringed eyes', iconSymbol: '◎' },
  { id: 'empty', name: 'Empty / Hollow', promptToken: 'empty eyes, blank eyes', iconSymbol: '○' },
];

export const MOCK_PUPIL_COLORS: EyeColorItem[] = [
  { id: 'black', name: 'Black (Standard)', hex: '#090d16', promptToken: '' },
  { id: 'red', name: 'Red', hex: '#dc2626', promptToken: 'red pupils' },
  { id: 'white', name: 'White', hex: '#ffffff', promptToken: 'white pupils' },
  { id: 'yellow', name: 'Yellow / Gold', hex: '#eab308', promptToken: 'yellow pupils' },
  { id: 'blue', name: 'Blue', hex: '#2563eb', promptToken: 'blue pupils' },
  { id: 'purple', name: 'Purple', hex: '#9333ea', promptToken: 'purple pupils' },
  { id: 'pink', name: 'Pink', hex: '#ec4899', promptToken: 'pink pupils' },
  { id: 'green', name: 'Green', hex: '#16a34a', promptToken: 'green pupils' },
  { id: 'aqua', name: 'Aqua / Cyan', hex: '#06b6d4', promptToken: 'aqua pupils' },
];

export const MOCK_IRIS_ACCENTS = [
  { id: 'none', name: 'Natural / Standard', promptToken: '' },
];

export function compileOcularPrompt(state: OcularState): string {
  if (!state.isEnabled) return '';

  const c1 = MOCK_EYE_COLORS.find((c) => c.id === state.color1) || MOCK_EYE_COLORS[0];
  const c2 = MOCK_EYE_COLORS.find((c) => c.id === state.color2) || MOCK_EYE_COLORS[1];
  const tokens: string[] = [];

  // 1. Color distribution
  if (state.mode === 'single') {
    tokens.push(c1.promptToken);
  } else if (state.mode === 'heterochromia') {
    const single1 = c1.promptToken.replace(' eyes', ' eye');
    const single2 = c2.promptToken.replace(' eyes', ' eye');
    tokens.push(`heterochromia, ${single1}, ${single2}`);
  } else if (state.mode === 'multi') {
    tokens.push(`gradient eyes, two-tone eyes, ${c1.name.toLowerCase()} and ${c2.name.toLowerCase()} eyes`);
  }

  // 2. Iris Shape
  const shape = MOCK_IRIS_SHAPES.find((s) => s.id === state.irisShape);
  if (shape && shape.promptToken) {
    tokens.push(shape.promptToken);
  }

  // 3. Pupil Color (Replaces Iris Accent)
  if (state.pupilColor && state.pupilColor !== 'black') {
    const pc = MOCK_PUPIL_COLORS.find((p) => p.id === state.pupilColor);
    if (pc && pc.promptToken) {
      tokens.push(pc.promptToken);
    } else {
      tokens.push(`${state.pupilColor} pupils`);
    }
  }

  return tokens.join(', ');
}
