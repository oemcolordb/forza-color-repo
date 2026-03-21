import { CarColor } from '../types'
import { bmw2020Colors } from './bmw_2020_colors'
import { bmw2021Colors } from './bmw_2021_colors'
import { bmw2022Colors } from './bmw_2022_colors'
import { bmwIndividualColors } from './bmw_individual_colors'

// Aggregated BMW Collection
export const allBmwColors: CarColor[] = [
  ...bmw2020Colors,
  ...bmw2021Colors,
  ...bmw2022Colors,
  ...bmwIndividualColors,
]