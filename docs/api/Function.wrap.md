[**rune**](README.md)

***

[rune](README.md) / wrap

# Function: wrap()

```ts
function wrap(
   value, 
   minimum, 
   maximum
): number;
```

Defined in: math/scalar.ts:67

Wrap `value` into `[minimum, maximum)`. If the range is non-positive, returns
`minimum`.

## Parameters

### value

`number`

Value to wrap.

### minimum

`number`

Lower bound (inclusive).

### maximum

`number`

Upper bound (exclusive).

## Returns

`number`

`value` wrapped into [minimum, maximum).
