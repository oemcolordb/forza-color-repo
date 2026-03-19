/**
 * Unit Tests for ReconstructionEngine
 */

import { ReconstructionEngine } from '../ReconstructionEngine'
import { simpleStarDesign, complexCarDesign } from '../../data/examples'

describe('ReconstructionEngine', () => {
  let engine: ReconstructionEngine

  beforeEach(() => {
    engine = new ReconstructionEngine(simpleStarDesign)
  })

  afterEach(() => {
    engine.destroy()
  })

  describe('Initialization', () => {
    it('should initialize with correct state', () => {
      const state = engine.getState()
      expect(state.currentStep).toBe(0)
      expect(state.isPlaying).toBe(false)
      expect(state.speed).toBe(1)
      expect(state.loopEnabled).toBe(false)
    })

    it('should set highlighted shape to first shape', () => {
      const state = engine.getState()
      expect(state.highlightedShapeId).toBe(simpleStarDesign.buildOrder[0])
    })
  })

  describe('Playback Control', () => {
    it('should play animation', () => {
      engine.play()
      const state = engine.getState()
      expect(state.isPlaying).toBe(true)
    })

    it('should pause animation', () => {
      engine.play()
      engine.pause()
      const state = engine.getState()
      expect(state.isPlaying).toBe(false)
    })
  })

  describe('Step Navigation', () => {
    it('should advance to next step', () => {
      engine.nextStep()
      expect(engine.getState().currentStep).toBe(1)
    })

    it('should go to previous step', () => {
      engine.goToStep(2)
      engine.previousStep()
      expect(engine.getState().currentStep).toBe(1)
    })

    it('should jump to specific step', () => {
      engine.goToStep(3)
      expect(engine.getState().currentStep).toBe(3)
    })

    it('should not go below step 0', () => {
      engine.previousStep()
      expect(engine.getState().currentStep).toBe(0)
    })

    it('should not go beyond last step', () => {
      engine.goToStep(simpleStarDesign.buildOrder.length - 1)
      engine.nextStep()
      expect(engine.getState().currentStep).toBe(simpleStarDesign.buildOrder.length - 1)
    })
  })

  describe('Speed Control', () => {
    it('should set speed to 0.5x', () => {
      engine.setSpeed(0.5)
      expect(engine.getState().speed).toBe(0.5)
    })

    it('should set speed to 2x', () => {
      engine.setSpeed(2)
      expect(engine.getState().speed).toBe(2)
    })

    it('should set speed to 4x', () => {
      engine.setSpeed(4)
      expect(engine.getState().speed).toBe(4)
    })
  })

  describe('Loop Control', () => {
    it('should enable loop', () => {
      engine.toggleLoop()
      expect(engine.getState().loopEnabled).toBe(true)
    })

    it('should disable loop', () => {
      engine.toggleLoop()
      engine.toggleLoop()
      expect(engine.getState().loopEnabled).toBe(false)
    })
  })

  describe('State Queries', () => {
    it('should get visible shape IDs', () => {
      engine.goToStep(2)
      const visibleIds = engine.getVisibleShapeIds()
      expect(visibleIds.length).toBe(3)
    })

    it('should get current step info', () => {
      engine.goToStep(1)
      const info = engine.getCurrentStepInfo()
      expect(info.step).toBe(2)
      expect(info.total).toBe(simpleStarDesign.buildOrder.length)
    })

    it('should calculate progress correctly', () => {
      engine.goToStep(2)
      const progress = engine.getProgress()
      expect(progress).toBeGreaterThan(0)
      expect(progress).toBeLessThanOrEqual(100)
    })
  })

  describe('Reset Functionality', () => {
    it('should reset to beginning', () => {
      engine.goToStep(3)
      engine.reset()
      expect(engine.getState().currentStep).toBe(0)
    })
  })

  describe('Complex Design Handling', () => {
    it('should handle complex designs with many shapes', () => {
      const complexEngine = new ReconstructionEngine(complexCarDesign)
      expect(complexEngine.getState().currentStep).toBe(0)
      complexEngine.destroy()
    })
  })
})
