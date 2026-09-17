[**rune**](README.md)

***

[rune](README.md) / Emitter

# Class: Emitter\<T\>

Defined in: fx/emitter.ts:38

A self-managing population of pooled items that appear over time, live, then
expire. Each `update` expires finished items and, with probability
`spawnChance`, spawns one more (up to `capacity`). Particles is one concrete
emitter; AttackFeed-style event streams are another. Distinct from
EventEmitter (pub/sub) in core/events.

## Type Parameters

### T

`T`

## Constructors

### Constructor

```ts
new Emitter<T>(options): Emitter<T>;
```

Defined in: fx/emitter.ts:49

#### Parameters

##### options

[`EmitterOptions`](Interface.EmitterOptions.md)\<`T`\>

Emitter configuration.

#### Returns

`Emitter`\<`T`\>

## Properties

### total

```ts
total: number = 0;
```

Defined in: fx/emitter.ts:44

Total items ever spawned.

## Accessors

### active

#### Get Signature

```ts
get active(): T[];
```

Defined in: fx/emitter.ts:61

Currently live items.

##### Returns

`T`[]

***

### size

#### Get Signature

```ts
get size(): number;
```

Defined in: fx/emitter.ts:66

Number of live items.

##### Returns

`number`

## Methods

### clear()

```ts
clear(): void;
```

Defined in: fx/emitter.ts:102

Drop every live item and reset rate tracking.

#### Returns

`void`

***

### ratePerWindow()

```ts
ratePerWindow(tick): number;
```

Defined in: fx/emitter.ts:97

Items spawned within the last `rateWindow`; 0 when rate tracking is off.

#### Parameters

##### tick

`number`

Current time.

#### Returns

`number`

Spawn count over the configured window.

***

### update()

```ts
update(tick, hooks): T | null;
```

Defined in: fx/emitter.ts:77

Expire finished items, then maybe spawn a new one.

#### Parameters

##### tick

`number`

Current time (any consistent unit).

##### hooks

[`EmitterUpdate`](Interface.EmitterUpdate.md)\<`T`\>

Expire/initialize callbacks for this step.

#### Returns

`T` \| `null`

The spawned item, or `null` if nothing spawned this tick.
