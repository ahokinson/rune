[**rune**](README.md)

***

[rune](README.md) / SceneSwitchProps

# Interface: SceneSwitchProps\<TScreen\>

Defined in: SceneSwitch.tsx:12

Properties for the [SceneSwitch](Function.SceneSwitch.md) component.

## Type Parameters

### TScreen

`TScreen` *extends* `string`

## Properties

### active

```ts
active: Accessor<TScreen>;
```

Defined in: SceneSwitch.tsx:14

Reactive key identifying which screen to render.

***

### children

```ts
children: Partial<Record<TScreen, () => JSX.Element>>;
```

Defined in: SceneSwitch.tsx:16

Map of screen key to its render factory; only the active entry is mounted.
