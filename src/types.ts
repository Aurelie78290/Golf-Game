export type Vec3 = [number, number, number]

export interface Obstacle {
  position: Vec3
  size: Vec3
  color?: string
}

export interface Fairway {
  width: number
  length: number
  center: Vec3
}

export interface Hole {
  name: string
  par: number
  tee: Vec3
  hole: Vec3
  fairway: Fairway
  obstacles: Obstacle[]
}

export interface Player {
  id: number
  name: string
  color: string
  totalStrokes: number
  strokesThisHole: number
  holed: boolean
  position: Vec3
}

export type Phase = 'setup' | 'playing' | 'holeSummary' | 'gameOver'
