[**rune**](README.md)

***

[rune](README.md) / ObjectPoolOptions

# Interface: ObjectPoolOptions\<T\>

Defined in: core/objectPool.ts:13

Construction options for an [ObjectPool](Class.ObjectPool.md).

## Type Parameters

### T

`T`

Pooled object type.

## Properties

### create

```ts
create: () => T;
```

Defined in: core/objectPool.ts:15

Factory invoked to create a fresh instance when the pool is empty.

#### Returns

`T`

***

### initialSize?

```ts
optional initialSize?: number;
```

Defined in: core/objectPool.ts:19

Items to pre-allocate at construction (default 0).

***

### maximumSize?

```ts
optional maximumSize?: number;
```

Defined in: core/objectPool.ts:21

Hard cap on live instances; `acquire` throws once reached (default Infinity).

***

### reset?

```ts
optional reset?: (item) => void;
```

Defined in: core/objectPool.ts:17

Optional hook to reset an item's state before it is recycled.

#### Parameters

##### item

`T`

#### Returns

`void`
