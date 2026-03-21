import { CarColor } from '../types'
import { allBmwColors } from './bmw_colors'
import rawCarColors from '../../carColors.json'

// Filter out BMW from the raw JSON data since we have a dedicated, curated collection for it now.
// We also trim the make to handle "BMW " vs "BMW" inconsistencies in the legacy JSON.
const legacyColors = (rawCarColors as unknown as CarColor[]).filter(
  (car) => car.make.trim() !== 'BMW'
)

export const carColors: CarColor[] = [
  ...allBmwColors,
  ...legacyColors,
]