[**rune**](README.md)

***

[rune](README.md) / TileAppearance

# Type Alias: TileAppearance\<TCell\>

```ts
type TileAppearance<TCell> = 
  | Sprite
  | AnimatedSprite<Sprite>
  | ((context) => Sprite);
```

Defined in: draw/tileSet.ts:30

What a cell looks like: a fixed sprite, an animated sprite the tile set keeps
ticking, or a function that chooses a sprite from its surroundings.

## Type Parameters

### TCell

`TCell`
