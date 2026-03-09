// Web Worker for color generation
import { CarColor } from '../types'

interface GenerationMessage {
  type: 'generate'
  colors: CarColor[]
  generationType: 'hue' | 'brightness' | 'saturation' | 'finishes'
  maxColors: number
}

self.onmessage = function (e: MessageEvent<GenerationMessage>) {
  const { colors, generationType, maxColors } = e.data

  const newColors: CarColor[] = []
  let colorCount = 0

  try {
    for (let i = 0; i < colors.length && colorCount < maxColors; i++) {
      const color = colors[i]

      switch (generationType) {
        case 'hue':
          for (let j = 1; j <= 24 && colorCount < maxColors; j++) {
            const hueShift = j / 24
            const newHsb = { ...color.color1, h: (color.color1.h + hueShift) % 1 }

            newColors.push({
              ...color,
              colorName: `${color.colorName} H${j * 15}°`,
              make: `${color.make} Generated`,
              color1: newHsb,
              color2: { ...color.color2, h: (color.color2.h + hueShift) % 1 },
              colorType: 'Hue Variant',
              isGenerated: true,
              uniqueId: `${i}_${j}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            })
            colorCount++
          }
          break

        case 'brightness':
          for (let j = 1; j <= 20 && colorCount < maxColors; j++) {
            const brightnessMult = 0.1 + j * 0.045
            const newHsb = { ...color.color1, b: Math.min(1, color.color1.b * brightnessMult) }

            newColors.push({
              ...color,
              colorName: `${color.colorName} B${Math.round(brightnessMult * 100)}%`,
              make: `${color.make} Generated`,
              color1: newHsb,
              color2: { ...color.color2, b: Math.min(1, color.color2.b * brightnessMult) },
              colorType: 'Brightness Variant',
              isGenerated: true,
              uniqueId: `${i}_${j}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            })
            colorCount++
          }
          break

        case 'saturation':
          for (let j = 1; j <= 20 && colorCount < maxColors; j++) {
            const satMult = 0.05 + j * 0.0475
            const newHsb = { ...color.color1, s: Math.min(1, color.color1.s * satMult) }

            newColors.push({
              ...color,
              colorName: `${color.colorName} S${Math.round(satMult * 100)}%`,
              make: `${color.make} Generated`,
              color1: newHsb,
              color2: { ...color.color2, s: Math.min(1, color.color2.s * satMult) },
              colorType: 'Saturation Variant',
              isGenerated: true,
              uniqueId: `${i}_${j}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            })
            colorCount++
          }
          break

        case 'finishes':
          const finishes = [
            { name: 'Matte', s: 0.6, b: 0.8 },
            { name: 'Chrome', s: 0.7, b: 1.3 },
            { name: 'Metallic', s: 0.9, b: 1.15 },
          ]

          finishes.forEach((finish, finishIndex) => {
            for (let j = 1; j <= 10 && colorCount < maxColors; j++) {
              const intensity = 0.3 + j * 0.07

              const newHsb =
                finish.name === 'Chrome'
                  ? {
                      ...color.color1,
                      s: Math.min(1, Math.max(0.2, color.color1.s * finish.s * intensity)),
                      b: Math.min(1, color.color1.b * finish.b * intensity),
                    }
                  : {
                      ...color.color1,
                      s: Math.min(1, color.color1.s * finish.s * intensity),
                      b: Math.min(1, color.color1.b * finish.b * intensity),
                    }

              newColors.push({
                ...color,
                colorName: `${color.colorName} ${finish.name} ${Math.round(intensity * 100)}%`,
                make: `${color.make} Generated`,
                color1: newHsb,
                color2: { ...color.color2, s: newHsb.s, b: newHsb.b },
                colorType: finish.name,
                isGenerated: true,
                uniqueId: `${i}_${finishIndex}_${j}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              })
              colorCount++
            }
          })
          break
      }

      if (i % 100 === 0) {
        self.postMessage({
          type: 'progress',
          progress: (i / colors.length) * 100,
          generated: colorCount,
        })
      }
    }

    self.postMessage({ type: 'complete', colors: newColors })
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
