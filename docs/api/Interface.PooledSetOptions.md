[**rune**](README.md)

***

[rune](README.md) / PooledSetOptions

# Interface: PooledSetOptions\<T\>

Defined in: core/pooledSet.ts:14

Construction options for a [PooledSet](Class.PooledSet.md).

## Type Parameters

### T

`T`

Item type.

## Properties

### capacity

```ts
capacity: number;
```

Defined in: core/pooledSet.ts:20

Maximum number of items live at once; spawning past this returns null.

***

### create

```ts
create: () => T;
```

Defined in: core/pooledSet.ts:16

Factory invoked to create a fresh instance when the pool is empty.

#### Returns

`T`

***

### reset?

```ts
optional reset?: (item) => void;
```

Defined in: core/pooledSet.ts:18

Optional hook to reset an item's state before it is recycled.

#### Parameters

##### item

`T`

#### Returns

`void`
