import React from 'react'

const MapDisplay: React.FC = () => (
  <div className="w-full h-full min-h-[400px] flex flex-col">
    <iframe
      src="https://mapgenie.io/forza-horizon-5/maps/mexico?embed=light"
      title="Forza Horizon 5 Mexico Map"
      className="w-full flex-1 border-0"
      style={{ minHeight: '400px' }}
      allowFullScreen
      loading="lazy"
    />
  </div>
)

export default MapDisplay
