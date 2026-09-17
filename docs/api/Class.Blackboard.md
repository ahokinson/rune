[**rune**](README.md)

***

[rune](README.md) / Blackboard

# Class: Blackboard\<TSchema\>

Defined in: ai/blackboard.ts:16

Typed key/value store shared between agents for coordination.

## Type Parameters

### TSchema

`TSchema` *extends* `object` = `Record`\<`string`, `unknown`\>

Record mapping keys to value types.

## Constructors

### Constructor

```ts
new Blackboard<TSchema>(): Blackboard<TSchema>;
```

#### Returns

`Blackboard`\<`TSchema`\>

## Methods

### clear()

```ts
clear(): void;
```

Defined in: ai/blackboard.ts:69

Remove every entry.

#### Returns

`void`

***

### delete()

```ts
delete<K>(key): boolean;
```

Defined in: ai/blackboard.ts:64

Remove `key` from the store.

#### Type Parameters

##### K

`K` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### key

`K`

Schema key.

#### Returns

`boolean`

`true` if the key was present and removed.

***

### get()

```ts
get<K>(key): TSchema[K] | undefined;
```

Defined in: ai/blackboard.ts:35

Read `key`.

#### Type Parameters

##### K

`K` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### key

`K`

Schema key.

#### Returns

`TSchema`\[`K`\] \| `undefined`

The stored value, or `undefined` if unset.

***

### getOr()

```ts
getOr<K>(key, fallback): TSchema[K];
```

Defined in: ai/blackboard.ts:46

Read with a fallback for unset keys.

#### Type Parameters

##### K

`K` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### key

`K`

Schema key.

##### fallback

`TSchema`\[`K`\]

Value to return when the key is unset.

#### Returns

`TSchema`\[`K`\]

The stored value, or `fallback` when unset.

***

### has()

```ts
has<K>(key): boolean;
```

Defined in: ai/blackboard.ts:54

#### Type Parameters

##### K

`K` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### key

`K`

Schema key.

#### Returns

`boolean`

`true` if `key` has been set.

***

### set()

```ts
set<K>(key, value): void;
```

Defined in: ai/blackboard.ts:25

Set `key` to `value`, overwriting any prior entry.

#### Type Parameters

##### K

`K` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### key

`K`

Schema key.

##### value

`TSchema`\[`K`\]

Value to store.

#### Returns

`void`
