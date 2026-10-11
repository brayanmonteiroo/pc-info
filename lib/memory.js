import {readFile} from "./fileUtils.js";

/**
 * @returns {Map<string, number>}
 */
function parseMeminfo() {
  const text = readFile("/proc/meminfo");
  const map = new Map();
  if (text === null) return map;

  for (const line of text.split("\n")) {
    const match = line.match(/^(\w+):\s+(\d+)/);
    if (match) map.set(match[1], Number(match[2]));
  }
  return map;
}

/**
 * @returns {number|null} Used memory percent
 */
export function sampleMemoryUsage() {
  const info = parseMeminfo();
  const total = info.get("MemTotal");
  const available = info.get("MemAvailable");
  if (!total || available === undefined) return null;

  return Math.min(100, Math.max(0, (1 - available / total) * 100));
}

/**
 * @returns {number|null} Used swap percent, or 0 if no swap
 */
export function sampleSwapUsage() {
  const info = parseMeminfo();
  const total = info.get("SwapTotal");
  const free = info.get("SwapFree");
  if (total === undefined || free === undefined) return null;
  if (total === 0) return 0;

  return Math.min(100, Math.max(0, ((total - free) / total) * 100));
}

/**
 * @returns {boolean}
 */
export function isSwapAvailable() {
  const info = parseMeminfo();
  const total = info.get("SwapTotal");
  return total !== undefined && total > 0;
}
