[**rune**](README.md)

***

[rune](README.md) / directionalForce

# Function: directionalForce()

```ts
function directionalForce(x, y): ForceField;
```

Defined in: fx/forceField.ts:27

Constant directional force (wind, buoyancy). Gravity is just
directionalForce with a downward vector, but Particles already has a
dedicated gravity option.

## Parameters

### x

`number`

X acceleration per step.

### y

`number`

Y acceleration per step.

## Returns

[`ForceField`](TypeAlias.ForceField.md)

A [ForceField](TypeAlias.ForceField.md).
