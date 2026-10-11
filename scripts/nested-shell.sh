#!/usr/bin/env bash
# Official GNOME extension workflow: nested Shell (no logout on Wayland).
# Docs: https://gjs.guide/extensions/development/debugging.html
set -euo pipefail

UUID="pc-info@brayanmonteiroo.github.io"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Compiling schemas"
glib-compile-schemas "${ROOT}/schemas"

echo "==> Linking extension into ~/.local/share/gnome-shell/extensions"
mkdir -p "${HOME}/.local/share/gnome-shell/extensions"
# Symlink: edits in the repo appear immediately; never run
# `gnome-extensions install` while linked (it can replace/wipe the link).
ln -sfn "${ROOT}" "${HOME}/.local/share/gnome-shell/extensions/${UUID}"

major="$(gnome-shell --version | awk '{print int($3)}')"
echo "==> Starting nested GNOME Shell (close this window to reload after code changes)"
echo "    Inside the nested session, run:"
echo "      gnome-extensions enable ${UUID}"
echo "      gnome-extensions prefs ${UUID}"
echo

export SHELL_DEBUG="${SHELL_DEBUG:-backtrace-warnings}"

if [[ "${major}" -ge 49 ]]; then
  exec dbus-run-session gnome-shell --devkit --wayland
fi

exec dbus-run-session gnome-shell --nested --wayland
