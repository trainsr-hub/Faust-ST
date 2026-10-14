/**
 * hexId.ts
 * Generates collision-free hex-encoded timestamp keys for Hazard Trigger components.
 */

let lastTimestamp = 0;
let counter = 0;

export function generateHexId(prefix?: string): string {
  const now = Date.now();
  if (now === lastTimestamp) {
    counter++;
  } else {
    lastTimestamp = now;
    counter = 0;
  }

  const hexTime = counter === 0 ? now.toString(16) : `${now.toString(16)}_${counter}`;
  return prefix ? `${prefix}_${hexTime}` : hexTime;
}

export function formatHexDate(hexKey: string): string {
  const cleanHex = hexKey.replace(/^[^_]+_/, '').split('_')[0];
  const timestamp = parseInt(cleanHex, 16);
  if (isNaN(timestamp) || timestamp < 1000000000000) {
    return 'Custom Key';
  }
  return new Date(timestamp).toLocaleString();
}
