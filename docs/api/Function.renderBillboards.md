[**rune**](README.md)

***

[rune](README.md) / renderBillboards

# Function: renderBillboards()

```ts
function renderBillboards(context): void;
```

Defined in: draw/raycast/billboards.ts:68

Render billboarded sprites back-to-front with per-entry vertical offset from
eye height. Filters removed entries, sorts by squared distance to the camera,
then dispatches each to [drawPixelBillboard](Function.drawPixelBillboard.md) or [drawBillboard](Function.drawBillboard.md)
depending on the sprite type.

## Parameters

### context

[`BillboardRenderContext`](Interface.BillboardRenderContext.md)

Render parameters; see [BillboardRenderContext](Interface.BillboardRenderContext.md).

## Returns

`void`
