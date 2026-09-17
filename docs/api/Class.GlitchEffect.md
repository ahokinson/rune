[**rune**](README.md)

***

[rune](README.md) / GlitchEffect

# Class: GlitchEffect

Defined in: fx/glitch.ts:90

A CRT/retro glitch as a [ScreenEffect](Interface.ScreenEffect.md): it idles for a random cooldown,
fires one transient glitch (tear, static, flicker, chroma aberration or block
corruption) for a few ticks, then idles again. `rowOffset`/`brightness` feed a
[FilterCanvas](Class.FilterCanvas.md) so tears and flicker warp the live frame; `postPass`
paints the noisy kinds on top after the frame is drawn.

## Implements

- [`ScreenEffect`](Interface.ScreenEffect.md)

## Constructors

### Constructor

```ts
new GlitchEffect(options): GlitchEffect;
```

Defined in: fx/glitch.ts:102

#### Parameters

##### options

[`GlitchEffectOptions`](Interface.GlitchEffectOptions.md)

Glitch configuration.

#### Returns

`GlitchEffect`

## Methods

### brightness()

```ts
brightness(): number;
```

Defined in: fx/glitch.ts:214

Brightness multiplier for the flicker glitch.

#### Returns

`number`

Multiplier (1.0 when not flickering).

#### Implementation of

[`ScreenEffect`](Interface.ScreenEffect.md).[`brightness`](Interface.ScreenEffect.md#brightness)

***

### postPass()

```ts
postPass(canvas, tick): void;
```

Defined in: fx/glitch.ts:226

Paint the noisy glitch kinds (static, chroma, corrupt) onto `canvas`.

#### Parameters

##### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

Target canvas.

##### tick

`number`

Current tick number.

#### Returns

`void`

#### Implementation of

[`ScreenEffect`](Interface.ScreenEffect.md).[`postPass`](Interface.ScreenEffect.md#postpass)

***

### resize()

```ts
resize(width, height): void;
```

Defined in: fx/glitch.ts:117

Update the canvas size after a resize.

#### Parameters

##### width

`number`

New width in cells.

##### height

`number`

New height in cells.

#### Returns

`void`

***

### rowOffset()

```ts
rowOffset(y): number;
```

Defined in: fx/glitch.ts:203

Horizontal row offset for the tear glitch.

#### Parameters

##### y

`number`

Row index.

#### Returns

`number`

Cells to shift row `y` (0 outside a tear).

#### Implementation of

[`ScreenEffect`](Interface.ScreenEffect.md).[`rowOffset`](Interface.ScreenEffect.md#rowoffset)

***

### update()

```ts
update(tick): void;
```

Defined in: fx/glitch.ts:137

Advance the glitch timeline one tick: expire a running glitch or count down
the cooldown toward the next one.

#### Parameters

##### tick

`number`

Current tick number.

#### Returns

`void`

#### Implementation of

[`ScreenEffect`](Interface.ScreenEffect.md).[`update`](Interface.ScreenEffect.md#update)
