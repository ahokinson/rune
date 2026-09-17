[**rune**](README.md)

***

[rune](README.md) / SaveStore

# Class: SaveStore

Defined in: core/save.ts:29

A directory of named save slots. Each slot is one file holding the stable
serialisation of a plain-data snapshot; reads parse it back. Methods are async
(file I/O) and never throw on a missing slot — [load](#load) returns `null` and
[has](#has) returns `false`.

## Constructors

### Constructor

```ts
new SaveStore(options): SaveStore;
```

Defined in: core/save.ts:36

#### Parameters

##### options

[`SaveStoreOptions`](Interface.SaveStoreOptions.md)

Target directory and file extension.

#### Returns

`SaveStore`

## Methods

### delete()

```ts
delete(slot): Promise<void>;
```

Defined in: core/save.ts:90

Delete `slot` if present (a no-op otherwise).

#### Parameters

##### slot

`string`

Slot name.

#### Returns

`Promise`\<`void`\>

***

### has()

```ts
has(slot): Promise<boolean>;
```

Defined in: core/save.ts:76

#### Parameters

##### slot

`string`

Slot name.

#### Returns

`Promise`\<`boolean`\>

`true` if the slot exists and is readable.

***

### list()

```ts
list(): Promise<string[]>;
```

Defined in: core/save.ts:100

List the slot names present in the directory (without the extension),
alphabetically. Returns an empty array if the directory doesn't exist yet.

#### Returns

`Promise`\<`string`[]\>

Slot names.

***

### load()

```ts
load<T>(slot): Promise<T | null>;
```

Defined in: core/save.ts:64

Read `slot` back, or `null` if it doesn't exist.

#### Type Parameters

##### T

`T` *extends* [`Serializable`](TypeAlias.Serializable.md) = [`Serializable`](TypeAlias.Serializable.md)

Concrete shape to cast the snapshot to.

#### Parameters

##### slot

`string`

Slot name.

#### Returns

`Promise`\<`T` \| `null`\>

The parsed snapshot, or `null` when the slot is absent.

***

### save()

```ts
save(slot, value): Promise<void>;
```

Defined in: core/save.ts:52

Write `value` to `slot`, creating the directory if needed. Overwrites any
existing slot of the same name.

#### Parameters

##### slot

`string`

Slot name (used as the filename stem).

##### value

[`Serializable`](TypeAlias.Serializable.md)

Plain-data snapshot to persist.

#### Returns

`Promise`\<`void`\>
