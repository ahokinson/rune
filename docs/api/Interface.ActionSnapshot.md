[**rune**](README.md)

***

[rune](README.md) / ActionSnapshot

# Interface: ActionSnapshot\<TAction\>

Defined in: input/actions.ts:28

Read-only view of an action's current and edge state, mirroring the
keyboard/mouse snapshot API but keyed by action name.

## Type Parameters

### TAction

`TAction` *extends* `string`

Union of action names.

## Methods

### isDown()

```ts
isDown(action): boolean;
```

Defined in: input/actions.ts:30

`true` while any binding of `action` is currently held.

#### Parameters

##### action

`TAction`

#### Returns

`boolean`

***

### wasPressed()

```ts
wasPressed(action): boolean;
```

Defined in: input/actions.ts:32

`true` on the frame any binding of `action` transitioned from up to down.

#### Parameters

##### action

`TAction`

#### Returns

`boolean`

***

### wasReleased()

```ts
wasReleased(action): boolean;
```

Defined in: input/actions.ts:34

`true` on the frame any binding of `action` transitioned from down to up.

#### Parameters

##### action

`TAction`

#### Returns

`boolean`
