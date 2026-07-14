import { usePlane, useBox } from '@react-three/cannon'

function Wall({ position, size }) {
  const [ref] = useBox(() => ({
    type: 'Static',
    position,
    args: size,
  }))
  return (
    <mesh ref={ref} visible={false}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#553311" />
    </mesh>
  )
}

function Obstacle({ position, size, color }) {
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

function Ground({ fairway }) {
  const [ref] = usePlane(() => ({
    type: 'Static',
    rotation: [-Math.PI / 2, 0, 0],
    position: [fairway.center[0], 0, fairway.center[2]],
    material: { friction: 0.55, restitution: 0.3 },
  }))
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[fairway.width + 8, fairway.length + 8]} />
      <meshStandardMaterial color="#2f8f4e" roughness={1} />
    </mesh>
  )
}

function Cup({ position }) {
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

export default function Course({ hole }) {
  const { fairway, obstacles, hole: holePos } = hole
  const halfW = fairway.width / 2
  const halfL = fairway.length / 2
  const cz = fairway.center[2]

  return (
    <group>
      <Ground fairway={fairway} />

      {/* fairway boundary walls */}
      <Wall position={[fairway.center[0] - halfW - 0.1, 0.5, cz]} size={[0.2, 1, fairway.length]} />
      <Wall position={[fairway.center[0] + halfW + 0.1, 0.5, cz]} size={[0.2, 1, fairway.length]} />
      <Wall position={[fairway.center[0], 0.5, cz - halfL - 0.1]} size={[fairway.width, 1, 0.2]} />
      <Wall position={[fairway.center[0], 0.5, cz + halfL + 0.1]} size={[fairway.width, 1, 0.2]} />

      {obstacles.map((o, i) => (
        <Obstacle key={i} position={o.position} size={o.size} color={o.color} />
      ))}

      <Cup position={holePos} />
    </group>
  )
}
