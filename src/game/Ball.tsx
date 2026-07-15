import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSphere } from '@react-three/cannon'
import * as THREE from 'three'
import type { Fairway, Hill, Vec3 } from '../types'
import { terrainGradient, terrainHeight } from './terrain'

const BALL_RADIUS = 0.2
const BALL_MASS = 0.15
const GRAVITY = 9.82
const REST_SPEED_THRESHOLD = 0.06
const HOLE_CAPTURE_RADIUS = 0.32
// The physics worker needs a few frames to report the post-impulse velocity;
// skip the rest-check until then or a fresh shot reads as "already at rest".
const REST_CHECK_GRACE_FRAMES = 10

// Fairway (mowed) vs rough damping — the "wall" used to stop the ball is now
// grass drag instead of a physical barrier.
const FAIRWAY_LINEAR_DAMPING = 0.4
const FAIRWAY_ANGULAR_DAMPING = 0.4
const ROUGH_LINEAR_DAMPING = 0.85
const ROUGH_ANGULAR_DAMPING = 0.75

export interface BallHandle {
  applyImpulse: (impulse: Vec3) => void
  getPosition: () => Vec3
}

interface BallProps {
  position: Vec3
  color: string
  holePosition: Vec3
  fairway: Fairway
  terrain?: Hill[]
  onRest?: (position: Vec3) => void
  onHoled?: () => void
  onPositionChange?: (position: Vec3) => void
}

const Ball = forwardRef<BallHandle, BallProps>(function Ball(
  { position, color, holePosition, fairway, terrain, onRest, onHoled, onPositionChange },
  ref
) {
  const velocityRef = useRef<Vec3>([0, 0, 0])
  const positionRef = useRef<Vec3>(position)
  const movingRef = useRef(false)
  const settledRef = useRef(false)
  const restCheckGraceRef = useRef(0)
  const inRoughRef = useRef(false)
  const visualRef = useRef<THREE.Mesh>(null)

  const [meshRef, api] = useSphere(() => ({
    mass: BALL_MASS,
    args: [BALL_RADIUS],
    position,
    material: { friction: 0.55, restitution: 0.35 },
    linearDamping: FAIRWAY_LINEAR_DAMPING,
    angularDamping: FAIRWAY_ANGULAR_DAMPING,
  }))

  useEffect(() => {
    const unsubV = api.velocity.subscribe((v) => (velocityRef.current = v))
    const unsubP = api.position.subscribe((p) => {
      positionRef.current = p
      onPositionChange && onPositionChange(p)
    })
    return () => {
      unsubV()
      unsubP()
    }
  }, [api, onPositionChange])

  useImperativeHandle(ref, () => ({
    applyImpulse: (impulse) => {
      movingRef.current = true
      settledRef.current = false
      restCheckGraceRef.current = REST_CHECK_GRACE_FRAMES
      api.applyImpulse(impulse, [0, 0, 0])
    },
    getPosition: () => positionRef.current,
  }))

  useFrame(() => {
    if (!movingRef.current || settledRef.current) return
    if (restCheckGraceRef.current > 0) {
      restCheckGraceRef.current -= 1
      return
    }
    const [vx, vy, vz] = velocityRef.current
    const speed = Math.sqrt(vx * vx + vy * vy + vz * vz)
    const [px, , pz] = positionRef.current

    // Check if ball is captured by the hole
    const dx = px - holePosition[0]
    const dz = pz - holePosition[2]
    const distToHole = Math.sqrt(dx * dx + dz * dz)

    if (distToHole < HOLE_CAPTURE_RADIUS && speed < 3) {
      settledRef.current = true
      movingRef.current = false
      onHoled && onHoled()
      return
    }

    if (speed < REST_SPEED_THRESHOLD) {
      settledRef.current = true
      movingRef.current = false
      api.velocity.set(0, 0, 0)
      api.angularVelocity.set(0, 0, 0)
      onRest && onRest(positionRef.current)
    }
  })

  // Physics stays flat (a plain infinite plane) so collisions remain simple;
  // this frame just (1) toggles fairway/rough damping based on x/z bounds,
  // (2) nudges the ball downhill on slopes, and (3) renders it at the actual
  // terrain height instead of the flat physics height.
  useFrame(() => {
    const [px, , pz] = positionRef.current
    const halfW = fairway.width / 2
    const halfL = fairway.length / 2
    const inRough = Math.abs(px - fairway.center[0]) > halfW || Math.abs(pz - fairway.center[2]) > halfL

    if (inRough !== inRoughRef.current) {
      inRoughRef.current = inRough
      api.linearDamping.set(inRough ? ROUGH_LINEAR_DAMPING : FAIRWAY_LINEAR_DAMPING)
      api.angularDamping.set(inRough ? ROUGH_ANGULAR_DAMPING : FAIRWAY_ANGULAR_DAMPING)
    }

    if (movingRef.current && terrain && terrain.length > 0) {
      const [gradX, gradZ] = terrainGradient(px, pz, terrain)
      api.applyForce([-BALL_MASS * GRAVITY * gradX, 0, -BALL_MASS * GRAVITY * gradZ], [0, 0, 0])
    }

    if (visualRef.current && meshRef.current) {
      const y = terrainHeight(px, pz, terrain) + BALL_RADIUS
      visualRef.current.position.set(px, y, pz)
      visualRef.current.quaternion.copy(meshRef.current.quaternion)
    }
  })

  return (
    <>
      <mesh ref={meshRef} visible={false}>
        <sphereGeometry args={[BALL_RADIUS, 24, 24]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh ref={visualRef} castShadow>
        <sphereGeometry args={[BALL_RADIUS, 24, 24]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
      </mesh>
    </>
  )
})

export default Ball
