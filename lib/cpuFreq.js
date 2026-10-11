import GLib from "gi://GLib";

import {
  globDirectories,
  listDirectoryNames,
  readNumber
} from "./fileUtils.js";

/**
 * Average current frequency across online CPUs, in MHz.
 * @returns {number|null}
 */
export function sampleCpuFrequency() {
  const cpuDirs = listDirectoryNames("/sys/devices/system/cpu").filter(name =>
    /^cpu\d+$/.test(name)
  );

  if (cpuDirs.length === 0) return null;

  let sum = 0;
  let count = 0;

  for (const cpu of cpuDirs) {
    const base = GLib.build_filenamev(["/sys/devices/system/cpu", cpu]);
    const khz =
      readNumber(GLib.build_filenamev([base, "cpufreq", "scaling_cur_freq"])) ??
      readNumber(GLib.build_filenamev([base, "cpufreq", "cpuinfo_cur_freq"]));

    if (khz === null) continue;
    sum += khz / 1000;
    count += 1;
  }

  if (count === 0) {
    // Fallback: some systems expose freq via hwmon/cpufreq elsewhere
    for (const dir of globDirectories("/sys/devices/system/cpu/cpufreq/policy*")) {
      const khz =
        readNumber(GLib.build_filenamev([dir, "scaling_cur_freq"])) ??
        readNumber(GLib.build_filenamev([dir, "cpuinfo_cur_freq"]));
      if (khz === null) continue;
      sum += khz / 1000;
      count += 1;
    }
  }

  if (count === 0) return null;
  return sum / count;
}

/**
 * @returns {boolean}
 */
export function isCpuFrequencyAvailable() {
  return sampleCpuFrequency() !== null;
}
