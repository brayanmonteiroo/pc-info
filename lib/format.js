/**
 * @param {number|null} value
 * @returns {string}
 */
export function formatPercent(value) {
  if (value === null || !Number.isFinite(value)) return "--";
  return `${Math.round(value)}%`;
}

/**
 * @param {number|null} celsius
 * @returns {string}
 */
export function formatTemp(celsius) {
  if (celsius === null || !Number.isFinite(celsius)) return "--";
  return `${Math.round(celsius)}°`;
}

/**
 * Compact rate with stable width (monospace-friendly), e.g. "  0", "1.2K", " 12M".
 * @param {number} bytesPerSecond
 * @returns {string}
 */
export function formatRate(bytesPerSecond) {
  if (!Number.isFinite(bytesPerSecond) || bytesPerSecond < 0)
    return "  0".padStart(4, " ");

  let value = bytesPerSecond;
  let unit = "";

  if (value >= 1e9) {
    value /= 1e9;
    unit = "G";
  } else if (value >= 1e6) {
    value /= 1e6;
    unit = "M";
  } else if (value >= 1e3) {
    value /= 1e3;
    unit = "K";
  }

  let text;
  if (unit === "") text = `${Math.round(value)}`;
  else if (value >= 100) text = `${Math.round(value)}${unit}`;
  else if (value >= 10) text = `${Math.round(value)}${unit}`;
  else text = `${value.toFixed(1)}${unit}`;

  // Keep a fixed field so "0" → "1.2M" does not shove neighbors.
  return text.padStart(4, " ");
}

/**
 * @param {{down: number, up: number}|null} rates
 * @returns {string}
 */
export function formatNetwork(rates) {
  if (rates === null) return "  --↓   --↑";
  return `${formatRate(rates.down)}↓${formatRate(rates.up)}↑`;
}

/**
 * @param {{read: number, write: number}|null} rates
 * @returns {string}
 */
export function formatDiskActivity(rates) {
  if (rates === null) return "  --↓   --↑";
  return `${formatRate(rates.read)}↓${formatRate(rates.write)}↑`;
}

/**
 * @param {number|null} mhz
 * @returns {string}
 */
export function formatFrequency(mhz) {
  if (mhz === null || !Number.isFinite(mhz)) return "--";
  if (mhz >= 1000) return `${(mhz / 1000).toFixed(1)}G`;
  return `${Math.round(mhz)}M`;
}
