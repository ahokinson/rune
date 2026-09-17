[**rune**](README.md)

***

[rune](README.md) / Quaternion

# Class: Quaternion

Defined in: math/quaternion.ts:24

A unit quaternion for 3D orientation. Preferred over Euler angles for anything
that accumulates rotation over time — it integrates angular velocity without
gimbal lock and stays numerically stable under renormalization. Pairs with
Matrix4.composeQuaternionInto to build a model matrix for rendering.

## Example

```ts
const q = new Quaternion()
q.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2)  // 90° about Y
const out = new Vector3()
q.rotateVectorInto(out, new Vector3(1, 0, 0))  // out ≈ (0, 0, -1)
```

## Constructors

### Constructor

```ts
new Quaternion(
   x?, 
   y?, 
   z?, 
   w?
): Quaternion;
```

Defined in: math/quaternion.ts:40

#### Parameters

##### x?

`number` = `0`

X component (default 0).

##### y?

`number` = `0`

Y component (default 0).

##### z?

`number` = `0`

Z component (default 0).

##### w?

`number` = `1`

Scalar part (default 1, the identity rotation).

#### Returns

`Quaternion`

## Properties

### w

```ts
w: number;
```

Defined in: math/quaternion.ts:32

Scalar (real) part.

***

### x

```ts
x: number;
```

Defined in: math/quaternion.ts:26

X component of the vector part.

***

### y

```ts
y: number;
```

Defined in: math/quaternion.ts:28

Y component of the vector part.

***

### z

```ts
z: number;
```

Defined in: math/quaternion.ts:30

Z component of the vector part.

***

### identity

```ts
readonly static identity: Quaternion;
```

Defined in: math/quaternion.ts:48

The identity rotation (no rotation).

## Methods

### clone()

```ts
clone(): Quaternion;
```

Defined in: math/quaternion.ts:51

Return a copy of this quaternion.

#### Returns

`Quaternion`

***

### copyFrom()

```ts
copyFrom(other): this;
```

Defined in: math/quaternion.ts:77

Copy components from `other` into `this`.

#### Parameters

##### other

`Quaternion`

#### Returns

`this`

`this`.

***

### integrateInPlace()

```ts
integrateInPlace(angularVelocity, deltaSeconds): this;
```

Defined in: math/quaternion.ts:182

Advance the orientation by an angular velocity (world-frame, radians/sec)
over a time step, then renormalize. Uses q += 0.5·(ω as a pure quaternion)·q·Δt.

#### Parameters

##### angularVelocity

[`Vector3`](Class.Vector3.md)

World-frame angular velocity in radians/sec.

##### deltaSeconds

`number`

Time step in seconds.

#### Returns

`this`

`this` (renormalized).

***

### lengthSquared()

```ts
lengthSquared(): number;
```

Defined in: math/quaternion.ts:129

Squared length — cheaper than `Math.sqrt` when only comparing magnitudes.

#### Returns

`number`

`x² + y² + z² + w²`.

***

### multiplyInto()

```ts
multiplyInto(a, b): this;
```

Defined in: math/quaternion.ts:141

Hamilton product into `this = a ⊗ b`. Composing rotations: the result applies b
first, then a. Safe to alias (reads inputs before writing).

#### Parameters

##### a

`Quaternion`

Left operand.

##### b

`Quaternion`

Right operand.

#### Returns

`this`

`this`.

***

### normalizeInPlace()

```ts
normalizeInPlace(): this;
```

Defined in: math/quaternion.ts:163

Scale to unit length. Returns the identity if the length is zero.

#### Returns

`this`

`this`.

***

### rotateVectorInto()

```ts
rotateVectorInto(out, v): Vector3;
```

Defined in: math/quaternion.ts:202

Rotate a vector by this quaternion: out = q·v·q⁻¹. Out may alias the input.

#### Parameters

##### out

[`Vector3`](Class.Vector3.md)

Target vector to write.

##### v

[`Vector3`](Class.Vector3.md)

Vector to rotate.

#### Returns

[`Vector3`](Class.Vector3.md)

`out` for chaining.

***

### rotateVectorInverseInto()

```ts
rotateVectorInverseInto(out, v): Vector3;
```

Defined in: math/quaternion.ts:220

Rotate a vector by the inverse orientation (the conjugate, since unit). Out
may alias the input.

#### Parameters

##### out

[`Vector3`](Class.Vector3.md)

Target vector to write.

##### v

[`Vector3`](Class.Vector3.md)

Vector to rotate.

#### Returns

[`Vector3`](Class.Vector3.md)

`out` for chaining.

***

### set()

```ts
set(
   x, 
   y, 
   z, 
   w
): this;
```

Defined in: math/quaternion.ts:64

Set all four components and return `this` for chaining.

#### Parameters

##### x

`number`

X component.

##### y

`number`

Y component.

##### z

`number`

Z component.

##### w

`number`

Scalar part.

#### Returns

`this`

`this`.

***

### setFromAxisAngle()

```ts
setFromAxisAngle(axis, radians): this;
```

Defined in: math/quaternion.ts:92

Rotation of `radians` about a (not necessarily unit) axis.

#### Parameters

##### axis

[`Vector3`](Class.Vector3.md)

Rotation axis (need not be unit length).

##### radians

`number`

Rotation angle in radians.

#### Returns

`this`

`this`.

***

### setFromDirection()

```ts
setFromDirection(dir, localAxis?): this;
```

Defined in: math/quaternion.ts:239

Set this quaternion to the rotation that takes `localAxis` (default +Y)
onto `dir` (assumed unit). Handles the parallel and anti-parallel cases.

#### Parameters

##### dir

[`Vector3`](Class.Vector3.md)

Target direction (assumed unit length).

##### localAxis?

[`Vector3`](Class.Vector3.md) = `UP`

Axis to align onto `dir` (default +Y).

#### Returns

`this`

`this`.

***

### setFromEuler()

```ts
setFromEuler(
   x, 
   y, 
   z
): this;
```

Defined in: math/quaternion.ts:109

XYZ Euler angles (radians), applied X then Y then Z — matching the rotation
order of Matrix4.composeInto, so the two agree for the same angles.

#### Parameters

##### x

`number`

Rotation about X in radians.

##### y

`number`

Rotation about Y in radians.

##### z

`number`

Rotation about Z in radians.

#### Returns

`this`

`this`.
