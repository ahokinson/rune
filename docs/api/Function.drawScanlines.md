[**rune**](README.md)

***

[rune](README.md) / drawScanlines

# Function: drawScanlines()

```ts
function drawScanlines(canvas, options?): void;
```

Defined in: fx/scanlines.ts:34

Paint horizontal CRT scanlines across `canvas`, every `spacing` rows. A `skip`
predicate masks out cells (the globe demo skips the sphere's disc so the lines
stay in the background rather than banding the subject).

## Parameters

### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

Target canvas.

### options?

[`ScanlineOptions`](Interface.ScanlineOptions.md) = `{}`

Spacing, glyph, colour, and optional skip predicate.

## Returns

`void`
