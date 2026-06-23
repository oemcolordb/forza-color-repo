'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CarColor } from '@/types'
import { useWakeLock } from '@/hooks/useWakeLock'
import { ArrowLeft, Moon, Sun, MonitorSmartphone, Share2 } from 'lucide-react'
import { getAdvancedMaterialStyle } from '@/lib/utils/colorUtils'

interface CompanionViewProps {
  color: CarColor | null
  error?: string
  onNext?: () => void
  onPrev?: () => void
}

export default function CompanionView({ color, error, onNext, onPrev }: CompanionViewProps) {
  const { isSupported, isLocked, requestWakeLock, releaseWakeLock } = useWakeLock()
  const [copied, setCopied] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Minimum swipe distance
  const minSwipeDistance = 50

  const onTouchStartEvent = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMoveEvent = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEndEvent = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && onNext) {
      onNext()
    }
    if (isRightSwipe && onPrev) {
      onPrev()
    }
  }

  useEffect(() => {
    // Request wake lock when the component mounts
    if (isSupported) {
      requestWakeLock()
    }
    return () => {
      if (isSupported) {
        releaseWakeLock()
      }
    }
  }, [isSupported, requestWakeLock, releaseWakeLock])

  const copyToClipboard = () => {
    if (!color) return
    const text = `${color.make} ${color.colorName}
Type: ${color.colorType}
Base: H: ${Math.round(color.color1.h * 100) / 100}, S: ${Math.round(color.color1.s * 100) / 100}, B: ${Math.round(color.color1.b * 100) / 100}
${color.color2 ? `Flake: H: ${Math.round(color.color2.h * 100) / 100}, S: ${Math.round(color.color2.s * 100) / 100}, B: ${Math.round(color.color2.b * 100) / 100}` : ''}`
    
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (error || !color) {
    return (
      <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Color Not Found</h1>
        <p className="text-gray-400 mb-8 text-center">{error || "The requested color could not be loaded."}</p>
        <button 
          onClick={() => window.history.back()}
          className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-full flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={20} />
          Go Back
        </button>
      </div>
    )
  }

  const isDualTone = color.color2 !== undefined && color.color2 !== null

  return (
    <div 
      className="fixed inset-0 bg-black text-white overflow-y-auto overflow-x-hidden safe-area-pt pb-8 select-none"
      onTouchStart={onTouchStartEvent}
      onTouchMove={onTouchMoveEvent}
      onTouchEnd={onTouchEndEvent}
    >
      {/* Header Bar */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800 p-4 flex items-center justify-between">
        <button 
          onClick={() => window.history.back()}
          className="p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={24} />
          <span className="font-medium hidden sm:inline">Back</span>
        </button>
        
        <div className="flex items-center gap-3">
          {isSupported && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${isLocked ? 'bg-green-900/30 text-green-400 border-green-800/50' : 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50'}`}>
              <MonitorSmartphone size={14} />
              {isLocked ? 'Screen Awake' : 'May Sleep'}
            </div>
          )}
          <button 
            onClick={copyToClipboard}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
            title="Copy values"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {copied && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg z-50 text-sm font-medium"
          >
            Values copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-6 pt-6 pb-12 max-w-lg mx-auto">
        <div className="text-center mb-8 relative">
          <p className="text-gray-400 font-medium tracking-widest uppercase text-sm mb-2">{color.make}</p>
          
          <div className="flex items-center justify-center gap-4 mb-3">
            <button 
              onClick={onPrev}
              disabled={!onPrev}
              className={`p-2 rounded-full transition-colors ${onPrev ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'text-gray-800 cursor-not-allowed'}`}
              aria-label="Previous color"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight flex-1">
              {color.colorName}
            </h1>

            <button 
              onClick={onNext}
              disabled={!onNext}
              className={`p-2 rounded-full transition-colors ${onNext ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'text-gray-800 cursor-not-allowed'}`}
              aria-label="Next color"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
          
          <div className="inline-block bg-gray-800 text-gray-300 px-4 py-1.5 rounded-full text-sm font-medium border border-gray-700">
            {color.colorType}
          </div>
          
          {/* Swipe Hint */}
          {(onNext || onPrev) && (
            <div className="text-xs text-gray-500 mt-3 font-medium opacity-70">
              Swipe to browse more {color.make} colors
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Base Color Card */}
          <div className="bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl relative">
            <div 
              className="h-32 w-full"
              style={getAdvancedMaterialStyle(color.color1, color.color2, color.colorType)}
            />
            
            <div className="p-6">
              <h2 className="text-gray-400 font-medium text-sm tracking-widest uppercase mb-4 flex items-center justify-between">
                {isDualTone ? 'Base Color' : 'Color Values'}
                <div className="h-[1px] bg-gray-800 flex-grow ml-4"></div>
              </h2>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-gray-500 font-medium mb-1">H</span>
                  <span className="text-5xl sm:text-6xl font-bold text-white tracking-tighter">
                    {(Math.round(color.color1.h * 100) / 100).toFixed(2).replace(/^0+/, '')}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-gray-500 font-medium mb-1">S</span>
                  <span className="text-5xl sm:text-6xl font-bold text-white tracking-tighter">
                    {(Math.round(color.color1.s * 100) / 100).toFixed(2).replace(/^0+/, '')}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-gray-500 font-medium mb-1">B</span>
                  <span className="text-5xl sm:text-6xl font-bold text-white tracking-tighter">
                    {(Math.round(color.color1.b * 100) / 100).toFixed(2).replace(/^0+/, '')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Flake/Secondary Color Card */}
          {isDualTone && color.color2 && (
            <div className="bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl relative mt-6">
              <div 
                className="h-32 w-full"
                style={getAdvancedMaterialStyle(color.color2, null, color.colorType)}
              />
              
              <div className="p-6">
                <h2 className="text-gray-400 font-medium text-sm tracking-widest uppercase mb-4 flex items-center justify-between">
                  Flake / Highlight
                  <div className="h-[1px] bg-gray-800 flex-grow ml-4"></div>
                </h2>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-gray-500 font-medium mb-1">H</span>
                    <span className="text-5xl sm:text-6xl font-bold text-white tracking-tighter">
                      {(Math.round(color.color2.h * 100) / 100).toFixed(2).replace(/^0+/, '')}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-gray-500 font-medium mb-1">S</span>
                    <span className="text-5xl sm:text-6xl font-bold text-white tracking-tighter">
                      {(Math.round(color.color2.s * 100) / 100).toFixed(2).replace(/^0+/, '')}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-gray-500 font-medium mb-1">B</span>
                    <span className="text-5xl sm:text-6xl font-bold text-white tracking-tighter">
                      {(Math.round(color.color2.b * 100) / 100).toFixed(2).replace(/^0+/, '')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
