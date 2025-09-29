'use client'

import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { CarColor } from '../types/color'
import * as THREE from 'three'

interface Car3DProps {
  color: CarColor
  isDarkMode: boolean
}

function CarModel({ color }: { color: CarColor }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  
  useFrame((state) => {
    meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
  })

  const hsbToHex = (h: number, s: number, b: number) => {
    const c = b * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = b - c
    let r = 0, g = 0, bl = 0

    if (h >= 0 && h < 60) { r = c; g = x; bl = 0 }
    else if (h >= 60 && h < 120) { r = x; g = c; bl = 0 }
    else if (h >= 120 && h < 180) { r = 0; g = c; bl = x }
    else if (h >= 180 && h < 240) { r = 0; g = x; bl = c }
    else if (h >= 240 && h < 300) { r = x; g = 0; bl = c }
    else if (h >= 300 && h < 360) { r = c; g = 0; bl = x }

    return new THREE.Color(
      (r + m),
      (g + m), 
      (bl + m)
    )
  }

  const paintColor = hsbToHex(color.color1.h * 360, color.color1.s, color.color1.b)
  const isMetallic = color.colorType?.toLowerCase().includes('metal')

  return (
    <group>
      {/* Car Body */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[4, 1.5, 2]} />
        <meshStandardMaterial 
          color={paintColor}
          metalness={isMetallic ? 0.8 : 0.1}
          roughness={isMetallic ? 0.2 : 0.7}
          envMapIntensity={1}
        />
      </mesh>
      
      {/* Car Roof */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[3, 1, 1.8]} />
        <meshStandardMaterial 
          color={paintColor}
          metalness={isMetallic ? 0.8 : 0.1}
          roughness={isMetallic ? 0.2 : 0.7}
        />
      </mesh>

      {/* Wheels */}
      {[-1.5, 1.5].map((x, i) => (
        <group key={i}>
          <mesh position={[x, -0.8, 1]}>
            <cylinderGeometry args={[0.4, 0.4, 0.3]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[x, -0.8, -1]}>
            <cylinderGeometry args={[0.4, 0.4, 0.3]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </group>
      ))}

      {/* Headlights */}
      <mesh position={[2.1, 0.2, 0.7]}>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[2.1, 0.2, -0.7]}>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

const Car3DViewer: React.FC<Car3DProps> = ({ color, isDarkMode }) => {
  const [autoRotate, setAutoRotate] = useState(true)

  return (
    <div className={`w-full h-96 rounded-lg overflow-hidden ${
      isDarkMode ? 'bg-slate-900' : 'bg-gray-100'
    }`}>
      <Canvas camera={{ position: [5, 3, 5], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <CarModel color={color} />
        
        <OrbitControls 
          autoRotate={autoRotate}
          autoRotateSpeed={2}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minDistance={3}
          maxDistance={10}
        />
        
        <Environment preset="sunset" />
      </Canvas>
      
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-3 py-1 text-xs rounded transition-colors ${
            isDarkMode
              ? 'bg-slate-700 text-white hover:bg-slate-600'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {autoRotate ? '⏸️ Pause' : '▶️ Rotate'}
        </button>
      </div>
    </div>
  )
}

export default Car3DViewer