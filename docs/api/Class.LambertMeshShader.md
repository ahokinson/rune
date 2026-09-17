[**rune**](README.md)

***

[rune](README.md) / LambertMeshShader

# Class: LambertMeshShader

Defined in: draw/mesh/shader.ts:35

A trivial default [MeshShader](Interface.MeshShader.md): Lambert diffuse from a single directional
light times a base colour or texture sample. Richer looks belong in the game.

## Implements

- [`MeshShader`](Interface.MeshShader.md)

## Constructors

### Constructor

```ts
new LambertMeshShader(options?): LambertMeshShader;
```

Defined in: draw/mesh/shader.ts:49

#### Parameters

##### options?

[`LambertMeshShaderOptions`](Interface.LambertMeshShaderOptions.md) = `{}`

Shader parameters; see [LambertMeshShaderOptions](Interface.LambertMeshShaderOptions.md).

#### Returns

`LambertMeshShader`

## Methods

### shade()

```ts
shade(fragmentInput, out): void;
```

Defined in: draw/mesh/shader.ts:63

#### Parameters

##### fragmentInput

[`Fragment`](Interface.Fragment.md)

##### out

[`SurfaceColor`](Interface.SurfaceColor.md)

#### Returns

`void`

#### Implementation of

[`MeshShader`](Interface.MeshShader.md).[`shade`](Interface.MeshShader.md#shade)
