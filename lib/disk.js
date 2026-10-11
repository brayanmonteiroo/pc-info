import Gio from "gi://Gio";
import GLib from "gi://GLib";

import {readFile} from "./fileUtils.js";

/**
 * Used percent of the root filesystem.
 * @returns {number|null}
 */
export function sampleDiskSpace() {
  try {
    const file = Gio.File.new_for_path("/");
    const info = file.query_filesystem_info("filesystem::*", null);
    const total = info.get_attribute_uint64("filesystem::size");
    const free = info.get_attribute_uint64("filesystem::free");
    if (!total) return null;

    const used = total - free;
    return Math.min(100, Math.max(0, (used / total) * 100));
  } catch {
    return null;
  }
}

/**
 * @returns {boolean}
 */
export function isDiskSpaceAvailable() {
  return sampleDiskSpace() !== null;
}

/**
 * Whole-disk devices only (sda, nvme0n1, vda, MMC) — skip partitions.
 * @param {string} name
 * @returns {boolean}
 */
function isWholeDisk(name) {
  if (name.startsWith("loop") || name.startsWith("ram") || name.startsWith("dm-"))
    return false;
  if (/^nvme\d+n\d+$/.test(name)) return true;
  if (/^mmcblk\d+$/.test(name)) return true;
  if (/^(sd|vd|hd)[a-z]+$/.test(name)) return true;
  return false;
}

/**
 * @returns {{readSectors: number, writeSectors: number}|null}
 */
function readDiskTotals() {
  const text = readFile("/proc/diskstats");
  if (text === null) return null;

  let readSectors = 0;
  let writeSectors = 0;
  let found = false;

  for (const line of text.split("\n")) {
    const fields = line.trim().split(/\s+/);
    if (fields.length < 14) continue;

    const name = fields[2];
    if (!isWholeDisk(name)) continue;

    const reads = Number(fields[5]);
    const writes = Number(fields[9]);
    if (!Number.isFinite(reads) || !Number.isFinite(writes)) continue;

    readSectors += reads;
    writeSectors += writes;
    found = true;
  }

  return found ? {readSectors, writeSectors} : null;
}

export class DiskActivityCollector {
  constructor() {
    this._previous = null;
    this._previousAt = 0;
  }

  /**
   * @returns {{read: number, write: number}|null} Bytes per second
   */
  sample() {
    const totals = readDiskTotals();
    const now = GLib.get_monotonic_time();
    if (totals === null) return null;

    const previous = this._previous;
    const previousAt = this._previousAt;
    this._previous = totals;
    this._previousAt = now;

    if (!previous || previousAt === 0) return null;

    const elapsed = (now - previousAt) / 1e6;
    if (elapsed <= 0) return null;

    const sectorSize = 512;
    return {
      read: Math.max(
        0,
        ((totals.readSectors - previous.readSectors) * sectorSize) / elapsed
      ),
      write: Math.max(
        0,
        ((totals.writeSectors - previous.writeSectors) * sectorSize) / elapsed
      )
    };
  }

  /**
   * @returns {boolean}
   */
  isAvailable() {
    return readDiskTotals() !== null;
  }

  reset() {
    this._previous = null;
    this._previousAt = 0;
  }
}
