[**rune**](README.md)

***

[rune](README.md) / brightnessToChar

# Function: brightnessToChar()

```ts
function brightnessToChar(brightness, ramp?): string;
```

Defined in: draw/charRamp.ts:18

Pick a glyph from `ramp` for a 0..1 brightness. Out-of-range values clamp to
the ends of the ramp.

## Parameters

### brightness

`number`

Value in 0..1 (clamped to range).

### ramp?

`string` = `DEFAULT_CHAR_RAMP`

Character ramp to sample (default [DEFAULT\_CHAR\_RAMP](Variable.DEFAULT_CHAR_RAMP.md)).

## Returns

`string`

The character at the clamped index.
