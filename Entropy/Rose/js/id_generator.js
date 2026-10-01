/**
 * Entropy Rose: Deterministic Client-Side Hex ID Generator
 * Converts YYYYMMDDHHmmssfff (17-digit decimal timestamp) into a 16-character fixed-width Hex ID.
 * Strictly guarantees O(1) chronological sorting and hash-map lookups in browser JavaScript.
 */

export function generateHexId(date = new Date()) {
  const pad = (n, len = 2) => String(n).padStart(len, '0');

  // Format: YYYYMMDDHHmmssfff (e.g. 20260930153045123)
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const ms = pad(date.getMilliseconds(), 3);

  const timeStr = `${year}${month}${day}${hours}${minutes}${seconds}${ms}`;
  const decimalVal = BigInt(timeStr);
  const hexVal = decimalVal.toString(16).toUpperCase().padStart(16, '0');

  return hexVal;
}

export function parseHexIdToDate(hexId) {
  try {
    const decimalVal = BigInt(`0x${hexId}`).toString();
    if (decimalVal.length < 14) return null;

    const year = parseInt(decimalVal.slice(0, 4), 10);
    const month = parseInt(decimalVal.slice(4, 6), 10) - 1;
    const day = parseInt(decimalVal.slice(6, 8), 10);
    const hours = parseInt(decimalVal.slice(8, 10), 10);
    const minutes = parseInt(decimalVal.slice(10, 12), 10);
    const seconds = parseInt(decimalVal.slice(12, 14), 10);
    const ms = decimalVal.length >= 17 ? parseInt(decimalVal.slice(14, 17), 10) : 0;

    return new Date(year, month, day, hours, minutes, seconds, ms);
  } catch (err) {
    console.error("Failed to parse hex ID to Date:", err);
    return null;
  }
}
