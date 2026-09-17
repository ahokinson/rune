[**rune**](README.md)

***

[rune](README.md) / LitMeshShaderOptions

# Interface: LitMeshShaderOptions

Defined in: draw/mesh/shader.ts:93

Options for [LitMeshShader](Class.LitMeshShader.md).

## Properties

### ambient?

```ts
optional ambient?: number;
```

Defined in: draw/mesh/shader.ts:97

Ambient intensity (0–1). Default 0.3.

***

### diffuse?

```ts
optional diffuse?: number;
```

Defined in: draw/mesh/shader.ts:99

Diffuse intensity (0–1). Default 0.7.

***

### light

```ts
light: object;
```

Defined in: draw/mesh/shader.ts:95

Direction toward the key light (world space); normalised on construction.

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

### shininess?

```ts
optional shininess?: number;
```

Defined in: draw/mesh/shader.ts:101

Blinn-Phong specular exponent (phong mode only). Default 24.

***

### specular?

```ts
optional specular?: number;
```

Defined in: draw/mesh/shader.ts:103

Blinn-Phong specular strength (phong mode only). Default 0.7.
