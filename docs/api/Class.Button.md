[**rune**](README.md)

***

[rune](README.md) / Button

# Class: Button

Defined in: hud/button.ts:29

A canvas-space push button. Its [bounds](#bounds) are set by [drawButton](Function.drawButton.md)
each frame; [update](#update) reads a [MouseSnapshot](Interface.MouseSnapshot.md) to refresh hover/press
and reports a completed click (press then release inside the bounds).

## Constructors

### Constructor

```ts
new Button(options): Button;
```

Defined in: hud/button.ts:44

#### Parameters

##### options

[`ButtonOptions`](Interface.ButtonOptions.md)

Label and enabled state.

#### Returns

`Button`

## Properties

### bounds

```ts
bounds: Rectangle;
```

Defined in: hud/button.ts:35

Last drawn rectangle, used for hit-testing.

***

### enabled

```ts
enabled: boolean;
```

Defined in: hud/button.ts:33

Whether the button responds to the pointer.

***

### hovered

```ts
hovered: boolean = false;
```

Defined in: hud/button.ts:37

`true` while the pointer is over the button.

***

### label

```ts
label: string;
```

Defined in: hud/button.ts:31

Display text.

***

### pressed

```ts
pressed: boolean = false;
```

Defined in: hud/button.ts:39

`true` while a press started on the button and the pointer hasn't released.

## Methods

### contains()

```ts
contains(x, y): boolean;
```

Defined in: hud/button.ts:56

Point-in-bounds test against the last drawn rectangle.

#### Parameters

##### x

`number`

Pointer column.

##### y

`number`

Pointer row.

#### Returns

`boolean`

`true` if `(x, y)` is inside [bounds](#bounds).

***

### update()

```ts
update(mouse, button?): boolean;
```

Defined in: hud/button.ts:70

Update hover/press from the pointer and report whether a click completed this
call. A click is a press that began on the button and released while still
over it. Disabled buttons never hover, press, or click.

#### Parameters

##### mouse

[`MouseSnapshot`](Interface.MouseSnapshot.md)

Current mouse snapshot.

##### button?

[`MouseButton`](Enumeration.MouseButton.md) = `Buttons.Left`

Which mouse button to react to (default [MouseButton.Left](Enumeration.MouseButton.md#left)).

#### Returns

`boolean`

`true` exactly on the frame the click completes.
