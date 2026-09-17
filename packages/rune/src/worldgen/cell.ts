/**
 * The cell vocabulary the maze and dungeon generators emit. A plain two-state
 * enum keeps generators interchangeable: any of them returns a `TileMap<Cell>` the
 * game maps onto its own tile art. (Wave-function-collapse is richer and works
 * over arbitrary tile indices instead — see waveCollapse.ts.)
 *
 * @module
 */

/** Two-state tile enum used by the maze and dungeon generators. */
export enum Cell {
  /** Solid, impassable wall. */
  Wall = 0,
  /** Open, walkable floor. */
  Floor = 1,
}
