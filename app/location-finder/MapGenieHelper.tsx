'use client'

import React, { useState } from 'react'

interface MapGenieHelperProps {
  onClose: () => void
}

const MapGenieHelper: React.FC<MapGenieHelperProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false)

  const extractionScript = `// MapGenie Coordinate Extractor for Forza Horizon 5
// Run this in the browser console on mapgenie.io/forza-horizon-5/maps/mexico

const markers = [];
const mapContainer = document.querySelector('.leaflet-container');
if (!mapContainer) {
  console.error('Map container not found. Make sure you are on the MapGenie map page.');
} else {
  const mapRect = mapContainer.getBoundingClientRect();
  
  document.querySelectorAll('.leaflet-marker-icon').forEach((marker, index) => {
    const rect = marker.getBoundingClientRect();
    
    // Calculate percentage position relative to map container
    const x = ((rect.left + rect.width/2 - mapRect.left) / mapRect.width) * 100;
    const y = ((rect.top + rect.height/2 - mapRect.top) / mapRect.height) * 100;
    
    // Get marker info
    const title = marker.getAttribute('alt') || marker.getAttribute('title') || \`Location \${index}\`;
    
    // Only include markers within map bounds
    if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
      markers.push({
        name: title,
        x: parseFloat(x.toFixed(2)),
        y: parseFloat(y.toFixed(2))
      });
    }
  });
  
  console.log(\`Found \${markers.length} markers\`);
  console.table(markers);
  
  // Copy to clipboard
  const json = JSON.stringify(markers, null, 2);
  navigator.clipboard.writeText(json).then(() => {
    console.log('✅ Coordinates copied to clipboard!');
    console.log('Paste this into the coordinate import tool.');
  }).catch(err => {
    console.error('Failed to copy:', err);
    console.log('Manual copy:');
    console.log(json);
  });
}
`

  const handleCopyScript = () => {
    navigator.clipboard.writeText(extractionScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">🗺️ MapGenie Integration Guide</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Quick Start */}
            <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
              <h3 className="font-bold text-blue-300 mb-3">🚀 Quick Start (Recommended)</h3>
              <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                <li>Visit <a href="https://mapgenie.io/forza-horizon-5/maps/mexico" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">MapGenie FH5 Map</a></li>
                <li>Enable all location categories you want (use filters on left sidebar)</li>
                <li>Press <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">F11</kbd> for fullscreen</li>
                <li>Take a screenshot (<kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Win + Shift + S</kbd>)</li>
                <li>Click <strong>"🎯 Calibrate"</strong> button in your map</li>
                <li>Upload the screenshot and let the system auto-detect pins</li>
              </ol>
            </div>

            {/* Advanced Method */}
            <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-4">
              <h3 className="font-bold text-purple-300 mb-3">⚡ Advanced: Direct Coordinate Extraction</h3>
              <p className="text-sm text-gray-300 mb-3">
                Extract exact coordinates from MapGenie using browser console:
              </p>
              
              <div className="space-y-3">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-gray-400">EXTRACTION SCRIPT</span>
                    <button
                      onClick={handleCopyScript}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                        copied
                          ? 'bg-green-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {copied ? '✓ Copied!' : '📋 Copy Script'}
                    </button>
                  </div>
                  <pre className="text-xs text-gray-300 overflow-x-auto max-h-48 overflow-y-auto">
                    <code>{extractionScript}</code>
                  </pre>
                </div>

                <div className="text-sm text-gray-300 space-y-2">
                  <p className="font-semibold">Steps:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Open MapGenie in your browser</li>
                    <li>Press <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">F12</kbd> to open Developer Tools</li>
                    <li>Go to the <strong>Console</strong> tab</li>
                    <li>Paste the script above and press Enter</li>
                    <li>Coordinates will be copied to your clipboard automatically</li>
                    <li>Use the data to update your location JSON file</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4">
              <h3 className="font-bold text-green-300 mb-3">💡 Pro Tips</h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span><strong>Match categories:</strong> Enable the same location types in both MapGenie and your app for accurate calibration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span><strong>High resolution:</strong> Use 100% browser zoom and fullscreen mode for clearest pins</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span><strong>Persistent calibration:</strong> Once calibrated, settings are saved to your browser</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span><strong>Re-calibrate anytime:</strong> If pins drift, just run calibration again with a fresh screenshot</span>
                </li>
              </ul>
            </div>

            {/* Common Categories */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-bold text-white mb-3">📍 Common Location Categories</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-gray-300">Barn Finds</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-gray-300">Fast Travel Boards</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-300">XP Boards</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-gray-300">Treasure Chests</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                  <span className="text-gray-300">Player Houses</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-gray-300">Showcases</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-600"></div>
                  <span className="text-gray-300">Danger Signs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-sky-600"></div>
                  <span className="text-gray-300">Speed Traps</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <a
                href="https://mapgenie.io/forza-horizon-5/maps/mexico"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-center transition-colors"
              >
                🗺️ Open MapGenie
              </a>
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapGenieHelper
