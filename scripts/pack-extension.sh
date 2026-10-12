#!/usr/bin/env bash
# Build the EGO-ready ZIP (schemas + compiled locales, no po/ sources).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

UUID="pc-info@brayanmonteiroo.github.io"
ZIP="${UUID}.zip"

glib-compile-schemas schemas/
./scripts/compile-locales.sh

rm -f "$ZIP"
zip -r "$ZIP" \
  metadata.json \
  extension.js \
  prefs.js \
  stylesheet.css \
  LICENSE \
  schemas/org.gnome.shell.extensions.pc-info.gschema.xml \
  schemas/gschemas.compiled \
  lib/*.js \
  locale

echo "Created $ZIP"
unzip -Z1 "$ZIP" | sort | sed 's/^/  /'
