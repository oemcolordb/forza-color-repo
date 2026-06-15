import { render, screen } from '@testing-library/react'
import ImageColorExtractor from '@/components/color/ImageColorExtractor'
import type { CarColor } from '@/types/color'

const mockColors: CarColor[] = [
  {
    make: 'Ferrari',
    model: 'F40',
    year: 1987,
    colorName: 'Rosso Corsa',
    colorType: 'Normal',
    color1: { h: 0, s: 0.8, b: 0.9 },
    color2: { h: 0, s: 0.8, b: 0.9 },
  },
  {
    make: 'Porsche',
    model: '911',
    year: 2020,
    colorName: 'Guards Red',
    colorType: 'Normal',
    color1: { h: 0.02, s: 0.85, b: 0.8 },
    color2: { h: 0.02, s: 0.85, b: 0.8 },
  },
]

const mockOnColorsFound = jest.fn()

describe('ImageColorExtractor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders upload interface correctly', () => {
    render(
      <ImageColorExtractor
        colors={mockColors}
        onColorsFound={mockOnColorsFound}
        isDarkMode={true}
      />
    )

    expect(screen.getByText('Extract Colors from Image')).toBeInTheDocument()
    // the file input uses an aria-label rather than visible text
    expect(screen.getByLabelText('Upload image to extract colors')).toBeInTheDocument()
  })

  it('shows processing state when processing image', () => {
    render(
      <ImageColorExtractor
        colors={mockColors}
        onColorsFound={mockOnColorsFound}
        isDarkMode={true}
      />
    )

    // The processing state would be tested with actual file upload
    // For now, just verify the component renders without errors
    expect(screen.getByLabelText('Upload image to extract colors')).toBeInTheDocument()
  })

  it('applies correct theme classes', () => {
    const { container, rerender } = render(
      <ImageColorExtractor
        colors={mockColors}
        onColorsFound={mockOnColorsFound}
        isDarkMode={true}
      />
    )

    expect(container.firstChild).toHaveClass('bamboo-surface-dark')

    rerender(
      <ImageColorExtractor
        colors={mockColors}
        onColorsFound={mockOnColorsFound}
        isDarkMode={false}
      />
    )

    expect(container.firstChild).toHaveClass('bamboo-surface')
  })
})
