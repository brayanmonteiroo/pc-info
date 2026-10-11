#!/usr/bin/env bash
# Official GNOME extension workflow: nested Shell (no logout on Wayland).
# Docs: https://gjs.guide/extensions/development/debugging.html
set -euo pipefail

UUID="pc-info@brayanmonteiroo.github.io"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

"${ROOT}/scripts/link-extension.sh"

if [[ ! -x /usr/libexec/mutter-devkit ]]; then
  echo ""
  echo "AVISO: mutter-devkit não está instalado."
  echo "Sem ele o nested no GNOME 49+ fica quebrado/incompleto."
  echo "Instale com:"
  echo "  sudo dnf install mutter-devkit"
  echo ""
fi

major="$(gnome-shell --version | awk '{print int($3)}')"
echo "==> Starting nested GNOME Shell"
echo "    Teste DENTRO da janela nested (não na barra da sessão principal)."
echo "    A sessão principal só recarrega código com logout/login."
echo "    Inside nested:"
echo "      gnome-extensions enable ${UUID}"
echo

export SHELL_DEBUG="${SHELL_DEBUG:-backtrace-warnings}"

if [[ "${major}" -ge 49 ]]; then
  exec dbus-run-session gnome-shell --devkit --wayland
fi

exec dbus-run-session gnome-shell --nested --wayland
