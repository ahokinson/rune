[**rune**](README.md)

***

[rune](README.md) / TextureSurfaceShader

# Class: TextureSurfaceShader

Defined in: draw/raycast/textureShader.ts:38

A [SurfaceShader](Interface.SurfaceShader.md) that paints walls/floors/ceilings from [Texture](Class.Texture.md)
lookups instead of hand-written procedural code. Wall texels use the sample's
`u`/`v`; floor and ceiling texels use the fractional world position so a
texture tiles once per world cell. Supply `shade` to add fog/lighting.

## Implements

- [`SurfaceShader`](Interface.SurfaceShader.md)

## Constructors

### Constructor

```ts
new TextureSurfaceShader(options): TextureSurfaceShader;
```

Defined in: draw/raycast/textureShader.ts:50

#### Parameters

##### options

[`TextureSurfaceShaderOptions`](Interface.TextureSurfaceShaderOptions.md)

Shader parameters; see [TextureSurfaceShaderOptions](Interface.TextureSurfaceShaderOptions.md).

#### Returns

`TextureSurfaceShader`

## Methods

### ceilingPixel()

```ts
ceilingPixel(sample, out): void;
```

Defined in: draw/raycast/textureShader.ts:80

#### Parameters

##### sample

[`FlatSample`](Interface.FlatSample.md)

##### out

[`SurfaceColor`](Interface.SurfaceColor.md)

#### Returns

`void`

#### Implementation of

[`SurfaceShader`](Interface.SurfaceShader.md).[`ceilingPixel`](Interface.SurfaceShader.md#ceilingpixel)

***

### floorPixel()

```ts
floorPixel(sample, out): void;
```

Defined in: draw/raycast/textureShader.ts:73

#### Parameters

##### sample

[`FlatSample`](Interface.FlatSample.md)

##### out

[`SurfaceColor`](Interface.SurfaceColor.md)

#### Returns

`void`

#### Implementation of

[`SurfaceShader`](Interface.SurfaceShader.md).[`floorPixel`](Interface.SurfaceShader.md#floorpixel)

***

### wallPixel()

```ts
wallPixel(sample, out): void;
```

Defined in: draw/raycast/textureShader.ts:66

#### Parameters

##### sample

[`WallSample`](Interface.WallSample.md)

##### out

[`SurfaceColor`](Interface.SurfaceColor.md)

#### Returns

`void`

#### Implementation of

[`SurfaceShader`](Interface.SurfaceShader.md).[`wallPixel`](Interface.SurfaceShader.md#wallpixel)
