[**rune**](README.md)

***

[rune](README.md) / WallTextureLookup

# Type Alias: WallTextureLookup

```ts
type WallTextureLookup = (sample) => Texture | null;
```

Defined in: draw/raycast/textureShader.ts:13

Picks the texture for a surface, or `null` to fall back to `background`.

## Parameters

### sample

[`WallSample`](Interface.WallSample.md)

## Returns

[`Texture`](Class.Texture.md) \| `null`
