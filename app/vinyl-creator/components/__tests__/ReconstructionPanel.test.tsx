/**
 * Component Tests for ReconstructionPanel
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ReconstructionPanel from '../ReconstructionPanel'
import { simpleStarDesign } from '../../data/examples'

describe('ReconstructionPanel', () => {
  const mockOnStepChange = jest.fn()
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderComponent = (currentStep = 0) => {
    return render(
      <ReconstructionPanel
        design={simpleStarDesign}
        currentStep={currentStep}
        onStepChange={mockOnStepChange}
        onClose={mockOnClose}
      />
    )
  }

  describe('Rendering', () => {
    it('should render reconstruction panel', () => {
      renderComponent()
      expect(screen.getByText(/Reconstruction/i)).toBeInTheDocument()
    })

    it('should display current step', () => {
      renderComponent(2)
      expect(screen.getByText(/Step 3/)).toBeInTheDocument()
    })
  })

  describe('Playback Controls', () => {
    it('should have play button', () => {
      renderComponent()
      expect(screen.getByText(/Play/i)).toBeInTheDocument()
    })

    it('should have reset button', () => {
      renderComponent()
      expect(screen.getByText(/Reset/i)).toBeInTheDocument()
    })

    it('should have loop toggle', () => {
      renderComponent()
      expect(screen.getByText(/Loop/i)).toBeInTheDocument()
    })
  })

  describe('Speed Control', () => {
    it('should display speed buttons', () => {
      renderComponent()
      expect(screen.getByText('0.5x')).toBeInTheDocument()
      expect(screen.getByText('1x')).toBeInTheDocument()
      expect(screen.getByText('2x')).toBeInTheDocument()
      expect(screen.getByText('4x')).toBeInTheDocument()
    })
  })

  describe('Close Button', () => {
    it('should have close button', () => {
      renderComponent()
      const closeButton = screen.getByText('✖')
      expect(closeButton).toBeInTheDocument()
    })

    it('should call onClose when close button clicked', () => {
      renderComponent()
      const closeButton = screen.getByText('✖')
      fireEvent.click(closeButton)
      expect(mockOnClose).toHaveBeenCalled()
    })
  })
})
