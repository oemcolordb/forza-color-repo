# 🔗 Vinyl Creator - Integration Guide

## Overview

This guide explains how to integrate the Vinyl Creator module into your main application and use all its features effectively.

---

## 📦 Module Architecture

```
Main Application
    ↓
Vinyl Creator Module
    ├── Components (UI)
    ├── Hooks (State Management)
    ├── Utilities (Business Logic)
    ├── Types (Type Safety)
    └── Data (Examples & Presets)
```

---

## 🔌 Integration Points

### 1. Import Components

```typescript
// Main page or layout
import VinylDesigner from '@/app/vinyl-creator/components/VinylDesigner'
import ReconstructionPanel from '@/app/vinyl-creator/components/ReconstructionPanel'
import DesignPresets from '@/app/vinyl-creator/components/DesignPresets'

export default function VinylCreatorPage() {
  return (
    <div>
      <VinylDesigner />
      <ReconstructionPanel />
      <DesignPresets />
    </div>
  )
}
```

### 2. Import Hooks

```typescript
import { useReconstruction } from '@/app/vinyl-creator/hooks/useReconstruction'
import { useReconstructionKeyboard } from '@/app/vinyl-creator/hooks/useReconstructionKeyboard'

function MyComponent({ design }) {
  const { currentStep, isPlaying, play, pause } = useReconstruction(design)
  
  useReconstructionKeyboard({
    onPlayPause: play,
    onNextStep: () => { /* ... */ },
    // ... other handlers
  })
}
```

### 3. Import Utilities

```typescript
import { validateDesign, getDesignStats } from '@/app/vinyl-creator/lib/designValidation'
import { exportAndDownload, exportDesign } from '@/app/vinyl-creator/lib/exportUtils'
import { ReconstructionEngine } from '@/app/vinyl-creator/lib/ReconstructionEngine'
```

### 4. Import Types

```typescript
import type { VinylDesign, Shape, ShapeRole } from '@/app/vinyl-creator/types/vinyl'
```

---

## 🎨 Component Integration Examples

### Example 1: Full Vinyl Creator Page

```typescript
'use client'

import { useState } from 'react'
import VinylDesigner from '@/app/vinyl-creator/components/VinylDesigner'
import ReconstructionPanel from '@/app/vinyl-creator/components/ReconstructionPanel'
import { validateDesign } from '@/app/vinyl-creator/lib/designValidation'
import { exportAndDownload } from '@/app/vinyl-creator/lib/exportUtils'
import type { VinylDesign } from '@/app/vinyl-creator/types/vinyl'

export default function VinylCreatorPage() {
  const [design, setDesign] = useState<VinylDesign | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  const handleDesignChange = (newDesign: VinylDesign) => {
    const validation = validateDesign(newDesign)
    
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }
    
    setDesign(newDesign)
    setErrors([])
  }

  const handleExport = (format: 'json' | 'csv' | 'svg' | 'html') => {
    if (!design) return
    exportAndDownload(design, format)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Vinyl Creator</h1>
        
        {errors.length > 0 && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-8">
            <h3 className="text-red-400 font-semibold mb-2">Validation Errors:</h3>
            <ul className="text-red-300 space-y-1">
              {errors.map((error, i) => <li key={i}>• {error}</li>)}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <VinylDesigner onDesignChange={handleDesignChange} />
          </div>
          
          <div className="space-y-4">
            {design && (
              <>
                <ReconstructionPanel design={design} />
                
                <div className="bg-slate-700 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3">Export Design</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleExport('json')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                    >
                      Export as JSON
                    </button>
                    <button
                      onClick={() => handleExport('svg')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                    >
                      Export as SVG
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded"
                    >
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleExport('html')}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded"
                    >
                      Export as HTML
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Example 2: Design Gallery with Reconstruction

```typescript
'use client'

import { useState } from 'react'
import ReconstructionPanel from '@/app/vinyl-creator/components/ReconstructionPanel'
import { designExamples } from '@/app/vinyl-creator/data/examples'
import type { VinylDesign } from '@/app/vinyl-creator/types/vinyl'

export default function DesignGallery() {
  const [selectedDesign, setSelectedDesign] = useState<VinylDesign>(designExamples[0])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 p-8">
      {/* Design List */}
      <div className="lg:col-span-1 space-y-2">
        {designExamples.map(design => (
          <button
            key={design.id}
            onClick={() => setSelectedDesign(design)}
            className={`w-full text-left p-4 rounded-lg transition ${
              selectedDesign.id === design.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
            }`}
          >
            <h3 className="font-semibold">{design.name}</h3>
            <p className="text-sm opacity-75">{design.shapes.length} shapes</p>
          </button>
        ))}
      </div>

      {/* Design Viewer */}
      <div className="lg:col-span-3">
        <div className="bg-slate-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-2">{selectedDesign.name}</h2>
          <p className="text-slate-300 mb-6">{selectedDesign.description}</p>
          
          <ReconstructionPanel design={selectedDesign} />
        </div>
      </div>
    </div>
  )
}
```

### Example 3: Design Validation & Stats

```typescript
'use client'

import { useState } from 'react'
import { validateDesign, getDesignStats } from '@/app/vinyl-creator/lib/designValidation'
import type { VinylDesign } from '@/app/vinyl-creator/types/vinyl'

interface DesignAnalyzerProps {
  design: VinylDesign
}

export default function DesignAnalyzer({ design }: DesignAnalyzerProps) {
  const validation = validateDesign(design)
  const stats = getDesignStats(design)

  return (
    <div className="space-y-6 p-6 bg-slate-800 rounded-lg">
      {/* Validation Status */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Validation Status</h3>
        <div className={`p-4 rounded-lg ${
          validation.isValid
            ? 'bg-green-500/10 border border-green-500'
            : 'bg-red-500/10 border border-red-500'
        }`}>
          <p className={validation.isValid ? 'text-green-400' : 'text-red-400'}>
            {validation.isValid ? '✓ Design is valid' : '✗ Design has errors'}
          </p>
        </div>
      </div>

      {/* Errors */}
      {validation.errors.length > 0 && (
        <div>
          <h4 className="text-red-400 font-semibold mb-2">Errors:</h4>
          <ul className="space-y-1">
            {validation.errors.map((error, i) => (
              <li key={i} className="text-red-300 text-sm">• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <div>
          <h4 className="text-yellow-400 font-semibold mb-2">Warnings:</h4>
          <ul className="space-y-1">
            {validation.warnings.map((warning, i) => (
              <li key={i} className="text-yellow-300 text-sm">• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Design Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700 p-4 rounded">
            <p className="text-slate-400 text-sm">Total Shapes</p>
            <p className="text-2xl font-bold text-white">{stats.totalShapes}</p>
          </div>
          <div className="bg-slate-700 p-4 rounded">
            <p className="text-slate-400 text-sm">Total Layers</p>
            <p className="text-2xl font-bold text-white">{stats.totalLayers}</p>
          </div>
          <div className="bg-slate-700 p-4 rounded">
            <p className="text-slate-400 text-sm">Unique Colors</p>
            <p className="text-2xl font-bold text-white">{stats.uniqueColors}</p>
          </div>
          <div className="bg-slate-700 p-4 rounded">
            <p className="text-slate-400 text-sm">Avg Opacity</p>
            <p className="text-2xl font-bold text-white">{stats.averageOpacity.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Shape Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Shape Breakdown</h3>
        <div className="space-y-2">
          {Object.entries(stats.shapesByRole).map(([role, count]) => (
            <div key={role} className="flex justify-between items-center">
              <span className="text-slate-300 capitalize">{role}</span>
              <span className="text-white font-semibold">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

## 🪝 Hook Integration Examples

### Example 1: Reconstruction with Keyboard Shortcuts

```typescript
'use client'

import { useReconstruction } from '@/app/vinyl-creator/hooks/useReconstruction'
import { useReconstructionKeyboard } from '@/app/vinyl-creator/hooks/useReconstructionKeyboard'
import type { VinylDesign } from '@/app/vinyl-creator/types/vinyl'

interface ReconstructionViewerProps {
  design: VinylDesign
}

export default function ReconstructionViewer({ design }: ReconstructionViewerProps) {
  const {
    currentStep,
    isPlaying,
    speed,
    loopEnabled,
    stepInfo,
    play,
    pause,
    nextStep,
    previousStep,
    goToStep,
    reset,
    changeSpeed,
    toggleLoop,
    getProgress
  } = useReconstruction(design, {
    autoPlay: false,
    onStepChange: (step) => console.log(`Step: ${step}`),
    onComplete: () => console.log('Reconstruction complete!')
  })

  // Add keyboard shortcuts
  useReconstructionKeyboard({
    onPlayPause: isPlaying ? pause : play,
    onNextStep: nextStep,
    onPreviousStep: previousStep,
    onFirstStep: () => goToStep(0),
    onLastStep: () => goToStep(design.buildOrder.length - 1),
    onReset: reset,
    onClose: () => console.log('Close reconstruction')
  })

  const progress = getProgress()

  return (
    <div className="space-y-6 p-6 bg-slate-800 rounded-lg">
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-white font-semibold">Progress</span>
          <span className="text-slate-400">{progress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Info */}
      {stepInfo && (
        <div className="bg-slate-700 p-4 rounded">
          <p className="text-slate-300 text-sm">Current Step</p>
          <p className="text-2xl font-bold text-white">
            {currentStep + 1} / {design.buildOrder.length}
          </p>
          <p className="text-slate-400 text-sm mt-2">{stepInfo.shapeName}</p>
        </div>
      )}

      {/* Controls */}
      <div className="space-y-3">
        {/* Play/Pause */}
        <button
          onClick={isPlaying ? pause : play}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

        {/* Navigation */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => goToStep(0)}
            className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded"
          >
            ⏮
          </button>
          <button
            onClick={previousStep}
            className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded"
          >
            ◀
          </button>
          <button
            onClick={nextStep}
            className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded"
          >
            ▶
          </button>
          <button
            onClick={() => goToStep(design.buildOrder.length - 1)}
            className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded"
          >
            ⏭
          </button>
        </div>

        {/* Speed Control */}
        <div className="grid grid-cols-4 gap-2">
          {[0.5, 1, 2, 4].map(s => (
            <button
              key={s}
              onClick={() => changeSpeed(s as any)}
              className={`py-2 rounded font-semibold ${
                speed === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Loop & Reset */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={toggleLoop}
            className={`py-2 rounded font-semibold ${
              loopEnabled
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {loopEnabled ? '🔁 Loop On' : '🔁 Loop Off'}
          </button>
          <button
            onClick={reset}
            className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded font-semibold"
          >
            ↻ Reset
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="bg-slate-700/50 p-3 rounded text-xs text-slate-400">
        <p className="font-semibold mb-2">Keyboard Shortcuts:</p>
        <p>Space: Play/Pause | ←/→: Previous/Next | Home/End: First/Last | Esc: Close | Ctrl+R: Reset</p>
      </div>
    </div>
  )
}
```

---

## 📤 Export Integration

### Example: Export Button Component

```typescript
'use client'

import { useState } from 'react'
import { exportAndDownload } from '@/app/vinyl-creator/lib/exportUtils'
import type { VinylDesign } from '@/app/vinyl-creator/types/vinyl'

interface ExportButtonProps {
  design: VinylDesign
}

export default function ExportButton({ design }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleExport = (format: 'json' | 'csv' | 'svg' | 'html') => {
    exportAndDownload(design, format)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
      >
        📥 Export
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-slate-700 rounded-lg shadow-lg overflow-hidden z-10">
          <button
            onClick={() => handleExport('json')}
            className="w-full text-left px-4 py-2 hover:bg-slate-600 text-white"
          >
            📄 Export as JSON
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="w-full text-left px-4 py-2 hover:bg-slate-600 text-white"
          >
            📊 Export as CSV
          </button>
          <button
            onClick={() => handleExport('svg')}
            className="w-full text-left px-4 py-2 hover:bg-slate-600 text-white"
          >
            🎨 Export as SVG
          </button>
          <button
            onClick={() => handleExport('html')}
            className="w-full text-left px-4 py-2 hover:bg-slate-600 text-white"
          >
            🌐 Export as HTML
          </button>
        </div>
      )}
    </div>
  )
}
```

---

## 🔄 Data Flow

```
User Input
    ↓
Component (VinylDesigner)
    ↓
Hook (useReconstruction)
    ↓
Engine (ReconstructionEngine)
    ↓
Validation (validateDesign)
    ↓
Export (exportAndDownload)
    ↓
File Download
```

---

## 🧪 Testing Integration

### Example: Integration Test

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import ReconstructionViewer from '@/app/vinyl-creator/components/ReconstructionViewer'
import { designExamples } from '@/app/vinyl-creator/data/examples'

describe('ReconstructionViewer Integration', () => {
  it('should play and pause design', () => {
    render(<ReconstructionViewer design={designExamples[0]} />)
    
    const playButton = screen.getByText(/Play/)
    fireEvent.click(playButton)
    
    expect(screen.getByText(/Pause/)).toBeInTheDocument()
  })

  it('should navigate steps', () => {
    render(<ReconstructionViewer design={designExamples[0]} />)
    
    const nextButton = screen.getByText('▶')
    fireEvent.click(nextButton)
    
    expect(screen.getByText(/2 \//)).toBeInTheDocument()
  })

  it('should change speed', () => {
    render(<ReconstructionViewer design={designExamples[0]} />)
    
    const speedButton = screen.getByText('2x')
    fireEvent.click(speedButton)
    
    expect(speedButton).toHaveClass('bg-blue-600')
  })
})
```

---

## 🚀 Deployment Checklist

- [ ] All components imported correctly
- [ ] Hooks integrated into components
- [ ] Utilities imported and used
- [ ] Types imported for TypeScript
- [ ] Tests passing
- [ ] Export functionality working
- [ ] Keyboard shortcuts enabled
- [ ] Validation active
- [ ] Error handling in place
- [ ] Documentation updated

---

## 📞 Support

For integration issues:
1. Check component props in source files
2. Review example implementations
3. Check test files for usage patterns
4. Refer to IMPLEMENTATION_COMPLETE.md for API reference

---

**Status**: ✅ Ready for Integration  
**Last Updated**: 2024
