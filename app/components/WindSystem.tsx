import React from 'react'

interface WindSystemProps {
  isDarkMode: boolean
  intensity?: number
}

const WindSystem: React.FC<WindSystemProps> = ({ isDarkMode: _isDarkMode, intensity: _intensity = 1 }) => {
  return <div data-testid="wind-system" />
}

export default WindSystem
