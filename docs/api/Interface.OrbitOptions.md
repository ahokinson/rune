[**rune**](README.md)

***

[rune](README.md) / OrbitOptions

# Interface: OrbitOptions

Defined in: geom/orbitControl.ts:16

Configuration for an [OrbitControl](Class.OrbitControl.md). All angles are in radians; drag
sensitivities are signed so a caller can flip which way a drag turns the view.

## Properties

### canStartDrag?

```ts
optional canStartDrag?: (x, y) => boolean;
```

Defined in: geom/orbitControl.ts:41

Optional gate: a drag may only begin where this returns true (e.g. on a
globe disc). Omitted means a drag can start anywhere.

#### Parameters

##### x

`number`

##### y

`number`

#### Returns

`boolean`

***

### maxPitch

```ts
maxPitch: number;
```

Defined in: geom/orbitControl.ts:30

Upper pitch clamp while dragging (see [OrbitOptions.minPitch](#minpitch)).

***

### minPitch

```ts
minPitch: number;
```

Defined in: geom/orbitControl.ts:28

Absolute pitch clamp while dragging, given outright (independent of
`restPitch`) so a viewer can rest at a non-zero tilt while clamping about
any centre.

***

### pitchSensitivity

```ts
pitchSensitivity: number;
```

Defined in: geom/orbitControl.ts:20

Radians of pitch subtracted per cell of vertical cursor travel while dragging.

***

### restPitch

```ts
restPitch: number;
```

Defined in: geom/orbitControl.ts:22

Resting pitch the tilt eases back to once the auto-spin resumes.

***

### resumeDelayTicks

```ts
resumeDelayTicks: number;
```

Defined in: geom/orbitControl.ts:34

Ticks to hold still after a drag is released before the auto-spin resumes.

***

### spinPerSecond

```ts
spinPerSecond: number;
```

Defined in: geom/orbitControl.ts:32

Auto-spin rate about the yaw axis, radians per second.

***

### tiltResumeEase

```ts
tiltResumeEase: number;
```

Defined in: geom/orbitControl.ts:36

Per-tick ease factor gliding the pitch back to `restPitch` once spinning.

***

### yawSensitivity

```ts
yawSensitivity: number;
```

Defined in: geom/orbitControl.ts:18

Radians of yaw added per cell of horizontal cursor travel while dragging.
