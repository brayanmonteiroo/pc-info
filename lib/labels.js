/** Friendly labels and panel presentation (Portuguese). */
export const METRIC_DEFS = [
  {
    id: "cpuUsage",
    key: "show-cpu-usage",
    title: "Uso da CPU",
    subtitle: "Porcentagem de uso do processador",
    icon: "emblem-system-symbolic",
    technical: "/proc/stat"
  },
  {
    id: "cpuTemp",
    key: "show-cpu-temp",
    title: "Temperatura da CPU",
    subtitle: "Temperatura do processador",
    icon: "temperature-symbolic",
    technical: null
  },
  {
    id: "gpuUsage",
    key: "show-gpu-usage",
    title: "Uso da placa de vídeo",
    subtitle: "Porcentagem de uso da placa de vídeo",
    icon: "applications-graphics-symbolic",
    technical: null
  },
  {
    id: "gpuTemp",
    key: "show-gpu-temp",
    title: "Temperatura da placa de vídeo",
    subtitle: "Temperatura da placa de vídeo",
    icon: "video-display-symbolic",
    technical: null
  },
  {
    id: "memory",
    key: "show-memory",
    title: "Uso da memória",
    subtitle: "Porcentagem de memória em uso",
    icon: "drive-harddisk-solidstate-symbolic",
    technical: "/proc/meminfo (MemAvailable)"
  },
  {
    id: "network",
    key: "show-network",
    title: "Velocidade da rede",
    subtitle: "Download e upload em tempo real",
    icon: "network-transmit-receive-symbolic",
    technical: "/proc/net/dev"
  },
  {
    id: "diskSpace",
    key: "show-disk-space",
    title: "Espaço do disco",
    subtitle: "Espaço usado no disco principal",
    icon: "drive-harddisk-symbolic",
    technical: "sistema de arquivos /"
  },
  {
    id: "swap",
    key: "show-swap",
    title: "Uso da memória virtual",
    subtitle: "Porcentagem de memória virtual (swap) em uso",
    icon: "media-flash-symbolic",
    technical: "/proc/meminfo (Swap)"
  },
  {
    id: "cpuFreq",
    key: "show-cpu-freq",
    title: "Frequência da CPU",
    subtitle: "Frequência atual do processador",
    icon: "preferences-system-time-symbolic",
    technical: "cpufreq (scaling_cur_freq)"
  },
  {
    id: "diskActivity",
    key: "show-disk-activity",
    title: "Atividade do disco",
    subtitle: "Leitura e escrita do disco",
    icon: "system-run-symbolic",
    technical: "/proc/diskstats"
  }
];

export const UNAVAILABLE_SUBTITLE = "Não disponível neste computador";

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
 * @param {string} options.title
 * @param {string} options.subtitle
 * @param {string} [options.value]
 * @param {string|null} [options.technical]
 * @returns {string}
 */
export function buildTooltip({title, subtitle, value = null, technical = null}) {
  const lines = [title];
  if (value) lines.push(value);
  lines.push("");
  lines.push(subtitle);
  if (technical) {
    lines.push("");
    lines.push(`Fonte: ${technical}`);
  }
  return lines.join("\n");
}
