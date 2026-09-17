// Headless render check: draw a few pet states to an InMemoryCanvas and dump the
// characters so the layout/sprites can be eyeballed without a live terminal.
import { Camera, InMemoryCanvas } from "@ahokinson/rune"
import { Background } from "../scene/Background"
import { createPetUi, Hud } from "../scene/Hud"
import { Minigame } from "../scene/Minigame"
import { Pet } from "../scene/Pet"
import { Prop, PropKind } from "../scene/props"
import { Branch, createPetState, LifeStage, type PetState } from "../scene/state"

const BOWL_X = -22
const BED_X = -8
const TOY_X = 22

function dump(label: string, mutate: (state: PetState) => void): void {
  const state = createPetState()
  mutate(state)
  const ui = createPetUi()
  const canvas = new InMemoryCanvas(70, 24)
  const camera = new Camera()
  const background = new Background({ state })
  const bowl = new Prop({ kind: PropKind.Bowl, offsetCells: BOWL_X })
  const bed = new Prop({ kind: PropKind.Bed, offsetCells: BED_X })
  const toy = new Prop({ kind: PropKind.Toy, offsetCells: TOY_X })
  const pet = new Pet({ state, targets: { food: BOWL_X, sleep: BED_X, play: TOY_X } })
  const hud = new Hud({ state, ui })
  // Tick once so the pet builds the right stage animation and the AI picks a state.
  background.update(16)
  pet.update(16)
  hud.update(16)
  background.draw(canvas, camera)
  bowl.draw(canvas, camera)
  bed.draw(canvas, camera)
  toy.draw(canvas, camera)
  pet.draw(canvas, camera)
  hud.draw(canvas, camera)

  console.log(`\n=== ${label} ===`)
  for (let y = 0; y < canvas.height; y++) {
    let row = ""
    for (let x = 0; x < canvas.width; x++) row += canvas.cellAt(x, y)?.character ?? " "
    console.log(row.replace(/\s+$/, ""))
  }
}

function dumpMinigame(label: string): void {
  const state = createPetState()
  state.ageSeconds = 200
  state.stage = LifeStage.Chonkus
  const canvas = new InMemoryCanvas(70, 24)
  const camera = new Camera()
  const minigame = new Minigame({ state, onDone: () => {} })
  minigame.update(400) // advance the marker off the left edge
  minigame.draw(canvas, camera)
  console.log(`\n=== ${label} ===`)
  for (let y = 0; y < canvas.height; y++) {
    let row = ""
    for (let x = 0; x < canvas.width; x++) row += canvas.cellAt(x, y)?.character ?? " "
    console.log(row.replace(/\s+$/, ""))
  }
}

dump("egg", () => {})
dump("chonkus happy (good line)", (state) => {
  state.ageSeconds = 200
  state.stage = LifeStage.Chonkus
  state.branch = Branch.Good
  state.happiness = 1
  state.hunger = 1
})
dump("mochi hungry + sick + poop", (state) => {
  state.ageSeconds = 12
  state.stage = LifeStage.Mochi
  state.hunger = 0.1
  state.sick = true
})
dump("grouch teen (bad line)", (state) => {
  state.ageSeconds = 130
  state.stage = LifeStage.Grouch
  state.branch = Branch.Bad
  state.happiness = 0.3
})
dump("ghoul adult (bad line)", (state) => {
  state.ageSeconds = 400
  state.stage = LifeStage.Ghoul
  state.branch = Branch.Bad
})
dump("dead at night", (state) => {
  state.ageSeconds = 45
  state.dead = true
})
dumpMinigame("play minigame")
