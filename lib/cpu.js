import {readFile} from "./fileUtils.js";

export class CpuUsageCollector {
  constructor() {
    this._previous = null;
  }

  /**
   * @returns {number|null} Usage percent 0–100
   */
  sample() {
    const text = readFile("/proc/stat");
    if (text === null) return null;

    const line = text.split("\n").find(entry => entry.startsWith("cpu "));
    if (!line) return null;

    const parts = line.trim().split(/\s+/).slice(1).map(Number);
    if (parts.length < 4 || parts.some(n => !Number.isFinite(n))) return null;

    const idle = parts[3] + (parts[4] || 0);
    const total = parts.reduce((sum, value) => sum + value, 0);
    const previous = this._previous;
    this._previous = {idle, total};

    if (!previous) return null;

    const totalDelta = total - previous.total;
    const idleDelta = idle - previous.idle;
    if (totalDelta <= 0) return null;

    const usage = (1 - idleDelta / totalDelta) * 100;
    return Math.min(100, Math.max(0, usage));
  }

  reset() {
    this._previous = null;
  }
}
