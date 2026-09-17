[**rune**](README.md)

***

[rune](README.md) / createFirstPersonCamera

# Function: createFirstPersonCamera()

```ts
function createFirstPersonCamera(options): Camera;
```

Defined in: draw/raycast/firstPersonCamera.ts:34

Create a first-person [Camera](Class.Camera.md) with a [RaycastProjection](Class.RaycastProjection.md) at the
origin, facing +X.

## Parameters

### options

[`FirstPersonCameraOptions`](Interface.FirstPersonCameraOptions.md)

Camera parameters; see [FirstPersonCameraOptions](Interface.FirstPersonCameraOptions.md).

## Returns

[`Camera`](Class.Camera.md)

A new [Camera](Class.Camera.md) ready to sync each frame.
