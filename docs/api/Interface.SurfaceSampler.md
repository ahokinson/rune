[**rune**](README.md)

***

[rune](README.md) / SurfaceSampler

# Interface: SurfaceSampler

Defined in: geom/geometry3d.ts:220

Game-supplied callback that turns sampled surface points into a drawn cell.
The engine walks the disc, runs the 2x4 braille sub-pixel grid per cell, and
for each on-surface sub-pixel calls `subpixel`; the game accumulates coverage
+ shading, then `finishCell` packs it (return false to skip an empty cell).

## Methods

### beginCell()

```ts
beginCell(cx, cy): void;
```

Defined in: geom/geometry3d.ts:222

Start accumulating a new cell at `(cx, cy)`.

#### Parameters

##### cx

`number`

##### cy

`number`

#### Returns

`void`

***

### finishCell()

```ts
finishCell(out): boolean;
```

Defined in: geom/geometry3d.ts:226

Pack the accumulated cell; return `false` to skip an empty cell.

#### Parameters

##### out

[`SurfaceCellResult`](Interface.SurfaceCellResult.md)

#### Returns

`boolean`

***

### subpixel()

```ts
subpixel(
   sample, 
   row, 
   col, 
   bit
): void;
```

Defined in: geom/geometry3d.ts:224

Accumulate one on-surface sub-pixel sample.

#### Parameters

##### sample

[`SurfaceSample`](Interface.SurfaceSample.md)

##### row

`number`

##### col

`number`

##### bit

`number`

#### Returns

`void`
