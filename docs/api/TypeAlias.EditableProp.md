[**rune**](README.md)

***

[rune](README.md) / EditableProp

# Type Alias: EditableProp

```ts
type EditableProp = 
  | "enabled"
  | "visible"
  | "zIndex"
  | "rotation"
  | "position.x"
  | "position.y"
  | "position.z"
  | "scale.x"
  | "scale.y"
  | "scale.z";
```

Defined in: inspect/protocol.ts:150

The transform/state fields the server accepts edits for. 3D rotation
(a quaternion) is intentionally read-only — nudging raw components is not
meaningful, so it is omitted here.
