[**rune**](README.md)

***

[rune](README.md) / Matrix4

# Class: Matrix4

Defined in: math/matrix4.ts:27

A column-major 4×4 matrix, the model transform fed to the triangle rasterizer
(renderMesh). Storage is 16 contiguous numbers; element (row r, column c) lives
at index c * 4 + r, so columns 0–2 are the basis axes and column 3 is the
translation. Follows Vector3's `*Into(out)` idiom: every operation writes into
an existing matrix/vector so a render loop never allocates.

## Example

```ts
const m = new Matrix4()
const t = new Vector3(1, 2, 3)
m.composeInto(t, new Vector3(0, 0, 0), new Vector3(1, 1, 1))
const out = new Vector3()
m.transformPointInto(out, 0, 0, 0)  // out = (1, 2, 3)
```

## Constructors

### Constructor

```ts
new Matrix4(): Matrix4;
```

Defined in: math/matrix4.ts:35

Create a new identity matrix.

#### Returns

`Matrix4`

## Properties

### elements

```ts
readonly elements: Float64Array;
```

Defined in: math/matrix4.ts:32

Column-major: [m00,m10,m20,m30, m01,m11,m21,m31, ...]. Float64 so chained
composes keep enough precision for tight test tolerances.

## Methods

### composeInto()

```ts
composeInto(
   translation, 
   rotationEuler, 
   scale
): this;
```

Defined in: math/matrix4.ts:129

Build T · R · S from a translation, an XYZ Euler rotation (radians, applied
X then Y then Z), and a per-axis scale. The rotation columns are scaled in
place, so the result transforms a point as translate(rotate(scale(p))).

#### Parameters

##### translation

[`Vector3`](Class.Vector3.md)

Translation component (column 3).

##### rotationEuler

[`Vector3`](Class.Vector3.md)

XYZ Euler rotation in radians (X then Y then Z).

##### scale

[`Vector3`](Class.Vector3.md)

Per-axis scale.

#### Returns

`this`

`this` for chaining.

***

### composeQuaternionInto()

```ts
composeQuaternionInto(
   translation, 
   rotation, 
   scale
): this;
```

Defined in: math/matrix4.ts:178

Build T · R · S from a translation, a (unit) quaternion orientation, and a
per-axis scale — the quaternion counterpart of composeInto, for transforms
that track orientation as a quaternion rather than Euler angles.

#### Parameters

##### translation

[`Vector3`](Class.Vector3.md)

Translation component (column 3).

##### rotation

[`Quaternion`](Class.Quaternion.md)

Unit quaternion orientation.

##### scale

[`Vector3`](Class.Vector3.md)

Per-axis scale.

#### Returns

`this`

`this` for chaining.

***

### copyFrom()

```ts
copyFrom(other): this;
```

Defined in: math/matrix4.ts:72

Copy `other`'s elements into `this`.

#### Parameters

##### other

`Matrix4`

Matrix to copy from.

#### Returns

`this`

`this` for chaining.

***

### identity()

```ts
identity(): this;
```

Defined in: math/matrix4.ts:45

Reset to the identity matrix.

#### Returns

`this`

`this` for chaining.

***

### multiplyInto()

```ts
multiplyInto(a, b): this;
```

Defined in: math/matrix4.ts:85

Set `this = a · b` (column-major). Safe to alias `this` with `a` or `b`; the
16 products are read out of locals before any write-back.

#### Parameters

##### a

`Matrix4`

Left operand.

##### b

`Matrix4`

Right operand.

#### Returns

`this`

`this` for chaining.

***

### transformDirectionInto()

```ts
transformDirectionInto(
   out, 
   x, 
   y, 
   z
): Vector3;
```

Defined in: math/matrix4.ts:240

Transform a direction (w = 0): the 3×3 linear part only, so translation is
ignored. Note this is the plain upper-left block, correct for normals only
under rotation + uniform scale (the meshes here use uniform scale).

#### Parameters

##### out

[`Vector3`](Class.Vector3.md)

Target vector to write.

##### x

`number`

Input X.

##### y

`number`

Input Y.

##### z

`number`

Input Z.

#### Returns

[`Vector3`](Class.Vector3.md)

`out` for chaining.

***

### transformPointInto()

```ts
transformPointInto(
   out, 
   x, 
   y, 
   z
): Vector3;
```

Defined in: math/matrix4.ts:219

Transform a position (w = 1): rotation/scale columns plus the translation.

#### Parameters

##### out

[`Vector3`](Class.Vector3.md)

Target vector to write.

##### x

`number`

Input X.

##### y

`number`

Input Y.

##### z

`number`

Input Z.

#### Returns

[`Vector3`](Class.Vector3.md)

`out` for chaining.
