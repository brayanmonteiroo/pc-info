#!/usr/bin/env bash
# Official GNOME extension workflow: nested Shell (no logout on Wayland).
# Docs: https://gjs.guide/extensions/development/debugging.html
set -euo pipefail

UUID="pc-info@brayanmonteiroo.github.io"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

"${ROOT}/scripts/link-extension.sh"

major="$(gnome-shell --version | awk '{print int($3)}')"
echo "==> Starting nested GNOME Shell"
echo "    Close this window and re-run to reload code changes."
echo "    Inside the nested session:"
echo "      gnome-extensions enable ${UUID}"
echo

export SHELL_DEBUG="${SHELL_DEBUG:-backtrace-warnings}"

if [[ "${major}" -ge 49 ]]; then
  exec dbus-run-session gnome-shell --devkit --wayland
fi

exec dbus-run-session gnome-shell --nested --wayland
