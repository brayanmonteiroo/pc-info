import Adw from "gi://Adw";
import Gio from "gi://Gio";

import {ExtensionPreferences} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

import {probeAvailability} from "./lib/availability.js";
import {METRIC_DEFS, UNAVAILABLE_SUBTITLE} from "./lib/labels.js";

export default class PcInfoPreferences extends ExtensionPreferences {
  /**
   * @param {Adw.PreferencesWindow} window
   */
  fillPreferencesWindow(window) {
    const settings = this.getSettings();
    const availability = probeAvailability();

    const page = new Adw.PreferencesPage({
      title: "Geral",
      icon_name: "preferences-system-symbolic"
    });

    const group = new Adw.PreferencesGroup({
      title: "Mostrar na barra superior",
      description: "Escolha o que aparece na barra superior."
    });

    for (const metric of METRIC_DEFS) {
      const available = availability[metric.id] !== false;
      const row = new Adw.SwitchRow({
        title: metric.title,
        subtitle: available ? metric.subtitle : UNAVAILABLE_SUBTITLE,
        active: available && settings.get_boolean(metric.key),
        sensitive: available
      });

      if (available) {
        settings.bind(
          metric.key,
          row,
          "active",
          Gio.SettingsBindFlags.DEFAULT
        );
      } else {
        row.active = false;
      }

      group.add(row);
    }

    page.add(group);
    window.add(page);
    window.search_enabled = true;
  }
}
