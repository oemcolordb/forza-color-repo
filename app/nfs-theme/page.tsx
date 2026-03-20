'use client'

import React, { useState, useEffect } from 'react'
import NFSBackground, { 
  NFSSpeedometer, 
  NFSHeatLevel, 
  NFSGaugeCluster,
  NFSCard,
  NFSButton,
  NFSDriftIndicator 
} from '../components/NFSBackground'
import NFSHeader from '../components/NFSHeader'
import NFSColorCard from '../components/NFSColorCard'
import { CarColor } from '../types'

export default function NFSThemePage() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [speed, setSpeed] = useState(0)
  const [rpm, setRpm] = useState(0)
  const [heatLevel, setHeatLevel] = useState(0)
  const [nitrous, setNitrous] = useState(100)
  const [showPoliceScanner, setShowPoliceScanner] = useState(false)
  const [showNitrous, setShowNitrous] = useState(false)
  const [isDrifting, setIsDrifting] = useState(false)
  const [galleryColors, setGalleryColors] = useState<CarColor[]>([])

  useEffect(() => {
    import('../../services/colorDataLazy').then(({ getColorData }) => {
      getColorData().then((data: CarColor[]) => {
        // Pick 8 visually varied colors spread across the dataset
        const step = Math.floor(data.length / 8)
        setGalleryColors(data.filter((_, i) => i % step === 0).slice(0, 8))
      })
    })
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed(prev => {
        const newSpeed = prev + (Math.random() * 30 - 15)
        return Math.max(0, Math.min(200, newSpeed))
      })
      
      setRpm(prev => {
        const newRpm = prev + (Math.random() * 1000 - 500)
        return Math.max(1000, Math.min(8000, newRpm))
      })

      setNitrous(prev => {
        if (showNitrous && prev > 0) {
          return Math.max(0, prev - 5)
        }
        return Math.min(100, prev + 2)
      })
    }, 100)

    return () => clearInterval(interval)
  }, [showNitrous])

  const handleNitrousBoost = () => {
    if (nitrous > 20) {
      setShowNitrous(true)
      setSpeed(prev => Math.min(200, prev + 50))
      setTimeout(() => setShowNitrous(false), 2000)
    }
  }

  const handleDrift = () => {
    setIsDrifting(true)
    setTimeout(() => setIsDrifting(false), 2000)
  }

  const handlePoliceChase = () => {
    setShowPoliceScanner(!showPoliceScanner)
    setHeatLevel(prev => (showPoliceScanner ? 0 : 5))
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <NFSBackground 
        isDarkMode={isDarkMode}
        showPoliceScanner={showPoliceScanner}
        showNitrous={showNitrous}
      />

      <NFSHeader 
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        showHeatLevel={true}
      />

      <main className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold nfs-text-neon-blue uppercase tracking-wider">
              Need for Speed
            </h1>
            <p className="text-xl md:text-2xl nfs-text-neon-pink uppercase tracking-widest">
              Underground Theme
            </p>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Experience the ultimate street racing aesthetic with neon glows, carbon fiber textures, 
              and dynamic animations inspired by the legendary NFS Underground series.
            </p>
          </div>

          <NFSCard className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold nfs-text-neon-blue mb-4 uppercase">
              🏁 Gauge Cluster
            </h2>
            <div className="flex justify-center">
              <NFSGaugeCluster 
                speed={speed}
                rpm={rpm}
                heatLevel={heatLevel}
                nitrous={nitrous}
              />
            </div>
          </NFSCard>

          <NFSCard className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold nfs-text-neon-orange mb-4 uppercase">
              🎮 Controls
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NFSButton onClick={handleNitrousBoost} disabled={nitrous < 20}>
                💨 Nitrous Boost
              </NFSButton>
              <NFSButton onClick={handleDrift}>
                🌀 Drift Mode
              </NFSButton>
              <NFSButton onClick={handlePoliceChase}>
                🚨 {showPoliceScanner ? 'Evade Police' : 'Start Chase'}
              </NFSButton>
              <NFSButton onClick={() => {
                setSpeed(0)
                setRpm(1000)
                setHeatLevel(0)
                setNitrous(100)
              }}>
                🔄 Reset
              </NFSButton>
            </div>
          </NFSCard>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NFSCard>
              <h3 className="text-lg font-bold nfs-text-neon-blue mb-4 uppercase text-center">
                Speedometer
              </h3>
              <div className="flex justify-center">
                <NFSSpeedometer speed={speed} maxSpeed={200} />
              </div>
            </NFSCard>

            <NFSCard>
              <h3 className="text-lg font-bold nfs-text-neon-pink mb-4 uppercase text-center">
                Heat Level
              </h3>
              <div className="flex flex-col items-center gap-4">
                <NFSHeatLevel level={heatLevel} maxLevel={5} />
                <div className="text-sm text-gray-400 text-center">
                  {heatLevel === 0 && 'No police activity'}
                  {heatLevel === 1 && 'Police aware'}
                  {heatLevel === 2 && 'Pursuit initiated'}
                  {heatLevel === 3 && 'Helicopters deployed'}
                  {heatLevel === 4 && 'Roadblocks active'}
                  {heatLevel === 5 && 'Maximum heat!'}
                </div>
              </div>
            </NFSCard>

            <NFSCard>
              <h3 className="text-lg font-bold nfs-text-neon-orange mb-4 uppercase text-center">
                Drift Status
              </h3>
              <div className="flex justify-center">
                <NFSDriftIndicator isDrifting={isDrifting} />
              </div>
            </NFSCard>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold nfs-text-neon-blue uppercase text-center">
              🎨 Color Gallery
            </h2>
            {galleryColors.length === 0 ? (
              <p className="text-center text-gray-500 uppercase tracking-widest">Loading colors...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {galleryColors.map((color, index) => (
                  <NFSColorCard
                    key={index}
                    color={color}
                    isDarkMode={isDarkMode}
                    onSelect={(c) => console.log('Selected:', c.colorName)}
                    onShowInfo={(c) => console.log('Info:', c.colorName)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="text-center">
            <a href="/">
              <NFSButton>
                🏠 Back to Home
              </NFSButton>
            </a>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-8 text-center text-gray-500 text-sm">
        <div className="nfs-card max-w-2xl mx-auto p-4">
          <p className="nfs-text-neon-blue font-bold mb-2">
            FORZA COLOR UNIVERSE × NEED FOR SPEED
          </p>
          <p>Underground Racing Theme • Built with React & Next.js</p>
        </div>
      </footer>
    </div>
  )
}
