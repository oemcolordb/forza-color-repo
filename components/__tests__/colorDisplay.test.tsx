import { getAdvancedMaterialStyle } from '@/lib/utils/colorUtils'

describe('colorUtils - getAdvancedMaterialStyle', () => {
  const dummyColor1 = { h: 0.1, s: 0.8, b: 0.9 }
  const dummyColor2 = { h: 0.2, s: 0.7, b: 0.8 }

  it('renders Matte style for all matte variations', () => {
    const types = ['Matte', 'matte', 'Two-Tone Matte', 'Two Tone Matte', 'Aluminum Matte']
    types.forEach(type => {
      const style = getAdvancedMaterialStyle(dummyColor1, dummyColor2, type)
      // Matte uses circular gradient at 50% 30%
      expect(style.backgroundImage).toContain('radial-gradient(circle at 50% 30%')
    })
  })

  it('renders Metal Flake style for flake, pearl, two-tone, metallic, semigloss, and chrome variations', () => {
    const types = [
      'Metal Flake',
      'metal flake',
      'Pearlescent',
      'pearlescent',
      'Pearl',
      'Two-Tone Polished',
      'Two-Tone Semigloss',
      'Two-Tone',
      'two-tone',
      'Two Tone Polished',
      'Two Tone Semi Gloss',
      'Metallic',
      'semigloss',
      'Semigloss',
      'Chrome',
      'Aluminum Polished',
      'Aluminum Brushed',
      'Aluminum Semigloss',
      'Brushed Aluminum'
    ]
    types.forEach(type => {
      const style = getAdvancedMaterialStyle(dummyColor1, dummyColor2, type)
      // Flake/Pearl/Two-Tone/Metallic/Chrome/Semigloss uses ellipse at 40% 35%
      expect(style.backgroundImage).toContain('radial-gradient(ellipse at 40% 35%')
    })
  })

  it('renders Carbon Fiber or Kevlar weave style for carbon/kevlar variations', () => {
    const types = ['Carbon Fiber', 'carbon fiber', 'Carbon Fibre Polished', 'Carbon Fibre', 'Kevlar']
    types.forEach(type => {
      const style = getAdvancedMaterialStyle(dummyColor1, dummyColor2, type)
      // Weave uses repeating-linear-gradient
      expect(style.backgroundImage).toContain('repeating-linear-gradient')
    })
  })

  it('renders Damascus Steel structured pattern style', () => {
    const types = ['Damascus Steel']
    types.forEach(type => {
      const style = getAdvancedMaterialStyle(dummyColor1, dummyColor2, type)
      expect(style.backgroundImage).toContain('repeating-linear-gradient(135deg')
    })
  })

  it('renders Normal style for standard gloss and unrecognized types', () => {
    const types = ['Normal', 'Gloss', 'Solid', 'Body', 'VIP Body', 'Brake Caliper', 'Wheel', '']
    types.forEach(type => {
      const style = getAdvancedMaterialStyle(dummyColor1, dummyColor2, type)
      // Normal uses linear-gradient(105deg) without radial gradient
      expect(style.backgroundImage).not.toContain('radial-gradient')
      expect(style.backgroundImage).toContain('linear-gradient(105deg')
    })
  })
})
