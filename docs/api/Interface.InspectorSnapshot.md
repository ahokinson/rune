[**rune**](README.md)

***

[rune](README.md) / InspectorSnapshot

# Interface: InspectorSnapshot

Defined in: inspect/protocol.ts:128

One full description of the application state at a point in time. `scene` is
null when no scene is active (or, in preview mode, carries the project's
static structure under a synthetic tree).

## Properties

### framesPerSecond

```ts
framesPerSecond: number;
```

Defined in: inspect/protocol.ts:134

Current frames per second.

***

### paused

```ts
paused: boolean;
```

Defined in: inspect/protocol.ts:138

Whether the simulation is paused.

***

### protocol

```ts
protocol: number;
```

Defined in: inspect/protocol.ts:130

Protocol version (matches [INSPECT\_PROTOCOL\_VERSION](Variable.INSPECT_PROTOCOL_VERSION.md)).

***

### scene

```ts
scene: InspectorTree | null;
```

Defined in: inspect/protocol.ts:142

Serialized scene tree, or `null` when no scene is active.

***

### sceneStack

```ts
sceneStack: string[];
```

Defined in: inspect/protocol.ts:140

Names of the active scene stack.

***

### tick

```ts
tick: number;
```

Defined in: inspect/protocol.ts:132

Current tick count.

***

### ticksPerSecond

```ts
ticksPerSecond: number;
```

Defined in: inspect/protocol.ts:136

Current ticks per second.
