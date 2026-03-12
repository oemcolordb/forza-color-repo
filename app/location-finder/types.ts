export enum LocationCategory {
  Locations = 'Locations',
  Collectibles = 'Collectibles',
  RaceEvents = 'Race Events',
  HorizonStories = 'Horizon Stories',
  PRStunts = 'PR Stunts',
  Other = 'Other'
}

export enum LocationType {
  // Locations
  Expedition = 'Expedition',
  FestivalSite = 'Festival Site',
  Landmark = 'Landmark',
  PlayerHouse = 'Player House',
  PlaygroundGame = 'Playground Game',
  Showcase = 'Showcase',
  
  // Collectibles
  BarnFind = 'Barn Find',
  FastTravelBoard = 'Fast Travel Board',
  Treasure = 'Treasure',
  XPBoard = 'XP Board',
  
  // Race Events
  CrossCountryEvent = 'Cross Country Event',
  DirtRacingEvent = 'Dirt Racing Event',
  DragRacingEvent = 'Drag Racing Event',
  RoadRacingEvent = 'Road Racing Event',
  StreetRacingEvent = 'Street Racing Event',
  
  // Horizon Stories
  BornFast = 'Born Fast',
  ElCamino = 'El Camino',
  LuchaDeCarreteras = 'Lucha de Carreteras',
  TestDriver = 'Test Driver',
  V10 = 'V10',
  Vocho = 'Vocho',
  
  // PR Stunts
  DangerSign = 'Danger Sign',
  DriftZone = 'Drift Zone',
  SpeedTrap = 'Speed Trap',
  SpeedZone = 'Speed Zone',
  Trailblazer = 'Trailblazer',
  TrailblazerFinish = 'Trailblazer Finish',
  
  // Other
  ExpeditionAccolade = 'Expedition Accolade',
  Miscellaneous = 'Miscellaneous',
  Vehicle = 'Vehicle'
}

export interface Location {
  id: string
  name: string
  type: LocationType
  category: LocationCategory
  coordinates: { x: number; y: number }
  description?: string
  image?: string
}
