[**rune**](README.md)

***

[rune](README.md) / uvGridTexture

# Function: uvGridTexture()

```ts
function uvGridTexture(size?, gridPx?): Texture;
```

Defined in: draw/proceduralTexture.ts:47

The standard uv-debug map: coloured grid lines over a per-quadrant gradient,
so the mesh's uv layout is legible.

## Parameters

### size?

`number` = `64`

Texture edge length in pixels (default 64).

### gridPx?

`number` = `8`

Grid line spacing in pixels (default 8).

## Returns

[`Texture`](Class.Texture.md)

A new [Texture](Class.Texture.md).
