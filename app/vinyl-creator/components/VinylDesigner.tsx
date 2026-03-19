import React, { useState, useRef, useCallback } from 'react'
import { VinylDesign, Shape } from '../types/vinyl'
import Canvas from './Canvas'
import ContextMenu from './ContextMenu'
import ReconstructionPanel from './ReconstructionPanel'
import DesignPresets from './DesignPresets'
import AIVinylBuilder from './AIVinylBuilder'
import { SAMPLE_STAR } from '../data/presets'

export default function VinylDesigner() {
  const [currentDesign, setCurrentDesign] = useState<VinylDesign>(SAMPLE_STAR)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null)
  const [reconstructionActive, setReconstructionActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [groupMode, setGroupMode] = useState<'layer' | 'color' | 'role'>('layer')
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleCanvasContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        setContextMenu({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
      }
    },
    []
  )

  const handleSelectShape = (shapeId: string) => {
    setSelectedShapeId(shapeId)
    setContextMenu(null)
  }

  const handleStartReconstruction = (shapeId: string) => {
    setSelectedShapeId(shapeId)
    setReconstructionActive(true)
    setCurrentStep(0)
    setContextMenu(null)
  }

  const handleLoadPreset = (preset: VinylDesign) => {
    setCurrentDesign(preset)
    setSelectedShapeId(null)
    setReconstructionActive(false)
    setCurrentStep(0)
  }

  const handleStepChange = (step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, currentDesign.buildOrder.length - 1)))
  }

  const shapeUpToStep =
    reconstructionActive && currentStep < currentDesign.buildOrder.length
      ? currentDesign.buildOrder.slice(0, currentStep + 1)
      : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left sidebar - Design presets and controls */}
      <div className="lg:col-span-1 space-y-4">
        <DesignPresets
          currentDesign={currentDesign}
          onLoadPreset={handleLoadPreset}
        />

        {/* AI Vinyl Builder */}
        <AIVinylBuilder
          onDesignGenerated={design => {
            setCurrentDesign(design)
            setSelectedShapeId(null)
            setReconstructionActive(false)
            setCurrentStep(0)
          }}
          isDarkMode={true}
        />

        {/* Group mode selector */}
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
          <h3 className="text-sm font-semibold text-white mb-3">📊 Group By</h3>
          <div className="space-y-2">
            {(['layer', 'color', 'role'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setGroupMode(mode)}
                className={`w-full text-sm px-3 py-2 rounded transition-colors ${
                  groupMode === mode
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {mode === 'layer' && '📚 Layer'}
                {mode === 'color' && '🎨 Color'}
                {mode === 'role' && '⚙️ Role'}
              </button>
            ))}
          </div>
        </div>

        {/* Design info */}
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
          <h3 className="text-sm font-semibold text-white mb-2">ℹ️ Design Info</h3>
          <div className="text-xs text-slate-300 space-y-1">
            <div>
              <span className="text-slate-400">Shapes:</span> {currentDesign.shapes.length}
            </div>
            <div>
              <span className="text-slate-400">Layers:</span> {Math.max(...currentDesign.shapes.map(s => s.layer)) + 1}
            </div>
            <div>
              <span className="text-slate-400">Complexity:</span>{' '}
              {currentDesign.shapes.length > 30 ? '🔴 High' : currentDesign.shapes.length > 10 ? '🟡 Medium' : '🟢 Simple'}
            </div>
          </div>
        </div>
      </div>

      {/* Center - Canvas */}
      <div className="lg:col-span-2">
        <div
          ref={canvasRef}
          onContextMenu={handleCanvasContextMenu}
          className="relative bg-slate-900/80 backdrop-blur-sm rounded-lg border border-purple-500/30 h-[500px] overflow-hidden cursor-crosshair"
        >
          <Canvas
            design={currentDesign}
            selectedShapeId={selectedShapeId}
            reconstructionMode={reconstructionActive}
            shapesUpToStep={shapeUpToStep}
            onContextMenu={handleCanvasContextMenu}
          />

          {reconstructionActive && (
            <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
              Step {currentStep + 1}/{currentDesign.buildOrder.length}
            </div>
          )}
        </div>

        {/* Context Menu */}
        {contextMenu && (
          <ContextMenu
            position={contextMenu}
            design={currentDesign}
            groupMode={groupMode}
            selectedShapeId={selectedShapeId}
            onSelectShape={handleSelectShape}
            onStartReconstruction={handleStartReconstruction}
            onClose={() => setContextMenu(null)}
          />
        )}
      </div>

      {/* Right sidebar - Reconstruction panel */}
      <div className="lg:col-span-1">
        {reconstructionActive ? (
          <ReconstructionPanel
            design={currentDesign}
            currentStep={currentStep}
            onStepChange={handleStepChange}
            onClose={() => setReconstructionActive(false)}
          />
        ) : selectedShapeId ? (
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white mb-2">📍 Shape Selected</h3>
              {currentDesign.shapes.find(s => s.id === selectedShapeId) && (
                <ShapeDetails
                  shape={currentDesign.shapes.find(s => s.id === selectedShapeId)!}
                  onStartReconstruction={() => handleStartReconstruction(selectedShapeId)}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30 text-center">
            <p className="text-sm text-slate-400">
              👉 Right-click on the canvas to explore shapes and start reconstruction.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function ShapeDetails({
  shape,
  onStartReconstruction,
}: {
  shape: Shape
  onStartReconstruction: () => void
}) {
  return (
    <div className="space-y-2 text-xs text-slate-300">
      <div>
        <span className="text-slate-400 font-medium">Name:</span> {shape.name}
      </div>
      <div>
        <span className="text-slate-400 font-medium">Role:</span> {shape.role}
      </div>
      <div>
        <span className="text-slate-400 font-medium">Layer:</span> {shape.layer}
      </div>
      <div>
        <span className="text-slate-400 font-medium">Color:</span> {shape.color}
      </div>
      <button
        onClick={onStartReconstruction}
        className="w-full mt-3 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded transition-colors"
      >
        ▶️ View Reconstruction
      </button>
    </div>
  )
}
