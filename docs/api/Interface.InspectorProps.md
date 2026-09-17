[**rune**](README.md)

***

[rune](README.md) / InspectorProps

# Interface: InspectorProps

Defined in: inspect/protocol.ts:72

Only the transform fields relevant to a node's kind are populated. 2D nodes
carry Vector2 position/scale + scalar rotation + size; 3D nodes carry Vector3
position/scale + a quaternion rotation.

## Properties

### position?

```ts
optional position?: 
  | Vector2Data
  | Vector3Data;
```

Defined in: inspect/protocol.ts:74

Position (2D or 3D depending on kind).

***

### rotation?

```ts
optional rotation?: number | QuaternionData;
```

Defined in: inspect/protocol.ts:76

Rotation (scalar for 2D, quaternion for 3D).

***

### scale?

```ts
optional scale?: 
  | Vector2Data
  | Vector3Data;
```

Defined in: inspect/protocol.ts:78

Scale (2D or 3D depending on kind).

***

### size?

```ts
optional size?: Vector2Data;
```

Defined in: inspect/protocol.ts:80

2D size (2D entities only).
