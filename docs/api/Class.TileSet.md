[**rune**](README.md)

***

[rune](README.md) / TileSet

# Class: TileSet\<TCell\>

Defined in: draw/tileSet.ts:57

A legend for rendering: it maps each cell value to how that cell is drawn (and
whether it is solid). One animated appearance instance is shared by every cell
of that type, so e.g. all coin tiles spin in sync, advanced once per frame by
`update`.

## Example

```ts
const tiles = new TileSet<string>()
  .define("#", { appearance: fillTile(2, "#", Color.GRAY), solid: true })
  .define(".", { appearance: fillTile(2, ".", Color.BLACK) })
tiles.appearanceFor("#", context)  // -> the wall sprite
```

## Type Parameters

### TCell

`TCell`

## Constructors

### Constructor

```ts
new TileSet<TCell>(): TileSet<TCell>;
```

#### Returns

`TileSet`\<`TCell`\>

## Methods

### appearanceFor()

```ts
appearanceFor(cell, context): Sprite | null;
```

Defined in: draw/tileSet.ts:103

The sprite to draw for `cell` right now, or null if the cell has no
appearance (blank/undecorated cells are simply skipped).

#### Parameters

##### cell

`TCell`

Cell value.

##### context

[`TileContext`](Interface.TileContext.md)\<`TCell`\>

Surrounding context for neighbour-aware appearances.

#### Returns

[`Sprite`](Class.Sprite.md) \| `null`

The current sprite, or `null` if undefined.

***

### define()

```ts
define(cell, definition): this;
```

Defined in: draw/tileSet.ts:68

Register how `cell` is drawn and whether it is solid.

#### Parameters

##### cell

`TCell`

Cell value to define.

##### definition

[`TileDefinition`](Interface.TileDefinition.md)\<`TCell`\>

Appearance and solidity.

#### Returns

`this`

`this` for chaining.

***

### has()

```ts
has(cell): boolean;
```

Defined in: draw/tileSet.ts:80

Whether `cell` has a definition.

#### Parameters

##### cell

`TCell`

Cell value.

#### Returns

`boolean`

`true` if the cell is defined.

***

### isSolid()

```ts
isSolid(cell): boolean;
```

Defined in: draw/tileSet.ts:90

Whether `cell` blocks movement. `undefined`/unknown cells are passable.

#### Parameters

##### cell

`TCell` \| `undefined`

Cell value (may be `undefined` for empty/out-of-bounds).

#### Returns

`boolean`

`true` if the cell is solid.

***

### update()

```ts
update(deltaMilliseconds): void;
```

Defined in: draw/tileSet.ts:117

Advance every animated appearance. TileLayer calls this each update.

#### Parameters

##### deltaMilliseconds

`number`

Time to advance in milliseconds.

#### Returns

`void`
