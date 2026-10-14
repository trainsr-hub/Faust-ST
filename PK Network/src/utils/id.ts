/**
 * Hex ID Generator
 * Format: <4 prefix char> + <12 hexid converted from milliseconds of time>
 * Example: EVAS01A13B1A193C
 */

let lastTimeMs = 0;

export function generateHexId(prefix?: string, tableName?: string): string {
  // 1. Exactly 4 prefix characters
  const raw = (prefix || tableName || 'DATA').replace(/[^a-zA-Z0-9]/g, '');
  const cleanPrefix = raw.padEnd(4, 'X').slice(0, 4).toUpperCase();

  // 2. Exactly 12 hex characters converted from milliseconds of time
  let now = Date.now();
  if (now <= lastTimeMs) {
    now = lastTimeMs + 1; // Strict monotonicity guarantee
  }
  lastTimeMs = now;

  const hexTime = now.toString(16).padStart(12, '0').slice(-12).toUpperCase();

  return `${cleanPrefix}${hexTime}`;
}
