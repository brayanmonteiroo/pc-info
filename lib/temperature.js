import GLib from "gi://GLib";

import {
  globDirectories,
  listNames,
  readFile,
  readNumber
} from "./fileUtils.js";

const CPU_HWMON_NAMES = new Set([
  "k10temp",
  "coretemp",
  "zenpower",
  "cpu_thermal",
  "acpitz",
  "soc_thermal"
]);

const GPU_HWMON_NAMES = new Set([
  "amdgpu",
  "nouveau",
  "nvidia",
  "i915",
  "xe",
  "radeon"
]);

/**
 * @param {string} hwmonPath
 * @returns {{name: string, inputs: {path: string, label: string|null, value: number}[]}|null}
 */
function readHwmon(hwmonPath) {
  const name = readFile(GLib.build_filenamev([hwmonPath, "name"]));
  if (name === null) return null;

  const inputs = [];
  for (const entry of listNames(hwmonPath)) {
    const match = entry.match(/^(temp\d+)_input$/);
    if (!match) continue;

    const base = match[1];
    const value = readNumber(GLib.build_filenamev([hwmonPath, entry]));
    if (value === null) continue;

    const label = readFile(GLib.build_filenamev([hwmonPath, `${base}_label`]));
    inputs.push({path: entry, label, value});
  }

  if (inputs.length === 0) return null;
  return {name, inputs};
}

/**
 * Prefer Tctl / Package / Tdie style labels for CPU.
 * @param {{label: string|null, value: number}[]} inputs
 * @returns {number}
 */
function pickCpuTemp(inputs) {
  const preferred = inputs.find(item => {
    if (!item.label) return false;
    const label = item.label.toLowerCase();
    return (
      label.includes("tctl") ||
      label.includes("package") ||
      label.includes("tdie") ||
      label === "cpu"
    );
  });
  return (preferred ?? inputs[0]).value / 1000;
}

/**
 * Prefer edge / junction for GPU.
 * @param {{label: string|null, value: number}[]} inputs
 * @returns {number}
 */
function pickGpuTemp(inputs) {
  const preferred = inputs.find(item => {
    if (!item.label) return false;
    const label = item.label.toLowerCase();
    return label.includes("edge") || label.includes("junction");
  });
  return (preferred ?? inputs[0]).value / 1000;
}

/**
 * @returns {number|null} Celsius
 */
export function sampleCpuTemperature() {
  const dirs = globDirectories("/sys/class/hwmon/hwmon*");
  let fallback = null;

  for (const dir of dirs) {
    const hwmon = readHwmon(dir);
    if (!hwmon) continue;

    if (CPU_HWMON_NAMES.has(hwmon.name))
      return pickCpuTemp(hwmon.inputs);

    if (fallback === null && hwmon.name !== "nvme" && !GPU_HWMON_NAMES.has(hwmon.name))
      fallback = pickCpuTemp(hwmon.inputs);
  }

  return fallback;
}

/**
 * @returns {number|null} Celsius
 */
export function sampleGpuTemperature() {
  const dirs = globDirectories("/sys/class/hwmon/hwmon*");

  for (const dir of dirs) {
    const hwmon = readHwmon(dir);
    if (!hwmon) continue;
    if (GPU_HWMON_NAMES.has(hwmon.name)) return pickGpuTemp(hwmon.inputs);
  }

  return null;
}

/**
 * @returns {boolean}
 */
export function isCpuTemperatureAvailable() {
  return sampleCpuTemperature() !== null;
}

/**
 * @returns {boolean}
 */
export function isGpuTemperatureAvailable() {
  return sampleGpuTemperature() !== null;
}
