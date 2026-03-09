import React, { useState } from 'react'

const CollapsibleSection = ({ title, children, defaultOpen = false, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={`border rounded-lg ${isDarkMode ? 'border-slate-600' : 'border-gray-300'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-4 text-left flex justify-between items-center ${
          isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-50'
        }`}
      >
        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && (
        <div className={`p-4 border-t ${isDarkMode ? 'border-slate-600' : 'border-gray-300'}`}>
          {children}
        </div>
      )}
    </div>
  )
}

export default CollapsibleSection
