[**rune**](README.md)

***

[rune](README.md) / clamp

# Function: clamp()

```ts
function clamp(
   value, 
   low, 
   high
): number;
```

Defined in: math/scalar.ts:28

Clamp `value` to `[low, high]`.

## Parameters

### value

`number`

Value to clamp.

### low

`number`

Lower bound.

### high

`number`

Upper bound.

## Returns

`number`

`value` if in range, else the nearest bound.
