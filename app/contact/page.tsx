'use client'

export const dynamic = 'force-dynamic'

export default function Contact() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden text-white">
      {/* EPIC video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src="/EPIC.mp4"
      />
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 text-center px-6 max-w-lg">
        <p className="text-6xl mb-4">🚧</p>
        <h1 className="text-4xl font-bold mb-3">Contact coming soon</h1>
        <p className="text-gray-300 mb-6">This page is taking a pit stop. Use the links below to reach out in the meantime.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="mailto:julian.penning1@gmail.com" className="px-5 py-3 bamboo-button rounded-lg font-semibold">📧 Email us</a>
          <a href="/" className="px-5 py-3 bamboo-button-ghost border border-white/30 rounded-lg font-semibold">← Back home</a>
        </div>
      </div>
    </div>
  )
}
