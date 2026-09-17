import { animatedTile, type Color, fillTile, type Sprite, type TileContext, TileSet } from "@ahokinson/rune"
import { type Cell, isSolid, TILE } from "../level"
import * as theme from "../theme"

// Each terrain kind is a TILE×TILE sprite painted from the palette, matching the
// hand-drawn blocks the example used before: a filled body with edge accents. The
// engine tile set then renders them (and ticks the animated question block); the
// pipe is neighbour-aware so its rim only caps an exposed top.

function groundSprite(): Sprite {
  const sprite = fillTile(TILE, "█", theme.GROUND_FILL)
  for (let column = 0; column < TILE; column++) sprite.setCell(column, 0, "▀", theme.GROUND_TOP)
  return sprite
}

function brickSprite(): Sprite {
  const sprite = fillTile(TILE, "█", theme.BRICK)
  for (let column = 0; column < TILE; column++) sprite.setCell(column, 0, "─", theme.BRICK_LINE)
  sprite.setCell(1, 1, "│", theme.BRICK_LINE)
  return sprite
}

// A "?"/used block: shaded top and bottom edges over a base body, with a centred
// glyph. The question block shimmers between two glyph colours.
function questionSprite(base: Color, glyph: string, glyphColor: Color): Sprite {
  const sprite = fillTile(TILE, "█", base)
  for (let column = 0; column < TILE; column++) {
    sprite.setCell(column, 0, "▄", theme.QUESTION_SHADE)
    sprite.setCell(column, TILE - 1, "▀", theme.QUESTION_SHADE)
  }
  sprite.setCell(1, 1, glyph, glyphColor, base)
  return sprite
}

function pipeSprite(rim: boolean): Sprite {
  const sprite = fillTile(TILE, "█", theme.PIPE)
  for (let row = 0; row < TILE; row++) sprite.setCell(TILE - 1, row, "▐", theme.PIPE_DARK)
  sprite.setCell(0, 0, "▌", theme.PIPE_DARK)
  if (rim) for (let column = 0; column < TILE; column++) sprite.setCell(column, 0, "▀", theme.PIPE_DARK)
  return sprite
}

export function buildTerrainTileSet(): TileSet<Cell> {
  const pipeBody = pipeSprite(false)
  const pipeRim = pipeSprite(true)
  const questionShimmer = animatedTile(
    [questionSprite(theme.QUESTION, "?", theme.HUD_SHADOW), questionSprite(theme.QUESTION, "?", theme.QUESTION_SHADE)],
    420,
  )
  return new TileSet<Cell>()
    .define("ground", { appearance: groundSprite(), solid: true })
    .define("brick", { appearance: brickSprite(), solid: true })
    .define("question", { appearance: questionShimmer, solid: true })
    .define("questionUsed", { appearance: questionSprite(theme.QUESTION_USED, "·", theme.HUD_SHADOW), solid: true })
    .define("pipe", {
      appearance: (context: TileContext<Cell>) =>
        isSolid(context.tileMap.get(context.column, context.row - 1)) ? pipeBody : pipeRim,
      solid: true,
    })
  // "hidden" is intentionally undefined: invisible and passable until a bonk
  // rewrites it to "questionUsed".
}
