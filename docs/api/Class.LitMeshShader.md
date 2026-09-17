[**rune**](README.md)

***

[rune](README.md) / LitMeshShader

# Class: LitMeshShader

Defined in: draw/mesh/shader.ts:118

One directional light with four switchable modes (Lambert diffuse, Blinn-Phong
specular, toon bands, normal debug), optional texture, optional shadow-map
lookup, and per-draw emissive glow. Material + mode are mutated before each
renderMesh call so a single instance shades multiple meshes. Math is inlined
(no per-fragment allocation) to match [LambertMeshShader](Class.LambertMeshShader.md).

## Implements

- [`MeshShader`](Interface.MeshShader.md)

## Constructors

### Constructor

```ts
new LitMeshShader(options): LitMeshShader;
```

Defined in: draw/mesh/shader.ts:151

#### Parameters

##### options

[`LitMeshShaderOptions`](Interface.LitMeshShaderOptions.md)

Shader parameters; see [LitMeshShaderOptions](Interface.LitMeshShaderOptions.md).

#### Returns

`LitMeshShader`

## Properties

### baseB

```ts
baseB: number = 180;
```

Defined in: draw/mesh/shader.ts:126

Base colour blue (0–255).

***

### baseG

```ts
baseG: number = 180;
```

Defined in: draw/mesh/shader.ts:124

Base colour green (0–255).

***

### baseR

```ts
baseR: number = 180;
```

Defined in: draw/mesh/shader.ts:122

Base colour red (0–255).

***

### emissive

```ts
emissive: number = 0;
```

Defined in: draw/mesh/shader.ts:128

Emissive glow added to every shaded fragment (0–1).

***

### mode

```ts
mode: LitMeshShaderMode = "lambert";
```

Defined in: draw/mesh/shader.ts:120

Per-draw state — set these before each renderMesh call.

***

### shadowMap

```ts
shadowMap: ShadowMap | null = null;
```

Defined in: draw/mesh/shader.ts:132

Optional shadow map for cast/self-shadow lookups.

***

### texture

```ts
texture: Texture | null = null;
```

Defined in: draw/mesh/shader.ts:130

Optional texture sampled by the fragment's uv; replaces the base colour when set.

***

### viewX

```ts
viewX: number = 0;
```

Defined in: draw/mesh/shader.ts:134

Camera position in world space, for the specular view direction (phong mode).

***

### viewY

```ts
viewY: number = 0;
```

Defined in: draw/mesh/shader.ts:136

Camera world Y for the specular view direction (phong mode).

***

### viewZ

```ts
viewZ: number = 0;
```

Defined in: draw/mesh/shader.ts:138

Camera world Z for the specular view direction (phong mode).

## Methods

### setLight()

```ts
setLight(
   x, 
   y, 
   z
): void;
```

Defined in: draw/mesh/shader.ts:166

Set the key-light direction (world space); normalised internally.

#### Parameters

##### x

`number`

Light direction X.

##### y

`number`

Light direction Y.

##### z

`number`

Light direction Z.

#### Returns

`void`

***

### setMaterial()

```ts
setMaterial(
   r, 
   g, 
   b, 
   emissive?
): void;
```

Defined in: draw/mesh/shader.ts:181

Set the base colour and emissive glow for the next draw.

#### Parameters

##### r

`number`

Base red (0–255).

##### g

`number`

Base green (0–255).

##### b

`number`

Base blue (0–255).

##### emissive?

`number` = `0`

Emissive glow (0–1); default 0.

#### Returns

`void`

***

### shade()

```ts
shade(fragment, out): void;
```

Defined in: draw/mesh/shader.ts:188

#### Parameters

##### fragment

[`Fragment`](Interface.Fragment.md)

##### out

[`SurfaceColor`](Interface.SurfaceColor.md)

#### Returns

`void`

#### Implementation of

[`MeshShader`](Interface.MeshShader.md).[`shade`](Interface.MeshShader.md#shade)
