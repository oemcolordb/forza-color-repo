export interface ColorLayer {
  h: number
  s: number
  b: number
}

export interface CarColor {
  make: string
  model: string
  year?: number | null
  colorName: string
  color1: ColorLayer
  color2: ColorLayer
  colorType?: string
  original_hex?: string
}
