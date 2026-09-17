[**rune**](README.md)

***

[rune](README.md) / parseSprite

# Function: parseSprite()

```ts
function parseSprite(art, legend): Sprite;
```

Defined in: assets/sprite.ts:208

Parse a terminal-art string into a [Sprite](Class.Sprite.md) using a character legend.

## Parameters

### art

`string`

Multi-line ASCII art.

### legend

`Record`\<`string`, [`SpriteLegendEntry`](Interface.SpriteLegendEntry.md)\>

Character-to-legend entry mapping.

## Returns

[`Sprite`](Class.Sprite.md)

A new [Sprite](Class.Sprite.md).
