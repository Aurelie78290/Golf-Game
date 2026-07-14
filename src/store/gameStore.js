import { create } from 'zustand'
import { HOLES } from '../game/holes'

const PLAYER_COLORS = ['#ff4d4d', '#4d94ff', '#4dff88', '#ffd24d', '#c34dff', '#ff8c4d']

function freshPlayers(names) {
  const tee = HOLES[0].tee
  return names.map((name, i) => ({
    id: i,
    name,
    color: PLAYER_COLORS[i % PLAYER_COLORS.length],
    totalStrokes: 0,
    strokesThisHole: 0,
    holed: false,
    position: [...tee],
  }))
}

export const useGameStore = create((set, get) => ({
  phase: 'setup', // 'setup' | 'playing' | 'holeSummary' | 'gameOver'
  players: [],
  currentHoleIndex: 0,
  currentPlayerIndex: 0,
  canShoot: true,
  lastImpulse: null,

  startGame: (names) => {
    set({
      players: freshPlayers(names),
      currentHoleIndex: 0,
      currentPlayerIndex: 0,
      phase: 'playing',
      canShoot: true,
    })
  },

  // Called when a shot is fired
  registerShot: () => set({ canShoot: false }),

  // Called when the ball comes to rest after a shot
  resolveShot: (restingPosition, isHoled) => {
    const { players, currentPlayerIndex, currentHoleIndex } = get()
    const hole = HOLES[currentHoleIndex]
    const updated = players.map((p, i) => {
      if (i !== currentPlayerIndex) return p
      const strokes = p.strokesThisHole + 1
      return {
        ...p,
        strokesThisHole: strokes,
        totalStrokes: isHoled ? p.totalStrokes + strokes : p.totalStrokes,
        holed: isHoled,
        position: isHoled ? [...hole.hole] : restingPosition,
      }
    })

    const anyoneLeft = updated.some((p) => !p.holed)

    if (!anyoneLeft) {
      set({ players: updated, phase: 'holeSummary' })
      return
    }

    // advance to next non-holed player
    let next = currentPlayerIndex
    for (let step = 1; step <= updated.length; step++) {
      const idx = (currentPlayerIndex + step) % updated.length
      if (!updated[idx].holed) {
        next = idx
        break
      }
    }

    set({ players: updated, currentPlayerIndex: next, canShoot: true })
  },

  nextHole: () => {
    const { players, currentHoleIndex } = get()
    const nextIndex = currentHoleIndex + 1
    if (nextIndex >= HOLES.length) {
      set({ phase: 'gameOver' })
      return
    }
    const tee = HOLES[nextIndex].tee
    const reset = players.map((p) => ({
      ...p,
      strokesThisHole: 0,
      holed: false,
      position: [...tee],
    }))
    // find first player index (order preserved, all start un-holed)
    set({
      players: reset,
      currentHoleIndex: nextIndex,
      currentPlayerIndex: 0,
      phase: 'playing',
      canShoot: true,
    })
  },

  restart: () => set({ phase: 'setup', players: [], currentHoleIndex: 0, currentPlayerIndex: 0 }),
}))
