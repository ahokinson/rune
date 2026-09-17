import { Vector2 } from "@/math/vector2"

/**
 * Polygon navigation mesh. Build it from convex polygons that tile the walkable
 * area; the mesh finds which polygons share edges (portals), A*-searches the
 * polygon graph between the start and goal polygons, then runs the funnel
 * algorithm ("string pulling") across the portal edges to produce a smooth,
 * taut path of waypoints — not the zig-zag a grid A* gives. Suited to open
 * walkable regions where a grid would be wastefully fine.
 *
 * @module
 */

/** A convex polygon expressed as its vertex list (in polygon order). */
export type NavPolygon = Vector2[]

interface Portal {
  left: Vector2
  right: Vector2
}

/**
 * Signed area ×2 of triangle abc: >0 if c is left of a→b, <0 if right, 0 collinear.
 */
function triarea2(a: Vector2, b: Vector2, c: Vector2): number {
  return (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)
}

/** Fuzzy equality on two points (within a 1e-9 epsilon). */
function pointsEqual(a: Vector2, b: Vector2): boolean {
  return Math.abs(a.x - b.x) < 1e-9 && Math.abs(a.y - b.y) < 1e-9
}

/** Centroid (mean vertex) of a polygon. */
function centroid(polygon: NavPolygon): Vector2 {
  const sum = new Vector2(0, 0)
  for (const vertex of polygon) sum.addInPlace(vertex)
  return sum.scaleInPlace(1 / polygon.length)
}

/** Even-odd ray-cast point-in-polygon test. */
function pointInPolygon(point: Vector2, polygon: NavPolygon): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const vi = polygon[i]!
    const vj = polygon[j]!
    const intersects =
      vi.y > point.y !== vj.y > point.y && point.x < ((vj.x - vi.x) * (point.y - vi.y)) / (vj.y - vi.y) + vi.x
    if (intersects) inside = !inside
  }
  return inside
}

/**
 * Polygon navigation mesh supporting funnel-string-pulled paths between any two
 * walkable points.
 */
export class NavMesh {
  private readonly polygons: NavPolygon[]
  private readonly centroids: Vector2[]
  // adjacency[i] = list of { polygon, shared edge endpoints } neighbouring polygon i.
  private readonly adjacency: Array<Array<{ to: number; a: Vector2; b: Vector2 }>>

  /**
   * @param polygons - Convex polygons tiling the walkable area.
   */
  constructor(polygons: NavPolygon[]) {
    this.polygons = polygons
    this.centroids = polygons.map(centroid)
    this.adjacency = polygons.map(() => [])
    this.buildAdjacency()
  }

  // Two polygons are adjacent when they share two vertices (an edge). Recorded
  // both ways with the shared endpoints, which become the funnel portal.
  private buildAdjacency(): void {
    for (let i = 0; i < this.polygons.length; i++) {
      for (let j = i + 1; j < this.polygons.length; j++) {
        const shared: Vector2[] = []
        for (const vertexA of this.polygons[i]!) {
          for (const vertexB of this.polygons[j]!) {
            if (pointsEqual(vertexA, vertexB)) shared.push(vertexA)
          }
        }
        if (shared.length >= 2) {
          const a = shared[0]!
          const b = shared[1]!
          this.adjacency[i]!.push({ to: j, a, b })
          this.adjacency[j]!.push({ to: i, a, b })
        }
      }
    }
  }

  private polygonAt(point: Vector2): number {
    for (let i = 0; i < this.polygons.length; i++) {
      if (pointInPolygon(point, this.polygons[i]!)) return i
    }
    return -1
  }

  // A* over the polygon graph, returning the polygon index path or null.
  private searchPolygons(startPoly: number, goalPoly: number, goal: Vector2): number[] | null {
    const open = new Set<number>([startPoly])
    const cameFrom = new Map<number, number>()
    const gScore = new Map<number, number>([[startPoly, 0]])
    const fScore = new Map<number, number>([[startPoly, this.centroids[startPoly]!.distanceTo(goal)]])

    while (open.size > 0) {
      let current = -1
      let best = Infinity
      for (const node of open) {
        const score = fScore.get(node) ?? Infinity
        if (score < best) {
          best = score
          current = node
        }
      }
      if (current === goalPoly) {
        const path = [current]
        while (cameFrom.has(current)) {
          current = cameFrom.get(current)!
          path.unshift(current)
        }
        return path
      }
      open.delete(current)
      for (const edge of this.adjacency[current]!) {
        const tentative =
          (gScore.get(current) ?? Infinity) + this.centroids[current]!.distanceTo(this.centroids[edge.to]!)
        if (tentative < (gScore.get(edge.to) ?? Infinity)) {
          cameFrom.set(edge.to, current)
          gScore.set(edge.to, tentative)
          fScore.set(edge.to, tentative + this.centroids[edge.to]!.distanceTo(goal))
          open.add(edge.to)
        }
      }
    }
    return null
  }

  // Build the portal list for a polygon path, with left/right assigned relative to
  // travel direction so the funnel reads them consistently.
  private buildPortals(polygonPath: number[], start: Vector2, goal: Vector2): Portal[] {
    const portals: Portal[] = [{ left: start, right: start }]
    for (let i = 0; i < polygonPath.length - 1; i++) {
      const from = polygonPath[i]!
      const to = polygonPath[i + 1]!
      const edge = this.adjacency[from]!.find((candidate) => candidate.to === to)!
      // Left is the endpoint left of the travel direction (from→to centroids).
      const travelDir = this.centroids[to]!.subtract(this.centroids[from]!)
      const aSide = triarea2(new Vector2(0, 0), travelDir, edge.a.subtract(this.centroids[from]!))
      // Funnel expects `left` on the left of travel; the cross-product handedness
      // here is the opposite, so the negative side is the funnel's left.
      if (aSide < 0) portals.push({ left: edge.a, right: edge.b })
      else portals.push({ left: edge.b, right: edge.a })
    }
    portals.push({ left: goal, right: goal })
    return portals
  }

  // Mikko Mononen's "simple stupid funnel algorithm": walk the portals tightening a
  // left/right funnel from the apex, emitting a corner whenever the funnel crosses.
  private funnel(portals: Portal[]): Vector2[] {
    const path: Vector2[] = [portals[0]!.left.clone()]
    let apex = portals[0]!.left
    let portalLeft = portals[0]!.left
    let portalRight = portals[0]!.right
    let apexIndex = 0
    let leftIndex = 0
    let rightIndex = 0

    for (let i = 1; i < portals.length; i++) {
      const left = portals[i]!.left
      const right = portals[i]!.right

      // Tighten the right side.
      if (triarea2(apex, portalRight, right) <= 0) {
        if (pointsEqual(apex, portalRight) || triarea2(apex, portalLeft, right) > 0) {
          portalRight = right
          rightIndex = i
        } else {
          // Right over left: insert the left vertex as a corner and restart.
          path.push(portalLeft.clone())
          apex = portalLeft
          apexIndex = leftIndex
          portalLeft = apex
          portalRight = apex
          leftIndex = apexIndex
          rightIndex = apexIndex
          i = apexIndex
          continue
        }
      }

      // Tighten the left side.
      if (triarea2(apex, portalLeft, left) >= 0) {
        if (pointsEqual(apex, portalLeft) || triarea2(apex, portalRight, left) < 0) {
          portalLeft = left
          leftIndex = i
        } else {
          path.push(portalRight.clone())
          apex = portalRight
          apexIndex = rightIndex
          portalLeft = apex
          portalRight = apex
          leftIndex = apexIndex
          rightIndex = apexIndex
          i = apexIndex
        }
      }
    }
    const last = portals[portals.length - 1]!.left
    if (!pointsEqual(path[path.length - 1]!, last)) path.push(last.clone())
    return path
  }

  /**
   * Find a smooth path from `start` to `goal`, or null if either lies outside the
   * mesh or no polygon route connects them.
   *
   * @param start - Walkable start point.
   * @param goal - Walkable goal point.
   * @returns Waypoint list with `start` and `goal` at the ends, or `null` if unreachable.
   */
  findPath(start: Vector2, goal: Vector2): Vector2[] | null {
    const startPoly = this.polygonAt(start)
    const goalPoly = this.polygonAt(goal)
    if (startPoly === -1 || goalPoly === -1) return null
    if (startPoly === goalPoly) return [start.clone(), goal.clone()]
    const polygonPath = this.searchPolygons(startPoly, goalPoly, goal)
    if (!polygonPath) return null
    const portals = this.buildPortals(polygonPath, start, goal)
    return this.funnel(portals)
  }
}
