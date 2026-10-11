/** Figure space — same advance as a digit in most UI fonts. */
const FIG = "\u2007";

/**
 * Pad numeric field to 3 digits so "3%" → "10%" → "100%" does not shift the panel.
 * @param {number} n
 * @returns {string}
 */
function pad3(n) {
  return String(n).padStart(3, FIG);
}

/**
 * @param {number|null} value
 * @returns {string}
 */
export function formatPercent(value) {
  if (value === null || !Number.isFinite(value)) return `${FIG}${FIG}-%`;
  if (value > 0 && value < 1) return `${FIG}<1%`;
  return `${pad3(Math.min(100, Math.round(value)))}%`;
}

/**
 * @param {number|null} celsius
 * @returns {string}
 */
export function formatTemp(celsius) {
  if (celsius === null || !Number.isFinite(celsius)) return `${FIG}${FIG}-°`;
  return `${pad3(Math.round(celsius))}°`;
}

/**
 * @param {number} bytesPerSecond
 * @returns {string}
 */
export function formatRate(bytesPerSecond) {
  if (!Number.isFinite(bytesPerSecond) || bytesPerSecond < 0) return "0";

  const units = ["", "K", "M", "G"];
  let value = bytesPerSecond;
  let unit = 0;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit += 1;
  }

  const digits = value >= 100 || unit === 0 ? 0 : 1;
  return `${value.toFixed(digits)}${units[unit]}`;
}

/**
 * @param {{down: number, up: number}|null} rates
 * @returns {string}
 */
export function formatNetwork(rates) {
  if (rates === null) return "--";
  return `${formatRate(rates.down)}↓ ${formatRate(rates.up)}↑`;
}

/**
 * @param {{read: number, write: number}|null} rates
 * @returns {string}
 */
export function formatDiskActivity(rates) {
  if (rates === null) return "--";
  return `${formatRate(rates.read)}↓ ${formatRate(rates.write)}↑`;
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
