import GLib from "gi://GLib";

import {
  globDirectories,
  listNames,
  readFile,
  readNumber
} from "./fileUtils.js";
import {sampleGpuTemperature} from "./temperature.js";

/**
 * @returns {string|null}
 */
function findGpuBusyPath() {
  for (const card of globDirectories("/sys/class/drm/card*")) {
    const base = GLib.path_get_basename(card);
    if (base.includes("-")) continue;

    const busy = GLib.build_filenamev([card, "device", "gpu_busy_percent"]);
    if (readFile(busy) !== null) return busy;
  }

  // NVIDIA proprietary sometimes exposes utilization via hwmon-less paths
  for (const card of globDirectories("/sys/class/drm/card*")) {
    const base = GLib.path_get_basename(card);
    if (base.includes("-")) continue;

    const device = GLib.build_filenamev([card, "device"]);
    for (const name of listNames(device)) {
      if (name === "gpu_busy_percent" || name.endsWith("_busy_percent")) {
        const path = GLib.build_filenamev([device, name]);
        if (readFile(path) !== null) return path;
      }
    }
  }

  return null;
}

export class GpuUsageCollector {
  constructor() {
    this._path = null;
    this._resolved = false;
  }

  _ensurePath() {
    if (!this._resolved) {
      this._path = findGpuBusyPath();
      this._resolved = true;
    }
    return this._path;
  }

  /**
   * @returns {number|null}
   */
  sample() {
    const path = this._ensurePath();
    if (path === null) return null;

    const value = readNumber(path);
    if (value === null) return null;
    return Math.min(100, Math.max(0, value));
  }

  /**
   * @returns {boolean}
   */
  isAvailable() {
    return this._ensurePath() !== null;
  }

  reset() {
    this._path = null;
    this._resolved = false;
  }
}

export {sampleGpuTemperature};
