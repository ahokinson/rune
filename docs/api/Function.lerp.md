[**rune**](README.md)

***

[rune](README.md) / lerp

# Function: lerp()

```ts
function lerp(
   a, 
   b, 
   t
): number;
```

Defined in: math/scalar.ts:16

Linearly interpolate between `a` and `b`.

## Parameters

### a

`number`

Start value.

### b

`number`

End value.

### t

`number`

Interpolation factor (0 = `a`, 1 = `b`).

## Returns

`number`

`a + (b - a) * t`.
