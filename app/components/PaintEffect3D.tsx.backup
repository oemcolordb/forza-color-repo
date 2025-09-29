'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import { CarColor } from '../types/color'
import * as THREE from 'three'

interface PaintEffect3DProps {
  colors: CarColor[]
  isDarkMode: boolean
}

function PaintParticles({ colors }: { colors: CarColor[] }) {
  const pointsRef = useRef<THREE.Points>(null!)
  
  const particleCount = 1000
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return pos
  }, [])

  const particleColors = useMemo(() => {
    const cols = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)]
      const hsbColor = new THREE.Color().setHSL(
        color.color1.h,
        color.color1.s,
        color.color1.b
      )
      cols[i * 3] = hsbColor.r
      cols[i * 3 + 1] = hsbColor.g
      cols[i * 3 + 2] = hsbColor.b
    }
    return cols
  }, [colors])

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.1
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.15
    }
  })

  return (
    <Points ref={pointsRef} positions={positions} colors={particleColors}>
      <PointMaterial 
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </Points>
  )
}

const PaintEffect3D: React.FC<PaintEffect3DProps> = ({ colors, isDarkMode }) => {
  return (
    <div className={`w-full h-64 rounded-lg overflow-hidden ${
      isDarkMode ? 'bg-slate-900' : 'bg-gray-100'
    }`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.6} />
        <PaintParticles colors={colors.slice(0, 50)} />
      </Canvas>
      
      <div className="absolute bottom-2 left-2 z-10">
        <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
          🎨 3D Paint Particles
        </p>
      </div>
    </div>
  )
}

export default PaintEffect3D