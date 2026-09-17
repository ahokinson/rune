[**rune**](README.md)

***

[rune](README.md) / TileDefinition

# Interface: TileDefinition\<TCell\>

Defined in: draw/tileSet.ts:33

How a cell value is rendered and whether it blocks movement.

## Type Parameters

### TCell

`TCell`

## Properties

### appearance

```ts
appearance: TileAppearance<TCell>;
```

Defined in: draw/tileSet.ts:35

The sprite, animated sprite, or appearance function for the cell.

***

### solid?

```ts
optional solid?: boolean;
```

Defined in: draw/tileSet.ts:40

Whether the tile blocks movement. Read by collision queries
(TileLayer.collidersNear) — `undefined` counts as passable.
