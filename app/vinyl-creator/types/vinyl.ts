export type ShapeRole = 'base' | 'accent' | 'shadow' | 'highlight' | 'detail'

export interface Transform {
  x: number
  y: number
  scaleX: number
  scaleY: number
  rotation: number // in degrees
}

export interface Shape {
  id: string
  name: string
  role: ShapeRole
  layer: number
  color: string
  pathData: string // SVG path data
  transform: Transform
  opacity: number
  thumbnail?: string
}

export interface VinylDesign {
  id: string
  name: string
  description: string
  shapes: Shape[]
  buildOrder: string[] // shape IDs in assembly order
  complexity: 'simple' | 'medium' | 'complex'
}

export interface ContextMenuPosition {
  x: number
  y: number
}
