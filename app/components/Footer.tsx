import React from 'react'

interface Props {
  isDarkMode: boolean
}

const Footer: React.FC<Props> = ({ isDarkMode }) => {
  return (
    <footer className={`mt-12 py-8 text-center ${
      isDarkMode ? 'text-slate-400' : 'text-gray-600'
    }`}>
      <p>© 2024 Forza Color Universe</p>
    </footer>
  )
}

export default Footer