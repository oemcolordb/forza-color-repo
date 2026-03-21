import 'server-only'
import { CarColor } from '../types'

export const bmw2021Colors: CarColor[] = [
  // M Series Exclusive
  {
    make: 'BMW',
    model: 'M3/M4',
    year: 2021,
    colorName: 'Oxide Grey Metallic (C4A)',
    colorType: 'Metallic',
    color1: { h: 0.12, s: 0.10, b: 0.65 }, // Champagne/Grey metallic
    color2: { h: 0.12, s: 0.15, b: 0.75 }
  },
  {
    make: 'BMW',
    model: 'M5/M8',
    year: 2021,
    colorName: 'Brands Hatch Grey Metallic (C17)',
    colorType: 'Metallic',
    color1: { h: 0.60, s: 0.10, b: 0.40 },
    color2: { h: 0.60, s: 0.10, b: 0.50 }
  },
  
  // Luxury & X Series
  {
    make: 'BMW',
    model: 'X7/M8',
    year: 2021,
    colorName: 'Ametrin Metallic (X1B)',
    colorType: 'Metallic',
    color1: { h: 0.92, s: 0.60, b: 0.25 }, // Deep plum/purple
    color2: { h: 0.94, s: 0.70, b: 0.35 }
  },
  {
    make: 'BMW',
    model: 'X5/X6',
    year: 2021,
    colorName: 'Manhattan Green Metallic (C3D)',
    colorType: 'Metallic',
    color1: { h: 0.25, s: 0.20, b: 0.45 }, // Olive grey-green
    color2: { h: 0.25, s: 0.25, b: 0.55 }
  },
  {
    make: 'BMW',
    model: '5 Series/7 Series',
    year: 2021,
    colorName: 'Cashmere Silver Metallic (A72)',
    colorType: 'Metallic',
    color1: { h: 0.11, s: 0.15, b: 0.80 },
    color2: { h: 0.11, s: 0.10, b: 0.90 }
  },

  // Standard Range
  {
    make: 'BMW',
    model: '3 Series/X models',
    year: 2021,
    colorName: 'Blue Ridge Mountain Metallic (C35)',
    colorType: 'Metallic',
    color1: { h: 0.50, s: 0.30, b: 0.45 }, // Teal/Green-blue
    color2: { h: 0.50, s: 0.40, b: 0.55 }
  },
  {
    make: 'BMW',
    model: '1 Series/2 Series',
    year: 2021,
    colorName: 'Quantum Blue Metallic (C46)',
    colorType: 'Metallic',
    color1: { h: 0.58, s: 0.65, b: 0.40 },
    color2: { h: 0.58, s: 0.80, b: 0.55 }
  }
]