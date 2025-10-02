'use client'
import { useState, useEffect } from 'react'
import TokyoBackground from '../components/TokyoBackground'
import { getSecureAssetUrl } from '../lib/assetProtection'

export default function Help() {
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
              <span className={`text-xs font-mono ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>HELP SYSTEM</span>
            </div>
          </div>
          <div className="mt-4">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-yellow-400 to-red-400 text-transparent bg-clip-text">
              🔧 Help & Support
            </h1>
          </div>
        </div>
        
        <div className="space-y-8">
          {/* Dashboard - Getting Started */}
          <div className={`relative rounded-xl overflow-hidden ${
            isDarkMode ? 'bg-gradient-to-r from-slate-800 to-slate-900' : 'bg-gradient-to-r from-slate-100 to-slate-200'
          } border-2 ${isDarkMode ? 'border-blue-500/30' : 'border-blue-400/40'} p-6`}>
            <div className="absolute top-2 left-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className={`text-xs font-mono ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>GETTING STARTED</span>
              </div>
            </div>
            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                🚀 <span>Getting Started</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">🎨 Browsing Colors</h3>
                  <p className="leading-relaxed">Use the search bar to find colors by name, manufacturer, or model. Click on any color card to view detailed information including HSB values and color type.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">🔍 Filtering Results</h3>
                  <p className="leading-relaxed">Use the filter controls to narrow down results by manufacturer, color type, or other criteria. Filters can be combined for more precise searches.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">🎮 Telemetry Dashboard</h3>
                  <p className="leading-relaxed">Connect your Forza Horizon 5 game to view real-time telemetry data on the /telemetry page. Perfect for analyzing car performance.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Paint Booth - FAQ */}
          <div className={`relative rounded-xl overflow-hidden ${
            isDarkMode ? 'bg-gradient-to-r from-purple-800 to-purple-900' : 'bg-gradient-to-r from-purple-100 to-purple-200'
          } border-2 ${isDarkMode ? 'border-purple-500/30' : 'border-purple-400/40'} p-6`}>
            <div className="absolute top-2 left-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <span className={`text-xs font-mono ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>FAQ</span>
              </div>
            </div>
            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                ❓ <span>Frequently Asked Questions</span>
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">📊 How many colors are in the database?</h3>
                  <p className="leading-relaxed">Our database contains over 10,000 official automotive paint colors extracted from Forza racing games.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">💼 Can I use these colors for commercial projects?</h3>
                  <p className="leading-relaxed">The color data is provided for reference purposes. Please check with the original manufacturers for commercial usage rights.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">❤️ How do I save my favorite colors?</h3>
                  <p className="leading-relaxed">Click the heart icon on any color card to add it to your favorites. Your favorites are saved locally in your browser.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">📁 Can I export color data?</h3>
                  <p className="leading-relaxed">Yes, use the export functionality to download color information in various formats for use in design applications.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">📱 Is the site mobile-friendly?</h3>
                  <p className="leading-relaxed">Absolutely! The site is fully responsive and optimized for mobile devices with touch-friendly controls.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Control Panel - Technical Support */}
          <div className={`relative rounded-xl overflow-hidden ${
            isDarkMode ? 'bg-gradient-to-r from-green-800 to-green-900' : 'bg-gradient-to-r from-green-100 to-green-200'
          } border-2 ${isDarkMode ? 'border-green-500/30' : 'border-green-400/40'} p-6`}>
            <div className="absolute top-2 left-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className={`text-xs font-mono ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>TECHNICAL</span>
              </div>
            </div>
            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                🔧 <span>Technical Support</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">🌐 Browser Compatibility</h3>
                  <p className="leading-relaxed">We support all modern browsers including Chrome, Firefox, Safari, and Edge. For the best experience, please use the latest version of your browser.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">⚡ Performance Issues</h3>
                  <p className="leading-relaxed">If you experience slow loading, try clearing your browser cache or switching to a less resource-intensive view mode.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">🎮 Telemetry Setup</h3>
                  <p className="leading-relaxed">For Forza telemetry issues, ensure UDP port 9999 is open and Data Out is enabled in game settings. Run the fix-store script if using Microsoft Store version.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Showroom - Contact */}
          <div className={`relative rounded-xl overflow-hidden ${
            isDarkMode ? 'bg-gradient-to-r from-yellow-800 to-yellow-900' : 'bg-gradient-to-r from-yellow-100 to-yellow-200'
          } border-2 ${isDarkMode ? 'border-yellow-500/30' : 'border-yellow-400/40'} p-6`}>
            <div className="absolute top-2 left-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className={`text-xs font-mono ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>CONTACT</span>
              </div>
            </div>
            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                📞 <span>Contact Us</span>
              </h2>
              <p className="leading-relaxed mb-4">
                Need additional help? We're here to assist you:
              </p>
              <ul className="space-y-2">
                <li>📧 Email: julian.penning1@gmail.com</li>
                <li>🐙 GitHub: Report bugs and feature requests</li>
                <li>💬 Discord: Community support and discussions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}