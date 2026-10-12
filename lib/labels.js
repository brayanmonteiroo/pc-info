/**
 * Mark string for xgettext without translating at runtime.
 * Call sites wrap with gettext `_()` when displaying.
 * @param {string} s
 * @returns {string}
 */
export function N_(s) {
  return s;
}

/** Friendly labels and panel presentation (English msgids). */
export const METRIC_DEFS = [
  {
    id: "cpuUsage",
    key: "show-cpu-usage",
    title: N_("CPU usage"),
    subtitle: N_("Processor usage percentage"),
    icon: "computer-symbolic",
    technical: "/proc/stat"
  },
  {
    id: "cpuTemp",
    key: "show-cpu-temp",
    title: N_("CPU temperature"),
    subtitle: N_("Processor temperature"),
    icon: "temperature-symbolic",
    technical: null
  },
  {
    id: "gpuUsage",
    key: "show-gpu-usage",
    title: N_("GPU usage"),
    subtitle: N_("Graphics card usage percentage"),
    icon: "video-display-symbolic",
    technical: null
  },
  {
    id: "gpuTemp",
    key: "show-gpu-temp",
    title: N_("GPU temperature"),
    subtitle: N_("Graphics card temperature"),
    icon: "temperature-symbolic",
    technical: null
  },
  {
    id: "memory",
    key: "show-memory",
    title: N_("Memory usage"),
    subtitle: N_("Memory usage percentage"),
    icon: "drive-harddisk-solidstate-symbolic",
    technical: "/proc/meminfo (MemAvailable)"
  },
  {
    id: "network",
    key: "show-network",
    title: N_("Network speed"),
    subtitle: N_("Live download and upload rates"),
    icon: "network-workgroup-symbolic",
    technical: "/proc/net/dev"
  },
  {
    id: "diskSpace",
    key: "show-disk-space",
    title: N_("Disk space"),
    subtitle: N_("Used space on the main disk"),
    icon: "drive-harddisk-symbolic",
    technical: N_("root filesystem (/)")
  },
  {
    id: "swap",
    key: "show-swap",
    title: N_("Virtual memory usage"),
    subtitle: N_("Virtual memory (swap) usage percentage"),
    icon: "media-flash-symbolic",
    technical: "/proc/meminfo (Swap)"
  },
  {
    id: "cpuFreq",
    key: "show-cpu-freq",
    title: N_("CPU frequency"),
    subtitle: N_("Current processor frequency"),
    icon: "preferences-system-time-symbolic",
    technical: "cpufreq (scaling_cur_freq)"
  },
  {
    id: "diskActivity",
    key: "show-disk-activity",
    title: N_("Disk activity"),
    subtitle: N_("Disk read and write rates"),
    icon: "drive-harddisk-symbolic",
    technical: "/proc/diskstats"
  }
];

export const UNAVAILABLE_SUBTITLE = N_("Not available on this computer");

const SOURCE_FMT = N_("Source: %s");

/**
 * @param {string} id
 * @returns {(typeof METRIC_DEFS)[number]|undefined}
 */
export function getMetricDef(id) {
  return METRIC_DEFS.find(metric => metric.id === id);
}

/**
 * Tooltip: friendly first, technical last (for curious users).
 * @param {object} options
 * @param {string} options.title Already-translated title
 * @param {string} options.subtitle Already-translated subtitle
 * @param {string} [options.value]
 * @param {string|null} [options.technical] Already-translated when user-facing
 * @param {(s: string) => string} [gettext] Translator (defaults to identity)
 * @returns {string}
 */
export function buildTooltip({
  title,
  subtitle,
  value = null,
  technical = null,
  gettext = s => s
}) {
  const lines = [title];
  if (value) lines.push(value);
  lines.push("");
  lines.push(subtitle);
  if (technical) {
    lines.push("");
    lines.push(gettext(SOURCE_FMT).format(technical));
  }
  return lines.join("\n");
}
