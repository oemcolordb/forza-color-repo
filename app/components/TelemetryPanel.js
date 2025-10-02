'use client';
import React, { useState, useEffect } from 'react';

export const TelemetryPanel = ({ tuneData, carData, isDarkMode = true }) => {
  const [telemetryData, setTelemetryData] = useState({
    tireTemp: { front: [85, 90, 88], rear: [82, 87, 85] },
    tirePressure: { front: 28.5, rear: 26.8 },
    suspension: { compression: [45, 42, 48, 44], travel: [65, 68, 62, 66] },
    performance: { lapTime: '1:23.456', topSpeed: 287, acceleration: 3.2 }
  });

  const [activeTab, setActiveTab] = useState('tires');

  // Simulate telemetry updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryData(prev => ({
        ...prev,
        tireTemp: {
          front: prev.tireTemp.front.map(temp => temp + (Math.random() - 0.5) * 2),
          rear: prev.tireTemp.rear.map(temp => temp + (Math.random() - 0.5) * 2)
        },
        performance: {
          ...prev.performance,
          lapTime: `1:${(23 + Math.random() * 5).toFixed(3)}`
        }
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getTempColor = (temp) => {
    if (temp < 80) return 'text-blue-400';
    if (temp < 90) return 'text-green-400';
    if (temp < 100) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSuspensionStatus = (compression) => {
    if (compression < 30) return { color: 'bg-blue-500', status: 'Soft' };
    if (compression < 70) return { color: 'bg-green-500', status: 'Good' };
    return { color: 'bg-red-500', status: 'Stiff' };
  };

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <h3 className="font-bold text-lg mb-4">📊 Live Telemetry</h3>
      
      <div className="flex gap-2 mb-4">
        {['tires', 'suspension', 'performance'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 rounded text-sm capitalize ${
              activeTab === tab 
                ? 'bg-blue-500 text-white' 
                : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'tires' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">🔥 Tire Temperatures</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Front:</span>
                  <div className="flex gap-1">
                    {telemetryData.tireTemp.front.map((temp, i) => (
                      <span key={i} className={`font-mono ${getTempColor(temp)}`}>
                        {temp.toFixed(0)}°
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Rear:</span>
                  <div className="flex gap-1">
                    {telemetryData.tireTemp.rear.map((temp, i) => (
                      <span key={i} className={`font-mono ${getTempColor(temp)}`}>
                        {temp.toFixed(0)}°
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">⚡ Pressure</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Front:</span>
                  <span className="font-mono text-blue-400">
                    {telemetryData.tirePressure.front.toFixed(1)} PSI
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Rear:</span>
                  <span className="font-mono text-blue-400">
                    {telemetryData.tirePressure.rear.toFixed(1)} PSI
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div className="text-sm">
              <div className="font-semibold mb-1">💡 Tire Analysis:</div>
              <div className="text-xs space-y-1">
                <div>• Optimal temp range: 85-95°C</div>
                <div>• Even temps across tire = good camber</div>
                <div>• Hot outside edge = too much camber</div>
                <div>• Hot center = too much pressure</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'suspension' && (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">🔧 Suspension Travel</h4>
            <div className="grid grid-cols-2 gap-4">
              {['FL', 'FR', 'RL', 'RR'].map((corner, i) => {
                const compression = telemetryData.suspension.compression[i];
                const status = getSuspensionStatus(compression);
                return (
                  <div key={corner} className="text-center">
                    <div className="text-sm font-medium">{corner}</div>
                    <div className="mt-1">
                      <div className={`h-2 rounded ${status.color}`} style={{width: `${compression}%`}}></div>
                      <div className="text-xs mt-1">{compression.toFixed(0)}% - {status.status}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div className="text-sm">
              <div className="font-semibold mb-1">🎯 Suspension Tips:</div>
              <div className="text-xs space-y-1">
                <div>• 20-80% travel is optimal range</div>
                <div>• Bottoming out (100%) = too soft</div>
                <div>• No movement (&lt;20%) = too stiff</div>
                <div>• Adjust springs/dampers accordingly</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {telemetryData.performance.lapTime}
              </div>
              <div className="text-sm opacity-75">Lap Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {telemetryData.performance.topSpeed}
              </div>
              <div className="text-sm opacity-75">Top Speed (km/h)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {telemetryData.performance.acceleration}s
              </div>
              <div className="text-sm opacity-75">0-100 km/h</div>
            </div>
          </div>
          
          <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div className="text-sm">
              <div className="font-semibold mb-1">📈 Performance Notes:</div>
              <div className="text-xs space-y-1">
                <div>• Compare times after tune changes</div>
                <div>• Consistency more important than single fast lap</div>
                <div>• Monitor sector times for specific improvements</div>
                <div>• Balance top speed vs acceleration for track</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};