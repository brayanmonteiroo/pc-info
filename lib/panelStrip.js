import GObject from "gi://GObject";
import St from "gi://St";
import Clutter from "gi://Clutter";

import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";

import {CpuUsageCollector} from "./cpu.js";
import {sampleCpuFrequency} from "./cpuFreq.js";
import {
  DiskActivityCollector,
  sampleDiskSpace
} from "./disk.js";
import {
  formatDiskActivity,
  formatFrequency,
  formatNetwork,
  formatPercent,
  formatTemp
} from "./format.js";
import {GpuUsageCollector} from "./gpu.js";
import {buildTooltip, METRIC_DEFS} from "./labels.js";
import {sampleMemoryUsage, sampleSwapUsage} from "./memory.js";
import {NetworkCollector} from "./network.js";
import {
  readCpuTemperature,
  readGpuTemperature
} from "./temperature.js";
import {HoverTooltip} from "./tooltip.js";

const STYLE_BY_ID = {
  cpuUsage: "pc-info-cpu pc-info-fixed",
  cpuTemp: "pc-info-temp pc-info-fixed",
  gpuUsage: "pc-info-gpu pc-info-fixed",
  gpuTemp: "pc-info-gpu-temp pc-info-fixed",
  memory: "pc-info-ram pc-info-fixed",
  network: "pc-info-net",
  diskSpace: "pc-info-disk pc-info-fixed",
  swap: "pc-info-swap pc-info-fixed",
  cpuFreq: "pc-info-freq pc-info-fixed",
  diskActivity: "pc-info-disk-act"
};

const METRICS = [
  {
    id: "cpuUsage",
    sample: ctx => ({
      text: formatPercent(ctx.cpu.sample()),
      technical: "/proc/stat"
    })
  },
  {
    id: "cpuTemp",
    sample: () => {
      const reading = readCpuTemperature();
      return {
        text: formatTemp(reading?.celsius ?? null),
        technical: reading?.source ?? null
      };
    }
  },
  {
    id: "gpuUsage",
    sample: ctx => ({
      text: formatPercent(ctx.gpu.sample()),
      technical: ctx.gpu.sourceLabel()
    })
  },
  {
    id: "gpuTemp",
    sample: () => {
      const reading = readGpuTemperature();
      return {
        text: formatTemp(reading?.celsius ?? null),
        technical: reading?.source ?? null
      };
    }
  },
  {
    id: "memory",
    sample: () => ({
      text: formatPercent(sampleMemoryUsage()),
      technical: "/proc/meminfo (MemAvailable)"
    })
  },
  {
    id: "network",
    sample: ctx => ({
      text: formatNetwork(ctx.network.sample()),
      technical: "/proc/net/dev"
    })
  },
  {
    id: "diskSpace",
    sample: () => ({
      text: formatPercent(sampleDiskSpace()),
      technical: "sistema de arquivos /"
    })
  },
  {
    id: "swap",
    sample: () => ({
      text: formatPercent(sampleSwapUsage()),
      technical: "/proc/meminfo (Swap)"
    })
  },
  {
    id: "cpuFreq",
    sample: () => ({
      text: formatFrequency(sampleCpuFrequency()),
      technical: "cpufreq (scaling_cur_freq)"
    })
  },
  {
    id: "diskActivity",
    sample: ctx => ({
      text: formatDiskActivity(ctx.diskActivity.sample()),
      technical: "/proc/diskstats"
    })
  }
];

export const PanelStrip = GObject.registerClass(
  class PanelStrip extends PanelMenu.Button {
    /**
     * @param {string} name
     * @param {import('gi://Gio').Settings} settings
     */
    _init(name, settings) {
      super._init(0.0, name, true);

      this._settings = settings;
      this._cpu = new CpuUsageCollector();
      this._gpu = new GpuUsageCollector();
      this._network = new NetworkCollector();
      this._diskActivity = new DiskActivityCollector();
      this._cells = new Map();
      this._settingsIds = [];
      this._defs = new Map(METRIC_DEFS.map(def => [def.id, def]));
      this._lastReading = new Map();

      this._box = new St.BoxLayout({
        style_class: "pc-info-box",
        x_expand: true,
        y_align: Clutter.ActorAlign.CENTER
      });
      this.add_child(this._box);

      // Host must receive motion; child hover is unreliable in PanelMenu.Button.
      this.reactive = true;
      this.track_hover = true;
      this._tooltip = new HoverTooltip(this);

      for (const metric of METRICS) this._createCell(metric);

      this._settingsIds.push(
        this._settings.connect("changed", () => this._syncVisibility())
      );
      this._syncVisibility();
      this.update();
    }

    /**
     * @param {(typeof METRICS)[number]} metric
     */
    _createCell(metric) {
      const def = this._defs.get(metric.id);

      const cell = new St.BoxLayout({
        style_class: "pc-info-cell",
        y_align: Clutter.ActorAlign.CENTER,
        reactive: true,
        track_hover: true
      });

      const icon = new St.Icon({
        icon_name: def.icon,
        style_class: "system-status-icon pc-info-icon",
        icon_size: 14
      });

      const label = new St.Label({
        text: "--",
        style_class: `pc-info-value ${STYLE_BY_ID[metric.id]}`,
        y_align: Clutter.ActorAlign.CENTER
      });

      cell.add_child(icon);
      cell.add_child(label);
      this._box.add_child(cell);

      this._tooltip.addTarget(cell, () => {
        const reading = this._lastReading.get(metric.id);
        return buildTooltip({
          title: def.title,
          subtitle: def.subtitle,
          value: reading?.text ?? label.text,
          technical: reading?.technical ?? def.technical
        });
      });

      this._cells.set(metric.id, {cell, label, metric, def});
    }

    _syncVisibility() {
      for (const {cell, def} of this._cells.values())
        cell.visible = this._settings.get_boolean(def.key);
    }

    update() {
      const ctx = {
        cpu: this._cpu,
        gpu: this._gpu,
        network: this._network,
        diskActivity: this._diskActivity
      };

      for (const {label, metric, cell} of this._cells.values()) {
        if (!cell.visible) continue;

        const reading = metric.sample(ctx);
        label.text = reading.text;
        this._lastReading.set(metric.id, reading);
      }
    }

    destroy() {
      for (const id of this._settingsIds)
        this._settings.disconnect(id);
      this._settingsIds = [];

      if (this._tooltip) {
        this._tooltip.destroy();
        this._tooltip = null;
      }

      this._cpu.reset();
      this._gpu.reset();
      this._network.reset();
      this._diskActivity.reset();

      super.destroy();
    }
  }
);
