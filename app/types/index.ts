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

// Theme
export type AppTheme = 'light' | 'dark' | 'nfs'

// Component Props
export interface HeaderProps {
  isDarkMode: boolean
  theme: AppTheme
  onToggleTheme: () => void
  colorCount?: number
  manufacturerCount?: number
  gameLabel?: string
  searchQuery: string
  onSearchChange: (_value: string) => void
  selectedMake: string
  onMakeChange: (_value: string) => void
  selectedColorType: string
  onColorTypeChange: (_value: string) => void
  selectedYear: string
  onYearChange: (_value: string) => void
  years: string[]
  sortBy: 'newest' | 'az' | 'random'
  onSortChange: (_value: 'newest' | 'az' | 'random') => void
  makes: string[]
  colorTypes: string[]
  favoritesCount?: number
  showFavoritesOnly: boolean
  onToggleShowFavoritesOnly: () => void
  onClearFilters: () => void
}

export interface ImageColorExtractorProps {
  colors?: CarColor[]
  onColorsExtracted?: (_colors: ExtractedColor[]) => void
  onColorsFound?: (_matches: ForzaColorMatch[]) => void
  onColorSelect?: (_color: CarColor) => void
  isDarkMode: boolean
  showTutorial?: boolean
  onTutorialClose?: () => void
  onImageUpload?: (_file: File, _dataUrl: string) => void
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
  get<T>(_key: string): T | null
  set<T>(_key: string, _data: T, _ttl?: number): void
  clear(_key?: string): void
  has(_key: string): boolean
}
