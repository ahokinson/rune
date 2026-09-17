[**rune**](README.md)

***

[rune](README.md) / CanvasSurface

# Interface: CanvasSurface

Defined in: draw/canvas.ts:14

Cell-grid render target: a 2D buffer of coloured glyphs.

## Properties

### height

```ts
readonly height: number;
```

Defined in: draw/canvas.ts:18

Grid height in cells.

***

### width

```ts
readonly width: number;
```

Defined in: draw/canvas.ts:16

Grid width in cells.

## Methods

### clear()

```ts
clear(background?): void;
```

Defined in: draw/canvas.ts:24

Clear every cell to `background` (or the previous clear colour).

#### Parameters

##### background?

[`Color`](Class.Color.md)

Colour to fill with.

#### Returns

`void`

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

Defined in: draw/canvas.ts:94

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

[`Color`](Class.Color.md)

Glyph colour (default white).

##### background?

[`Color`](Class.Color.md)

Cell background (default the clear colour).

#### Returns

`void`

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

Defined in: draw/canvas.ts:104

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

***

### flush()

```ts
flush(): void;
```

Defined in: draw/canvas.ts:106

Publish the current frame to the host terminal.

#### Returns

`void`

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

Defined in: draw/canvas.ts:34

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

[`Color`](Class.Color.md)

Glyph colour (default white).

##### background?

[`Color`](Class.Color.md)

Cell background (default the clear colour).

#### Returns

`void`

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

Defined in: draw/canvas.ts:49

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

Defined in: draw/canvas.ts:74

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
