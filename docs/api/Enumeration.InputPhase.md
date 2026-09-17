[**rune**](README.md)

***

[rune](README.md) / InputPhase

# Enumeration: InputPhase

Defined in: input/phase.ts:17

Which pass of the frame is currently reading input. A frame runs the fixed
simulation step (often several substeps) and then a once-per-frame update
pass, and a single physical key press must be observable exactly once in
each. The input state keeps a separate press/release edge buffer per phase
and returns the one matching the active phase, so gameplay code in the fixed
step never sees a press twice when a frame runs multiple substeps, while
frame-level code (pause toggles, title screens) still sees it once per frame.

## Enumeration Members

### Fixed

```ts
Fixed: "fixed";
```

Defined in: input/phase.ts:19

The fixed-timestep simulation: scene/entity updates and `useFixedUpdate`.

***

### Frame

```ts
Frame: "frame";
```

Defined in: input/phase.ts:21

The once-per-frame update pass: `useUpdate`.
