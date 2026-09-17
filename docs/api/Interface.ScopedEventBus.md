[**rune**](README.md)

***

[rune](README.md) / ScopedEventBus

# Interface: ScopedEventBus\<TEventMap\>

Defined in: hooks.ts:285

Scoped event bus wrapping an [EventEmitter](Class.EventEmitter.md): `on`/`once` registrations
are tracked and unsubscribed automatically when the owning component unmounts.

## Type Parameters

### TEventMap

`TEventMap` *extends* `Record`\<`string`, `unknown`\>

Event name to payload map.

## Methods

### emit()

```ts
emit<K>(event, payload): void;
```

Defined in: hooks.ts:292

Emit `payload` for `event` to all current listeners.

#### Type Parameters

##### K

`K` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### event

`K`

Event name.

##### payload

`TEventMap`\[`K`\]

Event payload.

#### Returns

`void`

***

### off()

```ts
off<K>(event, listener): void;
```

Defined in: hooks.ts:316

Remove `listener` from `event` immediately.

#### Type Parameters

##### K

`K` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### event

`K`

Event name.

##### listener

[`EventListener`](TypeAlias.EventListener.md)\<`TEventMap`\[`K`\]\>

Previously-registered callback.

#### Returns

`void`

***

### on()

```ts
on<K>(event, listener): () => void;
```

Defined in: hooks.ts:300

Subscribe `listener` to `event`. The subscription is removed on unmount.

#### Type Parameters

##### K

`K` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### event

`K`

Event name.

##### listener

[`EventListener`](TypeAlias.EventListener.md)\<`TEventMap`\[`K`\]\>

Callback for each emission.

#### Returns

A function to unsubscribe early.

() => `void`

***

### once()

```ts
once<K>(event, listener): () => void;
```

Defined in: hooks.ts:309

Subscribe `listener` to `event` for a single emission. The subscription is
removed on unmount if it has not fired yet.

#### Type Parameters

##### K

`K` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### event

`K`

Event name.

##### listener

[`EventListener`](TypeAlias.EventListener.md)\<`TEventMap`\[`K`\]\>

Callback for the next emission.

#### Returns

A function to unsubscribe early.

() => `void`
