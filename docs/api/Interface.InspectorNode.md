[**rune**](README.md)

***

[rune](README.md) / InspectorNode

# Interface: InspectorNode

Defined in: inspect/protocol.ts:88

A serialized entity. `id` is stable across snapshots (see identity.ts) so the
client can preserve selection and target edits. `world` is present on a
WorldView3D and holds its nested Scene3D tree.

## Properties

### children

```ts
children: InspectorNode[];
```

Defined in: inspect/protocol.ts:104

Serialized children.

***

### detail?

```ts
optional detail?: string[];
```

Defined in: inspect/protocol.ts:112

Free-form descriptive lines for informational nodes (used by `rune preview`
to describe project files/assets). When present the inspector shows these in
the detail pane instead of editable transform properties.

***

### enabled

```ts
enabled: boolean;
```

Defined in: inspect/protocol.ts:96

Whether the entity is enabled.

***

### id

```ts
id: number;
```

Defined in: inspect/protocol.ts:90

Stable inspector id (assigned by `inspectorId()` in `inspect/identity.ts`).

***

### kind

```ts
kind: InspectorNodeKind;
```

Defined in: inspect/protocol.ts:94

Which coordinate space this node lives in.

***

### props

```ts
props: InspectorProps;
```

Defined in: inspect/protocol.ts:102

Transform properties relevant to this node's kind.

***

### type

```ts
type: string;
```

Defined in: inspect/protocol.ts:92

Entity class name.

***

### visible

```ts
visible: boolean;
```

Defined in: inspect/protocol.ts:98

Whether the entity is visible.

***

### world?

```ts
optional world?: InspectorTree;
```

Defined in: inspect/protocol.ts:106

Nested 3D scene tree, present only on WorldView3D nodes.

***

### zIndex

```ts
zIndex: number;
```

Defined in: inspect/protocol.ts:100

Draw/sort order index.
