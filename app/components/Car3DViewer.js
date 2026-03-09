import React from 'react'

const Car3DViewer = ({ color, isDarkMode }) => {
  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
      <div className="text-center">
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          3D Car Viewer - Coming Soon
        </div>
      </div>
    </div>
  )
}

export default Car3DViewer
