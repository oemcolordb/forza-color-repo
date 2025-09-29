import { CarColor } from './app/types/color'

// Custom color with your specified HSB values (normalized to 0-1 for Forza 5)
export const customColor: CarColor = {
  make: "Custom",
  model: "User Color",
  year: 2024,
  colorName: "Custom HSB Color",
  colorType: "Two-Tone",
  color1: {
    h: 223 / 360,
    s: 72 / 100,
    b: 99 / 100
  },
  color2: {
    h: 25 / 360,
    s: 100 / 100,
    b: 100 / 100
  }
}