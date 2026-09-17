[**rune**](README.md)

***

[rune](README.md) / SceneProps

# Interface: SceneProps

Defined in: Scene.tsx:14

Properties for the [Scene](Function.Scene.md) component.

## Properties

### children?

```ts
optional children?: any;
```

Defined in: Scene.tsx:20

Children rendered inside the scene context provider.

***

### name

```ts
name: string;
```

Defined in: Scene.tsx:16

Scene name used for debugging and inspection.

***

### scene?

```ts
optional scene?: SceneInstance;
```

Defined in: Scene.tsx:18

Existing scene instance to mount; a new scene is created from `name` when omitted.
