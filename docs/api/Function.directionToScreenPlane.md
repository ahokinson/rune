[**rune**](README.md)

***

[rune](README.md) / directionToScreenPlane

# Function: directionToScreenPlane()

```ts
function directionToScreenPlane(dir, out?): Vector2;
```

Defined in: geom/shading.ts:35

Project a 3D direction onto the screen XY plane and renormalize to a 2D unit
vector. Useful for tying screen-space effects (e.g. an atmospheric rim) to a
light direction so they brighten on the same limb the surface highlight sits on.

## Parameters

### dir

[`Vector3`](Class.Vector3.md)

Direction to project.

### out?

[`Vector2`](Class.Vector2.md) = `...`

Optional target vector to write into (default new).

## Returns

[`Vector2`](Class.Vector2.md)

`out` set to the unit screen-plane projection, or `(0, 0)` if `dir` has no XY component.
