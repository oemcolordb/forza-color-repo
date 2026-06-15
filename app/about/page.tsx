'use client'




import { useState, useEffect, useRef } from 'react'
import TokyoBackground from '@/components/backgrounds/TokyoBackground'
import { getSecureAssetUrl } from '@/lib/utils/assetProtection'

export default function About() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  // 🌿 secret: click the title 4 times to reveal the stash
  const [blazeCount, setBlazeCount] = useState(0)
  const [showStash, setShowStash] = useState(false)
  const blazeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    setIsDarkMode(savedTheme !== 'light')
  }, [])

  const handleTitleClick = () => {
    const next = blazeCount + 1
    setBlazeCount(next)
    if (blazeTimer.current) clearTimeout(blazeTimer.current)
    if (next >= 4) {
      setShowStash(true)
      setBlazeCount(0)
    } else {
      blazeTimer.current = setTimeout(() => setBlazeCount(0), 2000)
    }
  }

  return (
    <div
      className={`min-h-screen ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
    >
      <TokyoBackground isDarkMode={isDarkMode} getSecureAssetUrl={getSecureAssetUrl} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
        {/* Engine Bay - Header */}
        <div
          className={`relative mb-8 rounded-xl overflow-hidden p-6 ${
            isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'
          }`}
        >
          <div className="absolute top-2 left-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span
                className={`text-xs font-mono ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}
              >
                ABOUT SYSTEM
              </span>
            </div>
          </div>
          <div className="mt-4">
            <h1
              className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-yellow-400 to-red-400 text-transparent bg-clip-text cursor-default select-none"
              onClick={handleTitleClick}
              title={blazeCount > 0 ? `${4 - blazeCount} more…` : undefined}
            >
              🏁 About Forza Color Universe
              {/* subtle leaf hint that only appears after first click */}
              {blazeCount > 0 && (
                <span className="ml-2 text-green-500 text-2xl align-middle animate-leaf-sway inline-block" aria-hidden>
                  {'🌿'.repeat(blazeCount)}
                </span>
              )}
            </h1>
          </div>

          {/* 🌿 Secret stash — revealed after 4 title clicks */}
          {showStash && (
            <div
              className="mt-4 rounded-xl p-5 border border-green-500/40 bg-green-950/60 backdrop-blur-sm text-green-300 animate-420-slide-in"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl animate-leaf-spin inline-block">🌿</span>
                <div>
                  <div className="text-lg font-bold text-green-400">you found the stash 😎</div>
                  <div className="text-xs opacity-70">↑↑↓↓←→←→BA for the full experience</div>
                </div>
                <span className="text-4xl animate-leaf-spin-slow inline-block ml-auto">🍃</span>
              </div>
              <blockquote className="text-sm italic opacity-80 border-l-2 border-green-500/50 pl-3">
                "The best color in the world is the one that looks good on your car." — Some wise tuner, probably at 4:20
              </blockquote>
              <button
                onClick={() => setShowStash(false)}
                className="mt-3 text-xs text-green-600 hover:text-green-400 transition-colors"
              >
                put it away
              </button>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {/* Dashboard - Mission */}
          <div
            className={`relative rounded-xl overflow-hidden p-6 ${
              isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'
            }`}
          >
            <div className="absolute top-2 left-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span
                  className={`text-xs font-mono ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
                >
                  MISSION
                </span>
              </div>
            </div>
            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                🎯 <span>Our Mission</span>
              </h2>
              <p className="text-lg leading-relaxed">
                Forza Color Universe is the most comprehensive digital catalog of automotive paint
                colors extracted from the Forza racing game series. We preserve and make accessible
                over 10,000 official automotive colors for enthusiasts, designers, and developers
                worldwide.
              </p>
            </div>
          </div>

          {/* Paint Booth - Features */}
          <div
            className={`relative rounded-xl overflow-hidden p-6 ${
              isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'
            }`}
          >
            <div className="absolute top-2 left-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <span
                  className={`text-xs font-mono ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}
                >
                  FEATURES
                </span>
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
          <div
            className={`relative rounded-xl overflow-hidden p-6 ${
              isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'
            }`}
          >
            <div className="absolute top-2 left-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span
                  className={`text-xs font-mono ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}
                >
                  TECHNOLOGY
                </span>
              </div>
            </div>
            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                🔧 <span>Technology Stack</span>
              </h2>
              <p className="leading-relaxed">
                Built with modern web technologies including Next.js, TypeScript, and Tailwind CSS.
                Features real-time UDP telemetry processing, advanced color analysis algorithms, and
                performance optimizations like virtual scrolling for handling massive datasets
                efficiently.
              </p>
            </div>
          </div>

          {/* Paint Guide - How to Use */}
          <div
            className={`relative rounded-xl overflow-hidden p-6 ${
              isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'
            }`}
          >
            <div className="absolute top-2 left-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
                <span
                  className={`text-xs font-mono ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`}
                >
                  PAINT GUIDE
                </span>
              </div>
            </div>
            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                🎨 <span>Step-by-Step Guide to Creating Pearlescent Effects in FH5</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">1. Enter the Paint & Design Menu</h3>
                  <p className="text-sm opacity-90">
                    Go to your Garage → Upgrades & Tuning → Paint Car. Select Body Paint to start
                    customizing.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">2. Choose a Base Color</h3>
                  <p className="text-sm opacity-90">
                    Pick a solid or metallic base that will act as your "undercoat." Darker bases
                    (like black, navy, or deep purple) make pearlescent highlights pop more.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">3. Apply a Special Finish</h3>
                  <p className="text-sm opacity-90">
                    Select Polished Metal or Aluminum finishes. These reflect light differently and
                    give you that shimmering depth. Adjust the brightness and saturation to control
                    how strong the effect looks.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">4. Use Two-Tone or Dual-Color Fine Tuning</h3>
                  <p className="text-sm opacity-90">
                    In the Advanced Color Editor, you can fine-tune both the highlight and lowlight
                    colors. For a pearlescent effect, make the highlight a bright, contrasting color
                    (like teal over black, or pink over purple). Keep the lowlight close to your
                    base color for subtle blending.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">5. Experiment with Layers & Vinyls</h3>
                  <p className="text-sm opacity-90">
                    Add transparent gradient vinyls with different hues. This can mimic the
                    "color-shift" effect of real pearlescent paint.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">6. Test in Different Lighting</h3>
                  <p className="text-sm opacity-90">
                    Drive your car in daylight, sunset, and night to see how the paint reacts.
                    Pearlescent effects look best under changing light.
                  </p>
                </div>
                <div
                  className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'}`}
                >
                  <p className="text-sm font-medium">
                    ✅ Pro Tip: The best pearlescent looks come from contrast—dark base + bright
                    highlight. For example, black with teal highlights or deep purple with pink
                    highlights creates that "color-shift" magic.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Showroom - Acknowledgments */}
          <div
            className={`relative rounded-xl overflow-hidden p-6 ${
              isDarkMode ? 'bamboo-surface-dark' : 'bamboo-surface'
            }`}
          >
            <div className="absolute top-2 left-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                <span
                  className={`text-xs font-mono ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}
                >
                  CREDITS
                </span>
              </div>
            </div>
            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                🏆 <span>Acknowledgments</span>
              </h2>
              <p className="leading-relaxed">
                Credits: To the GTPlanet community, with special thanks to Terronium-12 (original
                creator), Frizbe (revival), and ongoing contributors Mitcho2001, JaCor653, and
                MadaraxUchiha, whose dedication built and maintained the Forza Color Database
                Spreadsheet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
