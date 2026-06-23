'use client'

import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { CarColor } from '@/types'
import { normalizeColorType, hsbToHex } from '@/lib/utils/colorUtils'

interface WebGLPaintPreviewProps {
  color: CarColor
}

class HDRIErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error: Error) {
    console.warn('HDRI environment failed to load:', error)
  }
  render() {
    if (this.state.hasError) return <Environment files="/hdri/studio_small_03_1k.hdr" />
    return this.props.children
  }
}

// ─── Model Configurations ────────────────────────────────────────────────────
interface ModelConfig {
  id: string
  name: string
  path: string
  bodyMeshes: Set<string>
  glassMeshes: Set<string>
  bodyMaterials: Set<string>
  glassMaterials: Set<string>
}

const MODEL_CONFIGS: Record<string, ModelConfig> = {
  lancer: {
    id: 'lancer',
    name: 'Lancer Evo X',
    path: '/models/lancer-evo/lancer-evo.glb',
    bodyMeshes: new Set([
      'Body', 'BumperF', 'BumperR', 'FenderL', 'FenderR',
      'Hood', 'Trunk', 'DoorL', 'DoorR', 'DoorRL', 'DoorRR',
      'SkirtL', 'SkirtR', 'Spoiler', 'Base', 'MirrorL', 'MirrorR',
    ]),
    glassMeshes: new Set([
      'WindF', 'WindR', 'WindFL', 'WindFR', 'WindRL', 'WindRR',
      'BLightLG', 'HLightLG', 'HLightRG', 'BLightRG',
    ]),
    bodyMaterials: new Set<string>(),
    glassMaterials: new Set<string>(),
  },
  porsche: {
    id: 'porsche',
    name: 'Porsche 911 (1975)',
    path: '/models/free-1975-porsche-911-930-turbo/free_1975_porsche_911_930_turbo.glb',
    bodyMeshes: new Set<string>(),
    glassMeshes: new Set<string>(),
    bodyMaterials: new Set(['paint', 'coat']),
    glassMaterials: new Set(['glass']),
  },
  nissan: {
    id: 'nissan',
    name: 'Nissan Sentra (2019)',
    path: '/models/2019_nissan_sentra_nismo.glb',
    bodyMeshes: new Set<string>(),
    glassMeshes: new Set<string>(),
    bodyMaterials: new Set(['material_4', 'material_5']),
    glassMaterials: new Set(['material_3']),
  },
}

// Tyre primitive material names baked into the GLB
const TYRE_MATERIAL_NAMES = new Set(['Tire', 'Black'])

// Shared fixed materials (never change)
const glassMat = new THREE.MeshPhysicalMaterial({
  color: '#0a0e18', roughness: 0.02, metalness: 0.1,
  transmission: 0.85, transparent: true, opacity: 0.35,
})
const tyreMat = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.9, metalness: 0.0 })
const rimMat  = new THREE.MeshStandardMaterial({ color: '#c0c0c0', metalness: 0.95, roughness: 0.08 })
const neutralMat = new THREE.MeshStandardMaterial({ color: '#2a2a2a', roughness: 0.6, metalness: 0.3 })

function buildPaintMaterial(paintProps: Record<string, any>): THREE.MeshPhysicalMaterial {
  const mat = new THREE.MeshPhysicalMaterial()
  // Set color first so specularColor/sheenColor (THREE.Color objects) work correctly
  mat.color = new THREE.Color(paintProps.color)
  mat.roughness          = paintProps.roughness          ?? 0.15
  mat.metalness          = paintProps.metalness          ?? 0.0
  mat.clearcoat          = paintProps.clearcoat          ?? 0.0
  mat.clearcoatRoughness = paintProps.clearcoatRoughness ?? 0.0
  if (paintProps.specularColor)  mat.specularColor  = paintProps.specularColor
  if (paintProps.specularIntensity !== undefined) mat.specularIntensity = paintProps.specularIntensity
  if (paintProps.sheen !== undefined)       mat.sheen       = paintProps.sheen
  if (paintProps.sheenColor)                mat.sheenColor  = paintProps.sheenColor
  if (paintProps.sheenRoughness !== undefined) mat.sheenRoughness = paintProps.sheenRoughness
  return mat
}

function CarModel({ paintProps, config }: { paintProps: Record<string, any>; config: ModelConfig }) {
  const { scene } = useGLTF(config.path)
  const paintMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null)

  // Build the scene clone when the model loads or changes
  const cloned = useMemo(() => {
    const clone = scene.clone(true)
    const paint = buildPaintMaterial(paintProps)
    paintMatRef.current = paint

    console.log('[3D] Building scene clone. Model:', config.name, 'Paint color:', paintProps.color)

    const bodyHits: string[] = []
    const allMeshNames: string[] = []

    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      const meshName = child.name || ''
      allMeshNames.push(meshName)
      const origMatName: string = Array.isArray(child.material)
        ? (child.material[0]?.name ?? '')
        : (child.material?.name ?? '')

      const cleanMeshName = meshName.replace(/_?\d+$/, '')
      const cleanMatName = origMatName.toLowerCase().trim()

      const isGlass = config.glassMeshes.has(cleanMeshName) || config.glassMaterials.has(cleanMatName)
      const isBody = config.bodyMeshes.has(cleanMeshName) || config.bodyMeshes.has(meshName) || config.bodyMaterials.has(cleanMatName)

      // Log mesh + material details for debugging/mapping purposes
      console.log(`[3D Debug] Model: "${config.id}", Mesh: "${meshName}", Material: "${origMatName}" | Body: ${isBody}, Glass: ${isGlass}`)

      if (isGlass) {
        child.material = glassMat
      } else if (isBody) {
        child.material = paint
        bodyHits.push(meshName)
      } else if (meshName.startsWith('Tire') || cleanMeshName.startsWith('Tire')) {
        child.material = TYRE_MATERIAL_NAMES.has(origMatName) ? tyreMat : rimMat
      } else {
        child.material = neutralMat
      }

      child.castShadow = true
      child.receiveShadow = true
    })

    console.log('[3D] All mesh names in scene:', allMeshNames)
    console.log('[3D] Body meshes painted:', bodyHits)

    // Auto-center & auto-scale based on bounding box
    const box    = new THREE.Box3().setFromObject(clone)
    const size   = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale  = maxDim > 0 ? 3.2 / maxDim : 1
    clone.scale.set(scale, scale, scale)
    clone.position.set(-center.x * scale, -center.y * scale + 0.02, -center.z * scale)

    return clone
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, config.id]) // re-clone only when scene changes or model id changes

  // Mutate existing paint material when color changes — no re-clone needed
  useEffect(() => {
    const paint = paintMatRef.current
    if (!paint) return
    paint.color.set(paintProps.color)
    paint.roughness          = paintProps.roughness          ?? 0.15
    paint.metalness          = paintProps.metalness          ?? 0.0
    paint.clearcoat          = paintProps.clearcoat          ?? 0.0
    paint.clearcoatRoughness = paintProps.clearcoatRoughness ?? 0.0
    if (paintProps.specularColor)  paint.specularColor.copy(paintProps.specularColor)
    if (paintProps.specularIntensity !== undefined) paint.specularIntensity = paintProps.specularIntensity
    paint.sheen          = paintProps.sheen          ?? 0.0
    if (paintProps.sheenColor)     paint.sheenColor.copy(paintProps.sheenColor)
    paint.sheenRoughness = paintProps.sheenRoughness ?? 0.0
    paint.needsUpdate = true
  }, [paintProps])

  console.log('[3D] Model rendered! Paint props:', paintProps)
  return <primitive object={cloned} />
}

function LancerEvoFallback() {
  return (
    <mesh>
      <boxGeometry args={[1.5, 0.4, 3.5]} />
      <meshStandardMaterial color="#333" />
    </mesh>
  )
}

function CarWrapper({ color, modelConfig }: { color: CarColor; modelConfig: ModelConfig }) {
  const carGroupRef = useRef<THREE.Group>(null)

  useFrame((_state, delta) => {
    // Stopped auto-rotation per user request
  })

  // Derive THREE.js-ready paint properties from the Forza color
  const paintProps = useMemo(() => {
    const rawType  = color.colorType || ''
    const normType = normalizeColorType(rawType)
    const t = (normType + ' ' + (color.colorName || '')).toLowerCase()

    const c1 = color.color1 || { h: 0, s: 0, b: 0 }
    const c2 = color.color2 || color.color1 || { h: 0, s: 0, b: 0 }

    // Use the same hsbToHex as the 2D swatches (validated, 0-1 normalized inputs)
    const hex1 = hsbToHex(c1.h, c1.s, c1.b)
    const hex2 = hsbToHex(c2.h, c2.s, c2.b)

    const paintProfiles: Record<string, Record<string, number>> = {
      'solid':             { roughness: 0.15, metalness: 0.0,  clearcoat: 1.0 },
      'gloss':             { roughness: 0.05, metalness: 0.1,  clearcoat: 1.0,  clearcoatRoughness: 0.02 },
      'matte':             { roughness: 0.95, metalness: 0.0,  clearcoat: 0.0,  clearcoatRoughness: 1.0 },
      'semigloss':         { roughness: 0.45, metalness: 0.0,  clearcoat: 0.1 },
      'brushed':           { roughness: 0.35, metalness: 1.0,  clearcoat: 0.0 },
      'metallic':          { roughness: 0.20, metalness: 0.65, clearcoat: 1.0,  clearcoatRoughness: 0.05 },
      'polished':          { roughness: 0.08, metalness: 0.9,  clearcoat: 1.0 },
      'chrome':            { roughness: 0.0,  metalness: 1.0,  clearcoat: 0.0 },
      'metal-flake':       { roughness: 0.25, metalness: 0.1,  clearcoat: 1.0,  clearcoatRoughness: 0.15 },
      'metal flake':       { roughness: 0.25, metalness: 0.1,  clearcoat: 1.0,  clearcoatRoughness: 0.15 },
      'candy':             { roughness: 0.05, metalness: 0.1,  clearcoat: 1.0,  clearcoatRoughness: 0.0 },
      'pearl':             { roughness: 0.1,  metalness: 0.05, clearcoat: 1.0,  clearcoatRoughness: 0.05 },
      'carbon-fiber':      { roughness: 0.6,  metalness: 0.2,  clearcoat: 1.0,  clearcoatRoughness: 0.1 },
      'carbon fiber':      { roughness: 0.6,  metalness: 0.2,  clearcoat: 1.0,  clearcoatRoughness: 0.1 },
      'kevlar':            { roughness: 0.65, metalness: 0.15, clearcoat: 0.8,  clearcoatRoughness: 0.2 },
      'damascus':          { roughness: 0.4,  metalness: 0.8,  clearcoat: 0.5 },
      'two-tone':          { roughness: 0.1,  metalness: 0.05, clearcoat: 1.0 },
      'two-tone-matte':    { roughness: 0.9,  metalness: 0.0,  clearcoat: 0.0,  clearcoatRoughness: 1.0 },
      'two-tone-polished': { roughness: 0.08, metalness: 0.05, clearcoat: 1.0 },
      'two-tone-semigloss':{ roughness: 0.4,  metalness: 0.05, clearcoat: 0.1 },
    }

    const matchedKey = Object.keys(paintProfiles)
      .sort((a, b) => b.length - a.length)
      .find(key => t.includes(key))

    const profile = matchedKey ? paintProfiles[matchedKey] : paintProfiles['solid']
    const props: Record<string, any> = { color: hex1, ...profile }

    if (t.includes('two') || t.includes('pearl') || t.includes('flake') || t.includes('metal') || t.includes('metallic')) {
      props.specularColor     = new THREE.Color(hex2)
      props.specularIntensity = profile.roughness > 0.5 ? 0.2 : profile.roughness > 0.3 ? 0.4 : 1.0
      props.sheen             = 1.0
      props.sheenColor        = new THREE.Color(hex2)
      props.sheenRoughness    = profile.roughness
    }

    return props
  }, [color])

  return (
    <group ref={carGroupRef}>
      <Suspense fallback={<LancerEvoFallback />}>
        <CarModel paintProps={paintProps} config={modelConfig} />
      </Suspense>
    </group>
  )
}

export default function WebGLPaintPreview({ color }: WebGLPaintPreviewProps) {
  const [mounted, setMounted] = useState(false)
  const [ambientIntensity, setAmbientIntensity] = useState(0.4)
  const [dirIntensity, setDirIntensity] = useState(1.5)
  const [environment, setEnvironment] = useState('studio_small_03_1k.hdr')
  const [showControls, setShowControls] = useState(false)
  const [bgType, setBgType] = useState<'black' | 'white'>('black')
  const [modelId, setModelId] = useState<string>('lancer')

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return (
      <div className="w-full h-[20vh] min-h-[110px] max-h-[180px] flex items-center justify-center bg-black/10 rounded-lg animate-pulse">
        <span className="text-sm opacity-50">Loading 3D Preview...</span>
      </div>
    )
  }

  const modelConfig = MODEL_CONFIGS[modelId] || MODEL_CONFIGS.lancer

  return (
    <div className="w-full rounded-lg bg-gradient-to-b from-gray-800 to-gray-900 relative">
      <div className="h-[20vh] min-h-[110px] max-h-[180px] relative overflow-hidden rounded-lg">
        {/* Background selector on the top left */}
        <div className="absolute top-2 left-2 flex gap-1.5 z-20 bg-black/50 backdrop-blur-md p-1 rounded-full border border-white/10">
          <button
            onClick={() => setBgType('black')}
            className={`w-5 h-5 rounded-full transition-all border ${
              bgType === 'black'
                ? 'bg-[#0d0d11] border-white scale-110 shadow-lg'
                : 'bg-[#0d0d11] border-transparent hover:border-white/30'
            }`}
            title="Dark Background"
            aria-label="Set dark background"
          />
          <button
            onClick={() => setBgType('white')}
            className={`w-5 h-5 rounded-full transition-all border ${
              bgType === 'white'
                ? 'bg-[#f3f4f6] border-black scale-110 shadow-lg'
                : 'bg-[#f3f4f6] border-transparent hover:border-black/30'
            }`}
            title="Light Background"
            aria-label="Set light background"
          />
        </div>

        {/* Model selector on the top right, to the left of the Settings button */}
        <div className="absolute top-2 right-14 z-20">
          <select
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            className="bg-black/60 hover:bg-black/80 text-white text-xs rounded-full px-3 py-1.5 backdrop-blur-md border border-white/10 outline-none focus:border-fuchsia-500 transition-colors shadow-lg cursor-pointer font-medium"
          >
            {Object.values(MODEL_CONFIGS).map((m) => (
              <option key={m.id} value={m.id} className="bg-gray-950 text-white font-medium">
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <Canvas camera={{ position: [3.0, 0.35, 0.2], fov: 38 }}>
          <color attach="background" args={[bgType === 'black' ? '#0d0d11' : '#f3f4f6']} />
          <HDRIErrorBoundary>
            {environment === 'studio_small_03_1k.hdr'
              ? <Environment files="/hdri/studio_small_03_1k.hdr" />
              : <Environment preset={environment as any} />}
          </HDRIErrorBoundary>

          {/* Upgraded Professional Studio 4-Point Lighting */}
          <ambientLight intensity={ambientIntensity * 1.15} />
          {/* Key Light */}
          <directionalLight position={[5, 6, 5]} intensity={dirIntensity} castShadow />
          {/* Fill Light (Soft front-left fill) */}
          <directionalLight position={[-5, 3, 2]} intensity={dirIntensity * 0.45} />
          {/* Rim Light / Backlight (Accentuates edges from behind) */}
          <directionalLight position={[0, 4, -6]} intensity={dirIntensity * 0.8} />
          {/* Top Light (Accentuates roof and hood contours) */}
          <directionalLight position={[0, 8, 0]} intensity={dirIntensity * 0.25} />

          <CarWrapper color={color} modelConfig={modelConfig} />

          <ContactShadows position={[0, -0.42, 0]} opacity={0.65} scale={8} blur={1.5} far={3} />
          <OrbitControls enablePan={false} enableZoom minDistance={2} maxDistance={8} autoRotate={false} />
        </Canvas>

        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-white text-[10px] rounded backdrop-blur-md font-medium pointer-events-none">
          Drag to rotate • Scroll to zoom
        </div>
      </div>

      {/* Settings button — outside the height-constrained div so panel isn't clipped */}
      <div className="absolute top-2 right-2 flex flex-col items-end gap-2 z-20">
        <button
          onClick={() => setShowControls(!showControls)}
          className="bg-black/60 hover:bg-black/80 text-white w-10 h-10 rounded-full backdrop-blur-md transition-colors shadow-lg border border-white/10 text-lg flex items-center justify-center"
          title="3D Viewer Settings"
        >
          ⚙️
        </button>

        {showControls && (
          <div className="bg-black/90 backdrop-blur-xl p-5 rounded-xl shadow-2xl border border-white/20 w-64 text-white text-sm space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">Lighting Environment</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white outline-none focus:border-fuchsia-500 transition-colors"
              >
                <option value="studio_small_03_1k.hdr">Default HDRI</option>
                <option value="studio">Bright Studio</option>
                <option value="city">Urban City</option>
                <option value="sunset">Warm Sunset</option>
                <option value="warehouse">Industrial Warehouse</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2 flex justify-between uppercase tracking-wider">
                <span>Sun Light</span><span>{dirIntensity.toFixed(1)}</span>
              </label>
              <input type="range" min="0" max="3" step="0.1"
                value={dirIntensity} onChange={(e) => setDirIntensity(parseFloat(e.target.value))}
                className="w-full accent-fuchsia-500" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2 flex justify-between uppercase tracking-wider">
                <span>Fill Light</span><span>{ambientIntensity.toFixed(1)}</span>
              </label>
              <input type="range" min="0" max="2" step="0.1"
                value={ambientIntensity} onChange={(e) => setAmbientIntensity(parseFloat(e.target.value))}
                className="w-full accent-fuchsia-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
