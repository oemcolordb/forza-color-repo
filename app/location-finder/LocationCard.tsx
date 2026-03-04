import React from 'react'
import { Location, LocationType } from './types'

interface LocationCardProps {
  location: Location
  isSelected: boolean
  onSelect: () => void
}

const LocationTypeIcon: React.FC<{ type: LocationType }> = ({ type }) => {
  let icon
  let colorClass

  switch (type) {
    case LocationType.Parking:
      icon = <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></>
      colorClass = 'text-blue-400'
      break
    case LocationType.PhotoOp:
      icon = <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></>
      colorClass = 'text-purple-400'
      break
    case LocationType.Landmark:
      icon = <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></>
      colorClass = 'text-green-400'
      break
    case LocationType.ScenicView:
      icon = <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      colorClass = 'text-yellow-400'
      break
    default:
      icon = <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></>
      colorClass = 'text-gray-400'
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {icon}
    </svg>
  )
}

const LocationCard: React.FC<LocationCardProps> = ({ location, isSelected, onSelect }) => {
  const cardClasses = `
    p-4 rounded-lg cursor-pointer transition-all duration-300 ease-in-out border
    ${isSelected 
      ? 'bg-blue-600/30 border-blue-500 shadow-lg scale-105' 
      : 'bg-gray-700/50 border-gray-700/50 hover:bg-gray-700 hover:border-gray-600'}
  `

  return (
    <div className={cardClasses} onClick={onSelect}>
      <div className="flex items-start gap-4">
        <div className="mt-1 flex-shrink-0">
          <LocationTypeIcon type={location.type} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white">{location.name}</h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isSelected ? 'bg-blue-200 text-blue-800' : 'bg-gray-600 text-gray-200'}`}>
              {location.type}
            </span>
          </div>
          <p className="text-sm text-gray-300 mt-1">{location.description}</p>
        </div>
      </div>
    </div>
  )
}

export default LocationCard
