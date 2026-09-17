[**rune**](README.md)

***

[rune](README.md) / snapshotFrame

# Function: snapshotFrame()

```ts
function snapshotFrame(canvas, into?): FramePlanes;
```

Defined in: fx/pipeline.ts:90

Snapshot the canvas's glyphs and fg/bg bytes into typed-array planes. Reuses
`into` when its dimensions match, so a per-frame pass allocates nothing.

## Parameters

### canvas

[`InMemoryCanvas`](Class.InMemoryCanvas.md)

Source canvas.

### into?

[`FramePlanes`](Interface.FramePlanes.md)

Existing planes to reuse when dimensions match.

## Returns

[`FramePlanes`](Interface.FramePlanes.md)

The populated planes (same reference as `into` when reused).
