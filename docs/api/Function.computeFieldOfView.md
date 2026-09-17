[**rune**](README.md)

***

[rune](README.md) / computeFieldOfView

# Function: computeFieldOfView()

```ts
function computeFieldOfView(options): void;
```

Defined in: light/shadowcast.ts:47

Compute a symmetric, artifact-free field of view via recursive shadowcasting.
`reveal` is called once per visible cell (including the origin).

## Parameters

### options

[`FieldOfViewOptions`](Interface.FieldOfViewOptions.md)

Origin, radius, blocking predicate, and reveal callback.

## Returns

`void`
