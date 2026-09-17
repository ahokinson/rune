import { Color, PixelSprite, Texture } from "@ahokinson/rune"

/**
 * Bitmap wall textures, keyed by `textureId`. Unlike the procedural shaders in
 * wallShaders.ts, these are sampled from a {@link Texture} — demonstrating the
 * engine's bitmap-texture path. A cell whose `textureId` is present here is
 * painted by sampling the texture; any other id falls back to procedural code.
 */
export const TEXTURED_WALL_ID = 10

const dark = Color.fromBytes(46, 42, 52)
const mid = Color.fromBytes(86, 78, 96)
const glow = Color.fromBytes(214, 150, 80)

// A 16x16 bordered sigil tile. Sampled with wrapping, it repeats once per wall
// cell. Legend: o = border, . = dark stone, X = glowing rune.
const sigil = PixelSprite.fromString(
  `
oooooooooooooooo
o..............o
o..XXX....XXX..o
o..X........X..o
o.....XXXX.....o
o....X....X....o
o...X..XX..X...o
o...X.X..X.X...o
o...X.X..X.X...o
o...X..XX..X...o
o....X....X....o
o.....XXXX.....o
o..X........X..o
o..XXX....XXX..o
o..............o
oooooooooooooooo
`,
  { o: mid, ".": dark, X: glow },
)

export const TOMB_WALL_TEXTURES: ReadonlyMap<number, Texture> = new Map([
  [TEXTURED_WALL_ID, Texture.fromPixelSprite(sigil)],
])
