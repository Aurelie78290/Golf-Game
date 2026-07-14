import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSphere } from '@react-three/cannon'
import type { Vec3 } from '../types'

const BALL_RADIUS = 0.2
const REST_SPEED_THRESHOLD = 0.06
const HOLE_CAPTURE_RADIUS = 0.32
// The physics worker needs a few frames to report the post-impulse velocity;
// skip the rest-check until then or a fresh shot reads as "already at rest".
const REST_CHECK_GRACE_FRAMES = 10

export interface BallHandle {
  applyImpulse: (impulse: Vec3) => void
  getPosition: () => Vec3
}

interface BallProps {
  position: Vec3
  color: string
  holePosition: Vec3
  onRest?: (position: Vec3) => void
  onHoled?: () => void
  onPositionChange?: (position: Vec3) => void
}

const Ball = forwardRef<BallHandle, BallProps>(function Ball(
  { position, color, holePosition, onRest, onHoled, onPositionChange },
  ref
) {
  const velocityRef = useRef<Vec3>([0, 0, 0])
  const positionRef = useRef<Vec3>(position)
  const movingRef = useRef(false)
  const settledRef = useRef(false)
  const restCheckGraceRef = useRef(0)

  const [meshRef, api] = useSphere(() => ({
    mass: 0.15,
    args: [BALL_RADIUS],
    position,
    material: { friction: 0.55, restitution: 0.35 },
    linearDamping: 0.4,
    angularDamping: 0.4,
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

  return (
    <mesh ref={meshRef} castShadow>
      <sphereGeometry args={[BALL_RADIUS, 24, 24]} />
      <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
    </mesh>
  )
})

export default Ball
