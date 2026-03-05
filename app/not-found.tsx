'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

export default function NotFound() {
  const [carPosition, setCarPosition] = useState(50)
  const [paintColor, setPaintColor] = useState('#ff0000')
  const [score, setScore] = useState(0)
  const [gameActive, setGameActive] = useState(false)
  const [paintDrops, setPaintDrops] = useState<Array<{id: number, x: number, y: number, color: string}>>([])

  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080']

  useEffect(() => {
    if (!gameActive) return

    const interval = setInterval(() => {
      setPaintDrops(prev => {
        const newDrops = prev.map(drop => ({ ...drop, y: drop.y + 5 }))
        return newDrops.filter(drop => drop.y < 400)
      })

      // Add new paint drop
      if (Math.random() < 0.3) {
        setPaintDrops(prev => [...prev, {
          id: Date.now(),
          x: Math.random() * 300,
          y: 0,
          color: colors[Math.floor(Math.random() * colors.length)]
        }])
      }
    }, 100)

    return () => clearInterval(interval)
  }, [gameActive])

  const moveCar = (direction: 'left' | 'right') => {
    setCarPosition(prev => {
      const newPos = direction === 'left' ? prev - 10 : prev + 10
      return Math.max(10, Math.min(90, newPos))
    })
  }

  const catchPaint = () => {
    const carX = (carPosition / 100) * 300
    setPaintDrops(prev => {
      const caught = prev.filter(drop => 
        Math.abs(drop.x - carX) < 30 && drop.y > 300 && drop.y < 350
      )
      if (caught.length > 0) {
        setScore(s => s + caught.length * 10)
        setPaintColor(caught[0].color)
      }
      return prev.filter(drop => 
        !(Math.abs(drop.x - carX) < 30 && drop.y > 300 && drop.y < 350)
      )
    })
  }

  useEffect(() => {
    if (gameActive) {
      const interval = setInterval(catchPaint, 50)
      return () => clearInterval(interval)
    }
  }, [gameActive, carPosition])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-red-500 to-yellow-500 text-transparent bg-clip-text">
          404
        </h1>
        <h2 className="text-2xl mb-2">🏁 Lost in the Garage!</h2>
        <p className="text-gray-300 mb-6">
          Your car got stuck in the paint booth. Help it collect colors to escape!
        </p>
      </div>

      {/* Game Area */}
      <div className="relative w-80 h-96 bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg border-4 border-gray-600 mb-6 overflow-hidden">
        {/* Paint Booth Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-600 to-gray-700">
          <div className="absolute top-0 left-0 w-full h-8 bg-gray-500 flex justify-around items-center">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-2 h-4 bg-gray-400 rounded-b"></div>
            ))}
          </div>
        </div>

        {/* Paint Drops */}
        {paintDrops.map(drop => (
          <div
            key={drop.id}
            className="absolute w-4 h-6 rounded-full animate-pulse"
            style={{
              left: `${drop.x}px`,
              top: `${drop.y}px`,
              backgroundColor: drop.color,
              boxShadow: `0 0 10px ${drop.color}`
            }}
          />
        ))}

        {/* Car */}
        <div
          className="absolute bottom-8 w-12 h-8 transition-all duration-200"
          style={{ 
            left: `${carPosition}%`,
            transform: 'translateX(-50%)'
          }}
        >
          <div 
            className="w-full h-full rounded-lg border-2 border-white transition-colors duration-300"
            style={{ backgroundColor: paintColor }}
          >
            <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded opacity-70"></div>
            <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded opacity-70"></div>
            <div className="absolute bottom-0 left-1 w-2 h-2 bg-black rounded-full"></div>
            <div className="absolute bottom-0 right-1 w-2 h-2 bg-black rounded-full"></div>
          </div>
        </div>

        {/* Game Over Overlay */}
        {!gameActive && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xl mb-4">🎮 Paint Booth Escape</p>
              <button
                onClick={() => {
                  setGameActive(true)
                  setScore(0)
                  setPaintDrops([])
                  setPaintColor('#ff0000')
                }}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Start Game
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Game Controls */}
      {gameActive && (
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => moveCar('left')}
            className="bg-gray-600 hover:bg-gray-500 px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            ← Left
          </button>
          <button
            onClick={() => moveCar('right')}
            className="bg-gray-600 hover:bg-gray-500 px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Right →
          </button>
        </div>
      )}

      {/* Score */}
      <div className="text-center mb-6">
        <p className="text-lg">
          🎨 Paint Score: <span className="font-bold text-yellow-400">{score}</span>
        </p>
        {score > 100 && (
          <p className="text-green-400 animate-bounce">🏆 Master Painter!</p>
        )}
      </div>

      {/* Navigation */}
      <div className="text-center">
        <Link 
          href="/"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 inline-block"
        >
          🏠 Back to Color Universe
        </Link>
        <p className="text-gray-400 text-sm mt-4">
          Use the arrow buttons to move your car and catch falling paint drops!
        </p>
      </div>
    </div>
  )
}