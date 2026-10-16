/**
 * Hazard Trigger - SVG Orthogonal Routing Service
 * Computes crisp bracket connectors: M a.x a.y H midX V b.y H b.x
 * Adheres strictly to Karpathy simplicity and line limits (<100 lines).
 */

export interface Point {
  x: number;
  y: number;
}

export interface SvgLineConfig {
  d: string;
  isActive: boolean;
  sourceSlot: string;
  targetSlot: string;
}

export function getSlotCenter(slotId: string, containerEl: HTMLElement): Point | null {
  const el = containerEl.querySelector(`[data-slot="${slotId}"]`) as HTMLElement;
  if (!el) return null;

  const r = el.getBoundingClientRect();
  const c = containerEl.getBoundingClientRect();

  return {
    x: r.left - c.left + r.width / 2,
    y: r.top - c.top + r.height / 2
  };
}

export function computeOrthogonalPath(a: Point, b: Point): string {
  const midX = (a.x + b.x) / 2;
  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} H ${midX.toFixed(1)} V ${b.y.toFixed(1)} H ${b.x.toFixed(1)}`;
}

export const ROUND_PAIRS: [string, string, string][] = [
  // Left Wing (West)
  ['l1', 'l2', 'l9'],
  ['l3', 'l4', 'l10'],
  ['l5', 'l6', 'l11'],
  ['l7', 'l8', 'l12'],
  ['l9', 'l10', 'l13'],
  ['l11', 'l12', 'l14'],
  ['l13', 'l14', 'l15'],

  // Right Wing (East)
  ['r1', 'r2', 'r9'],
  ['r3', 'r4', 'r10'],
  ['r5', 'r6', 'r11'],
  ['r7', 'r8', 'r12'],
  ['r9', 'r10', 'r13'],
  ['r11', 'r12', 'r14'],
  ['r13', 'r14', 'r15']
];
