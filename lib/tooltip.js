import Clutter from "gi://Clutter";
import GLib from "gi://GLib";
import St from "gi://St";

import * as Main from "resource:///org/gnome/shell/ui/main.js";

const SHOW_DELAY_MS = 250;

/**
 * Panel hover tooltip.
 *
 * Child actors inside PanelMenu.Button often never get notify::hover.
 * We listen to motion-event on the host button and hit-test the targets.
 */
export class HoverTooltip {
  /**
   * @param {Clutter.Actor} host Panel button (or container) that receives pointer motion
   */
  constructor(host) {
    this._host = host;
    this._targets = [];
    this._label = new St.Label({
      style_class: "pc-info-tooltip",
      reactive: false
    });
    this._label.hide();
    Main.layoutManager.uiGroup.add_child(this._label);

    this._timeoutId = 0;
    this._active = null;
    this._getText = null;

    this._motionId = host.connect("motion-event", (_actor, event) => {
      this._onMotion(event);
      return Clutter.EVENT_PROPAGATE;
    });
    this._leaveId = host.connect("leave-event", () => {
      this._hide();
      return Clutter.EVENT_PROPAGATE;
    });
  }

  /**
   * @param {Clutter.Actor} actor
   * @param {() => string} getText
   */
  addTarget(actor, getText) {
    actor.reactive = true;
    this._targets.push({actor, getText});
  }

  /**
   * @param {Clutter.Event} event
   */
  _onMotion(event) {
    const [ex, ey] = event.get_coords();
    let hit = null;

    for (const target of this._targets) {
      if (!target.actor.visible) continue;

      const [x, y] = target.actor.get_transformed_position();
      const w = target.actor.width;
      const h = target.actor.height;
      if (ex >= x && ex < x + w && ey >= y && ey < y + h) {
        hit = target;
        break;
      }
    }

    if (!hit) {
      this._hide();
      return;
    }

    if (this._active === hit.actor && this._label.visible) {
      this._getText = hit.getText;
      this._label.set_text(hit.getText());
      this._reposition();
      return;
    }

    this._scheduleShow(hit.actor, hit.getText);
  }

  /**
   * @param {Clutter.Actor} actor
   * @param {() => string} getText
   */
  _scheduleShow(actor, getText) {
    this._clearTimeout();
    this._active = actor;
    this._getText = getText;

    this._timeoutId = GLib.timeout_add(
      GLib.PRIORITY_DEFAULT,
      SHOW_DELAY_MS,
      () => {
        this._timeoutId = 0;
        if (this._active === actor) this._show();
        return GLib.SOURCE_REMOVE;
      }
    );
  }

  _show() {
    if (!this._active || !this._getText) return;

    const text = this._getText();
    if (!text) return;

    this._label.set_text(text);
    this._label.clutter_text.line_wrap = true;
    this._label.show();
    this._reposition();
  }

  _reposition() {
    if (!this._active || !this._label.visible) return;

    const [x, y] = this._active.get_transformed_position();
    const [, natWidth] = this._label.get_preferred_width(-1);
    const [, natHeight] = this._label.get_preferred_height(-1);

    let tipX = x + this._active.width / 2 - natWidth / 2;
    let tipY = y + this._active.height + 8;

    const monitor = Main.layoutManager.findMonitorForActor(this._active);
    if (monitor) {
      tipX = Math.max(
        monitor.x + 6,
        Math.min(tipX, monitor.x + monitor.width - natWidth - 6)
      );
      if (tipY + natHeight > monitor.y + monitor.height - 6)
        tipY = y - natHeight - 8;
    }

    this._label.set_position(Math.round(tipX), Math.round(tipY));
  }

  _hide() {
    this._clearTimeout();
    this._label.hide();
    this._active = null;
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
    if (this._motionId) this._host.disconnect(this._motionId);
    if (this._leaveId) this._host.disconnect(this._leaveId);
    this._motionId = 0;
    this._leaveId = 0;
    this._targets = [];
    this._label.destroy();
  }
}
