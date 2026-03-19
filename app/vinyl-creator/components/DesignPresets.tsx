import React from 'react'
import { VinylDesign } from '../types/vinyl'
import { ALL_PRESETS } from '../data/presets'

interface DesignPresetsProps {
  currentDesign: VinylDesign
  onLoadPreset: (_preset: VinylDesign) => void
}

export default function DesignPresets({
  currentDesign,
  onLoadPreset,
}: DesignPresetsProps) {
  return (
    <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
      <h3 className="text-sm font-semibold text-white mb-3">📚 Design Presets</h3>
      <div className="space-y-2">
        {ALL_PRESETS.map(preset => (
          <button
            key={preset.id}
            onClick={() => onLoadPreset(preset)}
            className={`w-full text-left px-3 py-2 rounded transition-colors text-xs ${
              currentDesign.id === preset.id
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <div className="font-medium">{preset.name}</div>
            <div className="text-xs opacity-75 mt-1">
              {preset.shapes.length} shapes • {preset.complexity}
            </div>
          </button>
        ))}
      </div>

      {/* Current design info */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="text-xs text-slate-400 space-y-1">
          <div className="font-medium text-slate-300 mb-1">Current Design</div>
          <div className="font-semibold text-white">{currentDesign.name}</div>
          <p className="text-slate-500 text-xs">{currentDesign.description}</p>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-0.5 bg-slate-700 rounded text-xs">
              {currentDesign.shapes.length} shapes
            </span>
            <span className={`px-2 py-0.5 rounded text-xs ${
              currentDesign.complexity === 'simple' ? 'bg-green-600' :
              currentDesign.complexity === 'medium' ? 'bg-yellow-600' :
              'bg-red-600'
            }`}>
              {currentDesign.complexity}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
