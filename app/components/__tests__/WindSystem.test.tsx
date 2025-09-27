import React from 'react'
import { render, screen } from '@testing-library/react'
import WindSystem from '../WindSystem'

// Mock window dimensions
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1200,
})

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 800,
})

describe('WindSystem', () => {
  it('renders without crashing', () => {
    render(<WindSystem isDarkMode={true} />)
    // Component should render without throwing errors
  })

  it('renders with light mode', () => {
    render(<WindSystem isDarkMode={false} />)
    // Component should render without throwing errors
  })

  it('accepts intensity prop', () => {
    render(<WindSystem isDarkMode={true} intensity={0.5} />)
    // Component should render without throwing errors
  })

  it('renders wind indicators', () => {
    render(<WindSystem isDarkMode={true} />)
    
    // Should have wind direction and strength indicators
    const container = screen.getByRole('generic')
    expect(container).toBeInTheDocument()
  })
})