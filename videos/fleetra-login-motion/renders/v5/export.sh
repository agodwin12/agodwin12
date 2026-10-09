#!/usr/bin/env bash
# Ré-encode les vidéos à fond transparent depuis la séquence PNG RGBA (frames/frame_000001.png … 000120, 1920×1080, 30 i/s).
set -euo pipefail
cd "$(dirname "$0")"
IN=frames/frame_%06d.png

# Web (Chrome / Firefox / Edge) : VP9 avec alpha
ffmpeg -y -framerate 30 -i "$IN" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 30 -auto-alt-ref 0 fleetra.webm

# Montage (Premiere / After Effects / DaVinci) : ProRes 4444 avec alpha (~146 Mo, trop lourd pour GitHub, non versionné)
ffmpeg -y -framerate 30 -i "$IN" -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le fleetra.mov

# Safari (macOS / iOS) : HEVC avec alpha, encodeur Apple VideoToolbox, donc Mac uniquement
if ffmpeg -hide_banner -encoders 2>/dev/null | grep -q hevc_videotoolbox; then
  ffmpeg -y -framerate 30 -i "$IN" -c:v hevc_videotoolbox -allow_sw 1 -pix_fmt bgra -alpha_quality 0.75 \
         -b:v 3M -tag:v hvc1 -movflags +faststart fleetra-safari.mov
else
  echo "hevc_videotoolbox indisponible : lancez ce script sur un Mac pour produire fleetra-safari.mov."
fi
