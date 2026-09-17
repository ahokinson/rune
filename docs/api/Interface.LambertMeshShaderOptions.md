[**rune**](README.md)

***

[rune](README.md) / LambertMeshShaderOptions

# Interface: LambertMeshShaderOptions

Defined in: draw/mesh/shader.ts:15

Options for [LambertMeshShader](Class.LambertMeshShader.md).

## Properties

### ambient?

```ts
optional ambient?: number;
```

Defined in: draw/mesh/shader.ts:24

Ambient intensity (0–1). Default 0.34.

***

### color?

```ts
optional color?: SurfaceColor;
```

Defined in: draw/mesh/shader.ts:17

Base RGB (0–255); ignored where `texture` is set. Defaults to mid grey.

***

### diffuse?

```ts
optional diffuse?: number;
```

Defined in: draw/mesh/shader.ts:26

Diffuse intensity (0–1). Default 0.66.

***

### light?

```ts
optional light?: object;
```

Defined in: draw/mesh/shader.ts:22

Direction toward the light (world space); normalised on construction.
Defaults to an upper-front key light.

#### x

```ts
x: number;
```

#### y

```ts
y: number;
```

#### z

```ts
z: number;
```

***

### texture?

```ts
optional texture?: Texture;
```

Defined in: draw/mesh/shader.ts:28

Optional texture sampled by the fragment's uv; replaces `color` when set.
