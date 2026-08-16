#!/usr/bin/env bash
# Turn a stock coin .blend into the GLB the site loads.
#
#   scripts/export-coin.sh ~/Downloads/bnb.blend bnb
#
# Writes public/app/3d/coins/<name>.glb, then add the file to `content/chains.ts`
# as that chain's `coin`. The source .blend is never written to: this opens it in
# a background Blender and only ever exports.
#
# Decimation is the reason a 4MB stock coin lands at 65KB. These files come out
# of a renderer at around 55,000 triangles with the bevels applied, and at the
# size a coin is drawn on this page 18% of that is indistinguishable from all of
# it. That was checked by rendering both, not assumed. Raise RATIO if a coin
# with finer detail ever looks chewed.
set -euo pipefail

BLENDER="${BLENDER_PATH:-/Applications/Blender.app/Contents/MacOS/Blender}"
RATIO="${RATIO:-0.18}"

src="$1"
name="$2"
here="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
out="$here/public/app/3d/coins/$name.glb"

mkdir -p "$(dirname "$out")"
"$BLENDER" --background "$src" --python "$here/scripts/export-coin.py" \
  -- "$out" "$name" draco "$RATIO" | sed -n '/<<<JSON>>>/,$p'

echo "wrote $out ($(du -h "$out" | cut -f1))"
