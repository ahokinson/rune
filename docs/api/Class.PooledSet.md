[**rune**](README.md)

***

[rune](README.md) / PooledSet

# Class: PooledSet\<T\>

Defined in: core/pooledSet.ts:32

A pool-backed set of live items with a fast spawn/expire lifecycle. Items are
recycled through an [ObjectPool](Class.ObjectPool.md) so a steady churn of short-lived objects
(particles, projectiles, transient events) allocates once and never GCs. The
active list is mutated in place; [PooledSet.expire](#expire) uses swap-pop so
removals stay O(1).

## Type Parameters

### T

`T`

Item type.

## Constructors

### Constructor

```ts
new PooledSet<T>(options): PooledSet<T>;
```

Defined in: core/pooledSet.ts:41

#### Parameters

##### options

[`PooledSetOptions`](Interface.PooledSetOptions.md)\<`T`\>

Set configuration; see [PooledSetOptions](Interface.PooledSetOptions.md).

#### Returns

`PooledSet`\<`T`\>

## Properties

### active

```ts
readonly active: T[] = [];
```

Defined in: core/pooledSet.ts:34

Live items currently in play (mutated in place by [spawn](#spawn)/[expire](#expire)).

## Accessors

### isFull

#### Get Signature

```ts
get isFull(): boolean;
```

Defined in: core/pooledSet.ts:56

`true` when the live count has reached the configured capacity.

##### Returns

`boolean`

***

### size

#### Get Signature

```ts
get size(): number;
```

Defined in: core/pooledSet.ts:51

Number of items currently live.

##### Returns

`number`

## Methods

### clear()

```ts
clear(): void;
```

Defined in: core/pooledSet.ts:92

Release all active items back to the pool.

#### Returns

`void`

***

### expire()

```ts
expire(shouldExpire): void;
```

Defined in: core/pooledSet.ts:80

Release every item for which `shouldExpire` is true back to the pool. Walks
backwards and swap-pops so the active list is mutated in place.

#### Parameters

##### shouldExpire

(`item`) => `boolean`

Predicate returning `true` for items to retire.

#### Returns

`void`

***

### spawn()

```ts
spawn(): T | null;
```

Defined in: core/pooledSet.ts:67

Acquire an item from the pool and add it to the active set, or return null
when the set is full (no throw, unlike a bare [ObjectPool](Class.ObjectPool.md) at its
maximum).

#### Returns

`T` \| `null`

A fresh or recycled item, or `null` if at capacity.
