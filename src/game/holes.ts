// Coordinate system: x = left/right, z = tee -> hole direction, y = up
// Each hole defines: tee position, hole (cup) position, par, fairway bounds,
// terrain (hills/dips) for slope play, and any static box obstacles/hazards.
import type { Hole } from '../types'

export const HOLES: Hole[] = [
  {
    name: 'Trou 1 - La Ligne Droite',
    par: 2,
    tee: [0, 0.3, -9],
    hole: [0, 0.05, 9],
    fairway: { width: 6, length: 20, center: [0, 0, 0] },
    obstacles: [],
    terrain: [
      // gentle rise off-center, well clear of the tee/hole line
      { center: [1.5, 0], radiusX: 2.5, radiusZ: 4, height: 0.5 },
    ],
  },
  {
    name: 'Trou 2 - Le Coude',
    par: 3,
    tee: [-3, 0.3, -10],
    hole: [3, 0.05, 9],
    fairway: { width: 9, length: 22, center: [0, 0, -0.5] },
    obstacles: [],
    terrain: [
      // mound guarding the green after the dogleg
      { center: [3, 5], radiusX: 3, radiusZ: 4, height: 0.6 },
      // shallow dip near the tee side
      { center: [-3, -6], radiusX: 2.5, radiusZ: 3, height: -0.35 },
    ],
  },
  {
    name: 'Trou 3 - Le Slalom',
    par: 4,
    tee: [0, 0.3, -11],
    hole: [0, 0.05, 11],
    fairway: { width: 8, length: 26, center: [0, 0, 0] },
    obstacles: [],
    terrain: [
      // rise off the tee, dip before the green — the slalom is now in the terrain
      { center: [0, -8], radiusX: 3, radiusZ: 3, height: 0.4 },
      { center: [0, 7], radiusX: 3, radiusZ: 3, height: -0.35 },
    ],
  },
]
