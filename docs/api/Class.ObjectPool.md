[**rune**](README.md)

***

[rune](README.md) / ObjectPool

# Class: ObjectPool\<T\>

Defined in: core/objectPool.ts:40

Reusable object pool. [acquire](#acquire) returns a recycled instance or creates
one; [release](#release) returns it to the free list after running the optional
`reset` hook. Use this to keep churn-heavy allocations (particles,
projectiles, scratch buffers) out of the hot path's GC pressure.

## Example

```ts
const pool = new ObjectPool({ create: () => new Vector2(), reset: (v) => v.set(0, 0) })
const v = pool.acquire()
// …use v…
pool.release(v)
```

## Type Parameters

### T

`T`

Pooled object type.

## Constructors

### Constructor

```ts
new ObjectPool<T>(options): ObjectPool<T>;
```

Defined in: core/objectPool.ts:50

#### Parameters

##### options

[`ObjectPoolOptions`](Interface.ObjectPoolOptions.md)\<`T`\>

Pool configuration; see [ObjectPoolOptions](Interface.ObjectPoolOptions.md).

#### Returns

`ObjectPool`\<`T`\>

## Accessors

### freeCount

#### Get Signature

```ts
get freeCount(): number;
```

Defined in: core/objectPool.ts:88

Number of instances currently sitting in the free list.

##### Returns

`number`

***

### inUseCount

#### Get Signature

```ts
get inUseCount(): number;
```

Defined in: core/objectPool.ts:93

Number of instances currently checked out via [acquire](#acquire).

##### Returns

`number`

## Methods

### acquire()

```ts
acquire(): T;
```

Defined in: core/objectPool.ts:67

Take an instance from the free list, or create one. Throws if the live
count has reached [ObjectPoolOptions.maximumSize](Interface.ObjectPoolOptions.md#maximumsize).

#### Returns

`T`

A pooled instance ready for use.

***

### release()

```ts
release(item): void;
```

Defined in: core/objectPool.ts:82

Return `item` to the free list, running the configured `reset` hook first.

#### Parameters

##### item

`T`

Instance to recycle.

#### Returns

`void`
