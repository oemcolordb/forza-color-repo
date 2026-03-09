// Core Types
export interface CarColor {
  make: string
  model?: string
  year?: number | null
  colorName: string
  colorType?: string
  color1: HSBColor
  color2: HSBColor
  isGenerated?: boolean
  uniqueId?: string
}

// Re-export car types
export * from './car'
export * from './color'

export interface HSBColor {
  h: number
  s: number
  b: number
}

export interface ExtractedColor {
  rgb: [number, number, number]
  hsb: HSBColor
  percentage: number
  pixelCount?: number
  name: string
}

export interface ForzaColorMatch {
  extracted: ExtractedColor
  forza: CarColor
  similarity: number
}

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  screenWidth: number
  screenHeight: number
}

export interface User {
  id: string
  name: string
  email: string
}

// Component Props
export interface HeaderProps {
  isDarkMode: boolean
  onToggleTheme: () => void
  onShowAuth: () => void
}

export interface ImageColorExtractorProps {
  colors?: CarColor[]
  onColorsExtracted?: (colors: ExtractedColor[]) => void
  onColorsFound?: (matches: ForzaColorMatch[]) => void
  onColorSelect?: (color: CarColor) => void
  isDarkMode: boolean
  showTutorial?: boolean
  onTutorialClose?: () => void
  onImageUpload?: (file: File, dataUrl: string) => void
}

// Error Types
export interface AppError {
  message: string
  code?: string
  details?: unknown
}

// Cache Types
export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

export interface CacheManager {
  get<T>(key: string): T | null
  set<T>(key: string, data: T, ttl?: number): void
  clear(key?: string): void
  has(key: string): boolean
}
