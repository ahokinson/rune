[**rune**](README.md)

***

[rune](README.md) / ApplicationEventMap

# Type Alias: ApplicationEventMap

```ts
type ApplicationEventMap = object & Record<string, unknown>;
```

Defined in: context.ts:24

Event payload map emitted by [ApplicationHandle.events](Interface.ApplicationHandle.md#events).

## Type Declaration

### resize

```ts
resize: object;
```

#### resize.height

```ts
height: number;
```

#### resize.width

```ts
width: number;
```

### scene:enter

```ts
scene:enter: object;
```

#### scene:enter.scene

```ts
scene: SceneInstance;
```

### scene:exit

```ts
scene:exit: object;
```

#### scene:exit.scene

```ts
scene: SceneInstance;
```

### tick

```ts
tick: object;
```

#### tick.deltaMilliseconds

```ts
deltaMilliseconds: number;
```

#### tick.tick

```ts
tick: number;
```
