'use client'

import React from 'react'
import { CarColor } from '../types'
import DialogShell from './ui/DialogShell'
import Button from './ui/Button'
import { hsbToCSS } from '../lib/colorUtils'

interface HSBPopupProps {
  color: CarColor | null
  isOpen: boolean
  onClose: () => void
  isDarkMode: boolean
}

const HSBPopup: React.FC<HSBPopupProps> = ({ color, isOpen, onClose, isDarkMode }) => {
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null)

  // Debug logging
  React.useEffect(() => {
    if (color) {
      console.log('HSBPopup color:', {
        colorName: color.colorName,
        make: color.make,
        colorType: color.colorType,
        hasColorType: !!color.colorType
      })
    }
  }, [color])

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
      panelClassName={`p-4 rounded-lg max-w-sm w-full mx-4 shadow-2xl border-2 ${isDarkMode ? 'bamboo-surface-dark text-white' : 'bamboo-surface text-gray-900'
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
            <div className="text-xs opacity-75">{color.make}{color.colorType ? ` • ${color.colorType}` : ''}</div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium mb-2">Color 1</div>
              <div
                className="w-full h-8 rounded border mb-2"
                style={{ backgroundColor: hsbToCSS(color.color1) }}
              />
              <div className="text-sm font-mono">
                {hsb1.h} {hsb1.s} {hsb1.b}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Color 2</div>
              <div
                className="w-full h-8 rounded border mb-2"
                style={{ backgroundColor: hsbToCSS(color.color2) }}
              />
              <div className="text-sm font-mono">
                {hsb2.h} {hsb2.s} {hsb2.b}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogShell>
  )
}

export default HSBPopup
