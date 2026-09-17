[**rune**](README.md)

***

[rune](README.md) / attenuation

# Function: attenuation()

```ts
function attenuation(
   listener, 
   source, 
   range
): number;
```

Defined in: audio/spatial.ts:30

Linear distance falloff: full volume at the listener, silent at `range` and
beyond. Returns a 0–1 gain suitable for [PlayOptions.volume](Interface.PlayOptions.md#volume).

## Parameters

### listener

[`SpatialPoint`](Interface.SpatialPoint.md)

Ear position.

### source

[`SpatialPoint`](Interface.SpatialPoint.md)

Sound position.

### range

`number`

Distance at which the sound goes silent.

## Returns

`number`

Gain in [0, 1].
