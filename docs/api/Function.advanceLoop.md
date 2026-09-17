[**rune**](README.md)

***

[rune](README.md) / advanceLoop

# Function: advanceLoop()

```ts
function advanceLoop(
   state, 
   deltaMilliseconds, 
   stepMilliseconds, 
   maxSubSteps, 
   onTick
): void;
```

Defined in: core/loop.ts:38

Drain `deltaMilliseconds` of wall-clock time into fixed `stepMilliseconds`
ticks, invoking `onTick` for each substep. Caps the accumulator to prevent
the "spiral of death" when the sim can't keep up with real time.

## Parameters

### state

[`LoopState`](Interface.LoopState.md)

Loop state to advance (mutated in place).

### deltaMilliseconds

`number`

Wall-clock time elapsed this frame.

### stepMilliseconds

`number`

Fixed simulation step length.

### maxSubSteps

`number`

Hard cap on substeps per frame.

### onTick

(`deltaMilliseconds`, `tick`) => `void`

Called once per substep with the step delta and tick index.

## Returns

`void`
