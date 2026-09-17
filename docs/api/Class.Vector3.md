[**rune**](README.md)

***

[rune](README.md) / Vector3

# Class: Vector3

Defined in: math/vector3.ts:23

Mutable 3D vector.

## Example

```ts
const v = new Vector3(1, 2, 2)
v.length()              // 3
v.normalize().length()  // 1

const out = new Vector3()
Vector3.lerpInto(out, new Vector3(0, 0, 0), new Vector3(3, 3, 3), 0.5)  // out = (1.5, 1.5, 1.5)
```

## Constructors

### Constructor

```ts
new Vector3(
   x?, 
   y?, 
   z?
): Vector3;
```

Defined in: math/vector3.ts:36

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

#### Returns

`Vector3`

## Properties

### x

```ts
x: number;
```

Defined in: math/vector3.ts:25

X component.

***

### y

```ts
y: number;
```

Defined in: math/vector3.ts:27

Y component.

***

### z

```ts
z: number;
```

Defined in: math/vector3.ts:29

Z component.

***

### back

```ts
readonly static back: Vector3;
```

Defined in: math/vector3.ts:57

Shortcut for `(0, 0, -1)`.

***

### down

```ts
readonly static down: Vector3;
```

Defined in: math/vector3.ts:49

Shortcut for `(0, 1, 0)` — screen-down is positive Y.

***

### forward

```ts
readonly static forward: Vector3;
```

Defined in: math/vector3.ts:55

Shortcut for `(0, 0, 1)`.

***

### left

```ts
readonly static left: Vector3;
```

Defined in: math/vector3.ts:51

Shortcut for `(-1, 0, 0)`.

***

### one

```ts
readonly static one: Vector3;
```

Defined in: math/vector3.ts:45

Shortcut for `(1, 1, 1)`.

***

### right

```ts
readonly static right: Vector3;
```

Defined in: math/vector3.ts:53

Shortcut for `(1, 0, 0)`.

***

### up

```ts
readonly static up: Vector3;
```

Defined in: math/vector3.ts:47

Shortcut for `(0, -1, 0)` — screen-up is negative Y.

***

### zero

```ts
readonly static zero: Vector3;
```

Defined in: math/vector3.ts:43

Shortcut for `(0, 0, 0)`.

## Methods

### add()

```ts
add(other): Vector3;
```

Defined in: math/vector3.ts:117

Return `this + other` as a new vector.

#### Parameters

##### other

`Vector3`

#### Returns

`Vector3`

***

### addInPlace()

```ts
addInPlace(other): this;
```

Defined in: math/vector3.ts:122

Add `other` into `this` and return `this`.

#### Parameters

##### other

`Vector3`

#### Returns

`this`

***

### clone()

```ts
clone(): Vector3;
```

Defined in: math/vector3.ts:76

Return a copy of this vector.

#### Returns

`Vector3`

***

### copyFrom()

```ts
copyFrom(other): this;
```

Defined in: math/vector3.ts:100

Copy components from `other` into `this`.

#### Parameters

##### other

`Vector3`

#### Returns

`this`

`this`.

***

### cross()

```ts
cross(other): Vector3;
```

Defined in: math/vector3.ts:191

Cross product `this × other` as a new vector.

#### Parameters

##### other

`Vector3`

#### Returns

`Vector3`

***

### distanceTo()

```ts
distanceTo(other): number;
```

Defined in: math/vector3.ts:200

Euclidean distance to `other`.

#### Parameters

##### other

`Vector3`

#### Returns

`number`

***

### distanceToSquared()

```ts
distanceToSquared(other): number;
```

Defined in: math/vector3.ts:208

Squared distance to `other` — cheaper for ordering comparisons.

#### Parameters

##### other

`Vector3`

#### Returns

`number`

***

### dot()

```ts
dot(other): number;
```

Defined in: math/vector3.ts:186

Dot product `this · other`.

#### Parameters

##### other

`Vector3`

#### Returns

`number`

***

### equals()

```ts
equals(other): boolean;
```

Defined in: math/vector3.ts:112

Component-wise equality.

#### Parameters

##### other

`Vector3`

#### Returns

`boolean`

`true` if all components match.

***

### length()

```ts
length(): number;
```

Defined in: math/vector3.ts:169

Euclidean length (`sqrt(x² + y² + z²)`).

#### Returns

`number`

***

### lengthSquared()

```ts
lengthSquared(): number;
```

Defined in: math/vector3.ts:174

Squared length — cheaper than [length](#length) when comparing distances.

#### Returns

`number`

***

### lerp()

```ts
lerp(other, t): Vector3;
```

Defined in: math/vector3.ts:220

Linearly interpolate toward `other` by `t`, returning a new vector.

#### Parameters

##### other

`Vector3`

##### t

`number`

Interpolation factor (0 = `this`, 1 = `other`).

#### Returns

`Vector3`

***

### multiply()

```ts
multiply(other): Vector3;
```

Defined in: math/vector3.ts:143

Return the component-wise product `this * other` as a new vector.

#### Parameters

##### other

`Vector3`

#### Returns

`Vector3`

***

### multiplyInPlace()

```ts
multiplyInPlace(other): this;
```

Defined in: math/vector3.ts:148

Multiply `this` by `other` in place and return `this`.

#### Parameters

##### other

`Vector3`

#### Returns

`this`

***

### normalize()

```ts
normalize(): Vector3;
```

Defined in: math/vector3.ts:179

Return a unit-length copy. Returns `(0, 0, 0)` if the length is zero.

#### Returns

`Vector3`

***

### scale()

```ts
scale(factor): Vector3;
```

Defined in: math/vector3.ts:156

Return `this * factor` as a new vector.

#### Parameters

##### factor

`number`

#### Returns

`Vector3`

***

### scaleInPlace()

```ts
scaleInPlace(factor): this;
```

Defined in: math/vector3.ts:161

Scale `this` by `factor` in place and return `this`.

#### Parameters

##### factor

`number`

#### Returns

`this`

***

### set()

```ts
set(
   x, 
   y, 
   z
): this;
```

Defined in: math/vector3.ts:88

Set all components and return `this` for chaining.

#### Parameters

##### x

`number`

New X.

##### y

`number`

New Y.

##### z

`number`

New Z.

#### Returns

`this`

`this`.

***

### subtract()

```ts
subtract(other): Vector3;
```

Defined in: math/vector3.ts:130

Return `this - other` as a new vector.

#### Parameters

##### other

`Vector3`

#### Returns

`Vector3`

***

### subtractInPlace()

```ts
subtractInPlace(other): this;
```

Defined in: math/vector3.ts:135

Subtract `other` from `this` in place and return `this`.

#### Parameters

##### other

`Vector3`

#### Returns

`this`

***

### lerpInto()

```ts
static lerpInto(
   out, 
   a, 
   b, 
   t
): Vector3;
```

Defined in: math/vector3.ts:68

Linearly interpolate from `a` to `b` by `t`, writing the result into `out`.

#### Parameters

##### out

`Vector3`

Target vector.

##### a

`Vector3`

Start vector.

##### b

`Vector3`

End vector.

##### t

`number`

Interpolation factor (0 = `a`, 1 = `b`).

#### Returns

`Vector3`

`out` for chaining.
