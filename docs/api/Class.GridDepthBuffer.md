[**rune**](README.md)

***

[rune](README.md) / GridDepthBuffer

# Class: GridDepthBuffer

Defined in: draw/raycast/gridDepthBuffer.ts:19

Per-pixel depth buffer using the LARGER = NEARER convention.

Used by the 3D geometry pass to resolve visibility between surfaces,
billboards, and markers drawn into the same frame.

## Constructors

### Constructor

```ts
new GridDepthBuffer(width?, height?): GridDepthBuffer;
```

Defined in: draw/raycast/gridDepthBuffer.ts:30

Create a new buffer, optionally pre-sized.

#### Parameters

##### width?

`number` = `0`

Initial width in cells (default 0; call [resize](#resize) later).

##### height?

`number` = `0`

Initial height in cells (default 0).

#### Returns

`GridDepthBuffer`

## Accessors

### height

#### Get Signature

```ts
get height(): number;
```

Defined in: draw/raycast/gridDepthBuffer.ts:40

Buffer height in cells.

##### Returns

`number`

***

### width

#### Get Signature

```ts
get width(): number;
```

Defined in: draw/raycast/gridDepthBuffer.ts:35

Buffer width in cells.

##### Returns

`number`

## Methods

### clear()

```ts
clear(value?): void;
```

Defined in: draw/raycast/gridDepthBuffer.ts:59

Fill the buffer with `value` (default -Infinity, meaning "nothing nearer").

#### Parameters

##### value?

`number` = `Number.NEGATIVE_INFINITY`

#### Returns

`void`

***

### get()

```ts
get(x, y): number;
```

Defined in: draw/raycast/gridDepthBuffer.ts:70

Read the depth at (x, y). Out-of-bounds reads return -Infinity.

#### Parameters

##### x

`number`

Column index.

##### y

`number`

Row index.

#### Returns

`number`

Stored depth, or -Infinity if (x, y) is outside the buffer.

***

### resize()

```ts
resize(width, height): void;
```

Defined in: draw/raycast/gridDepthBuffer.ts:48

Reallocates the backing store only when the size actually changes, so it can
be called every frame with the canvas dimensions cheaply.

#### Parameters

##### width

`number`

##### height

`number`

#### Returns

`void`

***

### testNearer()

```ts
testNearer(
   x, 
   y, 
   depth
): boolean;
```

Defined in: draw/raycast/gridDepthBuffer.ts:88

Would a fragment at `depth` be visible — i.e. at or in front of what's stored?
Uses >= so co-planar geometry (a marker sitting on the surface that wrote this
cell) is not self-occluded. Off-bounds reads are -Infinity, so any candidate
outside the buffer is considered visible.

#### Parameters

##### x

`number`

Column index.

##### y

`number`

Row index.

##### depth

`number`

Candidate depth (LARGER = NEARER).

#### Returns

`boolean`

`true` if the fragment passes the depth test.

***

### writeIfNearer()

```ts
writeIfNearer(
   x, 
   y, 
   depth
): boolean;
```

Defined in: draw/raycast/gridDepthBuffer.ts:102

Write `depth` if it is strictly nearer (larger) than what's stored.

#### Parameters

##### x

`number`

Column index.

##### y

`number`

Row index.

##### depth

`number`

Candidate depth (LARGER = NEARER).

#### Returns

`boolean`

`true` if the depth won the test and was written.
