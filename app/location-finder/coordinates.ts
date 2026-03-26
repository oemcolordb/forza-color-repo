export const MAP_IMAGE_WIDTH = 4000
export const MAP_IMAGE_HEIGHT = 2394

export interface PercentCoordinate {
  x: number
  y: number
}

const clampPercent = (value: number) => Math.max(0, Math.min(100, value))

export function percentToPixelX(xPercent: number): number {
  return (clampPercent(xPercent) / 100) * MAP_IMAGE_WIDTH
}

export function percentToPixelY(yPercent: number): number {
  return (clampPercent(yPercent) / 100) * MAP_IMAGE_HEIGHT
}

export function percentToLeafletLatLng(coordinates: PercentCoordinate): [number, number] {
  return [percentToPixelY(coordinates.y), percentToPixelX(coordinates.x)]
}

export function leafletLatLngToPercent(lat: number, lng: number): PercentCoordinate {
  return {
    x: (lng / MAP_IMAGE_WIDTH) * 100,
    y: (lat / MAP_IMAGE_HEIGHT) * 100,
  }
}
