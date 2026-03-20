# Need for Speed Underground Theme 🏁

A complete street racing-inspired design system for the Forza Color Universe app, featuring neon effects, carbon fiber textures, and dynamic animations inspired by the legendary Need for Speed Underground series.

## 🎨 Features

### Visual Effects
- **Carbon Fiber Backgrounds** - Authentic woven carbon fiber texture
- **Asphalt Textures** - Realistic street surface patterns
- **Neon Glow Effects** - Blue, pink, green, and orange neon lighting
- **Chrome Reflections** - Metallic shine animations
- **Underglow Animations** - Dynamic car underglow effects
- **Speed Lines** - Motion blur effects for racing feel
- **Tire Smoke** - Drift smoke animations
- **Street Lights** - Flickering street lamp effects

### Interactive Components
- **Speedometer** - Animated needle gauge (0-200 MPH)
- **RPM Gauge** - Engine RPM indicator with redline
- **Heat Level System** - 5-level police pursuit indicator
- **Nitrous Boost** - NOS meter with flash effects
- **Drift Indicator** - Spinning drift status display
- **Police Scanner** - Red/blue sweep effect
- **Gauge Cluster** - Complete dashboard display

### UI Components
- **NFSCard** - Styled container with neon borders
- **NFSButton** - Animated action buttons with shine effect
- **NFSColorCard** - Enhanced color display cards
- **NFSHeader** - Racing-themed navigation header
- **NFSBackground** - Full-screen ambient effects
- **Progress Bars** - Gradient-filled progress indicators

## 📁 File Structure

```
app/
├── nfs-theme.css              # Core NFS theme styles
├── components/
│   ├── NFSBackground.tsx      # Background effects & components
│   ├── NFSHeader.tsx          # Racing-themed header
│   └── NFSColorCard.tsx       # NFS-styled color cards
└── nfs-theme/
    └── page.tsx               # Demo page
```

## 🚀 Quick Start

### 1. Import the Theme

```tsx
import '../nfs-theme.css'
```

### 2. Use Components

```tsx
import NFSBackground, { 
  NFSSpeedometer, 
  NFSGaugeCluster,
  NFSCard,
  NFSButton 
} from './components/NFSBackground'
import NFSHeader from './components/NFSHeader'
import NFSColorCard from './components/NFSColorCard'
```

### 3. Basic Implementation

```tsx
export default function MyPage() {
  return (
    <div className="min-h-screen bg-black">
      <NFSBackground isDarkMode={true} />
      <NFSHeader isDarkMode={true} onToggleTheme={() => {}} />
      
      <main className="relative z-10 p-8">
        <NFSCard>
          <h1 className="nfs-text-neon-blue">Welcome</h1>
          <NFSButton onClick={() => {}}>
            Start Racing
          </NFSButton>
        </NFSCard>
      </main>
    </div>
  )
}
```

## 🎯 Component API

### NFSBackground

```tsx
<NFSBackground 
  isDarkMode={boolean}
  showPoliceScanner={boolean}  // Optional
  showNitrous={boolean}        // Optional
/>
```

### NFSSpeedometer

```tsx
<NFSSpeedometer 
  speed={number}      // 0-200
  maxSpeed={number}   // Default: 200
/>
```

### NFSGaugeCluster

```tsx
<NFSGaugeCluster 
  speed={number}      // 0-200
  rpm={number}        // 0-8000
  heatLevel={number}  // 0-5
  nitrous={number}    // 0-100
/>
```

### NFSHeatLevel

```tsx
<NFSHeatLevel 
  level={number}      // 0-5
  maxLevel={number}   // Default: 5
/>
```

### NFSCard

```tsx
<NFSCard 
  className={string}
  glowColor="blue" | "pink" | "green" | "orange"
>
  {children}
</NFSCard>
```

### NFSButton

```tsx
<NFSButton 
  onClick={() => {}}
  disabled={boolean}
  className={string}
>
  Button Text
</NFSButton>
```

### NFSColorCard

```tsx
<NFSColorCard 
  color={CarColor}
  onSelect={(color) => {}}
  onShowInfo={(color) => {}}
  isFavorite={boolean}
  onToggleFavorite={(id) => {}}
  isDarkMode={boolean}
/>
```

### NFSDriftIndicator

```tsx
<NFSDriftIndicator isDrifting={boolean} />
```

## 🎨 CSS Classes

### Background Effects

```css
.nfs-carbon-bg          /* Carbon fiber texture */
.nfs-asphalt-bg         /* Asphalt road texture */
.nfs-street-light       /* Street lamp glow */
.nfs-tire-smoke         /* Drift smoke effect */
.nfs-underglow          /* Car underglow effect */
```

### Neon Glow Effects

```css
.nfs-neon-glow-blue     /* Blue neon glow */
.nfs-neon-glow-pink     /* Pink neon glow */
.nfs-neon-glow-green    /* Green neon glow */
```

### Text Effects

```css
.nfs-text-neon-blue     /* Blue neon text */
.nfs-text-neon-pink     /* Pink neon text */
.nfs-text-neon-orange   /* Orange neon text */
```

### Component Styles

```css
.nfs-card               /* Styled card container */
.nfs-button             /* Animated button */
.nfs-speedometer        /* Speedometer gauge */
.nfs-progress-bar       /* Progress bar container */
.nfs-progress-fill      /* Progress bar fill */
.nfs-chrome             /* Chrome reflection */
```

### Special Effects

```css
.nfs-police-scanner     /* Police scanner sweep */
.nfs-nitrous-boost      /* Nitrous boost effect */
.nfs-drift-indicator    /* Drift status display */
.nfs-gauge-cluster      /* Dashboard cluster */
.nfs-heat-level         /* Heat level display */
```

## 🎬 Animations

All animations are defined in `nfs-theme.css`:

- `nfs-pulse-blue/pink/green` - Pulsing glow effects
- `nfs-text-flicker` - Neon sign flicker
- `nfs-needle-sweep` - Speedometer needle movement
- `nfs-scanner-sweep` - Police scanner beam
- `nfs-nitrous-pulse` - Nitrous boost pulse
- `nfs-street-flicker` - Street light flicker
- `nfs-smoke-rise` - Tire smoke rising
- `nfs-underglow-shift` - Color-shifting underglow
- `nfs-chrome-shine` - Chrome reflection shine
- `nfs-progress-shine` - Progress bar shine
- `nfs-drift-spin` - Drift indicator rotation
- `nfs-heat-pulse` - Heat level pulse

## 🎨 Color Palette

```css
--nfs-neon-blue: #00d9ff      /* Primary neon blue */
--nfs-neon-pink: #ff006e      /* Accent pink */
--nfs-neon-green: #00ff88     /* Success green */
--nfs-neon-orange: #ff6b00    /* Warning orange */
--nfs-neon-purple: #b300ff    /* Secondary purple */
--nfs-carbon: #0a0a0a         /* Carbon fiber dark */
--nfs-asphalt: #1a1a1a        /* Asphalt gray */
--nfs-street: #2a2a2a         /* Street surface */
--nfs-chrome: #c0c0c0         /* Chrome metallic */
```

## 📱 Responsive Design

All components are fully responsive and optimized for:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## ⚡ Performance

- GPU-accelerated animations
- Optimized CSS transforms
- Minimal repaints/reflows
- Efficient animation loops
- Lazy-loaded effects

## 🎮 Demo Page

Visit `/nfs-theme` to see all components in action with:
- Live speedometer
- Interactive controls
- Dynamic effects
- Sample color cards
- Integration examples

## 🔧 Customization

### Change Neon Colors

```css
:root {
  --nfs-neon-blue: #your-color;
  --nfs-neon-pink: #your-color;
}
```

### Adjust Animation Speed

```css
.nfs-neon-glow-blue {
  animation-duration: 3s; /* Default: 2s */
}
```

### Modify Glow Intensity

```css
.nfs-neon-glow-blue {
  box-shadow: 
    0 0 10px var(--nfs-neon-blue),  /* Increase values */
    0 0 20px var(--nfs-neon-blue),
    0 0 40px var(--nfs-neon-blue);
}
```

## 🎯 Use Cases

1. **Main App Theme** - Apply to entire Forza Color Universe
2. **Special Events** - Night racing events or promotions
3. **Color Showcases** - Highlight special paint collections
4. **Racing Features** - TuneForge, telemetry displays
5. **Landing Pages** - High-impact hero sections

## 🚦 Best Practices

1. Use dark backgrounds for optimal neon visibility
2. Limit simultaneous animations for performance
3. Test on mobile devices for touch interactions
4. Provide theme toggle for user preference
5. Use semantic HTML with ARIA labels
6. Optimize images and assets
7. Test with reduced motion preferences

## 🔗 Integration with Existing App

The NFS theme is designed to work alongside the existing bamboo theme:

```tsx
const [theme, setTheme] = useState<'bamboo' | 'nfs'>('bamboo')

return (
  <div className={theme === 'nfs' ? 'nfs-theme' : 'bamboo-theme'}>
    {theme === 'nfs' ? (
      <NFSBackground isDarkMode={isDarkMode} />
    ) : (
      <TokyoBackground isDarkMode={isDarkMode} />
    )}
  </div>
)
```

## 📄 License

Part of the Forza Color Universe project - MIT License

## 🙏 Credits

- Inspired by Need for Speed Underground (2003)
- Design: Street racing aesthetics
- Implementation: React + Next.js + Tailwind CSS

## 🐛 Known Issues

None currently. Report issues on GitHub.

## 🚀 Future Enhancements

- [ ] More color schemes (green, purple themes)
- [ ] Sound effects integration
- [ ] Advanced particle systems
- [ ] 3D car models
- [ ] Multiplayer race UI
- [ ] Leaderboard displays
- [ ] Achievement badges

---

**Built with ❤️ for street racing enthusiasts**
