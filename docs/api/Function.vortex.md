[**rune**](README.md)

***

[rune](README.md) / vortex

# Function: vortex()

```ts
function vortex(
   centerX, 
   centerY, 
   strength, 
   softening?
): ForceField;
```

Defined in: fx/forceField.ts:66

Swirl around a centre (a whirlpool / tornado): force is perpendicular to the
radius, magnitude `strength` scaled by 1/distance.

## Parameters

### centerX

`number`

Vortex centre X.

### centerY

`number`

Vortex centre Y.

### strength

`number`

Signed magnitude.

### softening?

`number` = `1`

Added to distance² to avoid singularity (default 1).

## Returns

[`ForceField`](TypeAlias.ForceField.md)

A [ForceField](TypeAlias.ForceField.md).
