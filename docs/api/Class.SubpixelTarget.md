[**rune**](README.md)

***

[rune](README.md) / SubpixelTarget

# Class: SubpixelTarget

Defined in: draw/mesh/subpixelTarget.ts:23

A persistent RGB + depth buffer at twice the terminal's vertical resolution,
the render target for [renderMesh](Function.renderMesh.md). Each terminal cell maps to two
stacked subpixels — row `2y` is the upper half, `2y+1` the lower — so a frame
is resolved to the canvas through the ▀ half block (foreground = upper colour,
background = lower). Allocate once per viewport and reuse: `clear` each frame,
`resolveTo` to blit. Depth follows LARGER = NEARER (it stores 1/zv), matching
the renderer's perspective-correct depth test.

## Constructors

### Constructor

```ts
new SubpixelTarget(width, cellRows): SubpixelTarget;
```

Defined in: draw/mesh/subpixelTarget.ts:43

#### Parameters

##### width

`number`

Subpixel width (terminal columns).

##### cellRows

`number`

Terminal rows; subpixel height is `cellRows * 2`.

#### Returns

`SubpixelTarget`

## Properties

### cellRows

```ts
readonly cellRows: number;
```

Defined in: draw/mesh/subpixelTarget.ts:29

Terminal rows this target resolves onto.

***

### color

```ts
readonly color: Uint8ClampedArray;
```

Defined in: draw/mesh/subpixelTarget.ts:31

RGB per subpixel, row-major: `(y * width + x) * 3`.

***

### depth

```ts
readonly depth: Float32Array;
```

Defined in: draw/mesh/subpixelTarget.ts:33

Depth (1/zv) per subpixel; cleared to 0 (infinitely far) each frame.

***

### height

```ts
readonly height: number;
```

Defined in: draw/mesh/subpixelTarget.ts:27

Subpixel rows = 2 × terminal rows.

***

### width

```ts
readonly width: number;
```

Defined in: draw/mesh/subpixelTarget.ts:25

Subpixel width (terminal columns).

## Methods

### clear()

```ts
clear(background): void;
```

Defined in: draw/mesh/subpixelTarget.ts:58

Reset every subpixel to the background colour and clear depth. Call once at
the start of a frame before drawing.

#### Parameters

##### background

[`Color`](Class.Color.md)

Clear colour.

#### Returns

`void`

***

### resolveTo()

```ts
resolveTo(canvas): void;
```

Defined in: draw/mesh/subpixelTarget.ts:95

Pack each upper/lower subpixel pair into one ▀ cell on `canvas`. The canvas
must be at least `width × cellRows`.

#### Parameters

##### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

Target canvas.

#### Returns

`void`

***

### setUnsafe()

```ts
setUnsafe(
   x, 
   y, 
   r, 
   g, 
   b
): void;
```

Defined in: draw/mesh/subpixelTarget.ts:82

Write an opaque RGB subpixel without bounds or depth checks. The caller owns
clipping and the depth test (renderMesh does both before calling this).

#### Parameters

##### x

`number`

Subpixel column.

##### y

`number`

Subpixel row.

##### r

`number`

Red (0–255).

##### g

`number`

Green (0–255).

##### b

`number`

Blue (0–255).

#### Returns

`void`
