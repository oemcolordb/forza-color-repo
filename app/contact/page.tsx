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
        <p className="text-gray-300 mb-6">
          This page is taking a pit stop. Use the links below to reach out in the meantime.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <a
            href="mailto:jayswervez@proton.me"
            className="px-5 py-3 bamboo-button rounded-lg font-semibold"
          >
            📧 Email us
          </a>
          <a
            href="/"
            className="px-5 py-3 bamboo-button-ghost border border-white/30 rounded-lg font-semibold"
          >
            ← Back home
          </a>
        </div>
        <div className="space-y-3 text-left text-sm text-gray-300">
          <p className="font-semibold text-gray-200">Social media</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-blue-200">Twitter</p>
              <p className="text-gray-400">@comingsoon</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-pink-300">Instagram</p>
              <p className="text-gray-400">@comingsoon</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-cyan-300">Discord</p>
              <p className="text-gray-400">Invite link coming soon</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-violet-300">TikTok</p>
              <p className="text-gray-400">@comingsoon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
