[**rune**](README.md)

***

[rune](README.md) / syncFirstPersonCamera

# Function: syncFirstPersonCamera()

```ts
function syncFirstPersonCamera(camera, view): void;
```

Defined in: draw/raycast/firstPersonCamera.ts:61

Copy a view's position and yaw onto a first-person camera. No-op on the yaw if
the camera isn't using a [RaycastProjection](Class.RaycastProjection.md).

## Parameters

### camera

[`Camera`](Class.Camera.md)

Camera to update.

### view

[`FirstPersonView`](Interface.FirstPersonView.md)

Source position and yaw.

## Returns

`void`
