[**rune**](README.md)

***

[rune](README.md) / InMemoryCanvas

# Class: InMemoryCanvas

Defined in: draw/canvas.ts:147

In-engine [Canvas](Interface.CanvasSurface.md) backed by flat typed arrays for the glyph and colour
channels, with a second buffer for diffing against the previous frame.

## Example

```ts
const canvas = new InMemoryCanvas(80, 24)
canvas.setCell(10, 5, "@", Color.RED)
canvas.flush()
```

## Implements

- [`CanvasSurface`](Interface.CanvasSurface.md)

## Constructors

### Constructor

```ts
new InMemoryCanvas(
   width, 
   height, 
   clearColor?
): InMemoryCanvas;
```

Defined in: draw/canvas.ts:183

#### Parameters

##### width

`number`

Grid width in cells (clamped to at least 1).

##### height

`number`

Grid height in cells (clamped to at least 1).

##### clearColor?

[`Color`](Class.Color.md) = `Color.BLACK`

Initial and default background (default black).

#### Returns

`InMemoryCanvas`

## Properties

### height

```ts
readonly height: number;
```

Defined in: draw/canvas.ts:149

Grid height in cells.

#### Implementation of

[`CanvasSurface`](Interface.CanvasSurface.md).[`height`](Interface.CanvasSurface.md#height)

***

### width

```ts
readonly width: number;
```

Defined in: draw/canvas.ts:148

Grid width in cells.

#### Implementation of

[`CanvasSurface`](Interface.CanvasSurface.md).[`width`](Interface.CanvasSurface.md#width)

## Methods

### cellAt()

```ts
cellAt(x, y): CellRecord | null;
```

Defined in: draw/canvas.ts:232

Read a cell back as a record (allocates new [Color](Class.Color.md) instances).

#### Parameters

##### x

`number`

Column.

##### y

`number`

Row.

#### Returns

`CellRecord` \| `null`

The cell record, or `null` if out of bounds.

***

### clear()

```ts
clear(background?): void;
```

Defined in: draw/canvas.ts:271

Reset every cell to `background` (space glyph, that background) and remember
it as the default for subsequent writes.

#### Parameters

##### background?

[`Color`](Class.Color.md) = `...`

Colour to clear with (default the last clear colour).

#### Returns

`void`

#### Implementation of

[`CanvasSurface`](Interface.CanvasSurface.md).[`clear`](Interface.CanvasSurface.md#clear)

***

### drawText()

```ts
drawText(
   x, 
   y, 
   text, 
   foreground?, 
   background?
): void;
```

Defined in: draw/canvas.ts:396

Write a string left-to-right starting at `(x, y)`.

#### Parameters

##### x

`number`

Leftmost column.

##### y

`number`

Row.

##### text

`string`

String to write.

##### foreground?

[`Color`](Class.Color.md) = `Color.WHITE`

Glyph colour (default white).

##### background?

[`Color`](Class.Color.md)

Cell background (default the clear colour).

#### Returns

`void`

#### Implementation of

[`CanvasSurface`](Interface.CanvasSurface.md).[`drawText`](Interface.CanvasSurface.md#drawtext)

***

### fillRectangle()

```ts
fillRectangle(
   x, 
   y, 
   width, 
   height, 
   color
): void;
```

Defined in: draw/canvas.ts:420

Fill an axis-aligned rectangle with `color` (space glyph, that background).

#### Parameters

##### x

`number`

Left column.

##### y

`number`

Top row.

##### width

`number`

Rectangle width in cells.

##### height

`number`

Rectangle height in cells.

##### color

[`Color`](Class.Color.md)

Fill colour.

#### Returns

`void`

#### Implementation of

[`CanvasSurface`](Interface.CanvasSurface.md).[`fillRectangle`](Interface.CanvasSurface.md#fillrectangle)

***

### flush()

```ts
flush(): void;
```

Defined in: draw/canvas.ts:446

Copy the current frame into the previous-frame buffer for diffing.

#### Returns

`void`

#### Implementation of

[`CanvasSurface`](Interface.CanvasSurface.md).[`flush`](Interface.CanvasSurface.md#flush)

***

### readCell()

```ts
readCell(
   x, 
   y, 
   out
): boolean;
```

Defined in: draw/canvas.ts:252

Read a cell's glyph and fg/bg bytes into `out` without allocating, for
post-processing passes that sample the composited frame. Returns false (and
leaves `out` untouched) for out-of-bounds coordinates.

#### Parameters

##### x

`number`

Column.

##### y

`number`

Row.

##### out

[`CellBytes`](Interface.CellBytes.md)

Target to fill.

#### Returns

`boolean`

`true` if `out` was filled; `false` if out of bounds.

***

### setCell()

```ts
setCell(
   x, 
   y, 
   character, 
   foreground?, 
   background?
): void;
```

Defined in: draw/canvas.ts:297

Set a single cell's glyph and colours. Out-of-bounds writes are ignored.

#### Parameters

##### x

`number`

Column.

##### y

`number`

Row.

##### character

`string`

Glyph to write.

##### foreground?

[`Color`](Class.Color.md) = `Color.WHITE`

Glyph colour (default white).

##### background?

[`Color`](Class.Color.md)

Cell background (default the clear colour).

#### Returns

`void`

#### Implementation of

[`CanvasSurface`](Interface.CanvasSurface.md).[`setCell`](Interface.CanvasSurface.md#setcell)

***

### setCellBytes()

```ts
setCellBytes(
   x, 
   y, 
   character, 
   fgR, 
   fgG, 
   fgB, 
   bgR, 
   bgG, 
   bgB
): void;
```

Defined in: draw/canvas.ts:326

Set a cell from raw 0–255 byte channels (alpha forced to 255). Out-of-bounds
writes are ignored.

#### Parameters

##### x

`number`

Column.

##### y

`number`

Row.

##### character

`string`

Glyph to write.

##### fgR

`number`

Foreground red (0–255).

##### fgG

`number`

Foreground green (0–255).

##### fgB

`number`

Foreground blue (0–255).

##### bgR

`number`

Background red (0–255).

##### bgG

`number`

Background green (0–255).

##### bgB

`number`

Background blue (0–255).

#### Returns

`void`

#### Implementation of

[`CanvasSurface`](Interface.CanvasSurface.md).[`setCellBytes`](Interface.CanvasSurface.md#setcellbytes)

***

### setCellBytesUnsafe()

```ts
setCellBytesUnsafe(
   x, 
   y, 
   character, 
   fgR, 
   fgG, 
   fgB, 
   bgR, 
   bgG, 
   bgB
): void;
```

Defined in: draw/canvas.ts:364

Set a cell from raw 0–255 byte channels without bounds checking. Faster
than [setCellBytes](#setcellbytes) but the caller must guarantee valid coordinates.

#### Parameters

##### x

`number`

Column.

##### y

`number`

Row.

##### character

`string`

Glyph to write.

##### fgR

`number`

Foreground red (0–255).

##### fgG

`number`

Foreground green (0–255).

##### fgB

`number`

Foreground blue (0–255).

##### bgR

`number`

Background red (0–255).

##### bgG

`number`

Background green (0–255).

##### bgB

`number`

Background blue (0–255).

#### Returns

`void`

#### Implementation of

[`CanvasSurface`](Interface.CanvasSurface.md).[`setCellBytesUnsafe`](Interface.CanvasSurface.md#setcellbytesunsafe)
