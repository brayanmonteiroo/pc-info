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
import {sampleMemoryUsage, sampleSwapUsage} from "./memory.js";
import {NetworkCollector} from "./network.js";
import {
  sampleCpuTemperature,
  sampleGpuTemperature
} from "./temperature.js";

const METRICS = [
  {
    id: "cpuUsage",
    key: "show-cpu-usage",
    icon: "computer-symbolic",
    style: "pc-info-cpu",
    sample: ctx => formatPercent(ctx.cpu.sample())
  },
  {
    id: "cpuTemp",
    key: "show-cpu-temp",
    icon: "temperature-symbolic",
    style: "pc-info-temp",
    sample: () => formatTemp(sampleCpuTemperature())
  },
  {
    id: "gpuUsage",
    key: "show-gpu-usage",
    icon: "video-display-symbolic",
    style: "pc-info-gpu",
    sample: ctx => formatPercent(ctx.gpu.sample())
  },
  {
    id: "gpuTemp",
    key: "show-gpu-temp",
    icon: "temperature-symbolic",
    style: "pc-info-temp",
    sample: () => formatTemp(sampleGpuTemperature())
  },
  {
    id: "memory",
    key: "show-memory",
    icon: "drive-harddisk-solidstate-symbolic",
    style: "pc-info-ram",
    sample: () => formatPercent(sampleMemoryUsage())
  },
  {
    id: "network",
    key: "show-network",
    icon: "network-workgroup-symbolic",
    style: "pc-info-net",
    sample: ctx => formatNetwork(ctx.network.sample())
  },
  {
    id: "diskSpace",
    key: "show-disk-space",
    icon: "drive-harddisk-symbolic",
    style: "pc-info-disk",
    sample: () => formatPercent(sampleDiskSpace())
  },
  {
    id: "swap",
    key: "show-swap",
    icon: "media-flash-symbolic",
    style: "pc-info-swap",
    sample: () => formatPercent(sampleSwapUsage())
  },
  {
    id: "cpuFreq",
    key: "show-cpu-freq",
    icon: "preferences-system-time-symbolic",
    style: "pc-info-freq",
    sample: () => formatFrequency(sampleCpuFrequency())
  },
  {
    id: "diskActivity",
    key: "show-disk-activity",
    icon: "drive-harddisk-symbolic",
    style: "pc-info-disk-act",
    sample: ctx => formatDiskActivity(ctx.diskActivity.sample())
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

      this._box = new St.BoxLayout({
        style_class: "pc-info-box",
        x_expand: true,
        y_align: Clutter.ActorAlign.CENTER
      });
      this.add_child(this._box);

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
      const cell = new St.BoxLayout({
        style_class: "pc-info-cell",
        y_align: Clutter.ActorAlign.CENTER
      });

      const icon = new St.Icon({
        icon_name: metric.icon,
        style_class: "system-status-icon pc-info-icon",
        icon_size: 14
      });

      const label = new St.Label({
        text: "--",
        style_class: `pc-info-value ${metric.style}`,
        y_align: Clutter.ActorAlign.CENTER
      });

      cell.add_child(icon);
      cell.add_child(label);
      this._box.add_child(cell);

      this._cells.set(metric.id, {cell, label, metric});
    }

    _syncVisibility() {
      for (const {cell, metric} of this._cells.values()) {
        const visible = this._settings.get_boolean(metric.key);
        cell.visible = visible;
      }
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
        label.text = metric.sample(ctx);
      }
    }

    destroy() {
      for (const id of this._settingsIds)
        this._settings.disconnect(id);
      this._settingsIds = [];

      this._cpu.reset();
      this._gpu.reset();
      this._network.reset();
      this._diskActivity.reset();

      super.destroy();
    }
  }
);
