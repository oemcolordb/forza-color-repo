'use client'

export const dynamic = 'force-dynamic'

import React from 'react'
import Link from 'next/link'

export default function HowToUsePage() {
  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* EPIC video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src="/EPIC.mp4"
      />
      <div className="absolute inset-0 bg-black/75" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bamboo-button-ghost rounded-lg transition-colors"
          >
            ← Back to Color Database
          </Link>
        </div>

        <div className="rounded-xl p-8 bamboo-surface-dark">
          <h1 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
            📖 How to Use Colors in Forza Horizon 5
          </h1>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="rounded-lg p-6 bamboo-surface-dark">
              <h2 className="text-2xl font-semibold mb-4 text-[color:var(--bamboo-stalk)]">
                🎯 Step 1: Find Your Perfect Color
              </h2>
              <ul className="space-y-2 text-slate-300">
                <li>• Browse the color database by manufacturer, model, or color type</li>
                <li>• Use the search function to find specific colors</li>
                <li>• Click the info button (ℹ️) on any color card to see detailed HSB values</li>
                <li>• Save colors to favorites (❤️) for easy access later</li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="rounded-lg p-6 bamboo-surface-dark">
              <h2 className="text-2xl font-semibold mb-4 text-[color:var(--bamboo-stalk)]">
                🎮 Step 2: Access Paint Shop in Forza Horizon 5
              </h2>
              <ol className="space-y-2 text-slate-300 list-decimal list-inside">
                <li>Open Forza Horizon 5 and go to your garage</li>
                <li>Select the car you want to paint</li>
                <li>
                  Press <kbd className="px-2 py-1 rounded text-white bamboo-button-ghost">X</kbd> to enter
                  the Paint Shop
                </li>
                <li>Choose "Paint Car" from the menu</li>
              </ol>
            </div>

            {/* Step 3 */}
            <div className="rounded-lg p-6 bamboo-surface-dark">
              <h2 className="text-2xl font-semibold mb-4 text-[color:var(--bamboo-stalk)]">
                🎨 Step 3: Input HSB Color Values
              </h2>
              <div className="space-y-4">
                <p className="text-slate-300">
                  In the Paint Shop, you'll see three sliders for HSB values:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-red-900/30 p-4 rounded border border-red-500/50">
                    <h3 className="font-semibold text-red-400 mb-2">H (Hue)</h3>
                    <p className="text-sm text-slate-300">Controls the color itself (0.00-1.00)</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Red → Orange → Yellow → Green → Blue → Purple
                    </p>
                  </div>
                  <div className="bg-yellow-900/30 p-4 rounded border border-yellow-500/50">
                    <h3 className="font-semibold text-yellow-400 mb-2">S (Saturation)</h3>
                    <p className="text-sm text-slate-300">Controls color intensity (0.00-1.00)</p>
                    <p className="text-xs text-slate-400 mt-1">0.00 = Gray, 1.00 = Vivid Color</p>
                  </div>
                  <div className="bg-blue-900/30 p-4 rounded border border-blue-500/50">
                    <h3 className="font-semibold text-blue-400 mb-2">B (Brightness)</h3>
                    <p className="text-sm text-slate-300">Controls lightness (0.00-1.00)</p>
                    <p className="text-xs text-slate-400 mt-1">0.00 = Black, 1.00 = Bright</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="rounded-lg p-6 bamboo-surface-dark">
              <h2 className="text-2xl font-semibold mb-4 text-[color:var(--bamboo-stalk)]">
                ⚙️ Step 4: Precise Input Method
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bamboo-surface-dark">
                  <h3 className="font-semibold mb-2 text-white">For Exact Values:</h3>
                  <ol className="space-y-2 text-slate-300 list-decimal list-inside">
                    <li>
                      Use the{' '}
                      <kbd className="px-2 py-1 rounded text-white bamboo-button-ghost">Left Stick</kbd> to
                      move sliders
                    </li>
                    <li>
                      Hold <kbd className="px-2 py-1 rounded text-white bamboo-button-ghost">LT</kbd> for
                      fine adjustment (slower movement)
                    </li>
                    <li>Input the exact decimal values from our database</li>
                    <li>Example: H: 0.65, S: 0.80, B: 0.90</li>
                  </ol>
                </div>
                <div className="bg-amber-900/30 p-4 rounded border border-amber-500/50">
                  <p className="text-amber-200">
                    <strong>💡 Pro Tip:</strong> For two-tone colors, apply Color 1 first, then use
                    the "Add Layer" option to apply Color 2 with different opacity/blend modes.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="rounded-lg p-6 bamboo-surface-dark">
              <h2 className="text-2xl font-semibold mb-4 text-[color:var(--bamboo-stalk)]">
                ✨ Step 5: Advanced Techniques
              </h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded bamboo-surface-dark">
                    <h3 className="font-semibold mb-2 text-white">Paint Types</h3>
                    <ul className="space-y-1 text-sm text-slate-300">
                      <li>
                        • <strong>Matte:</strong> Use low brightness values
                      </li>
                      <li>
                        • <strong>Metallic:</strong> Add metallic finish after color
                      </li>
                      <li>
                        • <strong>Pearl:</strong> Layer colors with transparency
                      </li>
                      <li>
                        • <strong>Chrome:</strong> High saturation + metallic
                      </li>
                    </ul>
                  </div>
                  <div className="p-4 rounded bamboo-surface-dark">
                    <h3 className="font-semibold mb-2 text-white">Color Matching</h3>
                    <ul className="space-y-1 text-sm text-slate-300">
                      <li>• Use our Paint Scanner tool for photos</li>
                      <li>• Check Color Roulette for harmonies</li>
                      <li>• Save successful combinations</li>
                      <li>• Share liveries with the community</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Reference */}
            <div className="rounded-lg p-6 bamboo-surface-dark">
              <h2 className="text-2xl font-semibold mb-4 text-white">🚀 Quick Reference Card</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2 text-[color:var(--bamboo-stalk)]">Controller Shortcuts</h3>
                  <ul className="space-y-1 text-sm text-slate-300">
                    <li>
                      <kbd className="px-1 rounded bamboo-button-ghost">X</kbd> - Enter Paint Shop
                    </li>
                    <li>
                      <kbd className="px-1 rounded bamboo-button-ghost">Left Stick</kbd> - Adjust sliders
                    </li>
                    <li>
                      <kbd className="px-1 rounded bamboo-button-ghost">LT</kbd> - Fine adjustment
                    </li>
                    <li>
                      <kbd className="px-1 rounded bamboo-button-ghost">Y</kbd> - Reset to default
                    </li>
                    <li>
                      <kbd className="px-1 rounded bamboo-button-ghost">B</kbd> - Back/Cancel
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-[color:var(--bamboo-stalk)]">HSB Value Ranges</h3>
                  <ul className="space-y-1 text-sm text-slate-300">
                    <li>
                      <strong>Hue:</strong> 0.00 - 1.00 (color wheel)
                    </li>
                    <li>
                      <strong>Saturation:</strong> 0.00 - 1.00 (intensity)
                    </li>
                    <li>
                      <strong>Brightness:</strong> 0.00 - 1.00 (lightness)
                    </li>
                    <li>
                      <strong>Precision:</strong> 2 decimal places
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bamboo-button text-white font-semibold rounded-lg transition-all transform hover:scale-105"
              >
                🎨 Start Painting Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>{/* end video wrapper */}
  )
}
