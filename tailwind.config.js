/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.text-shadow': {
          textShadow: '0 2px 4px rgba(0,0,0,0.10)',
        },
        '.text-shadow-md': {
          textShadow: '0 4px 8px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)',
        },
        '.text-shadow-lg': {
          textShadow: '0 15px 35px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.07)',
        },
        '.text-shadow-none': {
          textShadow: 'none',
        },
        '.gpu-accelerated': {
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
        },
        '.will-change-transform': {
          willChange: 'transform',
        },
        '.backdrop-blur-fix': {
          '-webkit-backdrop-filter': 'blur(4px)',
          'backdrop-filter': 'blur(4px)',
        },
        '.backdrop-blur-sm': {
          '-webkit-backdrop-filter': 'blur(4px)',
          'backdrop-filter': 'blur(4px)',
        },
        '.backdrop-blur': {
          '-webkit-backdrop-filter': 'blur(8px)',
          'backdrop-filter': 'blur(8px)',
        },
        '.backdrop-blur-md': {
          '-webkit-backdrop-filter': 'blur(12px)',
          'backdrop-filter': 'blur(12px)',
        },
        '.backdrop-blur-lg': {
          '-webkit-backdrop-filter': 'blur(16px)',
          'backdrop-filter': 'blur(16px)',
        },
        '.backdrop-blur-xl': {
          '-webkit-backdrop-filter': 'blur(24px)',
          'backdrop-filter': 'blur(24px)',
        },
        '.backdrop-blur-2xl': {
          '-webkit-backdrop-filter': 'blur(40px)',
          'backdrop-filter': 'blur(40px)',
        },
        '.backdrop-blur-3xl': {
          '-webkit-backdrop-filter': 'blur(64px)',
          'backdrop-filter': 'blur(64px)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}