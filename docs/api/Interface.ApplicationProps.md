[**rune**](README.md)

***

[rune](README.md) / ApplicationProps

# Interface: ApplicationProps

Defined in: Application.tsx:36

Properties for the [Application](Function.Application.md) component.

## Properties

### audio?

```ts
optional audio?: AudioContext;
```

Defined in: Application.tsx:44

Audio context to use; defaults to a [NullAudioContext](Class.NullAudioContext.md).

***

### children?

```ts
optional children?: any;
```

Defined in: Application.tsx:46

Component subtree that runs inside the application context.

***

### maximumSubSteps?

```ts
optional maximumSubSteps?: number;
```

Defined in: Application.tsx:40

Maximum sub-steps allowed per frame to catch up (default 5).

***

### randomSeed?

```ts
optional randomSeed?: number;
```

Defined in: Application.tsx:42

Seed for the shared deterministic [Random](Class.Random.md) (default `Date.now()`).

***

### ticksPerSecond?

```ts
optional ticksPerSecond?: number;
```

Defined in: Application.tsx:38

Fixed-update rate in Hz (default 30).
