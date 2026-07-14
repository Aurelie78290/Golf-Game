import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSphere } from '@react-three/cannon'

const BALL_RADIUS = 0.2
const REST_SPEED_THRESHOLD = 0.06
const HOLE_CAPTURE_RADIUS = 0.32

const Ball = forwardRef(function Ball(
  { position, color, holePosition, onRest, onHoled, onPositionChange },
  ref
) {
  const velocityRef = useRef([0, 0, 0])
  const positionRef = useRef(position)
  const movingRef = useRef(false)
  const settledRef = useRef(false)

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
  }, [api])

  useImperativeHandle(ref, () => ({
    applyImpulse: (impulse) => {
      movingRef.current = true
      settledRef.current = false
      api.applyImpulse(impulse, [0, 0, 0])
    },
    getPosition: () => positionRef.current,
  }))

  useFrame(() => {
    if (!movingRef.current || settledRef.current) return
    const [vx, vy, vz] = velocityRef.current
    const speed = Math.sqrt(vx * vx + vy * vy + vz * vz)
    const [px, py, pz] = positionRef.current

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
