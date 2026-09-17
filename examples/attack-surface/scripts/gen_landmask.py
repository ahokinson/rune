#!/usr/bin/env python3
"""Regenerate globe/landmask.ts from a Natural Earth equirectangular texture.

Usage (run from examples/attack-surface/):
    # download once (browser UA required by shadedrelief.com):
    curl -L -A "Mozilla/5.0" -o /tmp/earth_8k.jpg \
      https://shadedrelief.com/natural3/ne3_data/8192/textures/2_no_clouds_8k.jpg
    python3 scripts/gen_landmask.py /tmp/earth_8k.jpg

Classifies each cell land/ocean by blue dominance (ocean is strongly blue;
ice/snow land is only marginally blue, so a +25 margin keeps ice as land), then
bit-packs a MASK_W x MASK_H 1-bit mask (1=land) as base64.
"""
import base64
import sys
from PIL import Image

SRC = sys.argv[1] if len(sys.argv) > 1 else "/tmp/earth_8k.jpg"
OUT = "globe/landmask.ts"
MASK_W, MASK_H = 1024, 512

im = Image.open(SRC).convert("RGB").resize((MASK_W, MASK_H), Image.Resampling.BOX)
px = list(im.getdata())

mask = bytearray(MASK_W * MASK_H)
for i, (r, g, b) in enumerate(px):
    ocean = (b - (r if r > g else g)) > 25
    mask[i] = 0 if ocean else 1

packed = bytearray((MASK_W * MASK_H + 7) // 8)
for i in range(MASK_W * MASK_H):
    if mask[i]:
        packed[i >> 3] |= 1 << (7 - (i & 7))
b64 = base64.b64encode(bytes(packed)).decode()

ts = """import {{ equirectTexel }} from "rune"

// Auto-generated land/ocean mask from Natural Earth III 8K texture (2_no_clouds_8k.jpg).
// {h} rows (north->south) x {w} cols (west->east). 1 bit per cell (1=land),
// row-major, MSB-first, base64-packed. Regenerate via scripts/gen_landmask.py.
export const MASK_W = {w}
export const MASK_H = {h}

const PACKED = "{b64}"

const MASK: Uint8Array = (() => {{
  const bin = atob(PACKED)
  const out = new Uint8Array(MASK_W * MASK_H)
  for (let i = 0; i < out.length; i++) {{
    out[i] = (bin.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1
  }}
  return out
}})()

// Nearest-sample the land mask at a geographic coordinate. lon wraps, lat clamps.
// Geographic latitude/longitude in radians (the sphere engine's theta/phi).
export function sampleLand(latRad: number, lonRad: number): number {{
  const {{ x, y }} = equirectTexel(latRad, lonRad, MASK_W, MASK_H)
  return MASK[y * MASK_W + x]{bang}
}}
""".format(h=MASK_H, w=MASK_W, b64=b64, bang="!")

with open(OUT, "w") as f:
    f.write(ts)
print(f"wrote {OUT}  ({len(packed)} bytes, b64 {len(b64)} chars)")
