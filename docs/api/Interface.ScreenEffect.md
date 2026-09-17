[**rune**](README.md)

***

[rune](README.md) / ScreenEffect

# Interface: ScreenEffect

Defined in: fx/screen.ts:19

Screen-space post-processing hook set. Implement only the hooks an effect needs.

## Methods

### brightness()?

```ts
optional brightness(): number;
```

Defined in: fx/screen.ts:25

Brightness multiplier for every colour drawn this frame (flicker, fade). Default 1.

#### Returns

`number`

***

### postPass()?

```ts
optional postPass(canvas, tick): void;
```

Defined in: fx/screen.ts:27

Paint artifacts straight onto the canvas after the frame is composited (static, noise, glitch blocks).

#### Parameters

##### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

##### tick

`number`

#### Returns

`void`

***

### rowOffset()?

```ts
optional rowOffset(y): number;
```

Defined in: fx/screen.ts:23

Shift row `y` horizontally (tearing, jitter, shake). Default 0.

#### Parameters

##### y

`number`

#### Returns

`number`

***

### update()?

```ts
optional update(tick): void;
```

Defined in: fx/screen.ts:21

Advance the effect's own timeline once per tick.

#### Parameters

##### tick

`number`

#### Returns

`void`
