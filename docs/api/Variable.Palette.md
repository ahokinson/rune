[**rune**](README.md)

***

[rune](README.md) / Palette

# Variable: Palette

```ts
Palette: object;
```

Defined in: draw/palette.ts:11

Built-in palettes plus a [define](#define) helper.

## Type Declaration

### dawnbringer16

```ts
dawnbringer16: Palette;
```

### define

```ts
readonly define: (entries) => Palette = definePalette;
```

Build a palette from a mix of hex strings and [Color](Class.Color.md) values. Exposed
on Palette as `Palette.define`.

#### Parameters

##### entries

`Record`\<`string`, `string` \| [`Color`](Class.Color.md)\>

#### Returns

[`Palette`](TypeAlias.Palette.md)

### gameboy

```ts
gameboy: Palette;
```

Game Boy DMG-01, true-LCD RGB values (lightest → darkest). The bluer ink
(#081820) reads more like a real lit DMG screen than the green-only web hexes.
Mirrored in examples/tamagotui/theme.ts as the four GB shades.

### pico8

```ts
pico8: Palette;
```
