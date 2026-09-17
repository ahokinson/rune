[**rune**](README.md)

***

[rune](README.md) / Angle

# Variable: Angle

```ts
const Angle: object;
```

Defined in: math/angle.ts:18

Radians/degrees conversion and shortest-arc interpolation helpers.

All angles are in radians unless noted. `normalize` and `shortestDelta`
wrap into (−π, π], so `lerpShortest` always rotates the shorter way.

## Type Declaration

### fromDegrees()

```ts
fromDegrees(degrees): number;
```

Convert degrees to radians.

#### Parameters

##### degrees

`number`

Angle in degrees.

#### Returns

`number`

The same angle in radians.

### lerp()

```ts
lerp(
   from, 
   to, 
   t
): number;
```

Plain linear interpolation between two angles (no wrapping).

#### Parameters

##### from

`number`

Start angle in radians.

##### to

`number`

End angle in radians.

##### t

`number`

Interpolation factor (0 = `from`, 1 = `to`).

#### Returns

`number`

`from + (to - from) * t`.

### lerpShortest()

```ts
lerpShortest(
   from, 
   to, 
   t
): number;
```

Interpolate from `from` to `to` along the shorter arc.

#### Parameters

##### from

`number`

Start angle in radians.

##### to

`number`

End angle in radians.

##### t

`number`

Interpolation factor (0 = `from`, 1 = `to`).

#### Returns

`number`

The interpolated angle in (−π, π].

### normalize()

```ts
normalize(radians): number;
```

Fold an angle (in radians) into the (−π, π] range.

#### Parameters

##### radians

`number`

Angle in radians, any magnitude.

#### Returns

`number`

The equivalent angle in (−π, π].

### shortestDelta()

```ts
shortestDelta(from, to): number;
```

Smallest signed angular delta from `from` to `to`, in (−π, π].

#### Parameters

##### from

`number`

Start angle in radians.

##### to

`number`

End angle in radians.

#### Returns

`number`

`normalize(to - from)`.

### toDegrees()

```ts
toDegrees(radians): number;
```

Convert radians to degrees.

#### Parameters

##### radians

`number`

Angle in radians.

#### Returns

`number`

The same angle in degrees.
