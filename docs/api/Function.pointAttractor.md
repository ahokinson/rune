[**rune**](README.md)

***

[rune](README.md) / pointAttractor

# Function: pointAttractor()

```ts
function pointAttractor(
   centerX, 
   centerY, 
   strength, 
   softening?
): ForceField;
```

Defined in: fx/forceField.ts:45

Pull toward (positive strength) or push from (negative) a point, with strength
falling off as 1/distance so it stays finite near the centre. A gravity well,
a black hole, an explosion shockwave (negative).

## Parameters

### centerX

`number`

Attractor X.

### centerY

`number`

Attractor Y.

### strength

`number`

Signed magnitude; positive pulls, negative pushes.

### softening?

`number` = `1`

Added to distance² to avoid singularity at the centre (default 1).

## Returns

[`ForceField`](TypeAlias.ForceField.md)

A [ForceField](TypeAlias.ForceField.md).
