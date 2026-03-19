import React, { useState, useEffect } from 'react'
import { VinylDesign } from '../types/vinyl'

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
  const [speed, setSpeed] = useState(1)

  // Auto-play logic
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      onStepChange(currentStep + 1)
    }, 1000 / speed)

    return () => clearInterval(interval)
  }, [isPlaying, currentStep, onStepChange, speed])

  // Stop autoplay at end
  useEffect(() => {
    if (currentStep >= design.buildOrder.length - 1 && isPlaying) {
      setIsPlaying(false)
    }
  }, [currentStep, design.buildOrder.length, isPlaying])

  const currentShapeId = design.buildOrder[currentStep]
  const currentShape = design.shapes.find(s => s.id === currentShapeId)

  const handlePlayPause = () => {
    if (currentStep >= design.buildOrder.length - 1) {
      onStepChange(0)
    }
    setIsPlaying(!isPlaying)
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
        <div className="flex gap-2">
          <button
            onClick={handlePlayPause}
            className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded transition-colors"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            onClick={() => onStepChange(0)}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium rounded transition-colors"
          >
            ⏮ Reset
          </button>
        </div>

        {/* Speed control */}
        <div>
          <label className="text-xs text-slate-400 block mb-1">Speed: {speed.toFixed(1)}x</label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={speed}
            onChange={e => setSpeed(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Step navigation */}
        <div>
          <label className="text-xs text-slate-400 block mb-1">
            Step {currentStep + 1}/{design.buildOrder.length}
          </label>
          <input
            type="range"
            min="0"
            max={design.buildOrder.length - 1}
            value={currentStep}
            onChange={e => {
              setIsPlaying(false)
              onStepChange(parseInt(e.target.value))
            }}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
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
