/**
 * useReconstruction Hook
 * Manages reconstruction state and engine lifecycle
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { VinylDesign } from '../types/vinyl'
import { ReconstructionEngine, PlaybackSpeed, StepInfo } from '../lib/ReconstructionEngine'

export interface UseReconstructionOptions {
  autoPlay?: boolean
  onStepChange?: (step: number) => void
  onComplete?: () => void
}

export function useReconstruction(
  design: VinylDesign,
  options: UseReconstructionOptions = {}
) {
  const engineRef = useRef<ReconstructionEngine | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(options.autoPlay || false)
  const [speed, setSpeed] = useState<PlaybackSpeed>(1)
  const [loopEnabled, setLoopEnabled] = useState(false)
  const [stepInfo, setStepInfo] = useState<StepInfo | null>(null)

  // Initialize engine
  useEffect(() => {
    engineRef.current = new ReconstructionEngine(design)
    
    if (options.autoPlay) {
      engineRef.current.play()
    }

    return () => {
      engineRef.current?.destroy()
    }
  }, [design, options.autoPlay])

  // Sync engine state with component state
  useEffect(() => {
    if (!engineRef.current) return

    engineRef.current.goToStep(currentStep)
    const info = engineRef.current.getCurrentStepInfo()
    setStepInfo(info)
    options.onStepChange?.(currentStep)
  }, [currentStep, options])

  // Handle playback
  useEffect(() => {
    if (!engineRef.current) return

    if (isPlaying) {
      engineRef.current.play()
    } else {
      engineRef.current.pause()
    }
  }, [isPlaying])

  // Handle speed changes
  useEffect(() => {
    engineRef.current?.setSpeed(speed)
  }, [speed])

  // Handle loop changes
  useEffect(() => {
    if (!engineRef.current) return

    if (loopEnabled) {
      engineRef.current.enableLoop()
    } else {
      engineRef.current.disableLoop()
    }
  }, [loopEnabled])

  // Listen to engine events
  useEffect(() => {
    if (!engineRef.current) return

    const handleStepChange = (data: StepInfo) => {
      setCurrentStep(data.step - 1)
      setStepInfo(data)
      options.onStepChange?.(data.step - 1)
    }

    const handleComplete = () => {
      setIsPlaying(false)
      options.onComplete?.()
    }

    engineRef.current.on('step-change', handleStepChange)
    engineRef.current.on('complete', handleComplete)

    return () => {
      engineRef.current?.off('step-change', handleStepChange)
      engineRef.current?.off('complete', handleComplete)
    }
  }, [options])

  // Control methods
  const play = useCallback(() => setIsPlaying(true), [])
  const pause = useCallback(() => setIsPlaying(false), [])
  const togglePlayPause = useCallback(() => setIsPlaying(prev => !prev), [])
  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, design.buildOrder.length - 1))
  }, [design.buildOrder.length])
  const previousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }, [])
  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, design.buildOrder.length - 1)))
  }, [design.buildOrder.length])
  const reset = useCallback(() => {
    setCurrentStep(0)
    setIsPlaying(false)
  }, [])
  const changeSpeed = useCallback((newSpeed: PlaybackSpeed) => {
    setSpeed(newSpeed)
  }, [])
  const toggleLoop = useCallback(() => {
    setLoopEnabled(prev => !prev)
  }, [])

  // Get visible shapes
  const getVisibleShapeIds = useCallback(() => {
    return design.buildOrder.slice(0, currentStep + 1)
  }, [design.buildOrder, currentStep])

  // Get progress
  const getProgress = useCallback(() => {
    return ((currentStep + 1) / design.buildOrder.length) * 100
  }, [currentStep, design.buildOrder.length])

  return {
    // State
    currentStep,
    isPlaying,
    speed,
    loopEnabled,
    stepInfo,
    
    // Controls
    play,
    pause,
    togglePlayPause,
    nextStep,
    previousStep,
    goToStep,
    reset,
    changeSpeed,
    toggleLoop,
    
    // Queries
    getVisibleShapeIds,
    getProgress,
    
    // Engine reference
    engine: engineRef.current
  }
}
