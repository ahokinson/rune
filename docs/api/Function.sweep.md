[**rune**](README.md)

***

[rune](README.md) / sweep

# Function: sweep()

```ts
function sweep(
   moving, 
   deltaX, 
   deltaY, 
   obstacles
): SweepHit | null;
```

Defined in: physics/boundingBox.ts:112

Sweep `moving` by `(deltaX, deltaY)` and return the earliest obstacle hit in
the normalized interval `[0, 1]`. Resolves each axis independently and picks
the latest entry time across both axes as the contact moment.

## Parameters

### moving

[`Rectangle`](Class.Rectangle.md)

The rectangle being moved.

### deltaX

`number`

X displacement for this step.

### deltaY

`number`

Y displacement for this step.

### obstacles

readonly [`Rectangle`](Class.Rectangle.md)[]

Candidate rectangles to test against.

## Returns

[`SweepHit`](Interface.SweepHit.md) \| `null`

The earliest [SweepHit](Interface.SweepHit.md), or `null` if none is struck.
