[**rune**](README.md)

***

[rune](README.md) / Menu

# Class: Menu\<T\>

Defined in: hud/menu.ts:52

Cursor state over a list of [MenuItem](Interface.MenuItem.md)s. Navigation skips disabled items
and, when `wrap` is set, rolls around the ends. Input-source agnostic: drive it
from a keyboard snapshot, an action map, or mouse hit-testing — it only owns the
selection.

## Type Parameters

### T

`T`

## Constructors

### Constructor

```ts
new Menu<T>(options): Menu<T>;
```

Defined in: hud/menu.ts:65

#### Parameters

##### options

[`MenuOptions`](Interface.MenuOptions.md)\<`T`\>

Items and navigation behaviour.

#### Returns

`Menu`\<`T`\>

## Properties

### cursor

```ts
cursor: number;
```

Defined in: hud/menu.ts:56

Index of the highlighted item.

***

### items

```ts
items: MenuItem<T>[];
```

Defined in: hud/menu.ts:54

The entries.

***

### orientation

```ts
readonly orientation: MenuOrientation;
```

Defined in: hud/menu.ts:58

Layout direction.

***

### wrap

```ts
readonly wrap: boolean;
```

Defined in: hud/menu.ts:60

Whether navigation wraps at the ends.

## Accessors

### current

#### Get Signature

```ts
get current(): MenuItem<T> | undefined;
```

Defined in: hud/menu.ts:78

The highlighted item, or `undefined` if the menu is empty.

##### Returns

[`MenuItem`](Interface.MenuItem.md)\<`T`\> \| `undefined`

***

### value

#### Get Signature

```ts
get value(): T | undefined;
```

Defined in: hud/menu.ts:83

The highlighted item's value, or `undefined` if the menu is empty.

##### Returns

`T` \| `undefined`

## Methods

### moveBy()

```ts
moveBy(delta): void;
```

Defined in: hud/menu.ts:94

Move the cursor `delta` steps (sign = direction), skipping disabled items.
Wraps around the ends when `wrap` is set, otherwise stops at the last enabled
item. A no-op if no item is enabled.

#### Parameters

##### delta

`number`

Steps to move; negative moves toward the start.

#### Returns

`void`

***

### next()

```ts
next(): void;
```

Defined in: hud/menu.ts:115

Move to the next enabled item (see [moveBy](#moveby)).

#### Returns

`void`

***

### previous()

```ts
previous(): void;
```

Defined in: hud/menu.ts:120

Move to the previous enabled item (see [moveBy](#moveby)).

#### Returns

`void`

***

### setCursor()

```ts
setCursor(index): boolean;
```

Defined in: hud/menu.ts:130

Jump the cursor to `index` if that item exists and is enabled.

#### Parameters

##### index

`number`

Target item index.

#### Returns

`boolean`

`true` if the cursor moved there.
