import React from 'react'
import { Location, LocationType } from './types'

interface LocationCardProps {
  location: Location
  isSelected: boolean
  onSelect: () => void
}

const LocationTypeIcon: React.FC<{ type: LocationType }> = ({ type }) => {
  let colorClass = 'text-gray-400'

  switch (type) {
    case LocationType.BarnFind:
    case LocationType.DangerSign:
      colorClass = 'text-red-400'
      break
    case LocationType.FastTravelBoard:
    case LocationType.SpeedTrap:
    case LocationType.RoadRacingEvent:
      colorClass = 'text-blue-400'
      break
    case LocationType.XPBoard:
    case LocationType.SpeedZone:
      colorClass = 'text-yellow-400'
      break
    case LocationType.Treasure:
    case LocationType.StreetRacingEvent:
      colorClass = 'text-purple-400'
      break
    case LocationType.Landmark:
    case LocationType.CrossCountryEvent:
      colorClass = 'text-green-400'
      break
    case LocationType.DirtRacingEvent:
    case LocationType.DriftZone:
      colorClass = 'text-orange-400'
      break
    case LocationType.FestivalSite:
    case LocationType.PlayerHouse:
    case LocationType.Expedition:
    case LocationType.Showcase:
      colorClass = 'text-cyan-400'
      break
    default:
      colorClass = 'text-gray-400'
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-5 w-5 ${colorClass}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  )
}

const LocationCard: React.FC<LocationCardProps> = ({ location, isSelected, onSelect }) => {
  const [showCopied, setShowCopied] = React.useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(location.name)
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 2000)
  }

  const cardClasses = `
    p-4 rounded-lg cursor-pointer transition-all duration-300 ease-in-out border relative
    ${
      isSelected
        ? 'bg-blue-600/30 border-blue-500 shadow-lg scale-105'
        : 'bg-gray-700/50 border-gray-700/50 hover:bg-gray-700 hover:border-gray-600'
    }
  `

  return (
    <div className={cardClasses} onClick={onSelect}>
      {showCopied && (
        <div className="absolute -top-2 right-2 bg-green-500 text-white text-xs px-3 py-1.5 rounded-full animate-bounce z-20 shadow-lg">
          ✓ Copied!
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="mt-1 flex-shrink-0">
          <LocationTypeIcon type={location.type} />
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-white">{location.name}</h3>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isSelected ? 'bg-blue-200 text-blue-800' : 'bg-gray-600 text-gray-200'}`}
            >
              {location.type}
            </span>
          </div>
          <p className="text-sm text-gray-300 mt-1">{location.description}</p>
        </div>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-all hover:scale-105 shadow-md z-10"
          title="Copy location name"
        >
          📋
        </button>
      </div>
    </div>
  )
}

export default LocationCard
