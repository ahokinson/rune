import { Noise3D, Texture } from "@ahokinson/rune"

// Game-side procedural texture. The general debug textures (checker, uv grid)
// live in the engine now (checkerTexture / uvGridTexture); marble is an artistic
// look specific to the teapot demo, so it stays here, built on the engine's
// public Noise3D.

function write(data: Uint8ClampedArray, offset: number, r: number, g: number, b: number): void {
  data[offset] = r
  data[offset + 1] = g
  data[offset + 2] = b
  data[offset + 3] = 255
}

// Veined marble via turbulent noise: a sine of the u coordinate perturbed by fbm,
// blended between two stone tones. Gives the teapot a porcelain/stone feel.
export function makeMarbleTexture(size = 96, seed = 7): Texture {
  const noise = new Noise3D(seed)
  const data = new Uint8ClampedArray(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size
      const v = y / size
      const turbulence = noise.fbm(u * 4, v * 4, 0, 5)
      const veins = Math.abs(Math.sin((u * 6 + turbulence * 4) * Math.PI))
      const t = veins ** 0.6
      const r = Math.round(70 + t * 175)
      const g = Math.round(74 + t * 171)
      const b = Math.round(82 + t * 160)
      write(data, (y * size + x) * 4, r, g, b)
    }
  }
  return new Texture(size, size, data)
}
