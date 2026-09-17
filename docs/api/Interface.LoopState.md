[**rune**](README.md)

***

[rune](README.md) / LoopState

# Interface: LoopState

Defined in: core/loop.ts:11

Mutable state carried between frames by the fixed-step loop.

## Properties

### accumulator

```ts
accumulator: number;
```

Defined in: core/loop.ts:13

Leftover time (ms) not yet consumed by a fixed step.

***

### tick

```ts
tick: number;
```

Defined in: core/loop.ts:15

Monotonically increasing simulation tick counter.
