[**rune**](README.md)

***

[rune](README.md) / InspectorNodeKind

# Enumeration: InspectorNodeKind

Defined in: inspect/protocol.ts:26

Which transform/coordinate space a serialized node lives in. Drives how the
inspector labels and edits its properties.

## Enumeration Members

### Entity

```ts
Entity: "entity";
```

Defined in: inspect/protocol.ts:34

An entity of unknown or unhandled kind.

***

### Entity2D

```ts
Entity2D: "entity2d";
```

Defined in: inspect/protocol.ts:28

A 2D entity (position in 2D, scalar rotation).

***

### Entity3D

```ts
Entity3D: "entity3d";
```

Defined in: inspect/protocol.ts:30

A 3D entity (position in 3D, quaternion rotation).

***

### WorldView3D

```ts
WorldView3D: "worldview3d";
```

Defined in: inspect/protocol.ts:32

A 2D entity that owns a nested 3D scene (a `WorldView3D`).
