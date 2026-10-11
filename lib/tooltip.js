import GLib from "gi://GLib";
import St from "gi://St";

import * as Main from "resource:///org/gnome/shell/ui/main.js";

const SHOW_DELAY_MS = 350;

/**
 * Floating panel tooltip — St.tooltip_text is unreliable on panel actors.
 */
export class HoverTooltip {
  constructor() {
    this._label = new St.Label({
      style_class: "pc-info-tooltip",
      reactive: false
    });
    this._label.hide();
    Main.layoutManager.addTopChrome(this._label);

    this._timeoutId = 0;
    this._actor = null;
    this._getText = null;
    this._connections = [];
  }

  /**
   * @param {Clutter.Actor} actor
   * @param {() => string} getText
   */
  attach(actor, getText) {
    actor.reactive = true;
    actor.track_hover = true;

    const hoverId = actor.connect("notify::hover", () => {
      if (actor.hover) this._scheduleShow(actor, getText);
      else this._hide();
    });

    this._connections.push({actor, id: hoverId});
  }

  /**
   * @param {Clutter.Actor} actor
   * @param {() => string} getText
   */
  _scheduleShow(actor, getText) {
    this._clearTimeout();
    this._actor = actor;
    this._getText = getText;

    this._timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, SHOW_DELAY_MS, () => {
      this._timeoutId = 0;
      if (this._actor?.hover) this._show();
      return GLib.SOURCE_REMOVE;
    });
  }

  _show() {
    if (!this._actor || !this._getText) return;

    const text = this._getText();
    if (!text) return;

    this._label.set_text(text);
    this._label.clutter_text.set_line_wrap(true);
    this._label.opacity = 255;
    this._label.show();

    const [x, y] = this._actor.get_transformed_position();
    const [, natWidth] = this._label.get_preferred_width(-1);
    const [, natHeight] = this._label.get_preferred_height(-1);
    const actorWidth = this._actor.width;

    let tipX = x + actorWidth / 2 - natWidth / 2;
    let tipY = y + this._actor.height + 6;

    const monitor = Main.layoutManager.findMonitorForActor(this._actor);
    if (monitor) {
      tipX = Math.max(
        monitor.x + 6,
        Math.min(tipX, monitor.x + monitor.width - natWidth - 6)
      );
      if (tipY + natHeight > monitor.y + monitor.height - 6)
        tipY = y - natHeight - 6;
    }

    this._label.set_position(Math.round(tipX), Math.round(tipY));
  }

  _hide() {
    this._clearTimeout();
    this._label.hide();
    this._actor = null;
    this._getText = null;
  }

  _clearTimeout() {
    if (this._timeoutId) {
      GLib.Source.remove(this._timeoutId);
      this._timeoutId = 0;
    }
  }

  destroy() {
    this._hide();
    for (const {actor, id} of this._connections) actor.disconnect(id);
    this._connections = [];

    Main.layoutManager.removeChrome(this._label);
    this._label.destroy();
  }
}
