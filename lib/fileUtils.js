import Gio from "gi://Gio";
import GLib from "gi://GLib";

/**
 * @param {string} path
 * @returns {string|null}
 */
export function readFile(path) {
  const file = Gio.File.new_for_path(path);
  if (!file.query_exists(null)) return null;

  const [, contents] = file.load_contents(null);
  return new TextDecoder("utf-8").decode(contents).trim();
}

/**
 * @param {string} path
 * @returns {number|null}
 */
export function readNumber(path) {
  const text = readFile(path);
  if (text === null) return null;

  const value = Number.parseFloat(text);
  return Number.isFinite(value) ? value : null;
}

/**
 * @param {string} directory
 * @returns {string[]}
 */
export function listNames(directory) {
  const file = Gio.File.new_for_path(directory);
  if (!file.query_exists(null)) return [];

  const enumerator = file.enumerate_children(
    "standard::name",
    Gio.FileQueryInfoFlags.NONE,
    null
  );

  const names = [];
  let info = enumerator.next_file(null);
  while (info !== null) {
    names.push(info.get_name());
    info = enumerator.next_file(null);
  }
  enumerator.close(null);
  return names;
}

/**
 * @param {string} directory
 * @returns {string[]}
 */
export function listDirectoryNames(directory) {
  return listNames(directory);
}

/**
 * @param {string} pattern Absolute path with a single * segment, e.g. /sys/class/hwmon/hwmon*
 * @returns {string[]}
 */
export function globDirectories(pattern) {
  const star = pattern.indexOf("*");
  if (star < 0) return [];

  const parent = pattern.slice(0, pattern.lastIndexOf("/", star));
  const prefix = pattern.slice(parent.length + 1, star);
  const suffix = pattern.slice(star + 1);

  return listDirectoryNames(parent)
    .filter(name => name.startsWith(prefix) && name.endsWith(suffix))
    .map(name => GLib.build_filenamev([parent, name]));
}
