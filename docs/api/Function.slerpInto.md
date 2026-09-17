[**rune**](README.md)

***

[rune](README.md) / slerpInto

# Function: slerpInto()

```ts
function slerpInto(
   out, 
   a, 
   b, 
   t
): Vector3;
```

Defined in: geom/sphere.ts:78

Allocation-free variant of [slerp](Function.slerp.md): writes the result into `out`.

## Parameters

### out

[`Vector3`](Class.Vector3.md)

Target vector.

### a

[`Vector3`](Class.Vector3.md)

Start direction (unit).

### b

[`Vector3`](Class.Vector3.md)

End direction (unit).

### t

`number`

Interpolation factor (0 = `a`, 1 = `b`).

## Returns

[`Vector3`](Class.Vector3.md)

`out` for chaining.
