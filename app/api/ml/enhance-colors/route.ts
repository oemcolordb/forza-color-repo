import { NextRequest, NextResponse } from 'next/server'
import { checkBotId } from '@/botid/server'

interface ExtractedColor {
  rgb: [number, number, number]
  hsb: { h: number; s: number; b: number }
  percentage: number
  name?: string
}

export async function POST(request: NextRequest) {
  try {
    const botCheck = await checkBotId()
    if (botCheck.isBot) return NextResponse.json({ error: 'Access denied' }, { status: 403 })

    const { colors } = await request.json()

    if (!colors || !Array.isArray(colors)) {
      return NextResponse.json({ error: 'Invalid colors data' }, { status: 400 })
    }

    const enhancedColors = enhanceColors(colors)

    return NextResponse.json({ colors: enhancedColors })
  } catch (error) {
    console.error('Color enhancement error:', error)
    return NextResponse.json({ error: 'Enhancement failed' }, { status: 500 })
  }
}

function enhanceColors(colors: ExtractedColor[]): ExtractedColor[] {
  const clusters: ExtractedColor[][] = []
  const threshold = 30
  const maxClusters = 10

  for (const color of colors) {
    if (clusters.length >= maxClusters) break

    let bestCluster: ExtractedColor[] | null = null
    let minDistance = threshold

    for (const cluster of clusters) {
      const distance = calculateRGBDistance(color.rgb, cluster[0].rgb)
      if (distance < minDistance) {
        minDistance = distance
        bestCluster = cluster
      }
    }

    if (bestCluster) {
      bestCluster.push(color)
    } else {
      clusters.push([color])
    }
  }

  return clusters
    .map(cluster => {
      const avgR = Math.round(cluster.reduce((sum, c) => sum + c.rgb[0], 0) / cluster.length)
      const avgG = Math.round(cluster.reduce((sum, c) => sum + c.rgb[1], 0) / cluster.length)
      const avgB = Math.round(cluster.reduce((sum, c) => sum + c.rgb[2], 0) / cluster.length)

      const totalPercentage = cluster.reduce((sum, c) => sum + c.percentage, 0)

      return {
        rgb: [avgR, avgG, avgB] as [number, number, number],
        hsb: rgbToHsb(avgR, avgG, avgB),
        percentage: Math.round(totalPercentage * 100) / 100,
        name: predictColorName(avgR, avgG, avgB),
      }
    })
    .sort((a, b) => b.percentage - a.percentage)
}

function calculateRGBDistance(
  rgb1: [number, number, number],
  rgb2: [number, number, number]
): number {
  const [r1, g1, b1] = rgb1
  const [r2, g2, b2] = rgb2
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
}

function rgbToHsb(r: number, g: number, b: number) {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min

  let h = 0
  if (diff !== 0) {
    if (max === r) h = ((g - b) / diff) % 6
    else if (max === g) h = (b - r) / diff + 2
    else h = (r - g) / diff + 4
  }
  h = Math.round(h * 60)
  if (h < 0) h += 360

  const s = max === 0 ? 0 : diff / max
  const brightness = max

  return {
    h: h / 360,
    s: Math.round(s * 100) / 100,
    b: Math.round(brightness * 100) / 100,
  }
}

function predictColorName(r: number, g: number, b: number): string {
  const { h, s, b: brightness } = rgbToHsb(r, g, b)
  const hDeg = h * 360

  if (s < 0.1) {
    if (brightness < 0.2) return 'Black'
    if (brightness < 0.5) return 'Gray'
    return 'White'
  }

  if (hDeg < 15 || hDeg >= 345) return 'Red'
  if (hDeg < 45) return 'Orange'
  if (hDeg < 75) return 'Yellow'
  if (hDeg < 150) return 'Green'
  if (hDeg < 210) return 'Cyan'
  if (hDeg < 270) return 'Blue'
  if (hDeg < 330) return 'Magenta'
  return 'Red'
}
