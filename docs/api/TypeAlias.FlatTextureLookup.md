[**rune**](README.md)

***

[rune](README.md) / FlatTextureLookup

# Type Alias: FlatTextureLookup

```ts
type FlatTextureLookup = (sample) => Texture | null;
```

Defined in: draw/raycast/textureShader.ts:15

Picks the texture for a floor or ceiling surface, or `null` to fall back to `background`.

## Parameters

### sample

[`FlatSample`](Interface.FlatSample.md)

## Returns

[`Texture`](Class.Texture.md) \| `null`
