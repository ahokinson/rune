import {
  type AssetPack,
  Color,
  createFirstPersonCamera,
  SceneRenderer,
  syncFirstPersonCamera,
  updateTriggers,
  useActions,
  useAudio,
  useMouse,
  useScene,
  useUpdate,
  Vector2,
} from "@ahokinson/rune"
import { type JSX, onCleanup, onMount } from "solid-js"
import { playerBindings } from "../actions"
import type { EnemyAsset } from "../assets/enemy"
import type { ExitAsset } from "../assets/exit"
import { LevelAsset } from "../assets/level"
import type { PickupAsset } from "../assets/pickup"
import type { LevelTheme, ThemeAsset } from "../assets/theme"
import type { WeaponAsset } from "../assets/weapon"
import { CameraShake } from "../game/CameraShake"
import { DamageFlash } from "../game/DamageFlash"
import type { Decoration } from "../game/Decoration"
import type { Enemy } from "../game/Enemy"
import { Exit } from "../game/Exit"
import { HUD } from "../game/HUD"
import { EYE_HEIGHT, Level } from "../game/Level"
import { PLAYER_LAYER } from "../game/layers"
import { getHazard } from "../game/map"
import type { Pickup, PickupKind } from "../game/Pickup"
import { type FireResult, Player } from "../game/Player"
import { createBloodParticles, createMuzzleParticles } from "../game/particles"
import { bakeLightGrid, type LightAuthor } from "../game/render/lightGrid"
import { spawnLevelEntities } from "../game/spawn"
import { Weapon } from "../game/Weapon"
import type { GameState } from "../state"

export interface GameScreenProps {
  state: GameState
  pack: AssetPack
}

export function GameScreen(props: GameScreenProps): JSX.Element {
  const scene = useScene()
  const controls = useActions(playerBindings)
  const mouse = useMouse()

  const { canvasWidth, canvasHeight } = props.state
  const allLevels = props.pack.getAll(LevelAsset)
  const campaignLevels = allLevels.filter((l) => !l.document.name.endsWith("Test"))
  const testLevel = process.env.TOMB_TEST_LEVEL
  const testIndex = testLevel ? Number.parseInt(testLevel, 10) : NaN
  const level = Number.isFinite(testIndex) ? allLevels[testIndex]!.layout : campaignLevels[props.state.level()]!.layout
  const audio = useAudio()

  const themes: LevelTheme[] = [
    level.theme,
    ...level.extraThemeNames.map((name) => props.pack.get<ThemeAsset>(name).theme),
  ]

  const muzzleParticles = createMuzzleParticles(canvasWidth, canvasHeight)
  const bloodParticles = createBloodParticles()

  const weapon = new Weapon(canvasWidth, canvasHeight, props.pack.get<WeaponAsset>("pistol").config)
  const shake = new CameraShake()

  const enemies: Enemy[] = []
  const pickups: Pickup[] = []
  const decorations: Decoration[] = []

  const hud = new HUD({
    health: props.state.health,
    ammo: props.state.ammo,
    canvasWidth,
    canvasHeight,
  })

  const damageFlash = new DamageFlash({
    canvasWidth,
    canvasHeight,
    hudHeight: 3,
    health: props.state.health,
  })

  function findEnemyAlongRay(result: FireResult): Enemy | null {
    let bestEnemy: Enemy | null = null
    let bestDistance = result.distance
    const rightX = -result.direction.y
    const rightY = result.direction.x
    for (const enemy of enemies) {
      if (enemy.isDead) continue
      const dx = enemy.position.x - result.origin.x
      const dy = enemy.position.y - result.origin.y
      const along = dx * result.direction.x + dy * result.direction.y
      if (along <= 0 || along > bestDistance) continue
      const sideways = Math.abs(dx * rightX + dy * rightY)
      if (sideways > 0.4) continue
      bestEnemy = enemy
      bestDistance = along
    }
    return bestEnemy
  }

  const onPlayerFire = (result: FireResult) => {
    if (props.state.ammo() <= 0) return
    props.state.setAmmo((current) => Math.max(0, current - 1))
    muzzleParticles.origin = new Vector2(canvasWidth / 2, canvasHeight / 2 - 1)
    muzzleParticles.emit(8)
    weapon.trigger()
    audio.play("shot")
    shake.trigger(0.04, 80)
    const hit = findEnemyAlongRay(result)
    if (hit) {
      const enemyPosition = hit.position.clone()
      hit.kill()
      audio.play("impHurt")
      shake.trigger(0.06, 100)
      levelActor.flashHitMarker()
      const screen = camera.projection.worldToScreen(enemyPosition, camera)
      if (Number.isFinite(screen.x)) {
        bloodParticles.origin = new Vector2(screen.x, screen.y + 1)
        bloodParticles.emit(14)
      }
    }
  }

  const player = new Player({
    position: level.playerStart.clone(),
    yaw: 0,
    controls,
    mouse,
    tileMap: level.tileMap,
    obstacles: decorations,
    onFire: onPlayerFire,
    onDoorToggle: () => audio.play("pickup"),
  })

  const camera = createFirstPersonCamera({
    viewportWidth: canvasWidth,
    viewportHeight: canvasHeight,
    fieldOfViewDegrees: 66,
  })

  const blockedCells = new Set<number>()

  const impConfig = props.pack.get<EnemyAsset>("imp").config
  const hellknightConfig = props.pack.tryGet<EnemyAsset>("hellknight")?.config ?? null
  const healthConfig = props.pack.get<PickupAsset>("health").config
  const ammoConfig = props.pack.get<PickupAsset>("ammo").config
  const exitConfig = props.pack.get<ExitAsset>("exit").config

  const onEnemyAttack = (damage: number) => {
    props.state.setHealth((current) => Math.max(0, current - damage))
    audio.play("playerHurt")
    shake.trigger(0.15, 200)
    damageFlash.trigger(Math.min(1, damage / 12), 240)
  }

  const onPickupCollected = (kind: PickupKind, amount: number) => {
    if (kind === "health") {
      props.state.setHealth((current) => Math.min(100, current + amount))
    } else {
      props.state.setAmmo((current) => current + amount)
    }
    audio.play("pickup")
  }

  const spawned = spawnLevelEntities({
    spawns: level.spawns,
    tileMap: level.tileMap,
    pack: props.pack,
    player,
    blockedCells,
    configs: { imp: impConfig, hellknight: hellknightConfig, health: healthConfig, ammo: ammoConfig },
    onEnemyAttack,
    onPickupCollected,
  })
  enemies.push(...spawned.enemies)
  pickups.push(...spawned.pickups)
  decorations.push(...spawned.decorations)

  for (const d of decorations) {
    if (!d.solid) continue
    const col = Math.floor(d.position.x)
    const row = Math.floor(d.position.y)
    blockedCells.add(row * 16384 + col)
  }

  const allLights: LightAuthor[] = [...level.authoredLights]
  for (const d of decorations) {
    if (!d.light) continue
    allLights.push({
      at: [d.position.x, d.position.y],
      color: d.light.color,
      radius: d.light.radius,
      intensity: d.light.intensity ?? 1,
    })
  }
  const lightGrid =
    allLights.length === level.authoredLights.length
      ? level.lightGrid
      : bakeLightGrid(level.levelWidth, level.levelHeight, allLights)

  const levelActor = new Level({
    tileMap: level.tileMap,
    camera,
    columnCount: canvasWidth,
    rowCount: canvasHeight,
    themes,
    lightGrid,
  })

  scene.camera.position = new Vector2(canvasWidth / 2, canvasHeight / 2)
  player.collisionLayer = PLAYER_LAYER

  for (const enemy of enemies) levelActor.billboards.push(enemy)
  for (const pickup of pickups) levelActor.billboards.push(pickup)
  for (const decoration of decorations) levelActor.billboards.push(decoration)

  const exit = new Exit({
    position: level.exitCenter.clone(),
    config: exitConfig,
    tileMap: level.tileMap,
    onReached: () => {
      audio.play("exit")
      props.state.nextLevel()
    },
  })
  levelActor.billboards.push(exit)

  const lastPlayerPosition = player.position.clone()
  let bobPhase = 0
  let hazardFlashAccumulator = 0
  useUpdate((deltaMilliseconds) => {
    shake.update(deltaMilliseconds)
    syncFirstPersonCamera(camera, player)
    levelActor.eyeZ = player.z + EYE_HEIGHT
    const movementDistance = player.position.distanceTo(lastPlayerPosition)
    const isMoving = movementDistance > 0.0005
    weapon.notifyMovement(deltaMilliseconds, isMoving)
    if (isMoving) bobPhase += deltaMilliseconds * 0.008
    const forward = player.forwardDirection()
    const rightX = -forward.y
    const rightY = forward.x
    const bobLateral = isMoving ? Math.sin(bobPhase) * 0.045 : 0
    const bobAxial = isMoving ? Math.abs(Math.sin(bobPhase)) * 0.02 : 0
    camera.position.x += shake.offset.x + bobLateral * rightX + bobAxial * forward.x
    camera.position.y += shake.offset.y + bobLateral * rightY + bobAxial * forward.y
    lastPlayerPosition.copyFrom(player.position)
    updateTriggers(scene)
    scene.pruneRemoved()

    const dps = getHazard(level.tileMap, Math.floor(player.position.x), Math.floor(player.position.y))
    if (dps > 0) {
      const dtSeconds = deltaMilliseconds / 1000
      props.state.setHealth((current) => Math.max(0, current - dps * dtSeconds))
      hazardFlashAccumulator += deltaMilliseconds
      if (hazardFlashAccumulator >= 250) {
        hazardFlashAccumulator = 0
        damageFlash.trigger(0.35, 220)
        shake.trigger(0.04, 120)
      }
    } else {
      hazardFlashAccumulator = 0
    }

    if (props.state.health() <= 0) props.state.setScreen("over")
  })

  onMount(() => {
    void audio.load("shot", "assets/shot.wav")
    void audio.load("impHurt", "assets/impHurt.wav")
    void audio.load("playerHurt", "assets/playerHurt.wav")
    void audio.load("pickup", "assets/pickup.wav")
    void audio.load("exit", "assets/exit.wav")
    scene.addAll([
      player,
      levelActor,
      muzzleParticles,
      bloodParticles,
      weapon,
      damageFlash,
      hud,
      ...enemies,
      ...pickups,
      ...decorations,
      exit,
    ])
  })

  onCleanup(() => {
    scene.clear()
  })

  return <SceneRenderer clearColor={Color.fromHex("#000000")} />
}
