import { AssetPack } from "@ahokinson/rune"
import { DecorationAsset } from "./decoration"
import { EnemyAsset } from "./enemy"
import { ExitAsset } from "./exit"
import { LevelAsset } from "./level"
import { PickupAsset } from "./pickup"
import { ThemeAsset } from "./theme"
import { WeaponAsset } from "./weapon"

const ASSETS_DIR = import.meta.dir

export function loadAssets(): AssetPack {
  return AssetPack.mount(ASSETS_DIR, {
    enemy: EnemyAsset,
    pickup: PickupAsset,
    weapon: WeaponAsset,
    exit: ExitAsset,
    level: LevelAsset,
    theme: ThemeAsset,
    decoration: DecorationAsset,
  })
}
