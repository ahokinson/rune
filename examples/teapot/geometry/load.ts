import { readFileSync } from "node:fs"
import { type Mesh, normalizeMesh, parseObj, reverseWinding } from "@ahokinson/rune"
import { makeTeapot } from "./teapot"

// Load the headline teapot from the bundled OBJ asset, recentred + scaled to
// ~unit size and reoriented Z-up → Y-up (the model stands on z = 0). Falls back
// to the procedural curve teapot if the asset can't be read, so the example is
// never blocked on the file.
export function loadTeapot(): Mesh {
  try {
    const text = readFileSync(new URL("../assets/teapot.obj", import.meta.url), "utf8")
    const mesh = parseObj(text)
    // The OBJ is Z-up (base at z = 0). rune's camera up is (0, -1, 0), so model
    // up must map to world -y to read right-side-up: +z → -y. The map is a pure
    // rotation (no winding flip), but the asset winds opposite rune's front-face
    // convention, so reverse it — otherwise culling shows the teapot's interior.
    return reverseWinding(normalizeMesh(mesh, { size: 1.2, axisMap: (x, y, z) => [x, -z, y] }))
  } catch {
    return makeTeapot()
  }
}
