import GLib from "gi://GLib";

import {readFile} from "./fileUtils.js";

const IGNORED_IFACES = new Set(["lo", "docker0", "virbr0"]);

/**
 * @returns {{rx: number, tx: number}|null}
 */
function readTotals() {
  const text = readFile("/proc/net/dev");
  if (text === null) return null;

  let rx = 0;
  let tx = 0;
  let found = false;

  for (const line of text.split("\n").slice(2)) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const colon = trimmed.indexOf(":");
    if (colon < 0) continue;

    const iface = trimmed.slice(0, colon).trim();
    if (
      IGNORED_IFACES.has(iface) ||
      iface.startsWith("veth") ||
      iface.startsWith("br-")
    )
      continue;

    const fields = trimmed.slice(colon + 1).trim().split(/\s+/);
    if (fields.length < 9) continue;

    const rxBytes = Number(fields[0]);
    const txBytes = Number(fields[8]);
    if (!Number.isFinite(rxBytes) || !Number.isFinite(txBytes)) continue;

    rx += rxBytes;
    tx += txBytes;
    found = true;
  }

  return found ? {rx, tx} : null;
}

export class NetworkCollector {
  constructor() {
    this._previous = null;
    this._previousAt = 0;
  }

  /**
   * @returns {{down: number, up: number}|null} Bytes per second
   */
  sample() {
    const totals = readTotals();
    const now = GLib.get_monotonic_time();
    if (totals === null) return null;

    const previous = this._previous;
    const previousAt = this._previousAt;
    this._previous = totals;
    this._previousAt = now;

    if (!previous || previousAt === 0) return null;

    const elapsed = (now - previousAt) / 1e6;
    if (elapsed <= 0) return null;

    return {
      down: Math.max(0, (totals.rx - previous.rx) / elapsed),
      up: Math.max(0, (totals.tx - previous.tx) / elapsed)
    };
  }

  /**
   * @returns {boolean}
   */
  isAvailable() {
    return readTotals() !== null;
  }

  reset() {
    this._previous = null;
    this._previousAt = 0;
  }
}
