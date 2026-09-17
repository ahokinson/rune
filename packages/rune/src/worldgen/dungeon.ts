import { Random } from "@/math/random"
import { TileMap } from "@/world/tileMap"
import { Cell } from "./cell"

/**
 * Room-and-corridor dungeon via binary space partitioning. The map is recursively
 * split into sub-regions; a room is carved inside each leaf, then sibling rooms
 * are joined with L-shaped corridors as the recursion unwinds. BSP guarantees
 * non-overlapping rooms and full connectivity (every room reaches every other),
 * which is what you want for a roguelike floor. The returned `rooms` rectangles
 * are handy for placing the player, stairs, and loot at room centres.
 *
 * @module
 */

/** A carved room rectangle in dungeon coordinates. */
export interface DungeonRoom {
  /** Left column. */
  x: number
  /** Top row. */
  y: number
  /** Room width in cells. */
  width: number
  /** Room height in cells. */
  height: number
}

/** Result of {@link generateDungeon}: the tile map plus the carved rooms. */
export interface DungeonResult {
  /** Tile map of {@link Cell} values. */
  map: TileMap<Cell>
  /** Carved rooms (place player/stairs/loot at their centres). */
  rooms: DungeonRoom[]
}

/** Options for {@link generateDungeon}. */
export interface DungeonOptions {
  /** Map width in cells. */
  width: number
  /** Map height in cells. */
  height: number
  /** RNG seed (default 0). */
  seed?: number
  /** Stop splitting a region once it is below this size; larger → fewer, bigger rooms. */
  minLeafSize?: number
  /** Smallest room edge length. */
  minRoomSize?: number
}

function roomCenter(room: DungeonRoom): [number, number] {
  return [Math.floor(room.x + room.width / 2), Math.floor(room.y + room.height / 2)]
}

/**
 * Generate a room-and-corridor dungeon via BSP.
 *
 * @param options - Dimensions, seed, and sizing knobs.
 * @returns The tile map and the list of carved rooms.
 */
export function generateDungeon(options: DungeonOptions): DungeonResult {
  const width = Math.max(4, Math.floor(options.width))
  const height = Math.max(4, Math.floor(options.height))
  const minLeafSize = options.minLeafSize ?? 8
  const minRoomSize = options.minRoomSize ?? 3
  const random = new Random(options.seed ?? 0)
  const map = new TileMap<Cell>(width, height, Cell.Wall)
  const rooms: DungeonRoom[] = []

  const carveRoom = (room: DungeonRoom): void => {
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) map.set(x, y, Cell.Floor)
    }
  }

  const carveCorridor = (ax: number, ay: number, bx: number, by: number): void => {
    // L-shaped: horizontal leg then vertical leg, order chosen at random so
    // corridors don't all elbow the same way.
    const horizontalFirst = random.chance(0.5)
    const stepLine = (fixed: number, from: number, to: number, horizontal: boolean): void => {
      const lo = Math.min(from, to)
      const hi = Math.max(from, to)
      for (let i = lo; i <= hi; i++) map.set(horizontal ? i : fixed, horizontal ? fixed : i, Cell.Floor)
    }
    if (horizontalFirst) {
      stepLine(ay, ax, bx, true)
      stepLine(bx, ay, by, false)
    } else {
      stepLine(ax, ay, by, false)
      stepLine(by, ax, bx, true)
    }
  }

  // Recursively split [x, y, w, h]; return the representative room of the subtree
  // so the parent can connect its two halves.
  const split = (x: number, y: number, w: number, h: number): DungeonRoom => {
    const canSplitHorizontally = h >= minLeafSize * 2
    const canSplitVertically = w >= minLeafSize * 2
    if (!canSplitHorizontally && !canSplitVertically) {
      // Leaf: carve a room with a 1-tile margin so rooms never touch the edge.
      const roomW = random.integer(minRoomSize, Math.max(minRoomSize, w - 2))
      const roomH = random.integer(minRoomSize, Math.max(minRoomSize, h - 2))
      const roomX = x + random.integer(1, Math.max(1, w - roomW - 1))
      const roomY = y + random.integer(1, Math.max(1, h - roomH - 1))
      const room: DungeonRoom = { x: roomX, y: roomY, width: roomW, height: roomH }
      carveRoom(room)
      rooms.push(room)
      return room
    }

    // Prefer splitting the longer axis to keep regions squarish.
    const splitVertically = canSplitVertically && (!canSplitHorizontally || w >= h)
    let a: DungeonRoom
    let b: DungeonRoom
    if (splitVertically) {
      const cut = random.integer(minLeafSize, w - minLeafSize)
      a = split(x, y, cut, h)
      b = split(x + cut, y, w - cut, h)
    } else {
      const cut = random.integer(minLeafSize, h - minLeafSize)
      a = split(x, y, w, cut)
      b = split(x, y + cut, w, h - cut)
    }
    const [acx, acy] = roomCenter(a)
    const [bcx, bcy] = roomCenter(b)
    carveCorridor(acx, acy, bcx, bcy)
    return a
  }

  split(0, 0, width, height)
  return { map, rooms }
}
