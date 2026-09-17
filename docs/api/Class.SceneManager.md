[**rune**](README.md)

***

[rune](README.md) / SceneManager

# Class: SceneManager

Defined in: scene/sceneManager.ts:15

A stack of [Scene](Class.SceneInstance.md)s with one active top-of-stack scene.

Use it as the engine's central scene switch: `push` to enter a new scene, `pop`
to return to the previous one, `replace` to swap.

## Constructors

### Constructor

```ts
new SceneManager(): SceneManager;
```

#### Returns

`SceneManager`

## Accessors

### current

#### Get Signature

```ts
get current(): SceneInstance | null;
```

Defined in: scene/sceneManager.ts:19

The active (top-of-stack) scene, or `null` when the stack is empty.

##### Returns

[`SceneInstance`](Class.SceneInstance.md) \| `null`

***

### size

#### Get Signature

```ts
get size(): number;
```

Defined in: scene/sceneManager.ts:24

Number of scenes on the stack.

##### Returns

`number`

## Methods

### clear()

```ts
clear(): void;
```

Defined in: scene/sceneManager.ts:63

Pop every scene off the stack, firing [Scene.onExit](Class.SceneInstance.md#onexit) on each.

#### Returns

`void`

***

### pop()

```ts
pop(): SceneInstance | null;
```

Defined in: scene/sceneManager.ts:45

Pop the active scene off the stack and fire its [Scene.onExit](Class.SceneInstance.md#onexit).

#### Returns

[`SceneInstance`](Class.SceneInstance.md) \| `null`

The removed scene, or `null` if the stack was empty.

***

### push()

```ts
push(scene): SceneInstance;
```

Defined in: scene/sceneManager.ts:34

Push a scene onto the stack and fire its [Scene.onEnter](Class.SceneInstance.md#onenter).

#### Parameters

##### scene

[`SceneInstance`](Class.SceneInstance.md)

Scene to enter.

#### Returns

[`SceneInstance`](Class.SceneInstance.md)

The same `scene`, for chaining.

***

### replace()

```ts
replace(scene): SceneInstance;
```

Defined in: scene/sceneManager.ts:57

Replace the active scene with `scene`: pop the current one, then push the new.

#### Parameters

##### scene

[`SceneInstance`](Class.SceneInstance.md)

Scene to enter.

#### Returns

[`SceneInstance`](Class.SceneInstance.md)

The same `scene`, for chaining.

***

### scenes()

```ts
scenes(): readonly SceneInstance[];
```

Defined in: scene/sceneManager.ts:72

Read-only view of the stack, bottom to top.

#### Returns

readonly [`SceneInstance`](Class.SceneInstance.md)[]

A readonly array of scenes.
