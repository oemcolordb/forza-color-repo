'use client'
import { useState, useEffect } from 'react'
import TokyoBackground from '../components/TokyoBackground'
import { getSecureAssetUrl } from '../lib/assetProtection'

export default function Contact() {
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
              <span className={`text-xs font-mono ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>CONTACT SYSTEM</span>
            </div>
          </div>
          <div className="mt-4">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-yellow-400 to-red-400 text-transparent bg-clip-text">
              🔧 Contact & Support
            </h1>
            <p className="leading-relaxed">
              Get in touch for support, feedback, or collaboration opportunities.
            </p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Dashboard - Contact Info */}
          <div className={`relative rounded-xl overflow-hidden ${
            isDarkMode ? 'bg-gradient-to-r from-slate-800 to-slate-900' : 'bg-gradient-to-r from-slate-100 to-slate-200'
          } border-2 ${isDarkMode ? 'border-blue-500/30' : 'border-blue-400/40'} p-6`}>
            <div className="absolute top-2 left-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className={`text-xs font-mono ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>COMMUNICATION</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  📧 <span>Direct Contact</span>
                </h3>
                <a href="mailto:julian.penning1@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline text-lg">
                  julian.penning1@gmail.com
                </a>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Response usually within 24-48 hours
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  💰 <span>Support Development</span>
                </h3>
                <a 
                  href="https://www.paypal.com/paypalme/julianpenning1" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💳 PayPal Donation
                </a>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Help keep the project running and support new features
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  🌐 <span>Social Media</span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  <a href="https://twitter.com" className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors" target="_blank" rel="noopener noreferrer">
                    🐦 Twitter placeholder
                  </a>
                  <a href="https://github.com" className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors" target="_blank" rel="noopener noreferrer">
                    🐙 GitHub placeholder
                  </a>
                  <a href="https://discord.com" className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors" target="_blank" rel="noopener noreferrer">
                    💬 Discord placeholder
                  </a>
                  <a href="https://youtube.com" className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors" target="_blank" rel="noopener noreferrer">
                    📺 YouTube placeholder
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Control Panel - Support Info */}
          <div className={`relative rounded-xl overflow-hidden ${
            isDarkMode ? 'bg-gradient-to-r from-green-800 to-green-900' : 'bg-gradient-to-r from-green-100 to-green-200'
          } border-2 ${isDarkMode ? 'border-green-500/30' : 'border-green-400/40'} p-6`}>
            <div className="absolute top-2 left-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className={`text-xs font-mono ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>SUPPORT MATRIX</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  🔧 <span>Technical Support</span>
                </h3>
                <ul className="space-y-1 text-sm">
                  <li>• Website functionality issues</li>
                  <li>• Performance problems</li>
                  <li>• Browser compatibility</li>
                  <li>• Telemetry setup assistance</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  🎨 <span>Color Data</span>
                </h3>
                <ul className="space-y-1 text-sm">
                  <li>• Missing color information</li>
                  <li>• Data export questions</li>
                  <li>• Color matching assistance</li>
                  <li>• API usage inquiries</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  💡 <span>General Inquiries</span>
                </h3>
                <ul className="space-y-1 text-sm">
                  <li>• Feature suggestions</li>
                  <li>• Partnership opportunities</li>
                  <li>• Collaboration requests</li>
                  <li>• General feedback</li>
                </ul>
              </div>
              
              <div className={`mt-6 p-4 rounded-lg ${
                isDarkMode ? 'bg-green-900/40' : 'bg-green-50'
              }`}>
                <h3 className="text-lg font-medium mb-2">⏱️ Response Times</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Email: 24-48 hours</li>
                  <li>• Bug reports: 1-4 days</li>
                  <li>• Feature requests: 1 week</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}