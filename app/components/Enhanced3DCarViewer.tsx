'use client'

import React, { useState, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

interface Enhanced3DCarViewerProps {
  color: { h: number; s: number; b: number }
  isDarkMode: boolean
}

function CarModel({ color, rimColor, interiorColor }: any) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  const carColor = new THREE.Color().setHSL(color.h, color.s, color.b)
  const rimColorObj = new THREE.Color().setHSL(rimColor.h, rimColor.s, rimColor.b)

  return (
    <group>
      {/* Car Body */}
      <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[2, 0.8, 4]} />
        <meshStandardMaterial
          color={carColor}
          metalness={0.8}
          roughness={0.2}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Car Top */}
      <mesh position={[0, 1.2, -0.3]} castShadow>
        <boxGeometry args={[1.6, 0.6, 2]} />
        <meshStandardMaterial
          color={carColor}
          metalness={0.8}
          roughness={0.2}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Wheels */}
      {[[-0.8, 0, 1.2], [0.8, 0, 1.2], [-0.8, 0, -1.2], [0.8, 0, -1.2]].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.3, 32]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.25, 0.25, 0.32, 32]} />
            <meshStandardMaterial color={rimColorObj} metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Windows */}
      <mesh position={[0, 1.2, 0.5]}>
        <boxGeometry args={[1.5, 0.5, 0.1]} />
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 1.2, -1.1]}>
        <boxGeometry args={[1.5, 0.5, 0.1]} />
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

export default function Enhanced3DCarViewer({ color, isDarkMode }: Enhanced3DCarViewerProps) {
  const [lightingPreset, setLightingPreset] = useState<'studio' | 'sunset' | 'night' | 'warehouse'>('studio')
  const [rimColor, setRimColor] = useState({ h: 0, s: 0, b: 0.2 })
  const [interiorColor, setInteriorColor] = useState({ h: 0, s: 0, b: 0.1 })
  const [showCustomization, setShowCustomization] = useState(false)
  const [uploadedDecal, setUploadedDecal] = useState<string | null>(null)

  const handleDecalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedDecal(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className={`rounded-xl overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
      {/* 3D Canvas */}
      <div className="relative h-96">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[5, 3, 5]} />
          <Suspense fallback={null}>
            <CarModel color={color} rimColor={rimColor} interiorColor={interiorColor} />
            <Environment preset={lightingPreset} />
            <ContactShadows position={[0, -0.5, 0]} opacity={0.5} scale={10} blur={2} />
            <OrbitControls
              enablePan={false}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 2}
              minDistance={4}
              maxDistance={10}
            />
          </Suspense>
        </Canvas>

        {/* Lighting Controls */}
        <div className="absolute top-4 left-4 space-y-2">
          <div className={`px-3 py-2 rounded-lg ${isDarkMode ? 'bg-slate-900/80' : 'bg-white/80'} backdrop-blur`}>
            <div className="text-xs font-semibold mb-2">Lighting</div>
            <div className="flex gap-2">
              {(['studio', 'sunset', 'night', 'warehouse'] as const).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setLightingPreset(preset)}
                  className={`px-2 py-1 text-xs rounded ${
                    lightingPreset === preset
                      ? 'bg-blue-600 text-white'
                      : isDarkMode
                      ? 'bg-slate-700 text-gray-300'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Customization Toggle */}
        <button
          onClick={() => setShowCustomization(!showCustomization)}
          className="absolute top-4 right-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          🎨 Customize
        </button>
      </div>

      {/* Customization Panel */}
      {showCustomization && (
        <div className={`p-6 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Customization Options
          </h3>

          {/* Rim Color */}
          <div className="mb-4">
            <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Rim Color
            </label>
            <div className="flex gap-2">
              {[
                { h: 0, s: 0, b: 0.2, name: 'Black' },
                { h: 0, s: 0, b: 0.8, name: 'Silver' },
                { h: 0.1, s: 0.8, b: 0.5, name: 'Gold' },
                { h: 0, s: 0.8, b: 0.3, name: 'Bronze' },
              ].map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setRimColor(preset)}
                  className={`w-12 h-12 rounded border-2 ${
                    rimColor === preset ? 'border-blue-500' : 'border-gray-300'
                  }`}
                  style={{
                    background: `hsl(${preset.h * 360}, ${preset.s * 100}%, ${preset.b * 100}%)`
                  }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>

          {/* Interior Color */}
          <div className="mb-4">
            <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Interior Color
            </label>
            <div className="flex gap-2">
              {[
                { h: 0, s: 0, b: 0.1, name: 'Black' },
                { h: 0, s: 0, b: 0.5, name: 'Gray' },
                { h: 0.05, s: 0.5, b: 0.4, name: 'Tan' },
                { h: 0, s: 0.7, b: 0.3, name: 'Red' },
              ].map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setInteriorColor(preset)}
                  className={`w-12 h-12 rounded border-2 ${
                    interiorColor === preset ? 'border-blue-500' : 'border-gray-300'
                  }`}
                  style={{
                    background: `hsl(${preset.h * 360}, ${preset.s * 100}%, ${preset.b * 100}%)`
                  }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>

          {/* Decal Upload */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Upload Decal/Pattern
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleDecalUpload}
              className={`block w-full text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              } file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700`}
            />
            {uploadedDecal && (
              <div className="mt-2">
                <img src={uploadedDecal} alt="Decal preview" className="w-20 h-20 object-cover rounded" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
