'use client'

import React from 'react'
import { CarColor } from '@/types'
import DialogShell from '@/components/ui/DialogShell'
import { getAdvancedMaterialStyle } from '@/lib/utils/colorUtils'
import Button from '@/components/ui/Button'
import dynamic from 'next/dynamic'
import { BadgeCheck } from 'lucide-react'

const WebGLPaintPreview = dynamic(() => import('@/components/color/WebGLPaintPreview'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[20vh] min-h-[110px] max-h-[180px] flex items-center justify-center bg-gray-800 rounded-lg animate-pulse">
      <span className="text-gray-400 text-sm">Loading 3D Engine...</span>
    </div>
  )
})

interface HSBPopupProps {
  color: CarColor | null
  isOpen: boolean
  onClose: () => void
  isDarkMode: boolean
}

function hsbToRgbStr(h: number, s: number, b: number): string {
  const c = b * s
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
  const m = b - c
  let r = 0, g = 0, bl = 0
  if (h < 1 / 6)      { r = c; g = x; bl = 0 }
  else if (h < 2 / 6) { r = x; g = c; bl = 0 }
  else if (h < 3 / 6) { r = 0; g = c; bl = x }
  else if (h < 4 / 6) { r = 0; g = x; bl = c }
  else if (h < 5 / 6) { r = x; g = 0; bl = c }
  else                { r = c; g = 0; bl = x }
  return `rgb(${Math.round((r + m) * 255)}, ${Math.round((g + m) * 255)}, ${Math.round((bl + m) * 255)})`
}

const isDualToneFinish = (type?: string) => {
  if (!type) return false;
  const t = type.toLowerCase();
  return t.includes('flake') || t.includes('pearl') || t.includes('two-tone') || t.includes('two tone') || t.includes('carbon') || t.includes('kevlar');
}

const HSBPopup: React.FC<HSBPopupProps> = ({ color, isOpen, onClose, isDarkMode }) => {
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null)

  if (!isOpen || !color) return null

  const c1 = color.color1 || { h: 0, s: 0, b: 0 }
  const c2 = color.color2 || color.color1 || { h: 0, s: 0, b: 0 }

  const hsb1 = { h: (c1.h || 0).toFixed(2), s: (c1.s || 0).toFixed(2), b: (c1.b || 0).toFixed(2) }
  const hsb2 = { h: (c2.h || 0).toFixed(2), s: (c2.s || 0).toFixed(2), b: (c2.b || 0).toFixed(2) }

  const isExplicitSingleTone = color.colorType && !isDualToneFinish(color.colorType);
  const areColorsEqual = hsb1.h === hsb2.h && hsb1.s === hsb2.s && hsb1.b === hsb2.b;
  const showSingle = isExplicitSingleTone || areColorsEqual;

  return (
    <DialogShell
      isOpen={isOpen}
      onClose={onClose}
      titleId="hsb-popup-title"
      initialFocusRef={closeButtonRef}
      overlayClassName="fixed inset-0 z-[999999] overflow-y-auto bg-black/60 flex justify-center items-start sm:items-center p-4"
      panelClassName={`p-4 rounded-lg max-w-sm w-full shadow-2xl border-2 max-h-[90vh] sm:max-h-[85vh] overflow-y-auto ${
        isDarkMode 
          ? 'bg-[rgba(10,18,12,0.95)] border-[rgba(255,255,255,0.15)] text-white shadow-[0_0_50px_rgba(0,0,0,0.8)]' 
          : 'bg-[rgba(245,241,230,0.95)] border-[rgba(0,0,0,0.15)] text-gray-900 shadow-[0_0_30px_rgba(0,0,0,0.2)]'
      }`}
    >
      <div style={{ zIndex: 1000000 }}>
        <div className="flex justify-between items-center mb-3">
          <h3 id="hsb-popup-title" className="font-semibold">
            HSB Color Data
          </h3>
          <Button
            ref={closeButtonRef}
            onClick={onClose}
            onTouchStart={e => {
              e.stopPropagation()
              onClose()
            }}
            variant="ghost"
            size="md"
            className="text-xl min-w-[44px] min-h-[44px]"
            style={{ touchAction: 'manipulation' }}
          >
            ×
          </Button>
        </div>

        <div className="mb-4">
          <WebGLPaintPreview color={color} />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold flex items-center gap-1.5 text-base leading-snug">
                {color.colorName}
                {color.original_hex && (
                  <span title={`Validated against Paintlib (${color.original_hex})`} className="shrink-0 inline-flex items-center">
                    <BadgeCheck className="w-4 h-4 text-green-500" />
                  </span>
                )}
              </h3>
              <div className="text-xs opacity-75">{color.make}</div>
            </div>
            {color.colorType && (
              <div className="text-[9px] text-gray-400 opacity-90 uppercase tracking-wider font-semibold bg-white/5 px-2 py-0.5 rounded border border-white/10 shrink-0">
                {color.colorType}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-gray-700/30">
            {showSingle ? (
              <div className="flex items-center gap-3 bg-black/10 p-2 rounded-lg border border-white/5">
                <div
                  className="w-10 h-10 rounded border border-white/10 shrink-0 shadow-inner"
                  style={getAdvancedMaterialStyle(c1, color.color2, color.colorType)}
                />
                <div>
                  <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">HSB Values</div>
                  <div className="text-sm font-mono font-bold tracking-tight">
                    {hsb1.h} {hsb1.s} {hsb1.b}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 bg-black/10 p-2 rounded-lg border border-white/5">
                  <div
                    className="w-8 h-8 rounded border border-white/10 shrink-0 shadow-inner"
                    style={getAdvancedMaterialStyle(c1, null, color.colorType)}
                  />
                  <div>
                    <div className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">Color 1</div>
                    <div className="text-xs font-mono font-bold tracking-tight">
                      {hsb1.h} {hsb1.s} {hsb1.b}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-black/10 p-2 rounded-lg border border-white/5">
                  <div
                    className="w-8 h-8 rounded border border-white/10 shrink-0 shadow-inner"
                    style={getAdvancedMaterialStyle(c2, null, color.colorType)}
                  />
                  <div>
                    <div className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">Color 2</div>
                    <div className="text-xs font-mono font-bold tracking-tight">
                      {hsb2.h} {hsb2.s} {hsb2.b}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Companion Mode Button (Mobile/Tablet Only) */}
          <div className="mt-6 pt-4 border-t border-gray-700/50 flex lg:hidden">
            <a
              href={`/companion?id=${encodeURIComponent(`${color.make}-${color.colorName}-${color.year || 'unknown'}`)}`}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-3 px-4 rounded-xl font-medium transition-colors"
              onClick={(e) => {
                // Let the native navigation happen
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v2"/><path d="M2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6"/><path d="M12 16v-4"/><path d="M8 16h8"/><path d="M10 22h4"/></svg>
              Enter Companion Mode
            </a>
          </div>
        </div>
      </div>
    </DialogShell>
  )
}

export default HSBPopup
