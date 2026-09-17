[**rune**](README.md)

***

[rune](README.md) / checkerTexture

# Function: checkerTexture()

```ts
function checkerTexture(size?, cells?): Texture;
```

Defined in: draw/proceduralTexture.ts:26

A two-tone checkerboard of `cells × cells` squares. Reads how light wraps
around a surface at a glance.

## Parameters

### size?

`number` = `64`

Texture edge length in pixels (default 64).

### cells?

`number` = `8`

Number of checker squares per axis (default 8).

## Returns

[`Texture`](Class.Texture.md)

A new [Texture](Class.Texture.md).
