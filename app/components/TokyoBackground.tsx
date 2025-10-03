import React from 'react'

interface Props {
  isDarkMode: boolean
  getSecureAssetUrl: (url: string) => string
}

const TokyoBackground: React.FC<Props> = ({ isDarkMode }) => {
  return (
    <div className={`fixed inset-0 -z-10 ${
      isDarkMode ? 'bg-slate-900' : 'bg-gray-100'
    }`} />
  )
}

export default TokyoBackground