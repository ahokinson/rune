[**rune**](README.md)

***

[rune](README.md) / EmitterUpdate

# Interface: EmitterUpdate\<T\>

Defined in: fx/emitter.ts:24

Per-tick callbacks driving an [Emitter.update](Class.Emitter.md#update) step.

## Type Parameters

### T

`T`

## Properties

### expired

```ts
expired: (item, tick) => boolean;
```

Defined in: fx/emitter.ts:26

True when a live item has finished and should be recycled.

#### Parameters

##### item

`T`

##### tick

`number`

#### Returns

`boolean`

***

### initialize

```ts
initialize: (item, tick) => void;
```

Defined in: fx/emitter.ts:28

Fill a freshly spawned item (and run any per-spawn side effects).

#### Parameters

##### item

`T`

##### tick

`number`

#### Returns

`void`
