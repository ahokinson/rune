[**rune**](README.md)

***

[rune](README.md) / StateMachine

# Class: StateMachine\<TState\>

Defined in: ai/stateMachine.ts:25

State machine keyed by string state names.

## Type Parameters

### TState

`TState` *extends* `string`

String union of valid state names.

## Constructors

### Constructor

```ts
new StateMachine<TState>(): StateMachine<TState>;
```

#### Returns

`StateMachine`\<`TState`\>

## Accessors

### current

#### Get Signature

```ts
get current(): TState | null;
```

Defined in: ai/stateMachine.ts:42

The active state name, or `null` before the first transition.

##### Returns

`TState` \| `null`

## Methods

### addState()

```ts
addState(name, definition?): this;
```

Defined in: ai/stateMachine.ts:36

Register a state and its callbacks.

#### Parameters

##### name

`TState`

State name.

##### definition?

[`StateDefinition`](Interface.StateDefinition.md)\<`TState`\> = `{}`

Optional enter/update/exit callbacks.

#### Returns

`this`

`this` for chaining.

***

### transitionTo()

```ts
transitionTo(next): void;
```

Defined in: ai/stateMachine.ts:52

Transition to `next`, running the previous state's `onExit` and the new
state's `onEnter`. No-ops if `next` is already current.

#### Parameters

##### next

`TState`

State to transition to. Must have been registered.

#### Returns

`void`

***

### update()

```ts
update(deltaMilliseconds): void;
```

Defined in: ai/stateMachine.ts:72

Tick the current state.

#### Parameters

##### deltaMilliseconds

`number`

Time elapsed since the previous update.

#### Returns

`void`
