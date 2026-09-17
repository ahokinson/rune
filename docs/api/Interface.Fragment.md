[**rune**](README.md)

***

[rune](README.md) / Fragment

# Interface: Fragment

Defined in: draw/mesh/rasterizer.ts:36

One covered subpixel handed to a [MeshShader](Interface.MeshShader.md). World position and normal
are perspective-correct and in world space (the normal is interpolated, not
renormalised — shaders that need a unit normal should normalise it). `depth`
is view-space distance along the camera forward axis (for fog/debug).

## Properties

### depth

```ts
depth: number;
```

Defined in: draw/mesh/rasterizer.ts:45

***

### normalX

```ts
normalX: number;
```

Defined in: draw/mesh/rasterizer.ts:42

***

### normalY

```ts
normalY: number;
```

Defined in: draw/mesh/rasterizer.ts:43

***

### normalZ

```ts
normalZ: number;
```

Defined in: draw/mesh/rasterizer.ts:44

***

### screenX

```ts
screenX: number;
```

Defined in: draw/mesh/rasterizer.ts:46

***

### screenY

```ts
screenY: number;
```

Defined in: draw/mesh/rasterizer.ts:47

***

### u

```ts
u: number;
```

Defined in: draw/mesh/rasterizer.ts:37

***

### v

```ts
v: number;
```

Defined in: draw/mesh/rasterizer.ts:38

***

### worldX

```ts
worldX: number;
```

Defined in: draw/mesh/rasterizer.ts:39

***

### worldY

```ts
worldY: number;
```

Defined in: draw/mesh/rasterizer.ts:40

***

### worldZ

```ts
worldZ: number;
```

Defined in: draw/mesh/rasterizer.ts:41
