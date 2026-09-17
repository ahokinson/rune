[**rune**](README.md)

***

[rune](README.md) / CrtOptions

# Interface: CrtOptions

Defined in: fx/crt.ts:14

Options for the [crt](Function.crt.md) post effect.

## Properties

### scanlineDarkness?

```ts
optional scanlineDarkness?: number;
```

Defined in: fx/crt.ts:18

Brightness multiplier applied to every other scanline row. Default 0.7.

***

### scanlineSpacing?

```ts
optional scanlineSpacing?: number;
```

Defined in: fx/crt.ts:20

Rows between darkened scanlines. Default 2 (every other row).

***

### vignette?

```ts
optional vignette?: number;
```

Defined in: fx/crt.ts:16

Corner darkening strength, 0 (none) … 1 (corners go black). Default 0.35.
