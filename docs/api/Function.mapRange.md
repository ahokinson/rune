[**rune**](README.md)

***

[rune](README.md) / mapRange

# Function: mapRange()

```ts
function mapRange(
   value, 
   inputLow, 
   inputHigh, 
   outputLow, 
   outputHigh
): number;
```

Defined in: math/scalar.ts:45

Remap `value` from an input range to an output range. If the input range is
zero-width, returns `outputLow`.

## Parameters

### value

`number`

Value to remap.

### inputLow

`number`

Lower bound of the input range.

### inputHigh

`number`

Upper bound of the input range.

### outputLow

`number`

Lower bound of the output range.

### outputHigh

`number`

Upper bound of the output range.

## Returns

`number`

`value` mapped into the output range.
