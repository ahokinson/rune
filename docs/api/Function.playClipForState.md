[**rune**](README.md)

***

[rune](README.md) / playClipForState

# Function: playClipForState()

```ts
function playClipForState<TState, TFrame>(
   machine, 
   sprite, 
   stateToClip
): void;
```

Defined in: scene/spriteState.ts:26

Drive an [AnimatedSprite](Class.AnimatedSprite.md)'s current clip from a [StateMachine](Class.StateMachine.md): each
call plays the clip mapped to the machine's current state.

`play()` is a no-op when the clip is already current, so this is cheap to call
every update — the one canonical way to keep "what the entity is doing" and
"what it's showing" in lockstep, instead of hand-picking clip names in
`update()`. States with no entry in `stateToClip` leave the current clip
untouched.

## Type Parameters

### TState

`TState` *extends* `string`

### TFrame

`TFrame`

## Parameters

### machine

[`StateMachine`](Class.StateMachine.md)\<`TState`\>

Source state machine.

### sprite

[`AnimatedSprite`](Class.AnimatedSprite.md)\<`TFrame`\>

Sprite whose clip to set.

### stateToClip

`Partial`\<`Record`\<`TState`, `string`\>\>

Map from state name to clip name.

## Returns

`void`
