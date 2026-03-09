import React from 'react'

const OfflineIndicator = ({ isOnline }) => {
  if (isOnline) return null

  return (
    <div className="fixed top-4 right-4 bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg z-50">
      📡 Offline Mode
    </div>
  )
}

export default OfflineIndicator
