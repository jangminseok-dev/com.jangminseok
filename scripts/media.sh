#!/usr/bin/env bash
# 사용: scripts/media.sh <slug> <원본파일> <출력이름(확장자 제외)>
#  이미지 → content/<slug>/media/<이름>.webp (가로 1600px 이하)
#  영상   → content/<slug>/media/<이름>.mp4 (10초·무음·H.264·2MB 이하) + <이름>-poster.webp
set -euo pipefail

slug="$1"; src="$2"; name="$3"
out_dir="content/$slug/media"
mkdir -p "$out_dir"
ext="$(echo "${src##*.}" | tr '[:upper:]' '[:lower:]')"
max_bytes=$((2 * 1024 * 1024))

case "$ext" in
  png|jpg|jpeg|webp)
    width="$(sips -g pixelWidth "$src" | awk '/pixelWidth/ {print $2}')"
    if [ "$width" -gt 1600 ]; then
      cwebp -quiet -q 82 -resize 1600 0 "$src" -o "$out_dir/$name.webp"
    else
      cwebp -quiet -q 82 "$src" -o "$out_dir/$name.webp"
    fi
    echo "✓ $out_dir/$name.webp"
    ;;
  mov|mp4|webm)
    ffmpeg -loglevel error -y -i "$src" -t 10 -an \
      -vf "scale='min(1280,iw)':-2,fps=30" \
      -c:v libx264 -crf 30 -preset slow -pix_fmt yuv420p -movflags +faststart \
      "$out_dir/$name.mp4"
    ffmpeg -loglevel error -y -i "$out_dir/$name.mp4" -frames:v 1 "/tmp/$name-poster.png"
    cwebp -quiet -q 82 "/tmp/$name-poster.png" -o "$out_dir/$name-poster.webp"
    size="$(stat -f%z "$out_dir/$name.mp4")"
    if [ "$size" -gt "$max_bytes" ]; then
      echo "✗ $name.mp4 = ${size}B > 2MB — 스크립트의 -crf 값을 올려(예: 34) 다시 실행" >&2
      exit 1
    fi
    echo "✓ $out_dir/$name.mp4 (${size}B) + $name-poster.webp"
    ;;
  *)
    echo "지원하지 않는 확장자: $ext" >&2; exit 1 ;;
esac
