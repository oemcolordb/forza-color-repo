import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About - Forza Color Universe',
  description: 'Learn about Forza Color Universe, the comprehensive automotive color database from Forza racing games.',
}

'use client'
import { useState, useEffect } from 'react'
import TokyoBackground from '../components/TokyoBackground'
import { getSecureAssetUrl } from '../lib/assetProtection'

export default function About() {
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    setIsDarkMode(savedTheme !== 'light')
  }, [])

  return (
    <div className={`min-h-screen ${
      isDarkMode 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-gray-100 text-gray-800'
    }`}>
      <TokyoBackground isDarkMode={isDarkMode} getSecureAssetUrl={getSecureAssetUrl} />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
        {/* Engine Bay - Header */}
        <div className={`relative mb-8 rounded-xl overflow-hidden ${
          isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-gray-100 to-gray-200'
        } border-2 ${isDarkMode ? 'border-orange-500/30' : 'border-orange-400/40'} p-6`}>
          <div className="absolute top-2 left-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className={`text-xs font-mono ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>ABOUT SYSTEM</span>
            </div>
          </div>
          <div className="mt-4">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-yellow-400 to-red-400 text-transparent bg-clip-text">
              🏁 About Forza Color Universe
            </h1>
          </div>
        </div>
        
        <div className="space-y-8">
          {/* Dashboard - Mission */}
          <div className={`relative rounded-xl overflow-hidden ${
            isDarkMode ? 'bg-gradient-to-r from-slate-800 to-slate-900' : 'bg-gradient-to-r from-slate-100 to-slate-200'
          } border-2 ${isDarkMode ? 'border-blue-500/30' : 'border-blue-400/40'} p-6`}>
            <div className="absolute top-2 left-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className={`text-xs font-mono ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>MISSION</span>
              </div>
            </div>
            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                🎯 <span>Our Mission</span>
              </h2>
              <p className="text-lg leading-relaxed">
                Forza Color Universe is the most comprehensive digital catalog of automotive paint colors 
                extracted from the Forza racing game series. We preserve and make accessible over 10,000 
                official automotive colors for enthusiasts, designers, and developers worldwide.
              </p>
            </div>
          </div>

          {/* Paint Booth - Features */}
          <div className={`relative rounded-xl overflow-hidden ${
            isDarkMode ? 'bg-gradient-to-r from-purple-800 to-purple-900' : 'bg-gradient-to-r from-purple-100 to-purple-200'
          } border-2 ${isDarkMode ? 'border-purple-500/30' : 'border-purple-400/40'} p-6`}>
            <div className="absolute top-2 left-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <span className={`text-xs font-mono ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>FEATURES</span>
              </div>
            </div>
            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                ⚡ <span>What We Offer</span>
              </h2>
              <ul className="space-y-3">
                <li>🎨 10,000+ official automotive paint colors from Forza games</li>
                <li>🔍 Advanced search and filtering by manufacturer, model, and year</li>
                <li>📊 Detailed color analytics with HSB values and color types</li>
                <li>📸 Image color extraction and matching tools</li>
                <li>📁 Export functionality for design projects</li>
                <li>📱 Mobile-optimized experience for all devices</li>
                <li>🎮 Real-time Forza telemetry integration</li>
              </ul>
            </div>
          </div>

          {/* Control Panel - Technology */}
          <div className={`relative rounded-xl overflow-hidden ${
            isDarkMode ? 'bg-gradient-to-r from-green-800 to-green-900' : 'bg-gradient-to-r from-green-100 to-green-200'
          } border-2 ${isDarkMode ? 'border-green-500/30' : 'border-green-400/40'} p-6`}>
            <div className="absolute top-2 left-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className={`text-xs font-mono ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>TECHNOLOGY</span>
              </div>
            </div>
            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                🔧 <span>Technology Stack</span>
              </h2>
              <p className="leading-relaxed">
                Built with modern web technologies including Next.js, TypeScript, and Tailwind CSS. 
                Features real-time UDP telemetry processing, advanced color analysis algorithms, 
                and performance optimizations like virtual scrolling for handling massive datasets efficiently.
              </p>
            </div>
          </div>

          {/* Showroom - Acknowledgments */}
          <div className={`relative rounded-xl overflow-hidden ${
            isDarkMode ? 'bg-gradient-to-r from-yellow-800 to-yellow-900' : 'bg-gradient-to-r from-yellow-100 to-yellow-200'
          } border-2 ${isDarkMode ? 'border-yellow-500/30' : 'border-yellow-400/40'} p-6`}>
            <div className="absolute top-2 left-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className={`text-xs font-mono ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>CREDITS</span>
              </div>
            </div>
            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                🏆 <span>Acknowledgments</span>
              </h2>
              <p className="leading-relaxed">
                Special thanks to ResinRonin for the original Forza color data extraction and curation, 
                and to the Forza Motorsport series for providing the source automotive color data that 
                makes this project possible. Built with passion for the automotive and gaming communities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}