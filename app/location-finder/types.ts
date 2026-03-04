export enum LocationType {
  Parking = 'Parking',
  PhotoOp = 'Photo Op',
  Landmark = 'Landmark',
  ScenicView = 'Scenic View',
}

export interface Location {
  name: string
  description: string
  type: LocationType
}
