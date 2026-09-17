[**rune**](README.md)

***

[rune](README.md) / Projection

# Interface: Projection

Defined in: draw/raycast/projection.ts:14

Project world points to screen space and back, driven by a [Camera](Class.Camera.md).

## Methods

### screenToWorld()

```ts
screenToWorld(point, camera): Vector2;
```

Defined in: draw/raycast/projection.ts:16

#### Parameters

##### point

[`Vector2`](Class.Vector2.md)

##### camera

[`Camera`](Class.Camera.md)

#### Returns

[`Vector2`](Class.Vector2.md)

***

### worldToScreen()

```ts
worldToScreen(point, camera): Vector2;
```

Defined in: draw/raycast/projection.ts:15

#### Parameters

##### point

[`Vector2`](Class.Vector2.md)

##### camera

[`Camera`](Class.Camera.md)

#### Returns

[`Vector2`](Class.Vector2.md)
