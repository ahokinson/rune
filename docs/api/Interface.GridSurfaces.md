[**rune**](README.md)

***

[rune](README.md) / GridSurfaces

# Interface: GridSurfaces

Defined in: draw/raycast/grid.ts:25

Geometry sampler for [renderGridSurfaces](Function.renderGridSurfaces.md). The domain is infinite — the
implementation owns out-of-bounds behaviour. A column terminates when
`isSolid` returns `true`, so an adapter that returns `true` (and a finite
floor/ceiling) for missing cells produces a closed world.

## Methods

### ceilingHeight()

```ts
ceilingHeight(column, row): number;
```

Defined in: draw/raycast/grid.ts:28

#### Parameters

##### column

`number`

##### row

`number`

#### Returns

`number`

***

### floorHeight()

```ts
floorHeight(column, row): number;
```

Defined in: draw/raycast/grid.ts:27

#### Parameters

##### column

`number`

##### row

`number`

#### Returns

`number`

***

### isSolid()

```ts
isSolid(column, row): boolean;
```

Defined in: draw/raycast/grid.ts:26

#### Parameters

##### column

`number`

##### row

`number`

#### Returns

`boolean`
