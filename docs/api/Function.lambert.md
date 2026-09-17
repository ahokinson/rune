[**rune**](README.md)

***

[rune](README.md) / lambert

# Function: lambert()

```ts
function lambert(
   normal, 
   light, 
   ambient?, 
   diffuse?
): number;
```

Defined in: geom/shading.ts:22

Lambertian diffuse term for a surface normal lit by a directional light. Both
vectors are assumed unit length. `ambient` keeps the unlit side visible; the
diffuse term adds a directional highlight that falls off toward the terminator.

## Parameters

### normal

[`Vector3`](Class.Vector3.md)

Unit surface normal.

### light

[`Vector3`](Class.Vector3.md)

Unit direction toward the light source.

### ambient?

`number` = `0.34`

Ambient floor keeping the unlit side visible (default 0.34).

### diffuse?

`number` = `0.66`

Diffuse contribution scaled by N·L (default 0.66).

## Returns

`number`

Illuminance in `[ambient, ambient + diffuse]`.
