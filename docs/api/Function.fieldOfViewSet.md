[**rune**](README.md)

***

[rune](README.md) / fieldOfViewSet

# Function: fieldOfViewSet()

```ts
function fieldOfViewSet(
   originX, 
   originY, 
   radius, 
   isBlocking
): Set<string>;
```

Defined in: light/shadowcast.ts:113

Collect a field of view into a Set of "column,row" keys, for callers that want
a membership test rather than a streaming callback.

## Parameters

### originX

`number`

Origin column.

### originY

`number`

Origin row.

### radius

`number`

Maximum sight distance in cells.

### isBlocking

[`CellPredicate`](TypeAlias.CellPredicate.md)

Reports whether a cell blocks sight.

## Returns

`Set`\<`string`\>

Set of `"column,row"` strings for every visible cell.
