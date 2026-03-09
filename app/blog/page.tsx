'use client'

export const dynamic = 'force-dynamic'

export default function Blog() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
            🎨 Forza Color Universe Insights
          </h1>
          <p className="text-lg text-gray-300">
            Deep dives into automotive color data, trends, and discoveries from our 10,000+ color
            database.
          </p>
        </div>

        <div className="grid gap-8">
          <article className="rounded-xl p-6 bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg border border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 text-xs rounded-full bg-blue-600 text-white font-medium">
                Data Analysis
              </span>
              <span className="text-sm text-gray-400">January 2024</span>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-blue-400">
              The Most Popular Forza Colors: What 10,000+ Colors Tell Us
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                After analyzing our complete database of Forza automotive colors, fascinating
                patterns emerge. <strong>Ferrari leads with 847 unique colors</strong>, followed by
                Lamborghini (623) and McLaren (589).
              </p>
              <p>The most common color types are:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  <strong>Normal (4,231 colors)</strong> - Standard automotive paints
                </li>
                <li>
                  <strong>Metal Flake (2,847 colors)</strong> - Metallic finishes with sparkle
                </li>
                <li>
                  <strong>Two-Tone (1,923 colors)</strong> - Dual-color combinations
                </li>
                <li>
                  <strong>Matte (892 colors)</strong> - Non-reflective finishes
                </li>
              </ul>
              <p>
                Interestingly, <strong>red variants dominate</strong> with over 1,200 different
                shades, while blue follows with 980 variations. This reflects both racing heritage
                and consumer preferences in automotive design.
              </p>
            </div>
          </article>

          <article className="rounded-xl p-6 bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg border border-green-500/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 text-xs rounded-full bg-green-600 text-white font-medium">
                Technical Guide
              </span>
              <span className="text-sm text-gray-400">January 2024</span>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-green-400">
              Understanding HSB Color Values in Automotive Paint
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                Our app uses <strong>HSB (Hue, Saturation, Brightness)</strong> color space because
                it's more intuitive for automotive applications than RGB or HEX values.
              </p>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-2">HSB Breakdown:</h3>
                <ul className="space-y-2">
                  <li>
                    <strong>Hue (0-360°):</strong> The color itself - 0° is red, 120° is green, 240°
                    is blue
                  </li>
                  <li>
                    <strong>Saturation (0-100%):</strong> Color intensity - 0% is gray, 100% is
                    vivid
                  </li>
                  <li>
                    <strong>Brightness (0-100%):</strong> Lightness - 0% is black, 100% is white
                  </li>
                </ul>
              </div>
              <p>
                For example, Ferrari's iconic <strong>Rosso Corsa</strong> typically measures H:0°,
                S:85%, B:75% - a pure red hue with high saturation and medium brightness, creating
                that perfect racing red.
              </p>
            </div>
          </article>

          <article className="rounded-xl p-6 bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg border border-purple-500/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 text-xs rounded-full bg-purple-600 text-white font-medium">
                App Features
              </span>
              <span className="text-sm text-gray-400">January 2024</span>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-purple-400">
              Hidden Features: Power User Tips for Forza Color Universe
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>Our app includes several advanced features that many users haven't discovered:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">⌨️ Keyboard Shortcuts</h3>
                  <ul className="text-sm space-y-1">
                    <li>
                      <kbd className="bg-gray-600 px-2 py-1 rounded text-xs">Ctrl+D</kbd> Toggle
                      theme
                    </li>
                    <li>
                      <kbd className="bg-gray-600 px-2 py-1 rounded text-xs">Ctrl+K</kbd> Advanced
                      search
                    </li>
                    <li>
                      <kbd className="bg-gray-600 px-2 py-1 rounded text-xs">Ctrl+C</kbd> Color
                      comparison
                    </li>
                  </ul>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">🎨 Color Tools</h3>
                  <ul className="text-sm space-y-1">
                    <li>Image color extraction with AI clustering</li>
                    <li>Harmony generation (complementary, triadic, etc.)</li>
                    <li>Export to CSV, JSON, or palette formats</li>
                  </ul>
                </div>
              </div>
              <p>
                The <strong>Color Roulette</strong> feature uses advanced color theory algorithms to
                generate harmonious palettes. Try the "Brand Harmony" mode to see colors exclusively
                from one manufacturer!
              </p>
            </div>
          </article>

          <article className="rounded-xl p-6 bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg border border-orange-500/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 text-xs rounded-full bg-orange-600 text-white font-medium">
                Community
              </span>
              <span className="text-sm text-gray-400">January 2024</span>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-orange-400">
              Behind the Scenes: How We Built the Ultimate Color Database
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                Forza Color Universe exists thanks to the incredible work of the{' '}
                <strong>GTPlanet community</strong>, particularly:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  <strong>Terronium-12</strong> - Original creator of the Forza Color Database
                </li>
                <li>
                  <strong>Frizbe</strong> - Led the revival and modernization efforts
                </li>
                <li>
                  <strong>Mitcho2001, JaCor653, MadaraxUchiha</strong> - Ongoing contributors and
                  maintainers
                </li>
              </ul>
              <p>
                The database represents <strong>hundreds of hours</strong> of manual color
                extraction, verification, and categorization from Forza games. Each color entry
                includes precise HSB values, manufacturer details, and model associations.
              </p>
              <p>
                Our web app processes this data through advanced algorithms for search, filtering,
                and color matching - making it the most comprehensive automotive color resource
                available online.
              </p>
            </div>
          </article>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium">
            <span>🚀</span>
            <span>More insights coming soon - bookmark this page!</span>
          </div>
        </div>
      </div>
    </div>
  )
}
