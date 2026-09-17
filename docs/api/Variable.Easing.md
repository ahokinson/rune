[**rune**](README.md)

***

[rune](README.md) / Easing

# Variable: Easing

```ts
const Easing: object;
```

Defined in: math/easing.ts:26

Collection of common easing functions.

Pick `*In` to start slow, `*Out` to end slow, `*InOut` for ease at both
ends. `bounce*` and `elastic*` add overshoot for springy motion.

## Type Declaration

### bounceIn()

```ts
readonly bounceIn(t): number;
```

Bouncing ease-in (reverse of [bounceOut](#bounceout)).

#### Parameters

##### t

`number`

#### Returns

`number`

### bounceOut()

```ts
readonly bounceOut(t): number;
```

Bouncing ease-out (ball-drops-then-bounces curve).

#### Parameters

##### t

`number`

#### Returns

`number`

### cubicIn()

```ts
readonly cubicIn(t): number;
```

Cubic ease-in: starts at zero velocity.

#### Parameters

##### t

`number`

#### Returns

`number`

### cubicInOut()

```ts
readonly cubicInOut(t): number;
```

Cubic ease-in-out.

#### Parameters

##### t

`number`

#### Returns

`number`

### cubicOut()

```ts
readonly cubicOut(t): number;
```

Cubic ease-out: ends at zero velocity.

#### Parameters

##### t

`number`

#### Returns

`number`

### elasticIn()

```ts
readonly elasticIn(t): number;
```

Elastic ease-in (springy overshoot from 0).

#### Parameters

##### t

`number`

#### Returns

`number`

### elasticOut()

```ts
readonly elasticOut(t): number;
```

Elastic ease-out (springy overshoot toward 1).

#### Parameters

##### t

`number`

#### Returns

`number`

### linear()

```ts
readonly linear(t): number;
```

Linear (no easing).

#### Parameters

##### t

`number`

#### Returns

`number`

### quadraticIn()

```ts
readonly quadraticIn(t): number;
```

Quadratic ease-in: starts at zero velocity.

#### Parameters

##### t

`number`

#### Returns

`number`

### quadraticInOut()

```ts
readonly quadraticInOut(t): number;
```

Quadratic ease-in-out.

#### Parameters

##### t

`number`

#### Returns

`number`

### quadraticOut()

```ts
readonly quadraticOut(t): number;
```

Quadratic ease-out: ends at zero velocity.

#### Parameters

##### t

`number`

#### Returns

`number`

### sineIn()

```ts
readonly sineIn(t): number;
```

Sine ease-in.

#### Parameters

##### t

`number`

#### Returns

`number`

### sineInOut()

```ts
readonly sineInOut(t): number;
```

Sine ease-in-out.

#### Parameters

##### t

`number`

#### Returns

`number`

### sineOut()

```ts
readonly sineOut(t): number;
```

Sine ease-out.

#### Parameters

##### t

`number`

#### Returns

`number`

## Example

```ts
const ease = Easing.cubicInOut
ease(0.5)  // 0.5
```
