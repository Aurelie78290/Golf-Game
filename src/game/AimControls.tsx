import { useRef, useState, useCallback, type RefObject, type PointerEvent } from 'react'
import type { Vec3 } from '../types'

const MAX_DRAG_PX = 160
const MAX_IMPULSE = 3.2
const MIN_POWER = 0.06

interface AimControlsProps {
  enabled: boolean
  ballPosRef: RefObject<Vec3>
  holePosition: Vec3
  onShoot: (impulse: Vec3) => void
}

export default function AimControls({ enabled, ballPosRef, holePosition, onShoot }: AimControlsProps) {
  const [aiming, setAiming] = useState(false)
  const [angleDeg, setAngleDeg] = useState(0)
  const [power, setPower] = useState(0)
  const startRef = useRef({ x: 0, y: 0 })
  const aimDirRef = useRef<Vec3>([0, 0, -1])

  const computeForward = useCallback((): [number, number] => {
    const [bx, , bz] = ballPosRef.current
    const [hx, , hz] = holePosition
    const fx = hx - bx
    const fz = hz - bz
    const len = Math.sqrt(fx * fx + fz * fz) || 1
    return [fx / len, fz / len]
  }, [ballPosRef, holePosition])

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!enabled) return
    startRef.current = { x: e.clientX, y: e.clientY }
    setAiming(true)
    setPower(0)
    setAngleDeg(0)
  }

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!aiming || !enabled) return
    const dx = e.clientX - startRef.current.x
    const dy = e.clientY - startRef.current.y

    const angle = Math.max(-1, Math.min(1, dx / MAX_DRAG_PX)) * (Math.PI / 2.2)
    const pull = Math.max(0, Math.min(MAX_DRAG_PX, dy))
    const pwr = pull / MAX_DRAG_PX

    const [fx, fz] = computeForward()
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    // rotate forward vector around Y axis by `angle`
    const dirX = fx * cos + fz * sin
    const dirZ = -fx * sin + fz * cos

    aimDirRef.current = [dirX, 0, dirZ]
    setAngleDeg((angle * 180) / Math.PI)
    setPower(pwr)
  }

  const handlePointerUp = () => {
    if (!aiming || !enabled) {
      setAiming(false)
      return
    }
    setAiming(false)
    if (power >= MIN_POWER) {
      const [dx, , dz] = aimDirRef.current
      const strength = power * MAX_IMPULSE
      onShoot([dx * strength, 0.55 * strength * 0.35, dz * strength])
    }
    setPower(0)
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{
        position: 'absolute',
        inset: 0,
        cursor: enabled ? 'crosshair' : 'default',
        touchAction: 'none',
      }}
    >
      {aiming && (
        <>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 90,
              width: 8,
              height: Math.max(6, power * 140),
              background: `hsl(${120 - power * 120}, 90%, 50%)`,
              transform: 'translateX(-50%)',
              borderRadius: 4,
              transition: 'height 0.03s linear',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 40,
              transform: `translateX(-50%) rotate(${-angleDeg}deg)`,
              color: '#fff',
              fontSize: 28,
              textShadow: '0 0 6px rgba(0,0,0,0.8)',
              pointerEvents: 'none',
            }}
          >
            ↑
          </div>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 10,
              transform: 'translateX(-50%)',
              color: '#fff',
              fontSize: 13,
              fontFamily: 'sans-serif',
              textShadow: '0 0 4px rgba(0,0,0,0.9)',
            }}
          >
            Puissance {Math.round(power * 100)}%
          </div>
        </>
      )}
      {!aiming && enabled && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 24,
            transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.85)',
            fontSize: 14,
            fontFamily: 'sans-serif',
            textShadow: '0 0 4px rgba(0,0,0,0.9)',
            pointerEvents: 'none',
          }}
        >
          Cliquer-glisser vers le bas pour viser et tirer
        </div>
      )}
    </div>
  )
}
