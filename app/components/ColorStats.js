import React, { useMemo, useState, useEffect } from 'react'

const ColorStats = ({ colors, favorites, colorHistory, isDarkMode }) => {
  const [currentFactIndex, setCurrentFactIndex] = useState(0)

  const funFacts = useMemo(
    () => [
      { text: 'Red cars are statistically more likely to get speeding tickets.', duration: 6000 },
      {
        text: "Ferrari's signature red is called 'Rosso Corsa' - Italian for 'Racing Red'.",
        duration: 7000,
      },
      {
        text: "Lamborghini's famous orange is officially named 'Arancio Borealis'.",
        duration: 7000,
      },
      {
        text: "McLaren's signature color 'Papaya Orange' was inspired by their 1960s F1 cars.",
        duration: 8000,
      },
      {
        text: 'Bugatti uses over 20 layers of paint to achieve their signature finish.',
        duration: 7000,
      },
      { text: 'The rarest car color is often considered to be true purple.', duration: 6000 },
      {
        text: "Matte finishes require special care - they can't be polished like regular paint!",
        duration: 8000,
      },
      { text: 'Pearlescent paints contain actual crushed pearls or mica flakes.', duration: 7000 },
      { text: 'Chrome paint can cost over $10,000 to apply professionally.', duration: 6000 },
      {
        text: 'Color-changing paints use thermochromic pigments that react to temperature.',
        duration: 9000,
      },
      { text: 'The human eye can distinguish over 10 million different colors!', duration: 7000 },
      {
        text: 'Forza Horizon games feature over 700 different car models with thousands of paint options.',
        duration: 9000,
      },
      {
        text: 'JDM cars popularized many unique color combinations like purple with gold flakes.',
        duration: 8000,
      },
      {
        text: 'Drift cars often use bright colors for better visibility during competitions.',
        duration: 8000,
      },
      {
        text: "Porsche's 'Guards Red' was originally created for fire trucks and emergency vehicles.",
        duration: 8000,
      },
      {
        text: "BMW's 'Estoril Blue' is named after the famous Portuguese racing circuit.",
        duration: 7000,
      },
      {
        text: "Audi's 'Nardo Grey' gets its name from the high-speed test track in Italy.",
        duration: 7000,
      },
      { text: "Mercedes' 'Designo' colors can add over $8,000 to a car's price.", duration: 7000 },
      {
        text: "Koenigsegg offers a 'Naked Carbon' option that shows the raw carbon fiber weave.",
        duration: 8000,
      },
      { text: 'Pagani hand-paints each car, taking over 2 weeks per vehicle.', duration: 7000 },
      {
        text: 'Rolls-Royce will match any color sample you bring them, no matter how unusual.',
        duration: 8000,
      },
      {
        text: "Bentley's 'Mulliner' division offers over 100 standard paint colors.",
        duration: 7000,
      },
      {
        text: "Lamborghini's 'Verde Mantis' glows under UV light due to special pigments.",
        duration: 8000,
      },
      { text: "Ford's 'Grabber Blue' was inspired by 1960s muscle car culture.", duration: 7000 },
      {
        text: "Chevrolet's 'Hugger Orange' was designed to stand out on the Camaro.",
        duration: 7000,
      },
      {
        text: "Dodge's 'Plum Crazy' purple was one of the most popular muscle car colors.",
        duration: 8000,
      },
      {
        text: "Honda's 'Championship White' was exclusive to Type R models for years.",
        duration: 7000,
      },
      {
        text: "Toyota's 'Solar Shift' paint changes color depending on the viewing angle.",
        duration: 8000,
      },
      {
        text: "Nissan's 'Midnight Purple' contains special flakes that shimmer in darkness.",
        duration: 8000,
      },
      {
        text: "Subaru's 'World Rally Blue' became iconic through their WRC racing success.",
        duration: 8000,
      },
      {
        text: "Mazda's 'Soul Red Crystal' uses a unique three-layer painting process.",
        duration: 7000,
      },
      {
        text: "Acura's 'Indy Yellow Pearl' was inspired by their IndyCar racing heritage.",
        duration: 8000,
      },
      {
        text: "Lexus' 'Structural Blue' mimics the wing structure of morpho butterflies.",
        duration: 8000,
      },
      {
        text: "Infiniti's 'Liquid Copper' appears to flow like molten metal in sunlight.",
        duration: 8000,
      },
      {
        text: "Tesla's 'Pearl White Multi-Coat' has 7 layers including a protective clear coat.",
        duration: 8000,
      },
      {
        text: "Rivian's 'Launch Green' was specifically created for their electric truck debut.",
        duration: 8000,
      },
      {
        text: "Lucid's 'Stellar White' contains glass flakes for a starlike sparkle effect.",
        duration: 8000,
      },
      {
        text: "Polestar's 'Thunder' grey changes from light to dark based on lighting conditions.",
        duration: 9000,
      },
      {
        text: "Genesis' 'Himalayan Grey' was inspired by the natural stone formations.",
        duration: 8000,
      },
      {
        text: "Cadillac's 'Electric Blue' uses electroluminescent particles for extra depth.",
        duration: 8000,
      },
    ],
    []
  )

  useEffect(() => {
    const currentFact = funFacts[currentFactIndex]
    if (!currentFact || typeof currentFact.duration !== 'number') return

    const timer = setTimeout(
      () => {
        setCurrentFactIndex(prev => (prev + 1) % funFacts.length)
      },
      Math.min(Math.max(currentFact.duration, 1000), 30000)
    )

    return () => clearTimeout(timer)
  }, [currentFactIndex, funFacts])

  const stats = useMemo(() => {
    const makeCount = colors.reduce((acc, color) => {
      acc[color.make] = (acc[color.make] || 0) + 1
      return acc
    }, {})

    const typeCount = colors.reduce((acc, color) => {
      if (color.colorType) {
        acc[color.colorType] = (acc[color.colorType] || 0) + 1
      }
      return acc
    }, {})

    const topMakes = Object.entries(makeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    const topTypes = Object.entries(typeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)

    return {
      totalColors: colors.length,
      totalMakes: Object.keys(makeCount).length,
      totalFavorites: favorites.length,
      totalViewed: colorHistory.length,
      topMakes,
      topTypes,
    }
  }, [colors, favorites, colorHistory])

  return (
    <div
      className={`p-6 rounded-lg border ${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}
    >
      <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
        📊 Color Statistics
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-fuchsia-500">
            {stats.totalColors.toLocaleString()}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Total Colors
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-cyan-500">{stats.totalMakes}</div>
          <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Manufacturers
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-500">{stats.totalFavorites}</div>
          <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Favorites
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500">{stats.totalViewed}</div>
          <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Viewed</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>
            Top Manufacturers
          </h3>
          {stats.topMakes.map(([make, count]) => (
            <div key={make} className="flex justify-between items-center mb-1">
              <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                {make}
              </span>
              <span
                className={`text-sm font-mono ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}
              >
                {count}
              </span>
            </div>
          ))}
        </div>

        <div>
          <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>
            Popular Types
          </h3>
          {stats.topTypes.map(([type, count]) => (
            <div key={type} className="flex justify-between items-center mb-1">
              <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                {type}
              </span>
              <span
                className={`text-sm font-mono ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}
              >
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Fun Facts */}
      <div
        className={`p-4 rounded-lg border-l-4 border-l-fuchsia-500 ${
          isDarkMode ? 'bg-slate-700/50' : 'bg-blue-50'
        }`}
      >
        <h3
          className={`font-semibold mb-2 flex items-center ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}
        >
          💡 Automotive Paint Facts
        </h3>
        <p
          className={`text-sm leading-relaxed transition-all duration-500 ${
            isDarkMode ? 'text-slate-300' : 'text-gray-700'
          }`}
        >
          {funFacts[currentFactIndex].text}
        </p>
        <div className="mt-2 flex justify-center">
          <div className="flex space-x-1">
            {funFacts.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentFactIndex
                    ? 'bg-fuchsia-500 scale-125'
                    : isDarkMode
                      ? 'bg-slate-600'
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ColorStats
