[**rune**](README.md)

***

[rune](README.md) / KeyboardSnapshot

# Interface: KeyboardSnapshot

Defined in: input/keyboard.ts:13

Read-only view of keyboard state used by action mapping and gameplay code.

## Methods

### axis()

```ts
axis(negative, positive): -1 | 0 | 1;
```

Defined in: input/keyboard.ts:21

`-1` if `negative` is down, `1` if `positive` is down, `0` otherwise/both.

#### Parameters

##### negative

`string`

##### positive

`string`

#### Returns

`-1` \| `0` \| `1`

***

### isDown()

```ts
isDown(key): boolean;
```

Defined in: input/keyboard.ts:15

`true` while `key` is currently held.

#### Parameters

##### key

`string`

#### Returns

`boolean`

***

### wasPressed()

```ts
wasPressed(key): boolean;
```

Defined in: input/keyboard.ts:17

`true` on the frame `key` transitioned from up to down (phase-scoped).

#### Parameters

##### key

`string`

#### Returns

`boolean`

***

### wasReleased()

```ts
wasReleased(key): boolean;
```

Defined in: input/keyboard.ts:19

`true` on the frame `key` transitioned from down to up (phase-scoped).

#### Parameters

##### key

`string`

#### Returns

`boolean`
