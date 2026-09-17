[**rune**](README.md)

***

[rune](README.md) / TweenState

# Enumeration: TweenState

Defined in: tween/tween.ts:29

Lifecycle state of a [Tween](Class.Tween.md).

## Enumeration Members

### Cancelled

```ts
Cancelled: "cancelled";
```

Defined in: tween/tween.ts:37

Cancelled via [Tween.cancel](Class.Tween.md#cancel) before completing.

***

### Completed

```ts
Completed: "completed";
```

Defined in: tween/tween.ts:35

Reached its target and fired completion callbacks.

***

### Pending

```ts
Pending: "pending";
```

Defined in: tween/tween.ts:31

Created but not yet started via [Tween.start](Class.Tween.md#start).

***

### Running

```ts
Running: "running";
```

Defined in: tween/tween.ts:33

Currently advancing toward its target.
