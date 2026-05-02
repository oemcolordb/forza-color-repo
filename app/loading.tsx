/* 🌿 Loading screen — animated joint with rising smoke */
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
        {/* Burning joint + smoke */}
        <div className="relative flex flex-col items-center" style={{ height: 96 }}>
          {/* Smoke puffs */}
          <span
            className="absolute text-white/60 text-xl select-none animate-smoke"
            style={{ top: -8, left: '48%', animationDelay: '0s' }}
            aria-hidden
          >
            ○
          </span>
          <span
            className="absolute text-white/40 text-sm select-none animate-smoke-2"
            style={{ top: -4, left: '44%', animationDelay: '0.7s' }}
            aria-hidden
          >
            ○
          </span>
          <span
            className="absolute text-white/30 text-xs select-none animate-smoke"
            style={{ top: -2, left: '52%', animationDelay: '1.4s' }}
            aria-hidden
          >
            ○
          </span>

          {/* The joint body */}
          <svg
            width="24"
            height="72"
            viewBox="0 0 24 72"
            aria-hidden
            className="mt-4"
          >
            {/* Twisted paper tip */}
            <polygon points="12,0 10,8 14,8" fill="#d4c5a9" />
            {/* Joint body — white paper */}
            <rect x="6" y="8" width="12" height="50" rx="4" fill="#f5f0e8" />
            {/* Rolling crease lines */}
            <line x1="6" y1="22" x2="18" y2="22" stroke="#e0d8cc" strokeWidth="0.8" />
            <line x1="6" y1="36" x2="18" y2="36" stroke="#e0d8cc" strokeWidth="0.8" />
            <line x1="6" y1="50" x2="18" y2="50" stroke="#e0d8cc" strokeWidth="0.8" />
            {/* Filter / roach (tan) */}
            <rect x="6" y="58" width="12" height="14" rx="3" fill="#c8a96a" />
            {/* Lit ember tip */}
            <circle
              cx="12"
              cy="8"
              r="4"
              fill="#ff4500"
              className="animate-ember-glow"
            />
            <circle cx="12" cy="8" r="2" fill="#ff8c00" />
          </svg>
        </div>

        <p className="text-2xl font-bold tracking-wide">Loading…</p>
        <p className="text-sm opacity-60">Rolling something special…</p>
      </div>
    </div>
  )
}
