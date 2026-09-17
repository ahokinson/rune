[**rune**](README.md)

***

[rune](README.md) / ShadowMap

# Class: ShadowMap

Defined in: draw/mesh/shadowMap.ts:76

A directional/spot shadow map. Renders caster depth from the light's point of
view into its own [SubpixelTarget](Class.SubpixelTarget.md), then answers a lit↔shadowed query for
any world point — multiply a surface's direct light by [shadowAt](#shadowat) to drop
cast and self shadows. The depth pass reuses [renderMesh](Function.renderMesh.md) (with no canvas
so nothing blits), and [shadowAt](#shadowat) reproduces renderMesh's exact
perspective projection so the stored `1/zv` depths line up with the lookup.

## Constructors

### Constructor

```ts
new ShadowMap(options): ShadowMap;
```

Defined in: draw/mesh/shadowMap.ts:105

#### Parameters

##### options

[`ShadowMapOptions`](Interface.ShadowMapOptions.md)

Shadow map parameters; see [ShadowMapOptions](Interface.ShadowMapOptions.md).

#### Returns

`ShadowMap`

## Methods

### render()

```ts
render(casters): void;
```

Defined in: draw/mesh/shadowMap.ts:171

Render the casters' depth from the light. Call once per frame before shading,
after the casters' model transforms are set for this frame.

#### Parameters

##### casters

readonly [`ShadowCaster`](Interface.ShadowCaster.md)[]

Casters to render this frame.

#### Returns

`void`

***

### setLight()

```ts
setLight(
   lx, 
   ly, 
   lz
): void;
```

Defined in: draw/mesh/shadowMap.ts:130

Aim the light camera down `(lx, ly, lz)` (direction toward the light) and
recompute the cached basis. Cheap; call when the light direction changes.

#### Parameters

##### lx

`number`

Light direction X (toward the light).

##### ly

`number`

Light direction Y (toward the light).

##### lz

`number`

Light direction Z (toward the light).

#### Returns

`void`

***

### shadowAt()

```ts
shadowAt(
   wx, 
   wy, 
   wz, 
   ndotl
): number;
```

Defined in: draw/mesh/shadowMap.ts:196

Light reaching `(wx, wy, wz)`: 1 fully lit, 0 fully shadowed, fractional at
soft edges (2×2 PCF). `ndotl` (surface·light, clamped ≥0) slopes the bias so
grazing surfaces don't self-shadow. Points outside the light frustum read lit.

#### Parameters

##### wx

`number`

World X.

##### wy

`number`

World Y.

##### wz

`number`

World Z.

##### ndotl

`number`

Surface·light dot product, clamped ≥0.

#### Returns

`number`

Lit fraction in [0, 1].
