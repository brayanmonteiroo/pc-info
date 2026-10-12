#!/usr/bin/env bash
# Compile po/*.po into locale/<lang>/LC_MESSAGES/<domain>.mo for local installs.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DOMAIN="pc-info@brayanmonteiroo.github.io"
PODIR="${ROOT}/po"
LOCALEDIR="${ROOT}/locale"

rm -rf "${LOCALEDIR}"
mkdir -p "${LOCALEDIR}"

shopt -s nullglob
for po in "${PODIR}"/*.po; do
  lang="$(basename "$po" .po)"
  outdir="${LOCALEDIR}/${lang}/LC_MESSAGES"
  mkdir -p "$outdir"
  msgfmt -o "${outdir}/${DOMAIN}.mo" "$po"
  echo "Compiled ${lang} -> ${outdir}/${DOMAIN}.mo"
done
