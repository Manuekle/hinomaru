#!/bin/sh
# Turn an app screenshot (PNG, 1206 × 2622 from an iPhone 17/18 Pro or its simulator) into the
# landing's two high-quality WebP files: the full one and the 720 px one picked by srcset.
#
#   sh scripts/add_shot.sh songs ~/Desktop/songs.png          # English -> assets/shots/
#   sh scripts/add_shot.sh songs ~/Desktop/canciones.png es   # Spanish -> assets/shots/es/
#
# Simulator: `xcrun simctl io <udid> screenshot --mask=ignored file.png`. The page's iPhone
# frame draws its own Dynamic Island, so remove_island.py erases the one iOS bakes in.
# sharp_yuv keeps small coloured text (pink romaji, level pills) crisp after chroma subsampling.
set -eu
name=$1
src=$2
lang=${3:-}
here=$(cd "$(dirname "$0")" && pwd)
root=$here/../app/assets/shots
dir=$root${lang:+/$lang}
mobile=$root/mobile${lang:+/$lang}
tmp=$(mktemp -t kanago-shot).png
trap 'rm -f "$tmp"' EXIT
python3 "$here/remove_island.py" "$src" "$tmp"
mkdir -p "$dir" "$mobile"
cwebp -quiet -metadata none -sharp_yuv -q 92 -m 6 "$tmp" -o "$dir/$name.webp"
cwebp -quiet -metadata none -sharp_yuv -q 90 -m 6 -resize 720 0 "$tmp" -o "$mobile/$name.webp"
ls -l "$dir/$name.webp" "$mobile/$name.webp"
