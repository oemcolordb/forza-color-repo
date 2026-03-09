import { render, screen, fireEvent } from '@testing-library/react'
import ColorCard from '../ColorCard'
import type { CarColor } from '../../types/color'

const mockColor: CarColor = {
  make: 'Ferrari',
  model: 'F40',
  year: 1987,
  colorName: 'Rosso Corsa',
  colorType: 'Normal',
  color1: { h: 0, s: 0.8, b: 0.9 },
  color2: { h: 0, s: 0.8, b: 0.9 },
}

const mockOnSelect = jest.fn()
const mockOnToggleFavorite = jest.fn()

describe('ColorCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders color information correctly', () => {
    render(
      <ColorCard
        color={mockColor}
        onSelect={mockOnSelect}
        onToggleFavorite={mockOnToggleFavorite}
        isDarkMode={true}
      />
    )

    expect(screen.getByText('Rosso Corsa')).toBeInTheDocument()
    expect(screen.getByText('Ferrari F40 (1987)')).toBeInTheDocument()
    expect(screen.getByText('Normal')).toBeInTheDocument()
  })

  it('calls onSelect when info button is clicked', () => {
    render(
      <ColorCard
        color={mockColor}
        onSelect={mockOnSelect}
        onToggleFavorite={mockOnToggleFavorite}
        isDarkMode={true}
      />
    )

    const infoButton = screen.getByLabelText('Learn more about Rosso Corsa')
    fireEvent.click(infoButton)

    expect(mockOnSelect).toHaveBeenCalledWith(mockColor)
  })

  it('calls onToggleFavorite when favorite button is clicked', () => {
    render(
      <ColorCard
        color={mockColor}
        onSelect={mockOnSelect}
        onToggleFavorite={mockOnToggleFavorite}
        isFavorite={false}
        isDarkMode={true}
      />
    )

    const favoriteButton = screen.getByLabelText('Add to favorites')
    fireEvent.click(favoriteButton)

    expect(mockOnToggleFavorite).toHaveBeenCalled()
  })

  it('shows correct favorite icon based on isFavorite prop', () => {
    const { rerender } = render(
      <ColorCard
        color={mockColor}
        onSelect={mockOnSelect}
        onToggleFavorite={mockOnToggleFavorite}
        isFavorite={false}
        isDarkMode={true}
      />
    )

    expect(screen.getByLabelText('Add to favorites')).toBeInTheDocument()

    rerender(
      <ColorCard
        color={mockColor}
        onSelect={mockOnSelect}
        onToggleFavorite={mockOnToggleFavorite}
        isFavorite={true}
        isDarkMode={true}
      />
    )

    expect(screen.getByLabelText('Remove from favorites')).toBeInTheDocument()
  })

  it('handles color without model and year', () => {
    const colorWithoutModelYear: CarColor = {
      ...mockColor,
      model: '',
      year: null,
    }

    render(
      <ColorCard
        color={colorWithoutModelYear}
        onSelect={mockOnSelect}
        onToggleFavorite={mockOnToggleFavorite}
        isDarkMode={true}
      />
    )

    expect(screen.getByText('Ferrari')).toBeInTheDocument()
    expect(screen.queryByText('F40')).not.toBeInTheDocument()
    expect(screen.queryByText('1987')).not.toBeInTheDocument()
  })

  it('applies correct theme classes', () => {
    const { container, rerender } = render(
      <ColorCard
        color={mockColor}
        onSelect={mockOnSelect}
        onToggleFavorite={mockOnToggleFavorite}
        isDarkMode={true}
      />
    )

    expect(container.firstChild).toHaveClass('bg-slate-800/80')

    rerender(
      <ColorCard
        color={mockColor}
        onSelect={mockOnSelect}
        onToggleFavorite={mockOnToggleFavorite}
        isDarkMode={false}
      />
    )

    expect(container.firstChild).toHaveClass('bg-white')
  })
})
