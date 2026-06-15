import { FH5Calculator } from './fh5-calculator'
import { FH6Calculator } from './fh6-calculator'

export class TuningCalculator {
  constructor(carData, options = {}) {
    this.gameVersion = options.gameVersion || 'FH6'
    if (this.gameVersion === 'FH5') {
      this.calculator = new FH5Calculator(carData, options)
    } else {
      this.calculator = new FH6Calculator(carData, options)
    }
  }

  calculateBaseTune() {
    return this.calculator.calculateBaseTune()
  }

  getTrackRecommendations(trackType) {
    return this.calculator.getTrackRecommendations(trackType)
  }

  getStyleRecommendations(style) {
    return this.calculator.getStyleRecommendations(style)
  }

  getTuneTypeRecommendations(tuneType) {
    return this.calculator.getTuneTypeRecommendations(tuneType)
  }
}

// Re-export TRACK_TYPES and TRACKS from fh5-calculator (shared logic/constants)
export { TRACK_TYPES, TRACKS } from './fh5-calculator'
