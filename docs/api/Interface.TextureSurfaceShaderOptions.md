[**rune**](README.md)

***

[rune](README.md) / TextureSurfaceShaderOptions

# Interface: TextureSurfaceShaderOptions

Defined in: draw/raycast/textureShader.ts:17

## Properties

### background?

```ts
optional background?: SurfaceColor;
```

Defined in: draw/raycast/textureShader.ts:23

Colour used where a lookup returns `null`. Defaults to black.

***

### ceilingTexture?

```ts
optional ceilingTexture?: FlatTextureLookup;
```

Defined in: draw/raycast/textureShader.ts:21

***

### floorTexture?

```ts
optional floorTexture?: FlatTextureLookup;
```

Defined in: draw/raycast/textureShader.ts:20

***

### shade?

```ts
optional shade?: (out, distance, isSide) => void;
```

Defined in: draw/raycast/textureShader.ts:29

Optional post-pass applied to every pixel after the texture sample — the
place for distance fog, side darkening, or baked lighting. `out` is the
sampled colour to modify in place.

#### Parameters

##### out

[`SurfaceColor`](Interface.SurfaceColor.md)

##### distance

`number`

##### isSide

`boolean`

#### Returns

`void`

***

### wallTexture

```ts
wallTexture: WallTextureLookup;
```

Defined in: draw/raycast/textureShader.ts:19

Texture for a wall column at the given sample, or `null` for none.
