import {CpuUsageCollector} from "./cpu.js";
import {isCpuFrequencyAvailable} from "./cpuFreq.js";
import {
  DiskActivityCollector,
  isDiskSpaceAvailable
} from "./disk.js";
import {GpuUsageCollector} from "./gpu.js";
import {sampleMemoryUsage, isSwapAvailable} from "./memory.js";
import {NetworkCollector} from "./network.js";
import {
  isCpuTemperatureAvailable,
  isGpuTemperatureAvailable
} from "./temperature.js";

/**
 * Probe which metrics can be read on this machine.
 * Safe for prefs.js (no Shell / GTK imports in dependencies).
 * @returns {Record<string, boolean>}
 */
export function probeAvailability() {
  const cpu = new CpuUsageCollector();
  cpu.sample();
  const cpuUsage = cpu.sample() !== null;

  const gpu = new GpuUsageCollector();
  const network = new NetworkCollector();
  const diskActivity = new DiskActivityCollector();

  return {
    cpuUsage,
    cpuTemp: isCpuTemperatureAvailable(),
    gpuUsage: gpu.isAvailable(),
    gpuTemp: isGpuTemperatureAvailable(),
    memory: sampleMemoryUsage() !== null,
    network: network.isAvailable(),
    diskSpace: isDiskSpaceAvailable(),
    swap: isSwapAvailable(),
    cpuFreq: isCpuFrequencyAvailable(),
    diskActivity: diskActivity.isAvailable()
  };
}
