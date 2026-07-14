import { useRef, useEffect, type RefObject } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'
import { useGameStore } from './store/gameStore'
import { HOLES } from './game/holes'
import Course from './game/Course'
import Ball, { type BallHandle } from './game/Ball'
import CameraRig from './game/CameraRig'
import AimControls from './game/AimControls'
import HUD from './game/HUD'
import SetupScreen from './game/SetupScreen'
import { HoleSummary, GameOver } from './game/EndScreens'
import type { Hole, Player, Vec3 } from './types'

interface SceneProps {
  hole: Hole
  player: Player
  ballPosRef: RefObject<Vec3>
  ballApiRef: RefObject<BallHandle | null>
  onRest: (position: Vec3) => void
  onHoled: () => void
}

function Scene({ hole, player, ballPosRef, ballApiRef, onRest, onHoled }: SceneProps) {
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <Physics gravity={[0, -9.82, 0]} defaultContactMaterial={{ friction: 0.5, restitution: 0.35 }}>
        <Course hole={hole} />
        <Ball
          ref={ballApiRef}
          position={player.position}
          color={player.color}
          holePosition={hole.hole}
          onRest={onRest}
          onHoled={onHoled}
          onPositionChange={(p) => (ballPosRef.current = p)}
        />
      </Physics>
      <CameraRig ballPosRef={ballPosRef} holePosition={hole.hole} />
    </>
  )
}

export default function App() {
  const phase = useGameStore((s) => s.phase)
  const players = useGameStore((s) => s.players)
  const currentHoleIndex = useGameStore((s) => s.currentHoleIndex)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)
  const canShoot = useGameStore((s) => s.canShoot)
  const startGame = useGameStore((s) => s.startGame)
  const registerShot = useGameStore((s) => s.registerShot)
  const resolveShot = useGameStore((s) => s.resolveShot)
  const nextHole = useGameStore((s) => s.nextHole)
  const restart = useGameStore((s) => s.restart)

  const hole = HOLES[currentHoleIndex]
  const player = players[currentPlayerIndex]

  const ballApiRef = useRef<BallHandle | null>(null)
  const ballPosRef = useRef<Vec3>(player ? player.position : hole.tee)

  useEffect(() => {
    if (player) ballPosRef.current = player.position
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHoleIndex, currentPlayerIndex])

  if (phase === 'setup') {
    return <SetupScreen onStart={startGame} />
  }

  if (!player) return null

  const handleShoot = (impulse: Vec3) => {
    if (!canShoot) return
    registerShot()
    ballApiRef.current?.applyImpulse(impulse)
  }

  const handleRest = (position: Vec3) => resolveShot(position, false)
  const handleHoled = () => resolveShot(ballApiRef.current?.getPosition() ?? player.position, true)

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0d3620' }}>
      <Canvas shadows camera={{ fov: 55, position: [0, 3, -14] }}>
        <Scene
          key={`${currentHoleIndex}-${currentPlayerIndex}`}
          hole={hole}
          player={player}
          ballPosRef={ballPosRef}
          ballApiRef={ballApiRef}
          onRest={handleRest}
          onHoled={handleHoled}
        />
      </Canvas>

      <HUD
        hole={hole}
        holeNumber={currentHoleIndex + 1}
        totalHoles={HOLES.length}
        players={players}
        currentPlayerIndex={currentPlayerIndex}
      />

      {phase === 'playing' && (
        <AimControls
          enabled={canShoot}
          ballPosRef={ballPosRef}
          holePosition={hole.hole}
          onShoot={handleShoot}
        />
      )}

      {phase === 'holeSummary' && (
        <HoleSummary
          hole={hole}
          holeNumber={currentHoleIndex + 1}
          players={players}
          onNext={nextHole}
          isLastHole={currentHoleIndex + 1 >= HOLES.length}
        />
      )}

      {phase === 'gameOver' && <GameOver players={players} onRestart={restart} />}
    </div>
  )
}
