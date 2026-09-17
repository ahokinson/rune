[**rune**](README.md)

***

[rune](README.md) / ScanlineOptions

# Interface: ScanlineOptions

Defined in: fx/scanlines.ts:13

Options for [drawScanlines](Function.drawScanlines.md).

## Properties

### character?

```ts
optional character?: string;
```

Defined in: fx/scanlines.ts:17

Glyph painted on a scanline cell. Default "░".

***

### color?

```ts
optional color?: Color;
```

Defined in: fx/scanlines.ts:19

Scanline colour. Default a dim cool grey.

***

### skip?

```ts
optional skip?: (x, y) => boolean;
```

Defined in: fx/scanlines.ts:21

Return true for cells that should be left untouched (e.g. a foreground subject the scanlines should not slice through, or a border).

#### Parameters

##### x

`number`

##### y

`number`

#### Returns

`boolean`

***

### spacing?

```ts
optional spacing?: number;
```

Defined in: fx/scanlines.ts:15

Draw a scanline every `spacing` rows. Default 4.
