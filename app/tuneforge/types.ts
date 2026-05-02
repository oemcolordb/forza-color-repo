// TuneForge shared types

export interface Car {
  year: string
  manufacturer: string
  model: string
  type: string
  price: number
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary'
  country: string
  stats: {
    speed: number
    handling: number
    acceleration: number
    launch: number
    braking: number
    offroad: number
  }
  pi: {
    class: 'D' | 'C' | 'B' | 'A' | 'S1' | 'S2' | 'X'
    value: number
  }
  fullName?: string
  drivetrain?: string
  weight?: number
  engine?: {
    displacement: number
    cylinders: number
    aspiration: string
    horsepower: number
  }
  tags?: string[]
}

export interface TuneData {
  [key: string]: number
}

export interface SavedTune {
  id: string
  name: string
  carFullName: string
  carData: Car
  tune: TuneData
  timestamp: number
  version: string
}

export interface CommunityTune {
  id: string
  car_make: string
  car_model: string
  tune_name: string
  tuner_name: string
  share_code: string | null
  discipline: string
  pi_class: string | null
  pi_value: number | null
  tune_data: string
  votes: number
  created_at: string
}

export type DrivingStyle = 'smooth' | 'balanced' | 'aggressive' | 'drift'
export type DrivetrainType = 'AWD' | 'RWD' | 'FWD'
export type SpringUnit = 'lbf/in' | 'N/mm' | 'kgf/mm'
export type ActiveTab = 'quick' | 'advanced' | 'fixit' | 'ai' | 'telemetry' | 'guide'

export interface TuneState {
  tuneData: TuneData
  setTuneData: (data: TuneData) => void
  updateTuneValue: (key: string, value: number) => void
  isCalculating: boolean
  calculationProgress: number
  loadingStatus: string
  savedTunes: SavedTune[]
  upgrades: Record<string, string>
  setUpgrades: (upgrades: Record<string, string>) => void
  saveTune: () => Promise<void>
  exportTune: () => void
  importTune: (event: React.ChangeEvent<HTMLInputElement>) => void
  shareTune: () => void
  deleteTune: (id: string) => void
  loadTune: (tune: SavedTune) => void
  savedTuneSearch: string
  setSavedTuneSearch: (q: string) => void
  calculateBaseTune: () => Promise<void>
  // Quick tab settings
  selectedTrack: string
  setSelectedTrack: (v: string) => void
  drivingStyle: DrivingStyle
  setDrivingStyle: (v: DrivingStyle) => void
  weatherCondition: string
  setWeatherCondition: (v: string) => void
  trackSurface: string
  setTrackSurface: (v: string) => void
  lapTimeTarget: string
  setLapTimeTarget: (v: string) => void
  tuneType: string
  setTuneType: (v: string) => void
  unitSystem: string
  setUnitSystem: (v: string) => void
  carWeight: number
  setCarWeight: (v: number) => void
  frontDistribution: number
  setFrontDistribution: (v: number) => void
  drivetrain: DrivetrainType
  setDrivetrain: (v: DrivetrainType) => void
  gearCount: number
  setGearCount: (v: number) => void
  hpOverride: number | null
  setHpOverride: (v: number | null) => void
  handlingBalance: number
  setHandlingBalance: (v: number) => void
  bumpStiffness: number
  setBumpStiffness: (v: number) => void
  springFrequency: number
  setSpringFrequency: (v: number) => void
  rollStiffness: number
  setRollStiffness: (v: number) => void
  simpleMode: boolean
  setSimpleMode: (v: boolean) => void
  showChecklist: boolean
  setShowChecklist: (v: boolean) => void
  // Spring units for Advanced tab
  springUnit: SpringUnit
  setSpringUnit: (v: SpringUnit) => void
  displaySpringRate: (lbfIn: number) => number
  parseSpringRate: (displayed: number) => number
  springUnitLabel: string
  getTireCompoundName: (value: number) => string
}
