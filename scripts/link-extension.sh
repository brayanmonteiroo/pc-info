#!/usr/bin/env bash
# Replace install dir with a symlink to the repo (safe if a copy already exists).
set -euo pipefail

UUID="pc-info@brayanmonteiroo.github.io"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EXTENSIONS_DIR="${HOME}/.local/share/gnome-shell/extensions"
INSTALL_DIR="${EXTENSIONS_DIR}/${UUID}"

glib-compile-schemas "${ROOT}/schemas"
"${ROOT}/scripts/compile-locales.sh"
mkdir -p "${EXTENSIONS_DIR}"

# If INSTALL_DIR is an existing directory, `ln -sfn TARGET DIR` creates
# DIR/basename(TARGET) instead of replacing DIR — that hid our updates.
if [[ -e "${INSTALL_DIR}" || -L "${INSTALL_DIR}" ]]; then
  rm -rf "${INSTALL_DIR}"
fi

ln -sfn "${ROOT}" "${INSTALL_DIR}"

if [[ "$(readlink -f "${INSTALL_DIR}")" != "${ROOT}" ]]; then
  echo "ERROR: link failed: ${INSTALL_DIR}" >&2
  ls -la "${EXTENSIONS_DIR}" >&2
  exit 1
fi

echo "Linked ${INSTALL_DIR} -> ${ROOT}"
