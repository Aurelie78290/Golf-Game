import { useEffect, useMemo } from 'react'
import { Sky, Cloud } from '@react-three/drei'
import * as THREE from 'three'
import type { Hole, Vec3 } from '../types'
import { buildTerrainGeometry } from './terrain'

// Deterministic PRNG seeded per-hole so decorations stay put across re-renders
// (Scene remounts on every shot) instead of jumping around randomly.
function hashString(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number) {
  let a = seed
  return function random() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

let grassTextureCache: THREE.CanvasTexture | null = null
export function getGrassTexture() {
  if (grassTextureCache) return grassTextureCache
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#3a9a55'
  ctx.fillRect(0, 0, 256, 256)
  const stripeHeight = 32
  for (let y = 0; y < 256; y += stripeHeight) {
    ctx.fillStyle = (y / stripeHeight) % 2 === 0 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)'
    ctx.fillRect(0, y, 256, stripeHeight)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  grassTextureCache = texture
  return texture
}

let roughTextureCache: THREE.CanvasTexture | null = null
function getRoughTexture() {
  if (roughTextureCache) return roughTextureCache
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#2c7a42'
  ctx.fillRect(0, 0, 128, 128)
  const rnd = mulberry32(7)
  for (let i = 0; i < 900; i++) {
    const x = rnd() * 128
    const y = rnd() * 128
    ctx.fillStyle = rnd() > 0.5 ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'
    ctx.fillRect(x, y, 2, 2)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  roughTextureCache = texture
  return texture
}

let sandTextureCache: THREE.CanvasTexture | null = null
function getSandTexture() {
  if (sandTextureCache) return sandTextureCache
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#d9c283'
  ctx.fillRect(0, 0, 128, 128)
  const rnd = mulberry32(42)
  for (let i = 0; i < 700; i++) {
    const x = rnd() * 128
    const y = rnd() * 128
    ctx.fillStyle = rnd() > 0.5 ? 'rgba(120,95,40,0.15)' : 'rgba(255,255,255,0.2)'
    ctx.fillRect(x, y, 1.5, 1.5)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  sandTextureCache = texture
  return texture
}

export function CourseSky() {
  return (
    <>
      <Sky sunPosition={[60, 40, 20]} turbidity={4} rayleigh={1.2} mieCoefficient={0.006} mieDirectionalG={0.85} />
      <fog attach="fog" args={['#cfe9ff', 40, 160]} />
      <Cloud position={[-25, 22, -40]} speed={0.05} opacity={0.5} segments={12} bounds={[10, 3, 3]} />
      <Cloud position={[30, 26, -60]} speed={0.05} opacity={0.4} segments={10} bounds={[12, 3, 3]} />
    </>
  )
}

export function Terrain({ hole }: { hole: Hole }) {
  const geometry = useMemo(
    () => buildTerrainGeometry(hole.fairway, hole.terrain),
    [hole]
  )
  useEffect(() => () => geometry.dispose(), [geometry])

  const texture = useMemo(() => {
    const t = getGrassTexture().clone()
    t.needsUpdate = true
    return t
  }, [])

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial map={texture} vertexColors roughness={1} />
    </mesh>
  )
}

export function RoughField() {
  const texture = useMemo(() => {
    const t = getRoughTexture().clone()
    t.needsUpdate = true
    t.repeat.set(60, 60)
    return t
  }, [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
      <planeGeometry args={[300, 300]} />
      <meshStandardMaterial map={texture} roughness={1} />
    </mesh>
  )
}

function Tree({ position, seed }: { position: Vec3; seed: number }) {
  const rnd = mulberry32(seed)
  const scale = 0.8 + rnd() * 0.7
  const hue = 0.32 + rnd() * 0.06
  const foliageColor = new THREE.Color().setHSL(hue, 0.45, 0.28 + rnd() * 0.08)
  const rotationY = rnd() * Math.PI * 2

  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 1.2, 6]} />
        <meshStandardMaterial color="#5a3d24" roughness={1} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <coneGeometry args={[1.1, 1.6, 8]} />
        <meshStandardMaterial color={foliageColor} roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.3, 0]} castShadow>
        <coneGeometry args={[0.85, 1.3, 8]} />
        <meshStandardMaterial color={foliageColor} roughness={0.9} />
      </mesh>
      <mesh position={[0, 3, 0]} castShadow>
        <coneGeometry args={[0.55, 1, 8]} />
        <meshStandardMaterial color={foliageColor} roughness={0.9} />
      </mesh>
    </group>
  )
}

export function Trees({ hole }: { hole: Hole }) {
  const { fairway } = hole
  const halfW = fairway.width / 2
  const halfL = fairway.length / 2
  const cz = fairway.center[2]
  const cx = fairway.center[0]

  const trees = useMemo(() => {
    const rnd = mulberry32(hashString(hole.name))
    const list: { position: Vec3; seed: number }[] = []
    const spacing = 3.2
    for (let side = -1; side <= 1; side += 2) {
      for (let z = -halfL - 2; z <= halfL + 2; z += spacing) {
        const jitterZ = (rnd() - 0.5) * 1.6
        const jitterX = rnd() * 2.5
        list.push({
          position: [cx + side * (halfW + 2.5 + jitterX), 0, cz + z + jitterZ],
          seed: Math.floor(rnd() * 1e6),
        })
      }
    }
    return list
  }, [hole.name, cx, cz, halfW, halfL])

  return (
    <group>
      {trees.map((t, i) => (
        <Tree key={i} position={t.position} seed={t.seed} />
      ))}
    </group>
  )
}

function Bunker({ position, radiusX, radiusZ }: { position: Vec3; radiusX: number; radiusZ: number }) {
  const texture = useMemo(() => {
    const t = getSandTexture().clone()
    t.needsUpdate = true
    t.repeat.set(radiusX, radiusZ)
    return t
  }, [radiusX, radiusZ])

  return (
    <mesh
      position={[position[0], 0.01, position[2]]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[radiusX, radiusZ, 1]}
      receiveShadow
    >
      <circleGeometry args={[1, 24]} />
      <meshStandardMaterial map={texture} roughness={1} />
    </mesh>
  )
}

export function Bunkers({ hole }: { hole: Hole }) {
  const { fairway } = hole
  const halfW = fairway.width / 2
  const halfL = fairway.length / 2
  const cz = fairway.center[2]
  const cx = fairway.center[0]

  const bunkers = useMemo(() => {
    const rnd = mulberry32(hashString(hole.name + '-bunkers'))
    const count = 1 + Math.floor(rnd() * 2)
    const list: { position: Vec3; radiusX: number; radiusZ: number }[] = []
    for (let i = 0; i < count; i++) {
      const side = rnd() > 0.5 ? 1 : -1
      const z = cz + (rnd() - 0.5) * halfL * 1.2
      const x = cx + side * (halfW - 0.5 - rnd() * 1.5)
      list.push({ position: [x, 0, z], radiusX: 1.4 + rnd() * 1, radiusZ: 1.2 + rnd() * 0.8 })
    }
    return list
  }, [hole.name, cx, cz, halfW, halfL])

  return (
    <group>
      {bunkers.map((b, i) => (
        <Bunker key={i} position={b.position} radiusX={b.radiusX} radiusZ={b.radiusZ} />
      ))}
    </group>
  )
}
