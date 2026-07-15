import { useBox, usePlane } from '@react-three/cannon'
import type { Hole, Vec3 } from '../types'
import { Bunkers, RoughField, Terrain, Trees } from './Scenery'

// Flat, invisible, unbounded collider — the ball can roll anywhere; what
// slows it down outside the fairway is the extra damping applied in Ball.tsx,
// not a wall.
function PhysicsFloor() {
  usePlane(() => ({
    type: 'Static',
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    material: { friction: 0.5, restitution: 0.3 },
  }))
  return null
}

function Obstacle({ position, size, color }: { position: Vec3; size: Vec3; color?: string }) {
  const [ref] = useBox(() => ({
    type: 'Static',
    position,
    args: size,
  }))
  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color || '#8a6d3b'} roughness={0.9} />
    </mesh>
  )
}

function Cup({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.28, 32]} />
        <meshStandardMaterial color="#04140a" />
      </mesh>
      {/* flagstick */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 2, 8]} />
        <meshStandardMaterial color="#e5e5e5" />
      </mesh>
      <mesh position={[0.22, 1.75, 0]}>
        <planeGeometry args={[0.45, 0.3]} />
        <meshStandardMaterial color="#e63946" side={2} />
      </mesh>
    </group>
  )
}

export default function Course({ hole }: { hole: Hole }) {
  const { obstacles, hole: holePos } = hole

  return (
    <group>
      <RoughField />
      <Trees hole={hole} />
      <PhysicsFloor />
      <Terrain hole={hole} />
      <Bunkers hole={hole} />

      {obstacles.map((o, i) => (
        <Obstacle key={i} position={o.position} size={o.size} color={o.color} />
      ))}

      <Cup position={holePos} />
    </group>
  )
}
