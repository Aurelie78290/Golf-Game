import * as THREE from 'three'
import type { Fairway, Hill } from '../types'

// Smooth cosine bump per hill, summed. Zero outside its radius so tee/hole/
// obstacle areas can stay flat just by keeping hills away from them.
export function terrainHeight(x: number, z: number, hills?: Hill[]): number {
  if (!hills || hills.length === 0) return 0
  let h = 0
  for (const hill of hills) {
    const dx = (x - hill.center[0]) / hill.radiusX
    const dz = (z - hill.center[1]) / hill.radiusZ
    const d = Math.sqrt(dx * dx + dz * dz)
    if (d < 1) h += (hill.height * (Math.cos(d * Math.PI) + 1)) / 2
  }
  return h
}

const GRAD_EPS = 0.1

// Numeric gradient (dHeight/dx, dHeight/dz) used to nudge the ball downhill.
export function terrainGradient(x: number, z: number, hills?: Hill[]): [number, number] {
  if (!hills || hills.length === 0) return [0, 0]
  const dHdx = (terrainHeight(x + GRAD_EPS, z, hills) - terrainHeight(x - GRAD_EPS, z, hills)) / (2 * GRAD_EPS)
  const dHdz = (terrainHeight(x, z + GRAD_EPS, hills) - terrainHeight(x, z - GRAD_EPS, hills)) / (2 * GRAD_EPS)
  return [dHdx, dHdz]
}

const MARGIN = 8
const CELL_SIZE = 0.5
const MAX_SEGMENTS = 64
const EDGE_FEATHER = 0.6

const FAIRWAY_TINT = new THREE.Color('#ffffff')
const ROUGH_TINT = new THREE.Color('#5f7a56')

// Builds one seamless mesh covering the fairway + a rough margin, with
// per-vertex height (the terrain) and per-vertex color (fairway vs rough
// tint) so there is a single ground surface with no seams. Vertices are
// placed directly in world (x, y, z) so no mesh rotation/transform is needed.
export function buildTerrainGeometry(fairway: Fairway, hills?: Hill[]) {
  const width = fairway.width + MARGIN
  const length = fairway.length + MARGIN
  const segsX = Math.min(MAX_SEGMENTS, Math.max(8, Math.round(width / CELL_SIZE)))
  const segsZ = Math.min(MAX_SEGMENTS, Math.max(8, Math.round(length / CELL_SIZE)))
  const cx = fairway.center[0]
  const cz = fairway.center[2]
  const halfW = fairway.width / 2
  const halfL = fairway.length / 2

  const vertsX = segsX + 1
  const vertsZ = segsZ + 1
  const positions = new Float32Array(vertsX * vertsZ * 3)
  const colors = new Float32Array(vertsX * vertsZ * 3)
  const uvs = new Float32Array(vertsX * vertsZ * 2)
  const tintColor = new THREE.Color()

  let p = 0
  let u = 0
  for (let j = 0; j < vertsZ; j++) {
    const z = cz - length / 2 + (j / segsZ) * length
    for (let i = 0; i < vertsX; i++) {
      const x = cx - width / 2 + (i / segsX) * width
      const y = terrainHeight(x, z, hills)
      positions[p] = x
      positions[p + 1] = y
      positions[p + 2] = z

      const over = Math.max(Math.abs(x - cx) - halfW, Math.abs(z - cz) - halfL)
      const t = THREE.MathUtils.clamp(1 - over / EDGE_FEATHER, 0, 1)
      tintColor.copy(ROUGH_TINT).lerp(FAIRWAY_TINT, t)
      colors[p] = tintColor.r
      colors[p + 1] = tintColor.g
      colors[p + 2] = tintColor.b

      uvs[u] = x / 2
      uvs[u + 1] = z / 2
      p += 3
      u += 2
    }
  }

  const indices: number[] = []
  for (let j = 0; j < segsZ; j++) {
    for (let i = 0; i < segsX; i++) {
      const a = j * vertsX + i
      const b = a + 1
      const c = a + vertsX
      const d = c + 1
      indices.push(a, c, b, b, c, d)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}
