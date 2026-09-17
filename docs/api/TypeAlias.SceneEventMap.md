[**rune**](README.md)

***

[rune](README.md) / SceneEventMap

# Type Alias: SceneEventMap

```ts
type SceneEventMap = object & Record<string, unknown>;
```

Defined in: scene/scene.ts:16

Event map emitted by a [Scene](Class.SceneInstance.md) via its [EventEmitter](Class.EventEmitter.md).

## Type Declaration

### enter

```ts
enter: object;
```

#### enter.scene

```ts
scene: SceneInstance;
```

### entity:added

```ts
entity:added: object;
```

#### entity:added.entity

```ts
entity: Entity2D;
```

### entity:removed

```ts
entity:removed: object;
```

#### entity:removed.entity

```ts
entity: Entity2D;
```

### exit

```ts
exit: object;
```

#### exit.scene

```ts
scene: SceneInstance;
```
