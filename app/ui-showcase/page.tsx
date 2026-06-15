'use client'



import React from 'react'
import { motion } from 'framer-motion'
import { 
  GlassCard, 
  GlassButton,
  GlassIsland 
} from '@/components/ui/GlassCard'
import { 
  NeumorphicCard, 
  NeumorphicToggle, 
  NeumorphicSlider,
  NeumorphicButton,
  NeumorphicInput 
} from '@/components/ui/Neumorphic'
import { 
  AuroraBackground,
  MeshGradientBackground,
  GridLinesBackground,
  FloatingOrbs,
  RacingStripesBackground
} from '@/components/ui/AnimatedBackgrounds'
import {
  MagneticButton,
  TextReveal,
  SpotlightCard,
  RippleButton,
  TiltCard,
  GradientText,
  StaggerContainer,
  FadeInItem,
  BounceHover,
  Shimmer
} from '@/components/ui/MicroInteractions'
import { Sparkles, Palette, Zap, Layers, Heart, Star } from 'lucide-react'

export default function UIShowcasePage() {
  const [toggleState, setToggleState] = React.useState(true)
  const [sliderValue, setSliderValue] = React.useState(50)
  const [inputValue, setInputValue] = React.useState('')
  const [activeBg, setActiveBg] = React.useState<'aurora' | 'mesh' | 'grid' | 'orbs' | 'racing'>('aurora')

  const backgrounds = {
    aurora: <AuroraBackground />,
    mesh: <MeshGradientBackground />,
    grid: <GridLinesBackground />,
    orbs: <FloatingOrbs />,
    racing: <RacingStripesBackground />,
  }

  return (
    <main className="relative min-h-screen bg-gray-950 text-white overflow-x-hidden">
      {/* Active Background */}
      {backgrounds[activeBg]}

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="px-8 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-blue-400" />
              <h1 className="text-4xl font-bold">
                <GradientText>UI Design Showcase</GradientText>
              </h1>
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Premium UI components inspired by modern design trends. 
              Glassmorphism, Neumorphism, and advanced micro-interactions.
            </p>
          </motion.div>

          {/* Background Switcher */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {(['aurora', 'mesh', 'grid', 'orbs', 'racing'] as const).map((bg) => (
              <button
                key={bg}
                onClick={() => setActiveBg(bg)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  activeBg === bg
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                    : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </header>

        {/* Glassmorphism Section */}
        <section className="px-8 py-12 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-8"
          >
            <Layers className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold">Glassmorphism</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GlassCard glowColor="#8b5cf6" className="p-6">
              <h3 className="text-lg font-semibold mb-2">Frosted Glass Card</h3>
              <p className="text-sm text-gray-400">
                Backdrop blur with ethereal glow effects. Perfect for overlay UI.
              </p>
            </GlassCard>

            <GlassCard glowColor="#3b82f6" className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/30 flex items-center justify-center">
                  <Palette className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Color Studio</h3>
                  <p className="text-xs text-gray-400">10,000+ colors</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="w-6 h-6 rounded-full bg-red-500" />
                <span className="w-6 h-6 rounded-full bg-blue-500" />
                <span className="w-6 h-6 rounded-full bg-green-500" />
                <span className="w-6 h-6 rounded-full bg-yellow-500" />
              </div>
            </GlassCard>

            <div className="space-y-4">
              <GlassButton variant="primary" icon={<Zap className="w-4 h-4" />}>
                Primary Action
              </GlassButton>
              <GlassButton variant="secondary">
                Secondary
              </GlassButton>
              <GlassButton variant="ghost">
                Ghost Button
              </GlassButton>
            </div>
          </div>
        </section>

        {/* Neumorphism Section */}
        <section className="px-8 py-12 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-6 h-6 rounded-full bg-gray-700 shadow-[2px_2px_4px_rgba(0,0,0,0.5),-2px_-2px_4px_rgba(255,255,255,0.05)]" />
            <h2 className="text-2xl font-bold">Neumorphism</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <NeumorphicCard className="min-h-[200px]" interactive>
              <h3 className="text-lg font-semibold text-gray-300 mb-4">Soft UI Card</h3>
              <p className="text-sm text-gray-500 mb-6">
                Press me to feel the tactile depth effect. 
                The shadows create a physical "pressed" sensation.
              </p>
              <div className="flex gap-4">
                <NeumorphicButton variant="raised">Raised</NeumorphicButton>
                <NeumorphicButton variant="pressed">Pressed</NeumorphicButton>
              </div>
            </NeumorphicCard>

            <div className="space-y-6">
              <NeumorphicToggle
                checked={toggleState}
                onChange={setToggleState}
                label="Toggle Switch"
              />
              
              <NeumorphicSlider
                value={sliderValue}
                onChange={setSliderValue}
                label="Volume Control"
              />
              
              <NeumorphicInput
                value={inputValue}
                onChange={setInputValue}
                placeholder="Type something..."
              />
            </div>
          </div>
        </section>

        {/* Micro-Interactions Section */}
        <section className="px-8 py-12 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-8"
          >
            <Zap className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold">Micro-Interactions</h2>
          </motion.div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
            <FadeInItem>
              <SpotlightCard className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="font-semibold mb-2">Spotlight Effect</h3>
                <p className="text-sm text-gray-400">
                  Hover over this card to see the spotlight follow your cursor.
                </p>
              </SpotlightCard>
            </FadeInItem>

            <FadeInItem>
              <TiltCard className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="font-semibold mb-2">3D Tilt Card</h3>
                <p className="text-sm text-gray-400">
                  Move your mouse to see the 3D perspective effect.
                </p>
              </TiltCard>
            </FadeInItem>

            <FadeInItem>
              <div className="space-y-4">
                <MagneticButton 
                  className="px-6 py-3 bg-blue-500 rounded-lg font-semibold"
                  strength={0.4}
                >
                  Magnetic Button
                </MagneticButton>

                <RippleButton className="px-6 py-3 bg-gray-800 rounded-lg font-semibold">
                  Ripple Effect
                </RippleButton>
              </div>
            </FadeInItem>

            <FadeInItem>
              <div className="p-6">
                <TextReveal text="Hover to Reveal" className="text-xl font-bold" />
              </div>
            </FadeInItem>

            <FadeInItem>
              <BounceHover className="p-6">
                <div className="bg-gray-800 rounded-xl p-4 text-center">
                  <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Hover to bounce</p>
                </div>
              </BounceHover>
            </FadeInItem>

            <FadeInItem>
              <div className="p-6">
                <Shimmer className="w-full h-12 bg-gray-800 rounded-lg" />
                <p className="text-xs text-gray-500 mt-2">Shimmer loading effect</p>
              </div>
            </FadeInItem>
          </StaggerContainer>
        </section>

        {/* Glass Island Demo */}
        <section className="px-8 py-12 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-8"
          >
            <Star className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold">Floating Glass Island</h2>
          </motion.div>

          <div className="relative h-64 bg-gray-900/30 rounded-xl border border-gray-800 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-gray-600">
              <p>Glass Island appears at the bottom</p>
            </div>
            <GlassIsland position="bottom" className="mb-4">
              <button className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Home
              </button>
              <div className="w-px h-4 bg-gray-700" />
              <button className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Gallery
              </button>
              <div className="w-px h-4 bg-gray-700" />
              <button className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                Settings
              </button>
            </GlassIsland>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-8 py-12 text-center text-gray-500 text-sm">
          <p>
            UI components built with Framer Motion, Tailwind CSS, and React.
            <br />
            Inspired by modern design trends from Figma Community.
          </p>
        </footer>
      </div>
    </main>
  )
}
