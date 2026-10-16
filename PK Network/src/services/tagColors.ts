export interface NotionTagColor {
  name: string;
  bg: string;
  text: string;
  border: string;
}

export const NOTION_COLORS: NotionTagColor[] = [
  {
    name: 'default',
    bg: 'var(--tag-gray-bg, rgba(148, 163, 184, 0.15))',
    text: 'var(--tag-gray-text, #cbd5e1)',
    border: 'var(--tag-gray-border, rgba(148, 163, 184, 0.45))',
  },
  {
    name: 'blue',
    bg: 'var(--tag-blue-bg, rgba(56, 189, 248, 0.15))',
    text: 'var(--tag-blue-text, #38bdf8)',
    border: 'var(--tag-blue-border, rgba(56, 189, 248, 0.45))',
  },
  {
    name: 'green',
    bg: 'var(--tag-green-bg, rgba(16, 185, 129, 0.15))',
    text: 'var(--tag-green-text, #10b981)',
    border: 'var(--tag-green-border, rgba(16, 185, 129, 0.45))',
  },
  {
    name: 'yellow',
    bg: 'var(--tag-yellow-bg, rgba(245, 158, 11, 0.15))',
    text: 'var(--tag-yellow-text, #f59e0b)',
    border: 'var(--tag-yellow-border, rgba(245, 158, 11, 0.45))',
  },
  {
    name: 'red',
    bg: 'var(--tag-red-bg, rgba(244, 63, 94, 0.15))',
    text: 'var(--tag-red-text, #f43f5e)',
    border: 'var(--tag-red-border, rgba(244, 63, 94, 0.45))',
  },
  {
    name: 'purple',
    bg: 'var(--tag-purple-bg, rgba(168, 85, 247, 0.15))',
    text: 'var(--tag-purple-text, #a855f7)',
    border: 'var(--tag-purple-border, rgba(168, 85, 247, 0.45))',
  },
  {
    name: 'pink',
    bg: 'var(--tag-pink-bg, rgba(236, 72, 153, 0.15))',
    text: 'var(--tag-pink-text, #f472b6)',
    border: 'var(--tag-pink-border, rgba(236, 72, 153, 0.45))',
  },
  {
    name: 'orange',
    bg: 'var(--tag-orange-bg, rgba(249, 115, 22, 0.15))',
    text: 'var(--tag-orange-text, #f97316)',
    border: 'var(--tag-orange-border, rgba(249, 115, 22, 0.45))',
  },
  {
    name: 'teal',
    bg: 'var(--tag-teal-bg, rgba(20, 184, 166, 0.15))',
    text: 'var(--tag-teal-text, #14b8a6)',
    border: 'var(--tag-teal-border, rgba(20, 184, 166, 0.45))',
  },
  {
    name: 'indigo',
    bg: 'var(--tag-indigo-bg, rgba(99, 102, 241, 0.15))',
    text: 'var(--tag-indigo-text, #818cf8)',
    border: 'var(--tag-indigo-border, rgba(99, 102, 241, 0.45))',
  },
];

export function getTagColor(tag: string): NotionTagColor {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return NOTION_COLORS[Math.abs(hash) % NOTION_COLORS.length];
}

export function parseMultiValue(val: any): string[] {
  const formatItem = (x: any): string => {
    if (x === null || x === undefined) return '';
    if (typeof x === 'object') {
      if (x.conditionId) {
        const flag = x.setValue !== undefined ? (x.setValue ? 'TRUE' : 'FALSE') : (x.expectedValue ? 'TRUE' : 'FALSE');
        return `${x.conditionId}: ${flag}`;
      }
      if (x.tag) return String(x.tag);
      if (x.name) return String(x.name);
      if (x.label) return String(x.label);
      if (x.id) return String(x.id);
      return JSON.stringify(x);
    }
    return String(x).trim();
  };

  if (Array.isArray(val)) return val.map(formatItem).filter(Boolean);
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map(formatItem).filter(Boolean);
      } catch {}
    }
    return trimmed.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}
