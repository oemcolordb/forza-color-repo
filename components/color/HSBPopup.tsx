'use client'

import React from 'react'
import { CarColor } from '@/types'
import DialogShell from '@/components/ui/DialogShell'
import Button from '@/components/ui/Button'

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

const HSBPopup: React.FC<HSBPopupProps> = ({ color, isOpen, onClose, isDarkMode }) => {
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null)

  if (!isOpen || !color) return null

  const hsb1 = { h: color.color1.h.toFixed(2), s: color.color1.s.toFixed(2), b: color.color1.b.toFixed(2) }
  const hsb2 = { h: color.color2.h.toFixed(2), s: color.color2.s.toFixed(2), b: color.color2.b.toFixed(2) }

  return (
    <DialogShell
      isOpen={isOpen}
      onClose={onClose}
      titleId="hsb-popup-title"
      initialFocusRef={closeButtonRef}
      overlayClassName="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50"
      panelClassName={`p-4 rounded-lg max-w-sm w-full mx-4 shadow-2xl border-2 ${
        isDarkMode ? 'bamboo-surface-dark text-white' : 'bamboo-surface text-gray-900'
      }`}
    >
      <div onTouchStart={e => e.stopPropagation()} style={{ zIndex: 1000000 }}>
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

        <div className="space-y-3">
          <div>
            <div className="font-medium text-sm">{color.colorName}</div>
            <div className="text-xs opacity-75">{color.make}</div>
            {color.colorType && (
              <div className="text-[10px] text-gray-400 opacity-90 uppercase tracking-wider font-semibold mt-1">
                {color.colorType}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {hsb1.h === hsb2.h && hsb1.s === hsb2.s && hsb1.b === hsb2.b ? (
              <div>
                <div className="text-sm font-medium mb-2">Color</div>
                <div
                  className="w-full h-8 rounded border mb-2"
                  style={{ backgroundColor: hsbToRgbStr(color.color1.h, color.color1.s, color.color1.b) }}
                />
                <div className="text-sm font-mono">
                  {hsb1.h} {hsb1.s} {hsb1.b}
                </div>
              </div>
            ) : (
              <>
                <div>
                  <div className="text-sm font-medium mb-2">Color 1</div>
                  <div
                    className="w-full h-8 rounded border mb-2"
                    style={{ backgroundColor: hsbToRgbStr(color.color1.h, color.color1.s, color.color1.b) }}
                  />
                  <div className="text-sm font-mono">
                    {hsb1.h} {hsb1.s} {hsb1.b}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Color 2</div>
                  <div
                    className="w-full h-8 rounded border mb-2"
                    style={{ backgroundColor: hsbToRgbStr(color.color2.h, color.color2.s, color.color2.b) }}
                  />
                  <div className="text-sm font-mono">
                    {hsb2.h} {hsb2.s} {hsb2.b}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DialogShell>
  )
}

export default HSBPopup
