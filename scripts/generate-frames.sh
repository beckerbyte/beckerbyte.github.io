#!/usr/bin/env bash
set -euo pipefail

generate_sequence() {
  local scene="$1"
  local format="$2"
  local count="$3"
  local fps="$4"
  local width="$5"
  local height="$6"
  local source="assets/media/system/${scene}/${scene}-${format}.mp4"
  local destination="assets/media/frames/${scene}/${format}"

  mkdir -p "$destination"
  ffmpeg -hide_banner -loglevel error -y \
    -i "$source" \
    -an \
    -vf "fps=${fps},scale=${width}:${height}:flags=lanczos" \
    -frames:v "$count" \
    -c:v libwebp -preset picture -quality 58 -compression_level 5 \
    "${destination}/frame-%04d.webp"
}

for scene in home profile skills archive contact; do
  generate_sequence "$scene" desktop 72 14.2857 1152 648
  generate_sequence "$scene" tablet 54 10.7143 768 768
  generate_sequence "$scene" mobile 42 8.3333 540 960
done

for scene in portfolio analyzer; do
  generate_sequence "$scene" desktop 48 9.5238 1152 648
  generate_sequence "$scene" tablet 36 7.1429 768 768
  generate_sequence "$scene" mobile 30 5.9524 540 960
done

echo "Responsive Frame-Sequenzen für alle fünf Hauptszenen und zwei Projektseiten erzeugt."
