import GLib from "gi://GLib";

import {Extension} from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

import {PanelStrip} from "./lib/panelStrip.js";

const REFRESH_SECONDS = 2;

export default class PcInfoExtension extends Extension {
  enable() {
    this._settings = this.getSettings();
    this._indicator = new PanelStrip(this.metadata.name, this._settings);
    Main.panel.addToStatusArea(this.uuid, this._indicator);

    this._sourceId = GLib.timeout_add_seconds(
      GLib.PRIORITY_DEFAULT,
      REFRESH_SECONDS,
      () => {
        if (this._indicator) this._indicator.update();
        return GLib.SOURCE_CONTINUE;
      }
    );
  }

  disable() {
    if (this._sourceId) {
      GLib.Source.remove(this._sourceId);
      this._sourceId = null;
    }

    this._indicator?.destroy();
    this._indicator = null;
    this._settings = null;
  }
}
