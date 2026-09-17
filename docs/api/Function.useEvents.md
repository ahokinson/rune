[**rune**](README.md)

***

[rune](README.md) / useEvents

# Function: useEvents()

## Call Signature

```ts
function useEvents(): ScopedEventBus<ApplicationEventMap>;
```

Defined in: hooks.ts:366

Returns a [ScopedEventBus](Interface.ScopedEventBus.md) for the application's event bus. Subscribers
are unsubscribed automatically when the calling component unmounts.

### Returns

[`ScopedEventBus`](Interface.ScopedEventBus.md)\<[`ApplicationEventMap`](TypeAlias.ApplicationEventMap.md)\>

A scoped bus wrapping the application's events.

## Call Signature

```ts
function useEvents<TEventMap>(emitter): ScopedEventBus<TEventMap>;
```

Defined in: hooks.ts:374

Returns a [ScopedEventBus](Interface.ScopedEventBus.md) wrapping the supplied `emitter`. Subscribers
are unsubscribed automatically when the calling component unmounts.

### Type Parameters

#### TEventMap

`TEventMap` *extends* `Record`\<`string`, `unknown`\>

### Parameters

#### emitter

[`EventEmitter`](Class.EventEmitter.md)\<`TEventMap`\>

The emitter to wrap.

### Returns

[`ScopedEventBus`](Interface.ScopedEventBus.md)\<`TEventMap`\>

A scoped bus wrapping `emitter`.
