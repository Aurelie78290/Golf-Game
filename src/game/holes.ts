// Coordinate system: x = left/right, z = tee -> hole direction, y = up
// Each hole defines: tee position, hole (cup) position, par, fairway bounds,
// and a list of static obstacles (boxes) used both as walls and hazards.
import type { Hole } from '../types'

export const HOLES: Hole[] = [
  {
    name: 'Trou 1 - La Ligne Droite',
    par: 2,
    tee: [0, 0.3, -9],
    hole: [0, 0.05, 9],
    fairway: { width: 6, length: 20, center: [0, 0, 0] },
    obstacles: [],
  },
  {
    name: 'Trou 2 - Le Coude',
    par: 3,
    tee: [-3, 0.3, -10],
    hole: [3, 0.05, 9],
    fairway: { width: 9, length: 22, center: [0, 0, -0.5] },
    obstacles: [
      // central divider forcing players to curve around it
      { position: [0, 0.6, -1], size: [1.4, 1.2, 10], color: '#8a6d3b' },
    ],
  },
  {
    name: 'Trou 3 - Le Slalom',
    par: 4,
    tee: [0, 0.3, -11],
    hole: [0, 0.05, 11],
    fairway: { width: 8, length: 26, center: [0, 0, 0] },
    obstacles: [
      { position: [-2.2, 0.5, -4], size: [1.2, 1, 6], color: '#8a6d3b' },
      { position: [2.2, 0.5, 3], size: [1.2, 1, 6], color: '#8a6d3b' },
    ],
  },
]
