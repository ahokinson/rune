[**rune**](README.md)

***

[rune](README.md) / applyEdit

# Function: applyEdit()

```ts
function applyEdit(
   entity, 
   prop, 
   value
): void;
```

Defined in: inspect/snapshot.ts:113

Apply a single whitelisted edit to an entity. Unknown/irrelevant props for the
entity's kind are ignored. Re-sorts the owning container when zIndex changes so
the new draw/update order takes effect on the next pass.

## Parameters

### entity

[`Entity`](Class.Entity.md)

The entity to edit.

### prop

[`EditableProp`](TypeAlias.EditableProp.md)

The field to modify.

### value

`number` \| `boolean`

The new value.

## Returns

`void`
