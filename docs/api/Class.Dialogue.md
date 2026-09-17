[**rune**](README.md)

***

[rune](README.md) / Dialogue

# Class: Dialogue

Defined in: hud/dialogue.ts:30

A paged, character-by-character text reveal. Drive it from the frame loop with
[advance](#advance); read [visibleText](#visibletext) to render. [skip](#skip) completes the
current page instantly and [next](#next) moves on, so a single "confirm" key can
skip-then-advance the way dialogue boxes conventionally do.

## Constructors

### Constructor

```ts
new Dialogue(options): Dialogue;
```

Defined in: hud/dialogue.ts:41

#### Parameters

##### options

[`DialogueOptions`](Interface.DialogueOptions.md)

Pages and reveal speed.

#### Returns

`Dialogue`

## Properties

### pageIndex

```ts
pageIndex: number = 0;
```

Defined in: hud/dialogue.ts:34

Index of the page being revealed.

***

### pages

```ts
readonly pages: string[];
```

Defined in: hud/dialogue.ts:32

The pages of text.

## Accessors

### current

#### Get Signature

```ts
get current(): string;
```

Defined in: hud/dialogue.ts:47

The full text of the current page (empty once finished).

##### Returns

`string`

***

### isFinished

#### Get Signature

```ts
get isFinished(): boolean;
```

Defined in: hud/dialogue.ts:62

`true` once the last page has been advanced past.

##### Returns

`boolean`

***

### isPageComplete

#### Get Signature

```ts
get isPageComplete(): boolean;
```

Defined in: hud/dialogue.ts:57

`true` once every character of the current page is shown.

##### Returns

`boolean`

***

### visibleText

#### Get Signature

```ts
get visibleText(): string;
```

Defined in: hud/dialogue.ts:52

The portion of the current page revealed so far.

##### Returns

`string`

## Methods

### advance()

```ts
advance(deltaMilliseconds): void;
```

Defined in: hud/dialogue.ts:72

Reveal more of the current page based on elapsed time. A no-op once the page
is complete or the dialogue is finished.

#### Parameters

##### deltaMilliseconds

`number`

Frame delta in milliseconds.

#### Returns

`void`

***

### next()

```ts
next(): boolean;
```

Defined in: hud/dialogue.ts:88

Move to the next page and restart its reveal. Returns `false` once there are
no more pages (the dialogue is finished).

#### Returns

`boolean`

`true` if a next page is now showing, `false` if finished.

***

### skip()

```ts
skip(): void;
```

Defined in: hud/dialogue.ts:78

Reveal the rest of the current page immediately.

#### Returns

`void`
