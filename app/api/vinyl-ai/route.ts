import { NextResponse } from 'next/server'
import { VinylDesign, Shape, ShapeRole } from '@/app/vinyl-creator/types/vinyl'

// Simple SVG shape generators for common design elements
let shapeIdCounter = 0

const SHAPE_LIBRARY = {
  flame: (x: number, y: number, color: string, scale: number = 1): Shape => ({
    id: `flame-${++shapeIdCounter}`,
    name: 'Flame',
    role: 'base' as ShapeRole,
    layer: 0,
    color,
    pathData: `M${x},${y + 40 * scale} Q${x - 20 * scale},${y + 20 * scale} ${x - 15 * scale},${y - 10 * scale} Q${x},${y - 30 * scale} ${x + 15 * scale},${y - 10 * scale} Q${x + 20 * scale},${y + 20 * scale} ${x},${y + 40 * scale}`,
    transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
    opacity: 1,
  }),

  star: (x: number, y: number, color: string, points: number = 5, scale: number = 1): Shape => {
    const angle = (Math.PI * 2) / points
    let pathData = ''
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? 30 * scale : 15 * scale
      const px = x + r * Math.cos(i * angle - Math.PI / 2)
      const py = y + r * Math.sin(i * angle - Math.PI / 2)
      pathData += (i === 0 ? 'M' : 'L') + px + ',' + py
    }
    pathData += 'Z'
    return {
      id: `star-${++shapeIdCounter}`,
      name: 'Star',
      role: 'base' as ShapeRole,
      layer: 0,
      color,
      pathData,
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 1,
    }
  },

  circle: (x: number, y: number, color: string, radius: number = 20): Shape => ({
    id: `circle-${++shapeIdCounter}`,
    name: 'Circle',
    role: 'base' as ShapeRole,
    layer: 0,
    color,
    pathData: `M${x - radius},${y} A${radius},${radius} 0 1,0 ${x + radius},${y} A${radius},${radius} 0 1,0 ${x - radius},${y}`,
    transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
    opacity: 1,
  }),

  triangle: (x: number, y: number, color: string, size: number = 30): Shape => ({
    id: `triangle-${++shapeIdCounter}`,
    name: 'Triangle',
    role: 'base' as ShapeRole,
    layer: 0,
    color,
    pathData: `M${x},${y - size} L${x - size},${y + size} L${x + size},${y + size} Z`,
    transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
    opacity: 1,
  }),

  curve: (x: number, y: number, color: string, role: ShapeRole = 'accent'): Shape => ({
    id: `curve-${++shapeIdCounter}`,
    name: 'Curve',
    role,
    layer: 1,
    color,
    pathData: `M${x},${y} Q${x + 40},${y - 20} ${x + 80},${y}`,
    transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
    opacity: 0.8,
  }),
}

// Simple keyword-to-design mapper
function generateDesignFromPrompt(prompt: string): VinylDesign {
  const lowerPrompt = prompt.toLowerCase()

  // Color extraction - simple heuristics
  let baseColor = '#FF6B35'
  if (lowerPrompt.includes('gold') || lowerPrompt.includes('yellow')) baseColor = '#FFD700'
  if (lowerPrompt.includes('blue')) baseColor = '#0066FF'
  if (lowerPrompt.includes('red') || lowerPrompt.includes('fire')) baseColor = '#FF0000'
  if (lowerPrompt.includes('purple')) baseColor = '#9933FF'
  if (lowerPrompt.includes('black') || lowerPrompt.includes('dark')) baseColor = '#1a1a1a'
  if (lowerPrompt.includes('white') || lowerPrompt.includes('silver')) baseColor = '#EEEEEE'

  let accentColor = '#FFA500'
  if (lowerPrompt.includes('highlight')) accentColor = '#FFFF00'
  if (lowerPrompt.includes('shadow')) accentColor = '#333333'

  const shapes: Shape[] = []
  let layerIndex = 0
  const buildOrder: string[] = []

  // Phoenix/bird/wings
  if (
    lowerPrompt.includes('phoenix') ||
    lowerPrompt.includes('bird') ||
    lowerPrompt.includes('eagle') ||
    lowerPrompt.includes('wings')
  ) {
    // Left wing
    shapes.push({
      id: 'wing-left',
      name: 'Left Wing',
      role: 'base',
      layer: layerIndex++,
      color: baseColor,
      pathData: 'M150,200 Q80,150 50,100 Q100,120 150,150 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 1,
    })
    buildOrder.push('wing-left')

    // Right wing
    shapes.push({
      id: 'wing-right',
      name: 'Right Wing',
      role: 'base',
      layer: layerIndex++,
      color: baseColor,
      pathData: 'M300,200 Q370,150 400,100 Q350,120 300,150 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 1,
    })
    buildOrder.push('wing-right')

    // Body
    shapes.push(
      SHAPE_LIBRARY.circle(250, 240, baseColor, 35)
    )
    buildOrder.push(shapes[shapes.length - 1].id)

    // Detail accent
    shapes.push(
      SHAPE_LIBRARY.star(250, 160, accentColor, 5, 0.6)
    )
    buildOrder.push(shapes[shapes.length - 1].id)
  }

  // Dragon/reptile
  else if (lowerPrompt.includes('dragon') || lowerPrompt.includes('reptile')) {
    shapes.push(
      SHAPE_LIBRARY.triangle(200, 150, baseColor, 40)
    )
    buildOrder.push(shapes[shapes.length - 1].id)

    shapes.push(
      SHAPE_LIBRARY.circle(250, 220, baseColor, 30)
    )
    buildOrder.push(shapes[shapes.length - 1].id)

    shapes.push(
      SHAPE_LIBRARY.circle(300, 200, baseColor, 25)
    )
    buildOrder.push(shapes[shapes.length - 1].id)

    shapes.push(
      SHAPE_LIBRARY.curve(280, 160, accentColor, 'accent')
    )
    buildOrder.push(shapes[shapes.length - 1].id)
  }

  // Geometric/mandala
  else if (
    lowerPrompt.includes('geometric') ||
    lowerPrompt.includes('mandala') ||
    lowerPrompt.includes('pattern')
  ) {
    const numRings = 3
    for (let i = 0; i < numRings; i++) {
      const radius = 20 + i * 20
      shapes.push(
        SHAPE_LIBRARY.circle(250, 250, i % 2 === 0 ? baseColor : accentColor, radius)
      )
      buildOrder.push(shapes[shapes.length - 1].id)

      for (let j = 0; j < 4; j++) {
        const angle = (j / 4) * Math.PI * 2
        const x = 250 + Math.cos(angle) * (radius + 15)
        const y = 250 + Math.sin(angle) * (radius + 15)
        shapes.push({
          id: `geo-point-${i}-${j}`,
          name: `Geometric ${i}-${j}`,
          role: 'detail',
          layer: layerIndex++,
          color: accentColor,
          pathData: `M${x - 5},${y} L${x + 5},${y} M${x},${y - 5} L${x},${y + 5}`,
          transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
          opacity: 0.7,
        })
        buildOrder.push(shapes[shapes.length - 1].id)
      }
    }
  }

  // Tribal
  else if (lowerPrompt.includes('tribal')) {
    shapes.push(
      SHAPE_LIBRARY.triangle(250, 200, baseColor, 50)
    )
    buildOrder.push(shapes[shapes.length - 1].id)

    shapes.push(
      SHAPE_LIBRARY.curve(250, 150, accentColor, 'accent')
    )
    buildOrder.push(shapes[shapes.length - 1].id)

    shapes.push(
      SHAPE_LIBRARY.curve(250, 280, accentColor, 'accent')
    )
    buildOrder.push(shapes[shapes.length - 1].id)
  }

  // Default: creative mix
  else {
    shapes.push(SHAPE_LIBRARY.star(200, 200, baseColor, 5, 1.2))
    buildOrder.push(shapes[shapes.length - 1].id)

    shapes.push(SHAPE_LIBRARY.circle(320, 240, accentColor, 25))
    buildOrder.push(shapes[shapes.length - 1].id)

    shapes.push(
      SHAPE_LIBRARY.curve(250, 280, accentColor, 'highlight')
    )
    buildOrder.push(shapes[shapes.length - 1].id)
  }

  // Add some shadows and highlights
  if (shapes.length > 0) {
    shapes.push({
      id: 'shadow-base',
      name: 'Shadow',
      role: 'shadow',
      layer: layerIndex++,
      color: '#333333',
      pathData: 'M150,320 Q250,330 350,320 L350,330 Q250,340 150,330 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 0.3,
    })
    buildOrder.push('shadow-base')

    shapes.push({
      id: 'highlight-accent',
      name: 'Highlight',
      role: 'highlight',
      layer: layerIndex++,
      color: '#FFFFFF',
      pathData: 'M200,180 Q220,170 240,180 L220,200 Q210,195 200,200 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 0.4,
    })
    buildOrder.push('highlight-accent')
  }

  const complexity =
    shapes.length > 30 ? ('complex' as const) : shapes.length > 10 ? ('medium' as const) : ('simple' as const)

  return {
    id: `ai-design-${Date.now()}`,
    name: `AI Design: ${prompt.substring(0, 30)}`,
    description: `Generated from: "${prompt}"`,
    shapes,
    buildOrder,
    complexity,
  }
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Reset counter for each request to avoid ID collisions
    shapeIdCounter = 0

    // Generate design based on prompt
    const design = generateDesignFromPrompt(prompt)

    // Validate design
    if (!design.shapes || design.shapes.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate shape data' },
        { status: 500 }
      )
    }

    if (!design.buildOrder || design.buildOrder.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate build order' },
        { status: 500 }
      )
    }

    return NextResponse.json(design)
  } catch (error) {
    console.error('Vinyl AI error:', error)
    return NextResponse.json(
      { error: 'Failed to generate vinyl design' },
      { status: 500 }
    )
  }
}
