[**rune**](README.md)

***

[rune](README.md) / flowExtent

# Function: flowExtent()

```ts
function flowExtent(itemSizes, gap): number;
```

Defined in: draw/layout.ts:160

Total extent of a flow run: the sum of `itemSizes` plus `gap` between each pair.
Handy for sizing a panel to wrap a [flowRow](Function.flowRow.md)/[flowColumn](Function.flowColumn.md).

## Parameters

### itemSizes

`number`[]

Item sizes along the flow axis.

### gap

`number`

Cells between items.

## Returns

`number`

The run length in cells (0 for an empty run).
