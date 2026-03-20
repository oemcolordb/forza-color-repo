export enum LocationCategory {
  Locations = 'LOCATIONS',
  Collectibles = 'COLLECTIBLES',
  RaceEvents = 'RACE EVENTS',
  HorizonStories = 'HORIZON STORIES',
  PRStunts = 'PR STUNTS',
  Other = 'OTHER'
}

export enum LocationType {
  // LOCATIONS (Total: 75)
  Expedition = 'Expedition',                    // 5
  FestivalSite = 'Festival Site',              // 6
  Landmark = 'Landmark',                        // 56
  PlayerHouse = 'Player House',                 // 7
  PlaygroundGame = 'Playground Game',           // 3
  Showcase = 'Showcase',                        // 4
  
  // COLLECTIBLES (Total: 228)
  BarnFind = 'Barn Find',                       // 14
  FastTravelBoard = 'Fast Travel Board',        // 50
  Treasure = 'Treasure',                        // 4
  XPBoard = 'XP Board',                         // 200
  
  // RACE EVENTS (Total: 69)
  CrossCountryEvent = 'Cross Country Event',    // 20
  DirtRacingEvent = 'Dirt Racing Event',       // 20
  DragRacingEvent = 'Drag Racing Event',       // 3
  RoadRacingEvent = 'Road Racing Event',       // 25
  StreetRacingEvent = 'Street Racing Event',   // 21
  
  // HORIZON STORIES (Total: 57)
  BornFast = 'Born Fast',                       // 8
  ElCamino = 'El Camino',                      // 9
  LuchaDeCarreteras = 'Lucha de Carreteras',   // 8
  TestDriver = 'Test Driver',                   // 15
  V10 = 'V10',                                  // 12
  Vocho = 'Vocho',                             // 13
  
  // PR STUNTS (Total: 75)
  DangerSign = 'Danger Sign',                   // 20
  DriftZone = 'Drift Zone',                     // 20
  SpeedTrap = 'Speed Trap',                     // 31
  SpeedZone = 'Speed Zone',                     // 22
  Trailblazer = 'Trailblazer',                 // 13
  
  // OTHER (Total: 32)
  ExpeditionAccolade = 'Expedition Accolade',   // 14
  Miscellaneous = 'Miscellaneous',              // 5
  TrailblazerFinish = 'Trailblazer Finish',    // 13
  Vehicle = 'Vehicle'                           // 5
}

export interface Location {
  id: string
  name: string
  type: LocationType
  category: LocationCategory
  coordinates: { x: number; y: number }
  description?: string
  image?: string
  reward?: string
  cost?: string
}
