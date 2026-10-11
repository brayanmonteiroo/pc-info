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
 * @param {{label: string|null, value: number}[]} inputs
 * @param {string[]} preferences
 * @returns {{label: string|null, value: number}}
 */
function pickTempInput(inputs, preferences) {
  const preferred = inputs.find(item => {
    if (!item.label) return false;
    const label = item.label.toLowerCase();
    return preferences.some(part => label.includes(part));
  });
  return preferred ?? inputs[0];
}

/**
 * @param {string} hwmonName
 * @param {{label: string|null, value: number}} input
 * @returns {string}
 */
function formatSource(hwmonName, input) {
  if (input.label) return `${hwmonName} · ${input.label}`;
  return hwmonName;
}

/**
 * @returns {{celsius: number, source: string}|null}
 */
export function readCpuTemperature() {
  const dirs = globDirectories("/sys/class/hwmon/hwmon*");
  let fallback = null;

  for (const dir of dirs) {
    const hwmon = readHwmon(dir);
    if (!hwmon) continue;

    const input = pickTempInput(hwmon.inputs, [
      "tctl",
      "package",
      "tdie",
      "cpu"
    ]);
    const reading = {
      celsius: input.value / 1000,
      source: formatSource(hwmon.name, input)
    };

    if (CPU_HWMON_NAMES.has(hwmon.name)) return reading;

    if (
      fallback === null &&
      hwmon.name !== "nvme" &&
      !GPU_HWMON_NAMES.has(hwmon.name)
    )
      fallback = reading;
  }

  return fallback;
}

/**
 * @returns {{celsius: number, source: string}|null}
 */
export function readGpuTemperature() {
  const dirs = globDirectories("/sys/class/hwmon/hwmon*");

  for (const dir of dirs) {
    const hwmon = readHwmon(dir);
    if (!hwmon) continue;
    if (!GPU_HWMON_NAMES.has(hwmon.name)) continue;

    const input = pickTempInput(hwmon.inputs, ["edge", "junction"]);
    return {
      celsius: input.value / 1000,
      source: formatSource(hwmon.name, input)
    };
  }

  return null;
}

/**
 * @returns {number|null}
 */
export function sampleCpuTemperature() {
  return readCpuTemperature()?.celsius ?? null;
}

/**
 * @returns {number|null}
 */
export function sampleGpuTemperature() {
  return readGpuTemperature()?.celsius ?? null;
}

/**
 * @returns {boolean}
 */
export function isCpuTemperatureAvailable() {
  return readCpuTemperature() !== null;
}

/**
 * @returns {boolean}
 */
export function isGpuTemperatureAvailable() {
  return readGpuTemperature() !== null;
}
