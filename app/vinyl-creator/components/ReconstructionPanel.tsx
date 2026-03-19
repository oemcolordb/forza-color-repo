import React, { useState, useEffect, useRef } from 'react'
import { VinylDesign } from '../types/vinyl'
import { ReconstructionEngine, PlaybackSpeed } from '../lib/ReconstructionEngine'

interface ReconstructionPanelProps {
  design: VinylDesign
  currentStep: number
  onStepChange: (_step: number) => void
  onClose: () => void
}

export default function ReconstructionPanel({
  design,
  currentStep,
  onStepChange,
  onClose,
}: ReconstructionPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState<PlaybackSpeed>(1)
  const [loopEnabled, setLoopEnabled] = useState(false)
  const engineRef = useRef<ReconstructionEngine | null>(null)

  // Initialize engine
  useEffect(() => {
    engineRef.current = new ReconstructionEngine(design)
    return () => {
      engineRef.current?.destroy()
    }
  }, [design])

  // Sync engine state with props
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.goToStep(currentStep)
    }
  }, [currentStep])

  // Auto-play logic
  useEffect(() => {
    if (!engineRef.current) return

    if (isPlaying) {
      engineRef.current.play()
    } else {
      engineRef.current.pause()
    }
  }, [isPlaying])

  // Speed control
  useEffect(() => {
    engineRef.current?.setSpeed(speed)
  }, [speed])

  // Loop control
  useEffect(() => {
    if (engineRef.current) {
      if (loopEnabled) {
        engineRef.current.enableLoop()
      } else {
        engineRef.current.disableLoop()
      }
    }
  }, [loopEnabled])

  // Listen to engine events
  useEffect(() => {
    if (!engineRef.current) return

    const handleStepChange = (data: any) => {
      onStepChange(data.step - 1)
    }

    const handleComplete = () => {
      setIsPlaying(false)
    }

    engineRef.current.on('step-change', handleStepChange)
    engineRef.current.on('complete', handleComplete)

    return () => {
      engineRef.current?.off('step-change', handleStepChange)
      engineRef.current?.off('complete', handleComplete)
    }
  }, [onStepChange])

  const currentShapeId = design.buildOrder[currentStep] || null
  const currentShape = currentShapeId ? design.shapes.find(s => s.id === currentShapeId) : null

  if (!currentShapeId || design.buildOrder.length === 0) {
    return (
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30 h-full flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-slate-400 mb-2">📭 No reconstruction data</p>
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
          >
            ✖ Close
          </button>
        </div>
      </div>
    )
  }

  const handlePlayPause = () => {
    if (currentStep >= design.buildOrder.length - 1) {
      engineRef.current?.reset()
    }
    setIsPlaying(!isPlaying)
  }

  const handlePrevious = () => {
    engineRef.current?.previousStep()
  }

  const handleNext = () => {
    engineRef.current?.nextStep()
  }

  const handleReset = () => {
    engineRef.current?.reset()
    setIsPlaying(false)
  }

  const handleSpeedChange = (newSpeed: PlaybackSpeed) => {
    setSpeed(newSpeed)
  }

  const cycleSpeed = () => {
    const speeds: PlaybackSpeed[] = [0.5, 1, 2, 4]
    const currentIndex = speeds.indexOf(speed)
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length]
    setSpeed(nextSpeed)
  }

  return (
    <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">🎬 Reconstruction</h3>
        <button
          onClick={onClose}
          className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
        >
          ✖
        </button>
      </div>

      {/* Play controls */}
      <div className="space-y-3 mb-4">
        {/* Main playback controls */}
        <div className="flex gap-2">
          <button
            onClick={() => engineRef.current?.goToStep(0)}
            className="px-2 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium rounded transition-colors"
            title="First step"
          >
            ⏮
          </button>
          <button
            onClick={handlePrevious}
            className="px-2 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium rounded transition-colors"
            title="Previous step"
          >
            ◀
          </button>
          <button
            onClick={handlePlayPause}
            className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded transition-colors"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            onClick={handleNext}
            className="px-2 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium rounded transition-colors"
            title="Next step"
          >
            ▶
          </button>
          <button
            onClick={() => engineRef.current?.goToLast()}
            className="px-2 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium rounded transition-colors"
            title="Last step"
          >
            ⏭
          </button>
        </div>

        {/* Secondary controls */}
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium rounded transition-colors"
          >
            🔄 Reset
          </button>
          <button
            onClick={() => setLoopEnabled(!loopEnabled)}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded transition-colors ${
              loopEnabled
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
          >
            🔁 Loop
          </button>
        </div>

        {/* Speed control */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-slate-400">Speed</label>
            <button
              onClick={cycleSpeed}
              className="text-xs px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
            >
              {speed}x
            </button>
          </div>
          <div className="flex gap-1">
            {([0.5, 1, 2, 4] as PlaybackSpeed[]).map(s => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                  speed === s
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-slate-400">
              Step {currentStep + 1}/{design.buildOrder.length}
            </label>
            <span className="text-xs text-purple-400">
              {Math.round(((currentStep + 1) / design.buildOrder.length) * 100)}%
            </span>
          </div>
          <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / design.buildOrder.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Current shape info */}
      {currentShape && (
        <div className="bg-slate-900/50 rounded p-3 mb-4 text-xs text-slate-300 space-y-2">
          <div>
            <span className="text-slate-400 font-medium">Shape:</span> {currentShape.name}
          </div>
          <div>
            <span className="text-slate-400 font-medium">Role:</span> {currentShape.role}
          </div>
          <div>
            <span className="text-slate-400 font-medium">Color:</span>
            <div className="flex items-center gap-2 mt-1">
              <div
                className="w-3 h-3 rounded border border-slate-600"
                style={{ backgroundColor: currentShape.color }}
              />
              <span>{currentShape.color}</span>
            </div>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Layer:</span> {currentShape.layer}
          </div>
        </div>
      )}

      {/* Step timeline */}
      <div className="flex-1 overflow-y-auto mb-4">
        <h4 className="text-xs font-semibold text-slate-400 mb-2">Timeline</h4>
        <div className="space-y-1">
          {design.buildOrder.map((shapeId, idx) => {
            const shape = design.shapes.find(s => s.id === shapeId)
            const isCurrentStep = idx === currentStep
            const isPastStep = idx < currentStep

            return (
              <button
                key={shapeId}
                onClick={() => {
                  setIsPlaying(false)
                  onStepChange(idx)
                }}
                className={`w-full text-left text-xs px-2 py-1 rounded transition-colors truncate ${
                  isCurrentStep
                    ? 'bg-green-600 text-white'
                    : isPastStep
                      ? 'bg-purple-600/30 text-purple-200'
                      : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700/50'
                }`}
              >
                {idx + 1}. {shape?.name || 'Unknown'}
              </button>
            )
          })}
        </div>
      </div>

      {/* Info text */}
      <div className="text-xs text-slate-400 border-t border-slate-700 pt-3 text-center">
        {currentStep === design.buildOrder.length - 1
          ? '✨ Complete!'
          : `${design.buildOrder.length - currentStep - 1} steps remaining`}
      </div>
    </div>
  )
}
