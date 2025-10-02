'use client';
import React, { useState, useEffect } from 'react';

export const TelemetryPanel = ({ tuneData, carData, isDarkMode = true }) => {
  const [telemetryData, setTelemetryData] = useState({
    tireTemp: { front: [85, 90, 88], rear: [82, 87, 85] },
    tirePressure: { front: 28.5, rear: 26.8 },
    suspension: { compression: [45, 42, 48, 44], travel: [65, 68, 62, 66] },
    performance: { lapTime: '1:23.456', topSpeed: 287, acceleration: 3.2, sector1: '0:28.123', sector2: '0:31.456', sector3: '0:23.877' },
    engine: { rpm: 6500, gear: 4, throttle: 85, brake: 0, boost: 1.2 },
    aero: { downforce: 245, drag: 0.32, balance: 52 },
    gforces: { lateral: 1.2, longitudinal: 0.8, vertical: 1.0 },
    fuel: { level: 78, consumption: 2.3, remaining: 12 }
  });
  
  const [isRacing, setIsRacing] = useState(false);
  const [lapCount, setLapCount] = useState(1);

  const [activeTab, setActiveTab] = useState('tires');

  // Enhanced telemetry simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryData(prev => {
        const racing = isRacing || Math.random() > 0.7;
        const intensity = racing ? 1 : 0.3;
        
        return {
          ...prev,
          tireTemp: {
            front: prev.tireTemp.front.map(temp => Math.max(60, Math.min(120, temp + (Math.random() - 0.5) * 4 * intensity))),
            rear: prev.tireTemp.rear.map(temp => Math.max(60, Math.min(120, temp + (Math.random() - 0.5) * 4 * intensity)))
          },
          engine: {
            rpm: racing ? Math.floor(5000 + Math.random() * 3000) : Math.floor(2000 + Math.random() * 2000),
            gear: racing ? Math.floor(3 + Math.random() * 4) : Math.floor(1 + Math.random() * 3),
            throttle: racing ? Math.floor(60 + Math.random() * 40) : Math.floor(Math.random() * 30),
            brake: racing && Math.random() > 0.7 ? Math.floor(Math.random() * 100) : 0,
            boost: (0.8 + Math.random() * 0.8).toFixed(1)
          },
          performance: {
            ...prev.performance,
            lapTime: `1:${(23 + Math.random() * 8).toFixed(3)}`,
            sector1: `0:${(27 + Math.random() * 3).toFixed(3)}`,
            sector2: `0:${(30 + Math.random() * 4).toFixed(3)}`,
            sector3: `0:${(22 + Math.random() * 3).toFixed(3)}`
          },
          gforces: {
            lateral: racing ? (Math.random() * 2.5).toFixed(1) : (Math.random() * 0.5).toFixed(1),
            longitudinal: racing ? ((Math.random() - 0.5) * 2).toFixed(1) : (Math.random() * 0.3).toFixed(1),
            vertical: (0.8 + Math.random() * 0.4).toFixed(1)
          },
          fuel: {
            level: Math.max(0, prev.fuel.level - (racing ? 0.2 : 0.05)),
            consumption: (2.0 + Math.random() * 1.0).toFixed(1),
            remaining: Math.floor(prev.fuel.level / 6.5)
          }
        };
      });
    }, isRacing ? 500 : 1500);

    return () => clearInterval(interval);
  }, [isRacing]);

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
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          {['tires', 'suspension', 'performance', 'engine'].map((tab) => (
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
        
        <div className="flex items-center gap-3">
          <div className="text-sm">
            <span className="opacity-75">Lap:</span> <span className="font-mono">{lapCount}</span>
          </div>
          <button
            onClick={() => {
              setIsRacing(!isRacing);
              if (!isRacing) setLapCount(prev => prev + 1);
            }}
            className={`px-3 py-1 rounded text-sm font-medium ${
              isRacing 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-green-500 text-white'
            }`}
          >
            {isRacing ? '🏁 Racing' : '▶️ Start'}
          </button>
        </div>
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
          
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="text-center p-2 rounded bg-opacity-20 bg-yellow-500">
              <div className="font-mono text-yellow-400">{telemetryData.performance.sector1}</div>
              <div className="text-xs opacity-75">Sector 1</div>
            </div>
            <div className="text-center p-2 rounded bg-opacity-20 bg-orange-500">
              <div className="font-mono text-orange-400">{telemetryData.performance.sector2}</div>
              <div className="text-xs opacity-75">Sector 2</div>
            </div>
            <div className="text-center p-2 rounded bg-opacity-20 bg-red-500">
              <div className="font-mono text-red-400">{telemetryData.performance.sector3}</div>
              <div className="text-xs opacity-75">Sector 3</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-lg font-bold text-cyan-400">
                {telemetryData.gforces.lateral}G
              </div>
              <div className="text-xs opacity-75">Lateral G</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-pink-400">
                {telemetryData.gforces.longitudinal}G
              </div>
              <div className="text-xs opacity-75">Longitudinal G</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-indigo-400">
                {telemetryData.fuel.level.toFixed(0)}%
              </div>
              <div className="text-xs opacity-75">Fuel ({telemetryData.fuel.remaining} laps)</div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'engine' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>🔧 RPM:</span>
                <span className={`font-mono text-lg ${
                  telemetryData.engine.rpm > 7000 ? 'text-red-400' : 
                  telemetryData.engine.rpm > 5000 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {telemetryData.engine.rpm.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>⚙️ Gear:</span>
                <span className="font-mono text-lg text-blue-400">{telemetryData.engine.gear}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>🚀 Boost:</span>
                <span className="font-mono text-lg text-purple-400">{telemetryData.engine.boost} bar</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span>🎯 Throttle:</span>
                  <span className="font-mono">{telemetryData.engine.throttle}%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full transition-all" style={{width: `${telemetryData.engine.throttle}%`}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>🛑 Brake:</span>
                  <span className="font-mono">{telemetryData.engine.brake}%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full transition-all" style={{width: `${telemetryData.engine.brake}%`}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};