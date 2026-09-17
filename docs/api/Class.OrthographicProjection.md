[**rune**](README.md)

***

[rune](README.md) / OrthographicProjection

# Class: OrthographicProjection

Defined in: draw/raycast/projection.ts:23

Orthographic projection: scales world space by `zoom` around the camera
position with no perspective.

## Implements

- [`Projection`](Interface.Projection.md)

## Constructors

### Constructor

```ts
new OrthographicProjection(zoom?): OrthographicProjection;
```

Defined in: draw/raycast/projection.ts:30

#### Parameters

##### zoom?

`number` = `1`

Zoom factor (default 1).

#### Returns

`OrthographicProjection`

## Properties

### zoom

```ts
zoom: number;
```

Defined in: draw/raycast/projection.ts:25

Zoom factor; world units are multiplied by this to get screen pixels.

## Methods

### screenToWorld()

```ts
screenToWorld(point, camera): Vector2;
```

Defined in: draw/raycast/projection.ts:38

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

### worldToScreen()

```ts
worldToScreen(point, camera): Vector2;
```

Defined in: draw/raycast/projection.ts:34

#### Parameters

##### point

[`Vector2`](Class.Vector2.md)

##### camera

[`Camera`](Class.Camera.md)

#### Returns

[`Vector2`](Class.Vector2.md)

#### Implementation of

[`Projection`](Interface.Projection.md).[`worldToScreen`](Interface.Projection.md#worldtoscreen)
