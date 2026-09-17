[**rune**](README.md)

***

[rune](README.md) / WallSample

# Interface: WallSample

Defined in: draw/raycast/grid.ts:32

One wall sub-pixel handed to a [SurfaceShader](Interface.SurfaceShader.md).

## Properties

### distance

```ts
distance: number;
```

Defined in: draw/raycast/grid.ts:38

Perpendicular distance to the wall (for fog/shading).

***

### isSide

```ts
isSide: boolean;
```

Defined in: draw/raycast/grid.ts:40

True when the ray crossed a y-grid line (games may darken these faces).

***

### mapColumn

```ts
mapColumn: number;
```

Defined in: draw/raycast/grid.ts:41

***

### mapRow

```ts
mapRow: number;
```

Defined in: draw/raycast/grid.ts:42

***

### screenColumn

```ts
screenColumn: number;
```

Defined in: draw/raycast/grid.ts:43

***

### screenRow

```ts
screenRow: number;
```

Defined in: draw/raycast/grid.ts:44

***

### u

```ts
u: number;
```

Defined in: draw/raycast/grid.ts:34

Fractional world coordinate along the wall face, [0, 1).

***

### v

```ts
v: number;
```

Defined in: draw/raycast/grid.ts:36

Vertical position within the wall slice span, [0, 1).
