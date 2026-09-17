[**rune**](README.md)

***

[rune](README.md) / OrbitControl

# Class: OrbitControl

Defined in: geom/orbitControl.ts:60

Click-and-drag "turntable" orbit for 3D viewers. It owns the drag/spin/resume
state machine and exposes the resulting absolute `yaw` and `pitch`; callers
read those each frame and apply them to whatever transform or projection they
drive (a model matrix, a camera position, a sphere view). While dragging, the
auto-spin is suspended and the angles track the cursor relative to the anchor
captured on press; after release it pauses briefly, then resumes spinning and
glides the tilt back to rest.

## Example

```ts
const ctrl = new OrbitControl(opts)
ctrl.update(mouse, deltaMs)
modelMatrix.rotateY(ctrl.yaw).rotateX(ctrl.pitch)
```

## Constructors

### Constructor

```ts
new OrbitControl(options): OrbitControl;
```

Defined in: geom/orbitControl.ts:77

#### Parameters

##### options

[`OrbitOptions`](Interface.OrbitOptions.md)

Orbit configuration.

#### Returns

`OrbitControl`

## Properties

### dragging

```ts
dragging: boolean = false;
```

Defined in: geom/orbitControl.ts:66

Whether a drag is currently in progress.

***

### pitch

```ts
pitch: number;
```

Defined in: geom/orbitControl.ts:64

Current pitch angle in radians.

***

### yaw

```ts
yaw: number = 0;
```

Defined in: geom/orbitControl.ts:62

Current yaw angle in radians.

## Methods

### update()

```ts
update(
   mouse, 
   deltaMilliseconds, 
   paused?
): void;
```

Defined in: geom/orbitControl.ts:90

Advance one fixed tick. Call once per tick with the same delta the sim uses.
`paused` freezes the auto-spin and tilt ease but still allows dragging, so a
viewer's pause toggle can hold the pose while the user keeps orbiting by hand.

#### Parameters

##### mouse

[`MouseSnapshot`](Interface.MouseSnapshot.md)

Current mouse snapshot.

##### deltaMilliseconds

`number`

Tick delta in milliseconds (matches the sim tick).

##### paused?

`boolean` = `false`

Freeze auto-spin and tilt ease but keep drag (default false).

#### Returns

`void`
