// Advanced Forza Tuning System - Professional Grade
// Enhanced algorithms for weather, surface, and driver skill optimization

import { TuningCalculator } from './tuning-calculator.js'

export class AdvancedTuningCalculator extends TuningCalculator {
  constructor(carData, conditions = {}) {
    super(carData)
    this.weather = conditions.weather || 'dry'
    this.surface = conditions.surface || 'tarmac'
    this.temperature = conditions.temperature || 85
    this.driverSkill = conditions.driverSkill || 'intermediate'
    this.sessionType = conditions.sessionType || 'practice'
  }
  
  // Calculate optimal setup with all conditions
  calculateOptimalSetup() {
    let baseTune = this.calculateBaseTune()
    
    // Apply weather adjustments
    if (this.weather !== 'dry') {
      baseTune = this.getWeatherRecommendations(this.weather, baseTune)
    }
    
    // Apply surface adjustments
    if (this.surface !== 'tarmac') {
      baseTune = this.getSurfaceRecommendations(this.surface, baseTune)
    }
    
    // Apply temperature adjustments
    baseTune = this.getTemperatureAdjustments(baseTune)
    
    // Apply driver skill adjustments
    baseTune = this.getSkillAdjustments(baseTune)
    
    // Apply session type adjustments
    baseTune = this.getSessionAdjustments(baseTune)
    
    return baseTune
  }
  
  // Weather-specific adjustments
  getWeatherRecommendations(weather, baseTune) {
    const adjustments = {}
    
    switch (weather) {
      case 'wet':
        adjustments['tire-pressure-front'] = baseTune['tire-pressure-front'] - 3
        adjustments['tire-pressure-rear'] = baseTune['tire-pressure-rear'] - 3
        adjustments['camber-front'] = baseTune['camber-front'] + 0.5
        adjustments['camber-rear'] = baseTune['camber-rear'] + 0.5
        adjustments['ride-height-front'] = baseTune['ride-height-front'] + 0.5
        adjustments['ride-height-rear'] = baseTune['ride-height-rear'] + 0.5
        adjustments['anti-roll-bar-front'] = Math.max(baseTune['anti-roll-bar-front'] - 5, 1)
        adjustments['anti-roll-bar-rear'] = Math.max(baseTune['anti-roll-bar-rear'] - 5, 1)
        adjustments['differential-rear-accel'] = Math.max(baseTune['differential-rear-accel'] - 15, 5)
        break
        
      case 'mixed':
        adjustments['tire-pressure-front'] = baseTune['tire-pressure-front'] - 1
        adjustments['tire-pressure-rear'] = baseTune['tire-pressure-rear'] - 1
        adjustments['ride-height-front'] = baseTune['ride-height-front'] + 0.2
        adjustments['ride-height-rear'] = baseTune['ride-height-rear'] + 0.2
        break
    }
    
    return { ...baseTune, ...adjustments }
  }
  
  // Surface-specific adjustments
  getSurfaceRecommendations(surface, baseTune) {
    const adjustments = {}
    
    switch (surface) {
      case 'dirt':
        adjustments['tire-pressure-front'] = 22
        adjustments['tire-pressure-rear'] = 20
        adjustments['ride-height-front'] = 8.0
        adjustments['ride-height-rear'] = 8.5
        adjustments['spring-rate-front'] = 80
        adjustments['spring-rate-rear'] = 75
        adjustments['camber-front'] = -1.5
        adjustments['camber-rear'] = -1.0
        adjustments['differential-rear-accel'] = 65
        break
        
      case 'gravel':
        adjustments['tire-pressure-front'] = 24
        adjustments['tire-pressure-rear'] = 22
        adjustments['ride-height-front'] = 7.5
        adjustments['ride-height-rear'] = 8.0
        adjustments['spring-rate-front'] = 100
        adjustments['spring-rate-rear'] = 95
        adjustments['differential-rear-accel'] = 55
        break
        
      case 'snow':
        adjustments['tire-pressure-front'] = 20
        adjustments['tire-pressure-rear'] = 18
        adjustments['ride-height-front'] = 9.0
        adjustments['ride-height-rear'] = 9.5
        adjustments['spring-rate-front'] = 60
        adjustments['spring-rate-rear'] = 55
        adjustments['differential-rear-accel'] = 80
        adjustments['camber-front'] = -1.0
        adjustments['camber-rear'] = -0.8
        break
        
      case 'mixed':
        adjustments['tire-pressure-front'] = 25
        adjustments['tire-pressure-rear'] = 23
        adjustments['ride-height-front'] = 7.0
        adjustments['ride-height-rear'] = 7.5
        adjustments['spring-rate-front'] = 110
        adjustments['spring-rate-rear'] = 105
        break
    }
    
    return { ...baseTune, ...adjustments }
  }
  
  getTemperatureAdjustments(baseTune) {
    const tempDiff = this.temperature - 85 // 85°F baseline
    const pressureAdj = tempDiff * 0.1 // 0.1 PSI per degree
    
    return {
      ...baseTune,
      'tire-pressure-front': Math.max(baseTune['tire-pressure-front'] + pressureAdj, 15),
      'tire-pressure-rear': Math.max(baseTune['tire-pressure-rear'] + pressureAdj, 15)
    }
  }
  
  getSkillAdjustments(baseTune) {
    const adjustments = {}
    
    switch (this.driverSkill) {
      case 'beginner':
        // More forgiving setup
        adjustments['camber-front'] = Math.min(baseTune['camber-front'] + 0.5, 0)
        adjustments['camber-rear'] = Math.min(baseTune['camber-rear'] + 0.5, 0)
        adjustments['anti-roll-bar-front'] = Math.max(baseTune['anti-roll-bar-front'] - 5, 1)
        adjustments['anti-roll-bar-rear'] = Math.max(baseTune['anti-roll-bar-rear'] - 5, 1)
        adjustments['tire-pressure-front'] = baseTune['tire-pressure-front'] + 1
        adjustments['tire-pressure-rear'] = baseTune['tire-pressure-rear'] + 1
        break
        
      case 'alien':
        // Maximum attack setup
        adjustments['camber-front'] = baseTune['camber-front'] - 0.8
        adjustments['camber-rear'] = baseTune['camber-rear'] - 0.6
        adjustments['tire-pressure-front'] = Math.max(baseTune['tire-pressure-front'] - 4, 15)
        adjustments['tire-pressure-rear'] = Math.max(baseTune['tire-pressure-rear'] - 4, 15)
        adjustments['anti-roll-bar-front'] = Math.min(baseTune['anti-roll-bar-front'] + 8, 65)
        adjustments['anti-roll-bar-rear'] = Math.min(baseTune['anti-roll-bar-rear'] + 8, 65)
        break
        
      case 'advanced':
        // Performance focused
        adjustments['camber-front'] = baseTune['camber-front'] - 0.4
        adjustments['camber-rear'] = baseTune['camber-rear'] - 0.3
        adjustments['tire-pressure-front'] = baseTune['tire-pressure-front'] - 2
        adjustments['tire-pressure-rear'] = baseTune['tire-pressure-rear'] - 2
        break
    }
    
    return { ...baseTune, ...adjustments }
  }
  
  getSessionAdjustments(baseTune) {
    const adjustments = {}
    
    switch (this.sessionType) {
      case 'qualifying':
        // One-lap pace focus
        adjustments['tire-pressure-front'] = baseTune['tire-pressure-front'] - 2
        adjustments['tire-pressure-rear'] = baseTune['tire-pressure-rear'] - 2
        adjustments['camber-front'] = baseTune['camber-front'] - 0.3
        adjustments['camber-rear'] = baseTune['camber-rear'] - 0.2
        break
        
      case 'race':
        // Tire management focus
        adjustments['tire-pressure-front'] = baseTune['tire-pressure-front'] + 1
        adjustments['tire-pressure-rear'] = baseTune['tire-pressure-rear'] + 1
        adjustments['camber-front'] = Math.min(baseTune['camber-front'] + 0.2, 0)
        adjustments['camber-rear'] = Math.min(baseTune['camber-rear'] + 0.2, 0)
        break
        
      case 'endurance':
        // Consistency and tire preservation
        adjustments['tire-pressure-front'] = baseTune['tire-pressure-front'] + 2
        adjustments['tire-pressure-rear'] = baseTune['tire-pressure-rear'] + 2
        adjustments['camber-front'] = Math.min(baseTune['camber-front'] + 0.4, 0)
        adjustments['camber-rear'] = Math.min(baseTune['camber-rear'] + 0.4, 0)
        adjustments['spring-rate-front'] = baseTune['spring-rate-front'] - 15
        adjustments['spring-rate-rear'] = baseTune['spring-rate-rear'] - 15
        break
    }
    
    return { ...baseTune, ...adjustments }
  }
  
  // Predict lap time improvement
  predictLapTimeImprovement(currentSetup, newSetup) {
    const improvements = {
      camber: Math.abs((newSetup['camber-front'] || 0) - (currentSetup['camber-front'] || 0)) * 0.15,
      pressure: Math.abs((newSetup['tire-pressure-front'] || 0) - (currentSetup['tire-pressure-front'] || 0)) * 0.08,
      aero: Math.abs((newSetup['aero-rear'] || 0) - (currentSetup['aero-rear'] || 0)) * 0.003,
      springs: Math.abs((newSetup['spring-rate-front'] || 0) - (currentSetup['spring-rate-front'] || 0)) * 0.002,
      differential: Math.abs((newSetup['differential-rear-accel'] || 0) - (currentSetup['differential-rear-accel'] || 0)) * 0.01
    }
    
    const totalImprovement = Object.values(improvements).reduce((sum, val) => sum + val, 0)
    return Math.min(totalImprovement, 3.0) // Cap at 3 seconds
  }
  
  // Generate setup comparison report
  generateComparisonReport(setup1, setup2) {
    const differences = {}
    const criticalParams = [
      'tire-pressure-front', 'tire-pressure-rear', 
      'camber-front', 'camber-rear',
      'anti-roll-bar-front', 'anti-roll-bar-rear',
      'differential-rear-accel'
    ]
    
    criticalParams.forEach(param => {
      const diff = (setup2[param] || 0) - (setup1[param] || 0)
      if (Math.abs(diff) > 0.1) {
        differences[param] = {
          change: diff,
          impact: this.getParameterImpact(param, diff)
        }
      }
    })
    
    return differences
  }
  
  getParameterImpact(parameter, change) {
    const impacts = {
      'tire-pressure-front': change > 0 ? 'Reduced grip, better tire wear' : 'Increased grip, faster wear',
      'camber-front': change < 0 ? 'Better cornering grip' : 'More stable, less aggressive',
      'anti-roll-bar-front': change > 0 ? 'Stiffer front end, less understeer' : 'Softer front, more grip',
      'differential-rear-accel': change > 0 ? 'Better traction, less wheelspin' : 'More rotation, easier slides'
    }
    
    return impacts[parameter] || 'Setup adjustment'
  }
  
  // Calculate setup confidence score
  calculateSetupConfidence() {
    let confidence = 100
    
    // Reduce confidence for extreme conditions
    if (this.weather === 'wet') confidence -= 15
    if (this.surface !== 'tarmac') confidence -= 10
    if (this.temperature < 60 || this.temperature > 100) confidence -= 10
    if (this.driverSkill === 'beginner') confidence -= 5
    
    return Math.max(confidence, 60)
  }
}

// Professional tuning presets
export const PROFESSIONAL_PRESETS = {
  'time-attack': {
    name: 'Time Attack',
    description: 'Maximum one-lap pace setup',
    adjustments: {
      'tire-pressure-front': -3,
      'tire-pressure-rear': -3,
      'camber-front': -0.8,
      'camber-rear': -0.6,
      'ride-height-front': -0.5,
      'ride-height-rear': -0.5
    }
  },
  'endurance': {
    name: 'Endurance Racing',
    description: 'Tire preservation and consistency',
    adjustments: {
      'tire-pressure-front': +2,
      'tire-pressure-rear': +2,
      'camber-front': +0.4,
      'camber-rear': +0.4,
      'spring-rate-front': -15,
      'spring-rate-rear': -15
    }
  },
  'wet-weather': {
    name: 'Wet Weather',
    description: 'Optimized for rain conditions',
    adjustments: {
      'tire-pressure-front': -4,
      'tire-pressure-rear': -4,
      'camber-front': +0.5,
      'camber-rear': +0.5,
      'ride-height-front': +0.8,
      'ride-height-rear': +0.8,
      'anti-roll-bar-front': -8,
      'anti-roll-bar-rear': -8
    }
  }
}