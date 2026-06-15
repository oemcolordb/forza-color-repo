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
  setTuneData: (_data: TuneData) => void
  updateTuneValue: (_key: string, _value: number) => void
  isCalculating: boolean
  calculationProgress: number
  loadingStatus: string
  savedTunes: SavedTune[]
  upgrades: Record<string, string>
  setUpgrades: (_upgrades: Record<string, string>) => void
  saveTune: () => Promise<void>
  exportTune: () => void
  importTune: (_event: React.ChangeEvent<HTMLInputElement>) => void
  shareTune: () => void
  deleteTune: (_id: string) => void
  loadTune: (_tune: SavedTune) => void
  savedTuneSearch: string
  setSavedTuneSearch: (_q: string) => void
  calculateBaseTune: () => Promise<void>
  // Quick tab settings
  selectedTrack: string
  setSelectedTrack: (_v: string) => void
  drivingStyle: DrivingStyle
  setDrivingStyle: (_v: DrivingStyle) => void
  weatherCondition: string
  setWeatherCondition: (_v: string) => void
  trackSurface: string
  setTrackSurface: (_v: string) => void
  lapTimeTarget: string
  setLapTimeTarget: (_v: string) => void
  tuneType: string
  setTuneType: (_v: string) => void
  unitSystem: string
  setUnitSystem: (_v: string) => void
  carWeight: number
  setCarWeight: (_v: number) => void
  frontDistribution: number
  setFrontDistribution: (_v: number) => void
  drivetrain: DrivetrainType
  setDrivetrain: (_v: DrivetrainType) => void
  gearCount: number
  setGearCount: (_v: number) => void
  hpOverride: number | null
  setHpOverride: (_v: number | null) => void
  handlingBalance: number
  setHandlingBalance: (_v: number) => void
  bumpStiffness: number
  setBumpStiffness: (_v: number) => void
  springFrequency: number
  setSpringFrequency: (_v: number) => void
  rollStiffness: number
  setRollStiffness: (_v: number) => void
  simpleMode: boolean
  setSimpleMode: (_v: boolean) => void
  showChecklist: boolean
  setShowChecklist: (_v: boolean) => void
  // Spring units for Advanced tab
  springUnit: SpringUnit
  setSpringUnit: (_v: SpringUnit) => void
  displaySpringRate: (_lbfIn: number) => number
  parseSpringRate: (_displayed: number) => number
  springUnitLabel: string
  getTireCompoundName: (_value: number) => string
}
