[**rune**](README.md)

***

[rune](README.md) / FilterCanvas

# Class: FilterCanvas

Defined in: fx/screen.ts:38

Wraps a canvas and runs a stack of [ScreenEffect](Interface.ScreenEffect.md)s over everything drawn
through it: each draw call is shifted by the summed `rowOffset(y)` and tinted
by the product of every `brightness()`. Effects compose in array order. Drawing
code targets a FilterCanvas exactly like a plain canvas; call
`postPass` once after the frame is drawn to let effects overlay artifacts onto
the underlying canvas.

## Implements

- [`CanvasSurface`](Interface.CanvasSurface.md)

## Constructors

### Constructor

```ts
new FilterCanvas(inner, effects): FilterCanvas;
```

Defined in: fx/screen.ts:48

#### Parameters

##### inner

[`CanvasSurface`](Interface.CanvasSurface.md)

Underlying canvas to draw through.

##### effects

[`ScreenEffect`](Interface.ScreenEffect.md)[]

Effects applied to every draw call (in array order).

#### Returns

`FilterCanvas`

## Properties

### height

```ts
readonly height: number;
```

Defined in: fx/screen.ts:42

Wrapped canvas height in cells.

#### Implementation of

[`CanvasSurface`](Interface.CanvasSurface.md).[`height`](Interface.CanvasSurface.md#height)

***

### width

```ts
readonly width: number;
```

Defined in: fx/screen.ts:40

Wrapped canvas width in cells.

#### Implementation of

[`CanvasSurface`](Interface.CanvasSurface.md).[`width`](Interface.CanvasSurface.md#width)

## Methods

### clear()

```ts
clear(background?): void;
```

Defined in: fx/screen.ts:82

Clear the inner canvas, scaled by the composed brightness.

#### Parameters

##### background?

[`Color`](Class.Color.md)

Optional clear colour.

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

Defined in: fx/screen.ts:177

Draw a string, shifted by `rowOffset(y)` and tinted by the composed brightness.

#### Parameters

##### x

`number`

Start column.

##### y

`number`

Row.

##### text

`string`

Text to draw.

##### foreground?

[`Color`](Class.Color.md)

Optional foreground colour.

##### background?

[`Color`](Class.Color.md)

Optional background colour.

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

Defined in: fx/screen.ts:191

Fill a rectangle, shifted by `rowOffset(y)` and tinted by the composed brightness.

#### Parameters

##### x

`number`

Left column.

##### y

`number`

Top row.

##### width

`number`

Rectangle width.

##### height

`number`

Rectangle height.

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

Defined in: fx/screen.ts:197

Flush the inner canvas.

#### Returns

`void`

#### Implementation of

[`CanvasSurface`](Interface.CanvasSurface.md).[`flush`](Interface.CanvasSurface.md#flush)

***

### postPass()

```ts
postPass(tick): void;
```

Defined in: fx/screen.ts:207

Run each effect's overlay pass against the underlying canvas (un-shifted), so
post artifacts land in screen space rather than being offset by `rowOffset`.

#### Parameters

##### tick

`number`

Current tick number.

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

Defined in: fx/screen.ts:96

Set a cell, shifted by the summed `rowOffset(y)` and tinted by the composed
brightness.

#### Parameters

##### x

`number`

Column index.

##### y

`number`

Row index.

##### character

`string`

Glyph to write.

##### foreground?

[`Color`](Class.Color.md)

Optional foreground colour.

##### background?

[`Color`](Class.Color.md)

Optional background colour.

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

Defined in: fx/screen.ts:115

Set a cell from raw bytes, shifted by `rowOffset(y)` and tinted by the
composed brightness.

#### Parameters

##### x

`number`

Column index.

##### y

`number`

Row index.

##### character

`string`

Glyph to write.

##### fgR

`number`

Foreground red 0–255.

##### fgG

`number`

Foreground green 0–255.

##### fgB

`number`

Foreground blue 0–255.

##### bgR

`number`

Background red 0–255.

##### bgG

`number`

Background green 0–255.

##### bgB

`number`

Background blue 0–255.

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

Defined in: fx/screen.ts:143

Same as [setCellBytes](#setcellbytes) but skips bounds/clipping on the inner canvas.

#### Parameters

##### x

`number`

Column index.

##### y

`number`

Row index.

##### character

`string`

Glyph to write.

##### fgR

`number`

Foreground red 0–255.

##### fgG

`number`

Foreground green 0–255.

##### fgB

`number`

Foreground blue 0–255.

##### bgR

`number`

Background red 0–255.

##### bgG

`number`

Background green 0–255.

##### bgB

`number`

Background blue 0–255.

#### Returns

`void`

#### Implementation of

[`CanvasSurface`](Interface.CanvasSurface.md).[`setCellBytesUnsafe`](Interface.CanvasSurface.md#setcellbytesunsafe)
