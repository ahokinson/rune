[**rune**](README.md)

***

[rune](README.md) / Camera

# Class: Camera

Defined in: draw/camera.ts:26

View camera combining a world position with a projection.

## Example

```ts
const camera = new Camera(new Vector2(0, 0), new OrthographicProjection(1))
camera.follow(target, 0.1)        // ease toward target each update
camera.snapshot()                 // capture state for interpolation
camera.applyInterpolation(0.5)    // blend toward snapshot for rendering
camera.restoreInterpolation()     // restore true position after render
```

## Constructors

### Constructor

```ts
new Camera(position?, projection?): Camera;
```

Defined in: draw/camera.ts:42

#### Parameters

##### position?

[`Vector2`](Class.Vector2.md) = `...`

Initial world position (default origin).

##### projection?

[`Projection`](Interface.Projection.md) = `...`

Projection to use (default unit orthographic).

#### Returns

`Camera`

## Properties

### position

```ts
position: Vector2;
```

Defined in: draw/camera.ts:28

World-space position of the camera centre.

***

### projection

```ts
projection: Projection;
```

Defined in: draw/camera.ts:30

Projection used to map world points to screen space.

## Methods

### applyInterpolation()

```ts
applyInterpolation(alpha): boolean;
```

Defined in: draw/camera.ts:100

Overwrite the camera's render position with an interpolated blend of the
previous snapshot and the current state, for use between update and render.

#### Parameters

##### alpha

`number`

Blend factor in 0..1 (0 = previous, 1 = current).

#### Returns

`boolean`

`true` if interpolation was applied; `false` if no snapshot exists or `alpha` is 0.

***

### follow()

```ts
follow(target, smoothing?): void;
```

Defined in: draw/camera.ts:73

Ease the camera position toward `target` by `smoothing`.

#### Parameters

##### target

[`Vector2`](Class.Vector2.md)

Position to move toward.

##### smoothing?

`number` = `1`

Blend factor in 0..1 (0 = no move, 1 = snap; default 1).

#### Returns

`void`

***

### restoreInterpolation()

```ts
restoreInterpolation(): void;
```

Defined in: draw/camera.ts:121

Restore the true camera position after a rendering pass that called
[applyInterpolation](#applyinterpolation).

#### Returns

`void`

***

### screenToWorld()

```ts
screenToWorld(point): Vector2;
```

Defined in: draw/camera.ts:63

Unproject a screen-space point back to world space.

#### Parameters

##### point

[`Vector2`](Class.Vector2.md)

Screen coordinate.

#### Returns

[`Vector2`](Class.Vector2.md)

World-space coordinate.

***

### snapshot()

```ts
snapshot(): void;
```

Defined in: draw/camera.ts:83

Capture the current position (and yaw, for raycast projections) as the
previous-frame state for [applyInterpolation](#applyinterpolation).

#### Returns

`void`

***

### worldToScreen()

```ts
worldToScreen(point): Vector2;
```

Defined in: draw/camera.ts:53

Project a world-space point to screen space.

#### Parameters

##### point

[`Vector2`](Class.Vector2.md)

World coordinate.

#### Returns

[`Vector2`](Class.Vector2.md)

Screen-space coordinate.
