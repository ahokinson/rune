[**rune**](README.md)

***

[rune](README.md) / Vector2

# Class: Vector2

Defined in: math/vector2.ts:30

Mutable 2D vector.

## Example

```ts
const v = new Vector2(3, 4)
v.length()              // 5
v.normalize().length()  // 1

// Hot-path: reuse a scratch vector instead of allocating.
const scratch = new Vector2()
Vector2.fromAngleInto(scratch, 0)  // scratch = (1, 0)
```

## Constructors

### Constructor

```ts
new Vector2(x?, y?): Vector2;
```

Defined in: math/vector2.ts:40

#### Parameters

##### x?

`number` = `0`

X component (default 0).

##### y?

`number` = `0`

Y component (default 0).

#### Returns

`Vector2`

## Properties

### x

```ts
x: number;
```

Defined in: math/vector2.ts:32

X component.

***

### y

```ts
y: number;
```

Defined in: math/vector2.ts:34

Y component.

***

### down

```ts
readonly static down: Vector2;
```

Defined in: math/vector2.ts:52

Shortcut for `(0, 1)` — screen-down is positive Y.

***

### left

```ts
readonly static left: Vector2;
```

Defined in: math/vector2.ts:54

Shortcut for `(-1, 0)`.

***

### one

```ts
readonly static one: Vector2;
```

Defined in: math/vector2.ts:48

Shortcut for `(1, 1)`.

***

### right

```ts
readonly static right: Vector2;
```

Defined in: math/vector2.ts:56

Shortcut for `(1, 0)`.

***

### up

```ts
readonly static up: Vector2;
```

Defined in: math/vector2.ts:50

Shortcut for `(0, -1)` — screen-up is negative Y.

***

### zero

```ts
readonly static zero: Vector2;
```

Defined in: math/vector2.ts:46

Shortcut for `(0, 0)`.

## Methods

### add()

```ts
add(other): Vector2;
```

Defined in: math/vector2.ts:137

Return `this + other` as a new vector.

#### Parameters

##### other

`Vector2`

#### Returns

`Vector2`

***

### addInPlace()

```ts
addInPlace(other): this;
```

Defined in: math/vector2.ts:142

Add `other` into `this` and return `this`.

#### Parameters

##### other

`Vector2`

#### Returns

`this`

***

### clone()

```ts
clone(): Vector2;
```

Defined in: math/vector2.ts:99

Return a copy of this vector.

#### Returns

`Vector2`

***

### copyFrom()

```ts
copyFrom(other): this;
```

Defined in: math/vector2.ts:121

Copy components from `other` into `this`.

#### Parameters

##### other

`Vector2`

#### Returns

`this`

`this`.

***

### distanceTo()

```ts
distanceTo(other): number;
```

Defined in: math/vector2.ts:207

Euclidean distance to `other`.

#### Parameters

##### other

`Vector2`

#### Returns

`number`

***

### distanceToSquared()

```ts
distanceToSquared(other): number;
```

Defined in: math/vector2.ts:214

Squared distance to `other` — cheaper for ordering comparisons.

#### Parameters

##### other

`Vector2`

#### Returns

`number`

***

### dot()

```ts
dot(other): number;
```

Defined in: math/vector2.ts:202

Dot product `this · other`.

#### Parameters

##### other

`Vector2`

#### Returns

`number`

***

### equals()

```ts
equals(other): boolean;
```

Defined in: math/vector2.ts:132

Component-wise equality.

#### Parameters

##### other

`Vector2`

#### Returns

`boolean`

`true` if both `x` and `y` match.

***

### length()

```ts
length(): number;
```

Defined in: math/vector2.ts:185

Euclidean length (`sqrt(x² + y²)`).

#### Returns

`number`

***

### lengthSquared()

```ts
lengthSquared(): number;
```

Defined in: math/vector2.ts:190

Squared length — cheaper than [length](#length) when comparing distances.

#### Returns

`number`

***

### lerp()

```ts
lerp(other, t): Vector2;
```

Defined in: math/vector2.ts:225

Linearly interpolate toward `other` by `t`, returning a new vector.

#### Parameters

##### other

`Vector2`

##### t

`number`

Interpolation factor (0 = `this`, 1 = `other`).

#### Returns

`Vector2`

***

### multiply()

```ts
multiply(other): Vector2;
```

Defined in: math/vector2.ts:161

Return the component-wise product `this * other` as a new vector.

#### Parameters

##### other

`Vector2`

#### Returns

`Vector2`

***

### multiplyInPlace()

```ts
multiplyInPlace(other): this;
```

Defined in: math/vector2.ts:166

Multiply `this` by `other` in place and return `this`.

#### Parameters

##### other

`Vector2`

#### Returns

`this`

***

### normalize()

```ts
normalize(): Vector2;
```

Defined in: math/vector2.ts:195

Return a unit-length copy. Returns `(0, 0)` if the length is zero.

#### Returns

`Vector2`

***

### rotate()

```ts
rotate(angleRadians): Vector2;
```

Defined in: math/vector2.ts:233

Return a copy rotated by `angleRadians` (counter-clockwise in standard
math space, clockwise in Y-down screen space).

#### Parameters

##### angleRadians

`number`

#### Returns

`Vector2`

***

### scale()

```ts
scale(factor): Vector2;
```

Defined in: math/vector2.ts:173

Return `this * factor` as a new vector.

#### Parameters

##### factor

`number`

#### Returns

`Vector2`

***

### scaleInPlace()

```ts
scaleInPlace(factor): this;
```

Defined in: math/vector2.ts:178

Scale `this` by `factor` in place and return `this`.

#### Parameters

##### factor

`number`

#### Returns

`this`

***

### set()

```ts
set(x, y): this;
```

Defined in: math/vector2.ts:110

Set both components and return `this` for chaining.

#### Parameters

##### x

`number`

New X.

##### y

`number`

New Y.

#### Returns

`this`

`this`.

***

### subtract()

```ts
subtract(other): Vector2;
```

Defined in: math/vector2.ts:149

Return `this - other` as a new vector.

#### Parameters

##### other

`Vector2`

#### Returns

`Vector2`

***

### subtractInPlace()

```ts
subtractInPlace(other): this;
```

Defined in: math/vector2.ts:154

Subtract `other` from `this` in place and return `this`.

#### Parameters

##### other

`Vector2`

#### Returns

`this`

***

### fromAngle()

```ts
static fromAngle(angleRadians, magnitude?): Vector2;
```

Defined in: math/vector2.ts:65

Construct a unit vector at `angleRadians`, optionally scaled by `magnitude`.

#### Parameters

##### angleRadians

`number`

Direction in radians (0 = +X, π/2 = +Y).

##### magnitude?

`number` = `1`

Length of the resulting vector (default 1).

#### Returns

`Vector2`

A new Vector2.

***

### fromAngleInto()

```ts
static fromAngleInto(
   out, 
   angleRadians, 
   magnitude?
): Vector2;
```

Defined in: math/vector2.ts:77

Write a unit vector at `angleRadians` into `out` (no allocation).

#### Parameters

##### out

`Vector2`

Target vector to fill.

##### angleRadians

`number`

Direction in radians.

##### magnitude?

`number` = `1`

Length (default 1).

#### Returns

`Vector2`

`out` for chaining.

***

### lerpInto()

```ts
static lerpInto(
   out, 
   a, 
   b, 
   t
): Vector2;
```

Defined in: math/vector2.ts:92

Linearly interpolate from `a` to `b` by `t`, writing the result into `out`.

#### Parameters

##### out

`Vector2`

Target vector.

##### a

`Vector2`

Start vector.

##### b

`Vector2`

End vector.

##### t

`number`

Interpolation factor (0 = `a`, 1 = `b`).

#### Returns

`Vector2`

`out` for chaining.
