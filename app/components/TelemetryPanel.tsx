'use client'

import React from 'react'

interface TelemetryPanelProps {
  tuneData: any
  carData: any
  isDarkMode: boolean
}

export function TelemetryPanel({ tuneData, carData, isDarkMode }: TelemetryPanelProps) {
  return (
    <div className="space-y-4">
      {/* How to Access Telemetry */}
      <div className={`p-4 rounded ${isDarkMode ? 'bg-[#333333]' : 'bg-gray-100'}`}>
        <h4 className="font-bold mb-3">🎮 Accessing Telemetry in FH5</h4>
        <div className="text-sm space-y-2">
          <div><strong>PC:</strong> Press 'T' key to cycle through telemetry screens</div>
          <div><strong>Xbox:</strong> Hold View button + Right on D-pad</div>
          <div><strong>Menu:</strong> Settings → HUD and Gameplay → Telemetry</div>
          <div className="text-xs opacity-75 mt-2">Enable "Detailed" telemetry for maximum data</div>
        </div>
      </div>

      {/* Tire Temperature Tuning */}
      <div className={`p-4 rounded ${isDarkMode ? 'bg-[#333333]' : 'bg-gray-100'}`}>
        <h4 className="font-bold mb-3">🌡️ Tire Temperature Analysis</h4>
        <div className="text-sm space-y-3">
          <div>
            <strong className="text-green-400">Optimal Range:</strong> 85-95°C (185-203°F)
          </div>
          
          <div>
            <strong className="text-blue-400">Too Cold (Blue):</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Lower tire pressure by 2-3 PSI</li>
              <li>• Add more negative camber</li>
              <li>• Drive more aggressively to generate heat</li>
            </ul>
          </div>
          
          <div>
            <strong className="text-red-400">Overheating (Red):</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Increase tire pressure by 2-3 PSI</li>
              <li>• Reduce camber angle</li>
              <li>• Lower downforce if available</li>
            </ul>
          </div>
          
          <div>
            <strong>Temperature Distribution:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• <strong>Inside hotter:</strong> Too much camber</li>
              <li>• <strong>Outside hotter:</strong> Not enough camber</li>
              <li>• <strong>Middle hotter:</strong> Too much pressure</li>
              <li>• <strong>Edges hotter:</strong> Too little pressure</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Suspension Travel Guide */}
      <div className={`p-4 rounded ${isDarkMode ? 'bg-[#333333]' : 'bg-gray-100'}`}>
        <h4 className="font-bold mb-3">🔧 Suspension Travel Guide</h4>
        <div className="text-sm space-y-3">
          <div>
            <strong className="text-green-400">Target Range:</strong> 25-75% travel
          </div>
          
          <div>
            <strong className="text-red-400">Bottoming Out (100%):</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Increase spring rates</li>
              <li>• Raise ride height</li>
              <li>• Stiffen bump damping</li>
            </ul>
          </div>
          
          <div>
            <strong className="text-yellow-400">Too Stiff (0-20%):</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Soften spring rates</li>
              <li>• Lower ride height slightly</li>
              <li>• Reduce bump damping</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Track-Specific Telemetry Tips */}
      <div className={`p-4 rounded ${isDarkMode ? 'bg-[#333333]' : 'bg-gray-100'}`}>
        <h4 className="font-bold mb-3">🏁 Track-Specific Telemetry</h4>
        <div className="text-sm space-y-3">
          <div>
            <strong className="text-purple-400">Road Racing:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Focus on consistent tire temps across all corners</li>
              <li>• Monitor brake temps on long straights</li>
              <li>• Check suspension travel in fast corners</li>
            </ul>
          </div>
          
          <div>
            <strong className="text-orange-400">Drift:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Rear tires should run hotter than front</li>
              <li>• Look for consistent slip angles</li>
              <li>• Monitor throttle vs steering input</li>
            </ul>
          </div>
          
          <div>
            <strong className="text-cyan-400">Drag Racing:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Watch for wheel spin in telemetry</li>
              <li>• Monitor launch RPM vs wheel speed</li>
              <li>• Check gear shift points for optimal acceleration</li>
            </ul>
          </div>
          
          <div>
            <strong className="text-green-400">Cross Country:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Suspension should use full travel range</li>
              <li>• Tire temps may vary widely - focus on grip</li>
              <li>• Monitor landing impacts and adjust damping</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Advanced Telemetry Analysis */}
      <div className={`p-4 rounded ${isDarkMode ? 'bg-[#333333]' : 'bg-gray-100'}`}>
        <h4 className="font-bold mb-3">📊 Advanced Analysis</h4>
        <div className="text-sm space-y-3">
          <div>
            <strong>G-Force Analysis:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Lateral G: Cornering grip (higher = better)</li>
              <li>• Longitudinal G: Braking/acceleration grip</li>
              <li>• Consistent G-forces = balanced setup</li>
            </ul>
          </div>
          
          <div>
            <strong>Speed vs RPM:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Hitting rev limiter = gear too long</li>
              <li>• Low RPM in corners = gear too short</li>
              <li>• Optimize for track's longest straight</li>
            </ul>
          </div>
          
          <div>
            <strong>Brake Analysis:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Front/rear brake temps should be similar</li>
              <li>• Adjust brake balance if one end overheats</li>
              <li>• Monitor brake fade on long sessions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Current Tune Analysis */}
      {Object.keys(tuneData).length > 0 && (
        <div className={`p-4 rounded ${isDarkMode ? 'bg-[#333333]' : 'bg-gray-100'}`}>
          <h4 className="font-bold mb-3">🎯 Your Tune - What to Watch</h4>
          <div className="space-y-2 text-sm">
            {tuneData['tire-pressure-front'] && (
              <div>• <strong>Tire Pressure:</strong> {tuneData['tire-pressure-front']} PSI front - Watch for {tuneData['tire-pressure-front'] > 30 ? 'overheating' : 'cold tires'}</div>
            )}
            {tuneData['camber-front'] && (
              <div>• <strong>Camber:</strong> {tuneData['camber-front']}° - Monitor {Math.abs(tuneData['camber-front']) > 2.5 ? 'inside edge heating' : 'even tire wear'}</div>
            )}
            {tuneData['final-drive'] && (
              <div>• <strong>Gearing:</strong> {tuneData['final-drive']} final - Check if you're hitting rev limiter</div>
            )}
            {tuneData['aero-front'] && (
              <div>• <strong>Downforce:</strong> {tuneData['aero-front']}kg - Monitor cornering speeds vs straight-line speed</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}