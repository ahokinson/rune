[**rune**](README.md)

***

[rune](README.md) / RaycastProjection

# Class: RaycastProjection

Defined in: draw/raycast/projection.ts:63

First-person raycast projection. Derives the forward and right basis vectors
and the camera-plane magnitude from `yaw` and `fieldOfView`, caching them
until either changes. Provides per-column view rays for the DDA marcher.

## Implements

- [`Projection`](Interface.Projection.md)

## Constructors

### Constructor

```ts
new RaycastProjection(options?): RaycastProjection;
```

Defined in: draw/raycast/projection.ts:82

#### Parameters

##### options?

[`RaycastProjectionOptions`](Interface.RaycastProjectionOptions.md) = `{}`

Projection parameters; see [RaycastProjectionOptions](Interface.RaycastProjectionOptions.md).

#### Returns

`RaycastProjection`

## Properties

### pitch

```ts
pitch: number;
```

Defined in: draw/raycast/projection.ts:73

Vertical pitch in radians.

***

### viewportHeight

```ts
viewportHeight: number;
```

Defined in: draw/raycast/projection.ts:77

Viewport height in cells.

***

### viewportWidth

```ts
viewportWidth: number;
```

Defined in: draw/raycast/projection.ts:75

Viewport width in cells.

## Accessors

### fieldOfView

#### Get Signature

```ts
get fieldOfView(): number;
```

Defined in: draw/raycast/projection.ts:104

Horizontal field of view in radians.

##### Returns

`number`

#### Set Signature

```ts
set fieldOfView(value): void;
```

Defined in: draw/raycast/projection.ts:109

##### Parameters

###### value

`number`

New field of view in radians.

##### Returns

`void`

***

### forwardX

#### Get Signature

```ts
get forwardX(): number;
```

Defined in: draw/raycast/projection.ts:128

Cached forward basis X component.

##### Returns

`number`

***

### forwardY

#### Get Signature

```ts
get forwardY(): number;
```

Defined in: draw/raycast/projection.ts:134

Cached forward basis Y component.

##### Returns

`number`

***

### planeMagnitude

#### Get Signature

```ts
get planeMagnitude(): number;
```

Defined in: draw/raycast/projection.ts:152

Cached camera-plane magnitude (`tan(fieldOfView / 2)`).

##### Returns

`number`

***

### rightX

#### Get Signature

```ts
get rightX(): number;
```

Defined in: draw/raycast/projection.ts:140

Cached right basis X component.

##### Returns

`number`

***

### rightY

#### Get Signature

```ts
get rightY(): number;
```

Defined in: draw/raycast/projection.ts:146

Cached right basis Y component.

##### Returns

`number`

***

### yaw

#### Get Signature

```ts
get yaw(): number;
```

Defined in: draw/raycast/projection.ts:91

Facing angle in radians (0 = +X).

##### Returns

`number`

#### Set Signature

```ts
set yaw(value): void;
```

Defined in: draw/raycast/projection.ts:96

##### Parameters

###### value

`number`

New yaw in radians.

##### Returns

`void`

## Methods

### forward()

```ts
forward(): Vector2;
```

Defined in: draw/raycast/projection.ts:158

Return the forward basis vector as a new [Vector2](Class.Vector2.md).

#### Returns

[`Vector2`](Class.Vector2.md)

***

### forwardInto()

```ts
forwardInto(out): Vector2;
```

Defined in: draw/raycast/projection.ts:169

Write the forward basis vector into `out` (no allocation).

#### Parameters

##### out

[`Vector2`](Class.Vector2.md)

Target vector.

#### Returns

[`Vector2`](Class.Vector2.md)

`out` for chaining.

***

### right()

```ts
right(): Vector2;
```

Defined in: draw/raycast/projection.ts:177

Return the right basis vector as a new [Vector2](Class.Vector2.md).

#### Returns

[`Vector2`](Class.Vector2.md)

***

### rightInto()

```ts
rightInto(out): Vector2;
```

Defined in: draw/raycast/projection.ts:188

Write the right basis vector into `out` (no allocation).

#### Parameters

##### out

[`Vector2`](Class.Vector2.md)

Target vector.

#### Returns

[`Vector2`](Class.Vector2.md)

`out` for chaining.

***

### screenToWorld()

```ts
screenToWorld(point, camera): Vector2;
```

Defined in: draw/raycast/projection.ts:242

#### Parameters

##### point

[`Vector2`](Class.Vector2.md)

##### camera

[`Camera`](Class.Camera.md)

#### Returns

[`Vector2`](Class.Vector2.md)

#### Implementation of

[`Projection`](Interface.Projection.md).[`screenToWorld`](Interface.Projection.md#screentoworld)

***

### viewRayForColumn()

```ts
viewRayForColumn(column, columnCount): Vector2;
```

Defined in: draw/raycast/projection.ts:203

Return the view-ray direction for screen `column` (camera-space X in [-1, 1]
mapped across `columnCount`) as a new [Vector2](Class.Vector2.md).

#### Parameters

##### column

`number`

Screen column index.

##### columnCount

`number`

Total screen columns.

#### Returns

[`Vector2`](Class.Vector2.md)

A new ray direction.

***

### viewRayForColumnInto()

```ts
viewRayForColumnInto(
   column, 
   columnCount, 
   out
): Vector2;
```

Defined in: draw/raycast/projection.ts:220

Write the view-ray direction for screen `column` into `out` (no allocation).

#### Parameters

##### column

`number`

Screen column index.

##### columnCount

`number`

Total screen columns.

##### out

[`Vector2`](Class.Vector2.md)

Target vector.

#### Returns

[`Vector2`](Class.Vector2.md)

`out` for chaining.

***

### worldToScreen()

```ts
worldToScreen(point, camera): Vector2;
```

Defined in: draw/raycast/projection.ts:228

#### Parameters

##### point

[`Vector2`](Class.Vector2.md)

##### camera

[`Camera`](Class.Camera.md)

#### Returns

[`Vector2`](Class.Vector2.md)

#### Implementation of

[`Projection`](Interface.Projection.md).[`worldToScreen`](Interface.Projection.md#worldtoscreen)
