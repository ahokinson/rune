[**rune**](README.md)

***

[rune](README.md) / useCanvas

# Function: useCanvas()

```ts
function useCanvas(): Accessor<CanvasSurface | null>;
```

Defined in: hooks.ts:95

Read the canvas accessor from the nearest `<Canvas>`.

## Returns

`Accessor`\<[`CanvasSurface`](Interface.CanvasSurface.md) \| `null`\>

Accessor yielding the [Canvas](Interface.CanvasSurface.md) (or `null` before mount / after cleanup).
