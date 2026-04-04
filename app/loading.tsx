export default function Loading() {
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

      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-4">
        <div className="w-16 h-16 rounded-full border-4 border-white border-t-transparent animate-spin" />
        <p className="text-2xl font-bold tracking-wide">Loading…</p>
        <p className="text-sm opacity-60">Warming up the engine</p>
      </div>
    </div>
  )
}
