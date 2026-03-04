import React from 'react'
import { Location } from './types'

interface MapDisplayProps {
  selectedLocation: Location | null
}

const MapDisplay: React.FC<MapDisplayProps> = ({ selectedLocation }) => {
  const mapUrl = 'https://mapgenie.io/forza-horizon-5/maps/mexico'

  return (
    <div className="w-full h-full flex flex-col">
      {selectedLocation && (
        <div className="p-4 bg-gray-900/50 border-b border-gray-700/50 text-center">
          <p className="text-gray-300 text-sm">
            Now looking for: <strong className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">{selectedLocation.name}</strong>. Find it on the interactive map below!
          </p>
        </div>
      )}
      <div className="flex-grow w-full h-full p-2">
        <iframe
          src={mapUrl}
          title="Forza Horizon 5 Interactive Map"
          className="w-full h-full border-0 rounded-lg"
          allow="fullscreen"
        ></iframe>
      </div>
    </div>
  )
}

export default MapDisplay
