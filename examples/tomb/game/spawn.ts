import type { AssetPack, TileMap } from "@ahokinson/rune"
import type { DecorationAsset } from "../assets/decoration"
import type { EnemyConfig } from "../assets/enemy"
import type { PickupConfig } from "../assets/pickup"
import { Decoration } from "./Decoration"
import { Enemy } from "./Enemy"
import type { SpawnPoint, TombCell } from "./map"
import { Pickup, type PickupKind } from "./Pickup"
import type { Player } from "./Player"

export interface SpawnConfigs {
  imp: EnemyConfig
  hellknight: EnemyConfig | null
  health: PickupConfig
  ammo: PickupConfig
}

export interface SpawnDeps {
  spawns: SpawnPoint[]
  tileMap: TileMap<TombCell>
  pack: AssetPack
  player: Player
  blockedCells: Set<number>
  configs: SpawnConfigs
  onEnemyAttack: (damage: number) => void
  onPickupCollected: (kind: PickupKind, amount: number) => void
}

export interface SpawnedEntities {
  enemies: Enemy[]
  pickups: Pickup[]
  decorations: Decoration[]
}

/** Instantiate the enemies, pickups, and decorations described by a level's spawn points. */
export function spawnLevelEntities(deps: SpawnDeps): SpawnedEntities {
  const { spawns, tileMap, pack, player, blockedCells, configs } = deps
  const enemies: Enemy[] = []
  const pickups: Pickup[] = []
  const decorations: Decoration[] = []

  const addEnemy = (spawn: SpawnPoint, config: EnemyConfig) => {
    enemies.push(
      new Enemy({
        position: spawn.position.clone(),
        player,
        tileMap,
        config,
        blockedCells,
        onAttack: deps.onEnemyAttack,
      }),
    )
  }

  const addPickup = (spawn: SpawnPoint, kind: PickupKind, config: PickupConfig) => {
    pickups.push(
      new Pickup({
        position: spawn.position.clone(),
        kind,
        amount: spawn.amount,
        config,
        tileMap,
        onCollected: deps.onPickupCollected,
      }),
    )
  }

  for (const spawn of spawns) {
    if (spawn.kind === "imp") {
      addEnemy(spawn, configs.imp)
    } else if (spawn.kind === "hellknight" && configs.hellknight) {
      addEnemy(spawn, configs.hellknight)
    } else if (spawn.kind === "health") {
      addPickup(spawn, "health", configs.health)
    } else if (spawn.kind === "ammo") {
      addPickup(spawn, "ammo", configs.ammo)
    } else if (spawn.kind === "decoration" && spawn.spawnRef) {
      decorations.push(
        new Decoration({
          position: spawn.position.clone(),
          config: pack.get<DecorationAsset>(spawn.spawnRef).config,
          tileMap,
        }),
      )
    }
  }

  return { enemies, pickups, decorations }
}
