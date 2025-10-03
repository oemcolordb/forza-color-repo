export const createForzaGradient = (color1: { h: number; s: number; b: number }, color2: { h: number; s: number; b: number }): string => {
  const hsl1 = `hsl(${color1.h * 360}, ${color1.s * 100}%, ${color1.b * 100}%)`
  const hsl2 = `hsl(${color2.h * 360}, ${color2.s * 100}%, ${color2.b * 100}%)`
  return `linear-gradient(135deg, ${hsl1} 0%, ${hsl2} 100%)`
}

export const hsbToCSS = (color: { h: number; s: number; b: number }): string => {
  return `hsl(${color.h * 360}, ${color.s * 100}%, ${color.b * 100}%)`
}

export const formatHSBValues = (color: { h: number; s: number; b: number }): string => {
  return `H:${Math.round(color.h * 360)} S:${Math.round(color.s * 100)} B:${Math.round(color.b * 100)}`
}