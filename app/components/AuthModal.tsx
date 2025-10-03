import React from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  isDarkMode: boolean
}

const AuthModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg p-6" onClick={e => e.stopPropagation()}>
          <h2 className="text-xl font-bold mb-4">Sign In</h2>
          <p className="text-gray-600 mb-4">Authentication coming soon</p>
          <button onClick={onClose} className="px-4 py-2 bg-blue-500 text-white rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthModal