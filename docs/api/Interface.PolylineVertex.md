[**rune**](README.md)

***

[rune](README.md) / PolylineVertex

# Interface: PolylineVertex

Defined in: geom/geometry3d.ts:100

One vertex of a polyline: a world point, an optional radial `altitude` lift
(>= 1, bows the line off a surface), and a param `t` (0..1 along the line) the
style can map to colour/animation (e.g. a travelling comet head).

## Properties

### altitude

```ts
altitude: number;
```

Defined in: geom/geometry3d.ts:102

***

### point

```ts
point: Vector3;
```

Defined in: geom/geometry3d.ts:101

***

### t

```ts
t: number;
```

Defined in: geom/geometry3d.ts:103
