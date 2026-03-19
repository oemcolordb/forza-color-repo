import { VinylDesign } from '../types/vinyl'
import { simpleStarDesign, complexCarDesign } from './examples'

// Export the example designs as presets
export const SAMPLE_STAR: VinylDesign = simpleStarDesign

export const SAMPLE_CAR: VinylDesign = complexCarDesign

export const SAMPLE_ANIMAL: VinylDesign = {
  id: 'fox-complex',
  name: 'Fox Silhouette',
  description: 'Complex fox design with 40+ layered shapes',
  complexity: 'complex',
  shapes: [
    {
      id: 'fox-body',
      name: 'Body Base',
      role: 'base',
      layer: 0,
      color: '#FF6B35',
      pathData: 'M200,200 Q180,220 180,280 Q180,350 220,380 Q260,395 300,390 Q340,395 380,380 Q420,350 420,280 Q420,220 400,200 Q300,180 200,200 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 1,
    },
    {
      id: 'fox-head',
      name: 'Head',
      role: 'base',
      layer: 1,
      color: '#FF6B35',
      pathData: 'M300,120 Q250,110 230,140 Q220,150 220,170 Q220,190 240,200 Q260,205 300,210 Q340,205 360,200 Q380,190 380,170 Q380,150 370,140 Q350,110 300,120 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 1,
    },
    {
      id: 'fox-ear-left',
      name: 'Left Ear',
      role: 'base',
      layer: 1,
      color: '#FF6B35',
      pathData: 'M240,100 L220,60 L250,110 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 1,
    },
    {
      id: 'fox-ear-right',
      name: 'Right Ear',
      role: 'base',
      layer: 1,
      color: '#FF6B35',
      pathData: 'M360,100 L380,60 L350,110 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 1,
    },
    {
      id: 'fox-snout',
      name: 'Snout',
      role: 'detail',
      layer: 2,
      color: '#FFE5CC',
      pathData: 'M280,160 Q270,175 290,185 Q300,186 310,185 Q330,175 320,160 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 1,
    },
    {
      id: 'fox-eye-left',
      name: 'Left Eye',
      role: 'detail',
      layer: 2,
      color: '#000000',
      pathData: 'M270,145 Q260,140 265,150 Q270,155 275,150 Q280,140 270,145 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 1,
    },
    {
      id: 'fox-eye-right',
      name: 'Right Eye',
      role: 'detail',
      layer: 2,
      color: '#000000',
      pathData: 'M325,145 Q315,140 320,150 Q325,155 330,150 Q335,140 325,145 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 1,
    },
    {
      id: 'fox-tail-main',
      name: 'Tail Main',
      role: 'accent',
      layer: 0,
      color: '#FF6B35',
      pathData: 'M420,280 Q480,250 490,150 Q495,100 480,80 Q470,75 460,85 Q475,105 470,150 Q460,240 410,290 Z',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      opacity: 1,
    },
  ],
  buildOrder: [
    'fox-body',
    'fox-tail-main',
    'fox-head',
    'fox-ear-left',
    'fox-ear-right',
    'fox-snout',
    'fox-eye-left',
    'fox-eye-right',
  ],
}

// Export all presets as array
export const ALL_PRESETS = [SAMPLE_STAR, SAMPLE_CAR, SAMPLE_ANIMAL]
