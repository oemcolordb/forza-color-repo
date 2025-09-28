'use client'

import React, { useState } from 'react'

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  isDarkMode: boolean
  icon?: string
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultOpen = true,
  isDarkMode,
  icon = '📁'
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={`rounded-lg border ${
      isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-white/50'
    } backdrop-blur-sm`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-4 text-left font-semibold transition-colors ${
          isDarkMode 
            ? 'text-white hover:bg-slate-700/50' 
            : 'text-gray-900 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span>{title}</span>
        </div>
        <div className={`flex items-center gap-2 text-sm font-bold ${
          isDarkMode ? 'text-slate-300' : 'text-gray-600'
        }`}>
          <span className="text-xs">{isOpen ? 'CLOSE' : 'OPEN'}</span>
          <span className={`transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}>
            ▼
          </span>
        </div>
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ${
        isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="p-4 pt-0">
          {children}
        </div>
      </div>
    </div>
  )
}

export default CollapsibleSection