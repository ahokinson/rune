[**rune**](README.md)

***

[rune](README.md) / EventEmitter

# Class: EventEmitter\<TEventMap\>

Defined in: core/events.ts:30

Type-safe pub/sub emitter keyed by an event map. Listeners are stored in a
`Map` of `Set`s so add/remove/emit are all O(1) average and duplicates are
ignored. `emit` snapshots the listeners before invoking them, so a listener
may safely remove itself or others mid-dispatch.

## Example

```ts
const emitter = new EventEmitter<{ ping: number }>()
const off = emitter.on("ping", (n) => console.log(n))
emitter.emit("ping", 42)  // logs 42
off()                     // unsubscribe
```

## Type Parameters

### TEventMap

`TEventMap` *extends* `Record`\<`string`, `unknown`\>

Map of event name to payload type.

## Constructors

### Constructor

```ts
new EventEmitter<TEventMap>(): EventEmitter<TEventMap>;
```

#### Returns

`EventEmitter`\<`TEventMap`\>

## Methods

### clear()

```ts
clear(): void;
```

Defined in: core/events.ts:102

Remove all listeners for every event.

#### Returns

`void`

***

### emit()

```ts
emit<K>(event, payload): void;
```

Defined in: core/events.ts:86

Deliver `payload` to every listener subscribed to `event`. Iterates a
snapshot so listeners may mutate the subscription set during dispatch.

#### Type Parameters

##### K

`K` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### event

`K`

Event name.

##### payload

`TEventMap`\[`K`\]

Value passed to each listener.

#### Returns

`void`

***

### off()

```ts
off<K>(event, listener): void;
```

Defined in: core/events.ts:72

Remove a previously added `listener` from `event`. No-op if absent.

#### Type Parameters

##### K

`K` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### event

`K`

Event name.

##### listener

[`EventListener`](TypeAlias.EventListener.md)\<`TEventMap`\[`K`\]\>

The exact function passed to [on](#on) / [once](#once).

#### Returns

`void`

***

### on()

```ts
on<K>(event, listener): () => void;
```

Defined in: core/events.ts:40

Subscribe `listener` to `event`.

#### Type Parameters

##### K

`K` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### event

`K`

Event name (key of [TEventMap](#teventmap)).

##### listener

[`EventListener`](TypeAlias.EventListener.md)\<`TEventMap`\[`K`\]\>

Callback invoked with the event payload.

#### Returns

An unsubscribe function; calling it removes the listener.

() => `void`

***

### once()

```ts
once<K>(event, listener): () => void;
```

Defined in: core/events.ts:58

Subscribe `listener` to `event` for a single delivery; the listener is
automatically removed before it is invoked.

#### Type Parameters

##### K

`K` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### event

`K`

Event name.

##### listener

[`EventListener`](TypeAlias.EventListener.md)\<`TEventMap`\[`K`\]\>

Callback invoked once.

#### Returns

An unsubscribe function (cancels before the event fires).

() => `void`
