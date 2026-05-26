/* 🌿 Loading screen — wizard smoking a joint with rising smoke */
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

      {/* Ctrl+Shift+R hint for PC users */}
      <div className="absolute top-4 left-4 z-20 hidden md:block">
        <p className="text-xs text-white/40 font-mono">
          <span className="inline-block px-1.5 py-0.5 rounded bg-white/10 text-white/50 mr-0.5">Ctrl</span>
          +
          <span className="inline-block px-1.5 py-0.5 rounded bg-white/10 text-white/50 mx-0.5">Shift</span>
          +
          <span className="inline-block px-1.5 py-0.5 rounded bg-white/10 text-white/50 ml-0.5">R</span>
          <span className="ml-2 text-white/30">to hard refresh</span>
        </p>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-4">
        {/* Wizard smoking the joint */}
        <div className="relative animate-wizard-bob" style={{ width: 200, height: 220 }}>
          {/* Extra smoke clouds from the wizard */}
          <span
            className="absolute text-white/50 text-2xl select-none animate-smoke"
            style={{ top: 10, left: '55%', animationDelay: '0.3s' }}
            aria-hidden
          >☁</span>
          <span
            className="absolute text-white/30 text-lg select-none animate-smoke-2"
            style={{ top: 15, left: '60%', animationDelay: '1.0s' }}
            aria-hidden
          >☁</span>
          <span
            className="absolute text-white/20 text-sm select-none animate-smoke"
            style={{ top: 20, left: '50%', animationDelay: '1.8s' }}
            aria-hidden
          >☁</span>

          {/* Wizard SVG */}
          <svg viewBox="0 0 200 220" width="200" height="220" aria-hidden className="animate-wizard-inhale">
            {/* Wizard hat */}
            <polygon points="100,5 70,75 130,75" fill="#4a2d8a" />
            <polygon points="100,5 70,75 130,75" fill="url(#hatSheen)" />
            <ellipse cx="100" cy="75" rx="40" ry="8" fill="#3a1d7a" />
            {/* Hat stars */}
            <text x="90" y="40" fontSize="10" fill="#ffd700" opacity="0.8">✦</text>
            <text x="105" y="55" fontSize="7" fill="#ffd700" opacity="0.6">✦</text>
            {/* Hat brim */}
            <ellipse cx="100" cy="75" rx="50" ry="10" fill="#5a3d9a" />

            {/* Face */}
            <circle cx="100" cy="100" r="28" fill="#f5d0a9" />
            {/* Eyes — squinting from the smoke */}
            <line x1="88" y1="95" x2="96" y2="95" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="104" y1="95" x2="112" y2="95" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
            {/* Rosy cheeks */}
            <circle cx="85" cy="102" r="5" fill="#ff9999" opacity="0.4" />
            <circle cx="115" cy="102" r="5" fill="#ff9999" opacity="0.4" />
            {/* Mouth area — slight grin */}
            <path d="M 93 108 Q 100 114 107 108" fill="none" stroke="#994433" strokeWidth="1.5" strokeLinecap="round" />

            {/* Beard */}
            <path d="M 75 110 Q 80 150 100 160 Q 120 150 125 110" fill="#cccccc" />
            <path d="M 80 115 Q 85 145 100 155 Q 115 145 120 115" fill="#e0e0e0" />

            {/* Robe / body */}
            <path d="M 65 128 L 55 210 L 145 210 L 135 128" fill="#5a3d9a" />
            <line x1="100" y1="128" x2="100" y2="210" stroke="#4a2d8a" strokeWidth="2" />

            {/* Arm reaching to mouth holding joint */}
            <path d="M 130 145 Q 140 130 138 110 Q 136 102 128 105" fill="none" stroke="#f5d0a9" strokeWidth="8" strokeLinecap="round" />
            {/* Hand */}
            <circle cx="137" cy="108" r="5" fill="#f5d0a9" />

            {/* The joint in hand */}
            <g transform="translate(137, 100) rotate(-30)">
              {/* Joint body */}
              <rect x="-2" y="-18" width="4" height="16" rx="1.5" fill="#f5f0e8" />
              <line x1="-2" y1="-12" x2="2" y2="-12" stroke="#e0d8cc" strokeWidth="0.5" />
              <line x1="-2" y1="-7" x2="2" y2="-7" stroke="#e0d8cc" strokeWidth="0.5" />
              {/* Filter */}
              <rect x="-2" y="-2" width="4" height="5" rx="1" fill="#c8a96a" />
              {/* Ember tip */}
              <circle cx="0" cy="-18" r="3" fill="#ff4500" className="animate-ember-glow" />
              <circle cx="0" cy="-18" r="1.5" fill="#ff8c00" />
              {/* Smoke from tip */}
              <g>
                <circle cx="0" cy="-24" r="2" fill="white" opacity="0.3" className="animate-smoke" />
                <circle cx="2" cy="-28" r="1.5" fill="white" opacity="0.2" className="animate-smoke-2" />
              </g>
            </g>

            {/* Gradient defs */}
            <defs>
              <linearGradient id="hatSheen" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="white" stopOpacity="0.1" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <p className="text-2xl font-bold tracking-wide">Loading…</p>
        <p className="text-sm opacity-60">Rolling something special…</p>
      </div>
    </div>
  )
}
