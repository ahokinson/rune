[**rune**](README.md)

***

[rune](README.md) / StateDefinition

# Interface: StateDefinition\<TState\>

Defined in: ai/stateMachine.ts:11

Callbacks for a single state in a [StateMachine](Class.StateMachine.md).

## Type Parameters

### TState

`TState` *extends* `string`

## Properties

### onEnter?

```ts
optional onEnter?: (previous) => void;
```

Defined in: ai/stateMachine.ts:13

Called once when this state is entered.

#### Parameters

##### previous

`TState` \| `null`

#### Returns

`void`

***

### onExit?

```ts
optional onExit?: (next) => void;
```

Defined in: ai/stateMachine.ts:17

Called once when this state is exited by a transition.

#### Parameters

##### next

`TState`

#### Returns

`void`

***

### onUpdate?

```ts
optional onUpdate?: (deltaMilliseconds) => void;
```

Defined in: ai/stateMachine.ts:15

Called each [StateMachine.update](Class.StateMachine.md#update) while this state is active.

#### Parameters

##### deltaMilliseconds

`number`

#### Returns

`void`
