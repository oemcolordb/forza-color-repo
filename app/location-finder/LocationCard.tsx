import React from 'react'
import { Location, LocationType } from './types'

interface LocationCardProps {
  location: Location
  isSelected: boolean
  isFavorite: boolean
  isVisited: boolean
  onSelect: () => void
  onToggleFavorite: () => void
}

const typeColor: Partial<Record<LocationType, string>> = {
  [LocationType.BarnFind]: 'bg-red-500',
  [LocationType.FastTravelBoard]: 'bg-blue-500',
  [LocationType.XPBoard]: 'bg-yellow-500',
  [LocationType.Treasure]: 'bg-purple-500',
  [LocationType.Landmark]: 'bg-green-500',
  [LocationType.FestivalSite]: 'bg-pink-500',
  [LocationType.PlayerHouse]: 'bg-cyan-500',
  [LocationType.RoadRacingEvent]: 'bg-blue-600',
  [LocationType.DirtRacingEvent]: 'bg-amber-600',
  [LocationType.CrossCountryEvent]: 'bg-emerald-600',
  [LocationType.StreetRacingEvent]: 'bg-violet-600',
  [LocationType.DragRacingEvent]: 'bg-rose-600',
  [LocationType.DangerSign]: 'bg-red-600',
  [LocationType.SpeedTrap]: 'bg-sky-600',
  [LocationType.SpeedZone]: 'bg-teal-600',
  [LocationType.DriftZone]: 'bg-fuchsia-600',
}

const LocationCard: React.FC<LocationCardProps> = ({
  location,
  isSelected,
  isFavorite,
  isVisited,
  onSelect,
  onToggleFavorite,
}) => {
  const dot = typeColor[location.type] ?? 'bg-gray-500'

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-2.5 flex items-center gap-2.5 border-b border-gray-800 transition-colors ${
        isSelected ? 'bg-blue-600/25 border-l-2 border-l-blue-500' : 'hover:bg-gray-800/60'
      }`}
    >
      {/* Type dot */}
      <span className={`flex-shrink-0 w-2 h-2 rounded-full ${dot}`} />

      {/* Text */}
      <span className="flex-1 min-w-0">
        <span className={`block text-sm font-medium truncate ${isVisited ? 'text-gray-400 line-through' : 'text-white'}`}>
          {location.name}
        </span>
        <span className="block text-xs text-gray-500 truncate">{location.type}</span>
      </span>

      {/* Favorite */}
      <button
        onClick={e => { e.stopPropagation(); onToggleFavorite() }}
        className="flex-shrink-0 p-1 rounded hover:bg-gray-700 transition-colors"
        aria-label={isFavorite ? 'Remove favorite' : 'Add favorite'}
      >
        <svg
          className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600'}`}
          fill={isFavorite ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>
    </button>
  )
}

export default LocationCard
