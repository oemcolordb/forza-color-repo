# Forza Color Universe - Repository Memory

## Overview
Forza Color Universe is a comprehensive automotive paint color database and tuning platform for Forza racing games. Built with Next.js 16, TypeScript, and Tailwind CSS.

## Application Architecture

### Page Structure

```
app/
├── page.tsx                          # Main home page - color database
├── forza-color-sheet/page.tsx         # SEO redirect page
├── tuneforge/
│   ├── page.tsx                      # TuneForge tuning calculator
│   └── car/[slug]/
│       ├── page.tsx                  # Individual car tuning page
│       └── client.tsx                # Client component for car tuning
├── garage/
│   ├── page.tsx                      # Car database entry
│   └── GarageClient.tsx             # Car database client component
├── location-finder/
│   ├── page.tsx                      # Location finder (coming soon)
│   ├── MapDisplay.tsx                # Map component
│   ├── LocationCard.tsx              # Location card component
│   ├── ScenicFinder.tsx              # Scenic location finder
│   ├── SpeedCameraList.tsx           # Speed camera list
│   ├── NeonRoadMap.tsx               # Neon road map
│   └── MapCalibrator.tsx            # Map calibration tool
├── telemetry/
│   └── page.tsx                      # Telemetry dashboard setup
├── image-match/
│   └── page.tsx                      # Paint scanner AI
├── about/page.tsx                    # About page with easter eggs
├── contact/page.tsx                  # Contact page
├── help/page.tsx                     # Help & support page
├── how-to-use/page.tsx               # How to use guide
├── blog/page.tsx                     # Blog/insights page
├── mobile-dash/
│   └── page.tsx                      # Mobile telemetry dashboard
├── transitions/
│   └── page.tsx                      # Page transition gallery
├── ui-showcase/page.tsx              # UI component showcase
├── privacy/page.tsx                 # Privacy policy
├── terms/page.tsx                    # Terms of service
├── forgot-password/page.tsx          # Forgot password
├── reset-password/page.tsx           # Reset password
├── login/page.tsx                    # Login page
├── signup/page.tsx                   # Signup page
├── profile/page.tsx                  # User profile
├── favorites/page.tsx                # Saved favorites
├── dev/analytics/
│   └── page.tsx                      # Developer analytics dashboard
├── data/                             # Data files
└── color-sitemap.xml/                # Sitemap configuration
```

### Component Structure

```
app/components/
├── Header.tsx                        # Main navigation header
├── Footer.tsx                        # Page footer
├── SimpleColorGrid.tsx              # Basic color grid
├── VirtualColorGrid.tsx             # Virtualized color grid for performance
├── ColorCard.tsx                     # Individual color card with audio
├── TokyoBackground.tsx              # Animated Tokyo background
├── CreditsBackground.tsx            # Credits page background
├── OptimizedSearchControls.tsx      # Search/filter controls
├── ResponsiveLayout.tsx              # Responsive layout wrapper
├── AdvancedTools.tsx                 # Advanced color tools (dynamic import)
├── ImageColorExtractor.tsx          # Image color extraction (dynamic import)
├── ColorComparison.tsx               # Color comparison tool (dynamic import)
├── HSBPopup.tsx                      # HSB color popup (dynamic import)
├── ColorRouletteHarmony.js           # Color roulette harmony (dynamic import)
├── HarmonyVisualizer.js              # Harmony visualizer (dynamic import)
├── ColorGenerator.js                 # Color generator (dynamic import)
├── PerformanceMonitor.js             # Performance monitor (dynamic import)
├── ColorAnalyticsDashboard.tsx       # Color analytics (dynamic import)
├── CarStatsRadarChart.tsx            # Car stats radar chart
├── Breadcrumbs.tsx                   # Breadcrumb navigation
├── AuthProvider.tsx                  # Authentication context provider
├── ProtectedRoute.tsx                # Protected route wrapper
├── AuthModal.tsx                     # Authentication modal
├── AuthNavButton.tsx                 # Auth navigation button
├── PWAInstallButton.tsx             # PWA install button
├── GamingErrorBoundary.tsx          # Gaming-focused error boundary
├── ErrorBoundary.js                  # General error boundary
├── ThirdPartyErrorBoundary.js       # Third-party error boundary
├── NotFoundClient.tsx                # Not found client component
├── NotFoundWrapper.tsx               # Not found wrapper
├── KeyboardShortcuts.tsx             # Keyboard shortcuts handler
├── OfflineIndicator.js               # Offline status indicator
├── MobileGamingOptimizer.tsx        # Mobile gaming optimizer
├── ProgressiveLoader.js              # Progressive loading component
├── StatusAlert.js                    # Status alert component
├── ZoomResponsiveContainer.tsx       # Zoom-responsive container
├── StructuredData.tsx                # SEO structured data
├── GamingSEO.tsx                     # Gaming-focused SEO
├── ForzaColorSheetSEO.tsx            # Forza color sheet SEO
├── EasterEgg420.tsx                  # 420 easter egg component
├── ClientTransitionWrapper.tsx        # Client transition wrapper
├── TelemetryDashboard.tsx            # Telemetry dashboard (stub)
├── TelemetryDashboard.js             # Telemetry dashboard implementation
├── TelemetryMap.js                   # Telemetry map view
├── TelemetryPanel.tsx                # Telemetry panel controls
├── MobileTelemetryDash.tsx          # Mobile telemetry dashboard (stub)
├── MobileTelemetryDash.js            # Mobile telemetry implementation
├── MobileColorStats.js               # Mobile optimized color stats
├── MobileOptimizedBackground.js      # Mobile optimized background
├── EnhancedAuthProvider.tsx          # Enhanced authentication provider
├── ExportButton.js                   # Data export controls
├── LazyColorLoader.js                # Lazy loading color utility
├── LoadingSpinner.js                 # Global loading spinner
├── ModelBrowser.js                   # 3D model browser component
├── OptimizedStatsBar.js              # Performance optimized stats
├── PaintEffect3D.js                  # 3D paint visualizer
├── SoundtrackPlayer.tsx              # Audio playback component
├── WindSystem.js                     # Environment wind simulation
├── __tests__/                        # Component test suites
├── ui/
│   ├── Button.tsx                    # Button component
│   ├── LoadingSpinner.tsx           # Loading spinner
│   ├── LoadingOverlay.tsx            # Loading overlay
│   ├── GlassCard.tsx                 # Glassmorphism card
│   ├── Neumorphic.tsx                # Neumorphism components
│   ├── MicroInteractions.tsx        # Micro-interactions
│   └── AnimatedBackgrounds.tsx     # Animated backgrounds
└── transitions/
    ├── TransitionGallery.tsx         # Transition gallery
    ├── TransitionWrapper.tsx         # Transition wrapper
    └── PageTransitions.tsx            # Page transitions
```

### API Routes

```
app/api/
├── auth/
│   ├── login/route.ts                # User login
│   ├── signup/route.ts               # User signup
│   ├── logout/route.ts              # User logout
│   ├── me/route.ts                   # Get current user
│   ├── forgot-password/route.ts     # Forgot password
│   ├── reset-password/route.ts      # Reset password
│   └── change-password/route.ts     # Change password
├── tuneforge/
│   ├── cars/route.ts                 # Car database API
│   ├── tunes/route.ts                # Tunes API
│   ├── database/route.ts             # Tune database
│   ├── community-tunes/route.ts      # Community tunes
│   └── ai-tune/route.ts              # AI tune generation
├── favorites/route.ts                # Favorites API
├── fh5-locations/route.ts           # FH5 locations
├── map-progress/route.ts            # Map progress
├── map-proxy/route.ts                # Map proxy
├── ml/
│   └── enhance-colors/route.ts      # ML color enhancement
├── scans/route.ts                    # Scans API
├── scrape/route.ts                   # Scrape API
├── todos/route.ts                     # Todos API
├── transitions/
│   └── votes/route.ts                # Transition voting
├── dev/
│   └── analytics/route.ts            # Dev analytics API
└── og/route.tsx                      # OG image generation
```

### Library & Utility Structure

```
app/lib/
├── errorBoundary.tsx                # Error boundary utilities
├── cache.ts                          # Caching utilities
├── validation.ts                     # Input validation
├── indexedDB.ts                      # IndexedDB manager
├── db.ts                             # Database utilities
├── assetProtection.ts                # Asset protection utilities
├── colorUtils.ts                     # Color utilities
├── countryFlags.ts                   # Country flag utilities
├── car-specs.ts                      # Car specification data
├── tuning-calculator.js              # Tuning calculator logic
├── pythonApi.ts                      # Python API integration
└── logger.ts                         # Logging utilities

app/hooks/
├── useAnalytics.ts                   # Analytics hook
├── usePerformance.ts                # Performance hook
├── useOfflineStorage.ts              # Offline storage hook
├── useDeviceDetection.ts             # Device detection hook
├── useMapPersistence.ts             # Map persistence hook
├── useZoomDetection.ts               # Zoom detection hook
└── useAccessibleDialog.js            # Accessible dialog hook

app/types/
├── car.ts                            # Car type definitions
├── color.ts                          # Color type definitions
├── index.ts                          # Main type definitions
└── [other type files]

app/context/
├── TransitionContext.tsx            # Transition context
└── CarContext.tsx                   # Car context
```

## Component Functionality

### Core UI Components

#### Header.tsx
- Main navigation header with theme toggle
- Navigation links to main sections
- PWA install button integration
- "More" dropdown menu
- Responsive design

#### Footer.tsx
- Page footer with copyright
- Links to legal pages
- Social media links

#### TokyoBackground.tsx
- Animated Tokyo cityscape background
- Supports dark/light mode
- Video and image media support
- Asset protection integration

#### SimpleColorGrid.tsx
- Basic color grid for smaller datasets
- Responsive column adjustment
- Zoom detection integration
- Mobile-optimized rendering

#### VirtualColorGrid.tsx
- Virtualized grid for large datasets (10,000+ colors)
- Uses react-window for performance
- Responsive column calculation
- Container resize observation

#### ColorCard.tsx
- Individual color card component
- Displays color gradient preview
- Musical note audio feedback on interaction
- Favorite toggle functionality
- Color info popup trigger

### Authentication Components

#### AuthProvider.tsx
- React context provider for authentication
- Manages user session state
- Login, signup, logout functions
- Session token validation
- Provides useAuth hook

#### ProtectedRoute.tsx
- Route protection wrapper
- Redirects unauthenticated users
- Loading state during auth check
- Uses useAuth hook internally

#### AuthModal.tsx
- Modal dialog for authentication
- Login/signup form integration
- Error handling
- Close functionality

#### AuthNavButton.tsx
- Navigation button for auth
- Shows login/signup based on auth state
- Links to appropriate auth pages

### Data Display Components

#### CarStatsRadarChart.tsx
- Radar chart for car statistics
- Displays speed, handling, acceleration, etc.
- Responsive sizing
- Dark mode support

#### AdvancedTools.tsx
- Advanced color manipulation tools
- Dynamic import for performance
- Color mixing, harmonies, etc.

#### ImageColorExtractor.tsx
- AI-powered color extraction from images
- ML integration for color clustering
- File upload handling
- Results display with matched colors

#### ColorComparison.tsx
- Side-by-side color comparison
- HSB value comparison
- Visual difference display

#### TelemetryDashboard.tsx
- Real-time telemetry display
- WebSocket connection to game
- Speed, RPM, gear display
- Performance metrics

### Navigation Components

#### Breadcrumbs.tsx
- Breadcrumb navigation
- Dark mode support
- Simple, clean design

#### ResponsiveLayout.tsx
- Responsive layout wrapper
- Mobile optimization
- Breakpoint handling

### Performance Components

#### MobileGamingOptimizer.tsx
- Mobile gaming performance optimization
- Reduced animations on mobile
- Touch event optimization
- Battery saving features

#### ProgressiveLoader.tsx
- Progressive loading indicator
- Smooth loading states
- User feedback during data fetch

#### PerformanceMonitor.js
- Performance metrics monitoring
- Frame rate tracking
- Memory usage monitoring
- Debug information

### Error Handling Components

#### GamingErrorBoundary.tsx
- Gaming-focused error boundary
- Custom error UI
- Recovery actions
- Error logging

#### ErrorBoundary.js
- General error boundary
- Fallback UI
- Error reporting

#### ThirdPartyErrorBoundary.js
- Third-party script error boundary
- Isolates external script errors
- Prevents app crashes

### Utility Components

#### KeyboardShortcuts.tsx
- Keyboard shortcut handler
- Global shortcut registration
- Help overlay
- Customizable shortcuts

#### OfflineIndicator.js
- Offline status indicator
- Network state monitoring
- User notification

#### ZoomResponsiveContainer.tsx
- Zoom-responsive container
- Dynamic scaling
- Touch gesture support

### SEO Components

#### StructuredData.tsx
- JSON-LD structured data
- Schema.org integration
- SEO optimization

#### GamingSEO.tsx
- Gaming-focused SEO metadata
- OpenGraph tags
- Twitter cards

#### ForzaColorSheetSEO.tsx
- Forza color sheet specific SEO
- Color database metadata
- Search engine optimization

### Special Features

#### EasterEgg420.tsx
- 420 easter egg component
- Special animations
- Hidden content reveal
- Konami code detection

#### ColorAnalyticsDashboard.tsx
- Color usage analytics
- Trend visualization
- Popular colors ranking
- Statistical insights

## Page Functionality

### Main Pages

#### / (Home)
- Main color database interface
- Search and filter controls
- Color grid (simple or virtual)
- Advanced tools integration
- Favorites management
- Theme toggle
- Keyboard shortcuts

#### /tuneforge
- TuneForge tuning calculator
- Car selection
- Track selection
- Tune calculation
- Community tunes
- AI tune suggestions

#### /tuneforge/car/[slug]
- Individual car tuning page
- Car stats display
- Tune calculator
- Share codes
- Community tunes for specific car

#### /garage
- Car database
- Search by manufacturer, model, PI class
- Car stats display
- Filtering and sorting
- Car details

#### /telemetry
- Telemetry dashboard setup
- WebSocket bridge setup
- Game connection instructions
- Live data display
- Performance metrics

#### /image-match
- Paint scanner AI
- Image upload
- Color extraction
- ML-based matching
- Results display

#### /favorites
- User's saved colors
- Authentication required
- Remove favorites
- Local storage persistence

#### /profile
- User profile page
- Account settings
- Password change
- Favorites summary
- Authentication required

### Information Pages

#### /about
- Mission and features
- Technology stack
- Credits and acknowledgments
- Hidden easter egg (click title 4x)
- Step-by-step paint guide

#### /help
- Getting started guide
- FAQ
- Technical support
- Contact information

#### /how-to-use
- Step-by-step color usage guide
- HSB value explanation
- Controller shortcuts
- Advanced techniques

#### /blog
- Color insights articles
- Data analysis
- Technical guides
- Community features

### Auth Pages

#### /login
- User login form
- Email/password authentication
- Error handling
- Redirect after login
- AuthProvider wrapper

#### /signup
- User registration form
- Email/password/name
- Password confirmation
- Error handling
- Redirect after signup
- AuthProvider wrapper

#### /forgot-password
- Password reset request
- Email input
- Token generation
- Success/error states

#### /reset-password
- Password reset with token
- Token validation
- New password input
- Confirmation
- Success/error states

### Legal Pages

#### /privacy
- Privacy policy
- Data collection information
- Local storage usage
- Third-party services
- User rights

#### /terms
- Terms of service
- Use license
- Color data usage terms
- Disclaimer
- Contact information

### Special Pages

#### /location-finder
- FH5 location finder (coming soon)
- Interactive map
- Location categories
- Filter system
- Coming soon placeholder

#### /mobile-dash
- Mobile telemetry dashboard
- Simplified UI for mobile
- Touch-optimized controls
- Telemetry display

#### /transitions
- Page transition gallery
- 10 transition animations
- Voting system
- Preview functionality

#### /ui-showcase
- UI component showcase
- Glassmorphism demos
- Neumorphism demos
- Micro-interactions
- Animated backgrounds

#### /dev/analytics
- Developer analytics dashboard
- Favorites statistics
- Trend data
- Top colors/makes
- Authentication required
- Dev key protection

## Key Technologies

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React hooks (useState, useEffect, useContext)
- **Performance**: react-window (virtualization), dynamic imports
- **Authentication**: Custom AuthProvider with session tokens
- **Database**: Turso (community tunes), IndexedDB (local storage)
- **SEO**: Next.js metadata, structured data
- **PWA**: Service worker, manifest
- **Analytics**: Vercel Analytics, Speed Insights

## Important Patterns

### Code Obfuscation & Security (.enc files)
Almost all component, hook, and library files in the repository have a corresponding `.enc` (encrypted) version alongside the original source (e.g., `page.tsx.enc`, `tuning-calculator.js.enc`). This indicates a build or security step is applied to obfuscate or protect proprietary application logic and assets before deployment. The application likely uses a decryption loader or middleware to read these files.

### Authentication Pattern
All auth pages wrap their content in AuthProvider:
```tsx
<AuthProvider>
  <AuthContent />
</AuthProvider>
```

Protected routes use ProtectedRoute:
```tsx
<ProtectedRoute>
  <ProtectedContent />
</ProtectedRoute>
```

### Dynamic Imports
Heavy components are dynamically imported to reduce initial bundle:
```tsx
const HeavyComponent = dynamic(() => import('./HeavyComponent'), { ssr: false })
```

### Virtual Scrolling
Large datasets use react-window for performance:
- VirtualColorGrid for 10,000+ colors
- FixedSizeGrid for efficient rendering

### Theme System
- Dark/light mode toggle
- localStorage persistence
- CSS custom properties for theming

### Error Boundaries
- GamingErrorBoundary for gaming features
- ErrorBoundary for general errors
- ThirdPartyErrorBoundary for external scripts

## Build Configuration

- **Build Tool**: Next.js 16 with Turbopack
- **Runtime**: Edge runtime for some pages
- **Static Generation**: Most pages are static
- **Dynamic Pages**: Auth pages, tuneforge, telemetry

## Environment Variables

- `NEXT_PUBLIC_APP_URL` - Application URL
- `NEXT_PUBLIC_BASE_URL` - Base URL for API calls
- Database connection strings (not in repo)

## Common Issues & Solutions

### AuthProvider Wrapping
Any page using useAuth must be wrapped in AuthProvider to avoid "useAuth must be used within AuthProvider" errors.

### Property Names
Car objects use `manufacturer` not `make` property.

### Dynamic Imports
Components with heavy dependencies should be dynamically imported with `{ ssr: false }`.

### Virtual Scrolling
Use VirtualColorGrid for datasets over 1000 items to maintain performance.

## Development Notes

- Main entry point: app/page.tsx
- Root layout: app/layout.js
- Global styles: app/globals.css
- Custom CSS: app/animations.css, app/critical.css
- Build command: npm run build
- Dev command: npm run dev

## File Naming Conventions

- Client components: .tsx files
- Server components: .tsx with async functions
- API routes: route.ts files
- Utility files: .ts files
- Component files: PascalCase.tsx
- Page files: page.tsx or layout.tsx

## Module Connection Tree Diagram

```
Forza Color Universe
├── Root Layout (layout.js)
│   ├── ErrorBoundary
│   ├── ThirdPartyErrorBoundary
│   ├── EasterEgg420
│   ├── Analytics (Vercel)
│   └── Speed Insights
│
├── Main Pages
│   ├── / (Home)
│   │   ├── Header
│   │   │   ├── Button
│   │   │   └── PWAInstallButton
│   │   ├── Footer
│   │   ├── SimpleColorGrid
│   │   │   └── ColorCard
│   │   ├── VirtualColorGrid
│   │   │   └── ColorCard
│   │   ├── OptimizedSearchControls
│   │   ├── ResponsiveLayout
│   │   ├── TokyoBackground
│   │   ├── AdvancedTools (dynamic)
│   │   ├── ImageColorExtractor (dynamic)
│   │   ├── ColorComparison (dynamic)
│   │   ├── HSBPopup (dynamic)
│   │   ├── ColorRouletteHarmony (dynamic)
│   │   ├── HarmonyVisualizer (dynamic)
│   │   ├── ColorGenerator (dynamic)
│   │   ├── PerformanceMonitor (dynamic)
│   │   ├── ColorAnalyticsDashboard (dynamic)
│   │   ├── GamingErrorBoundary
│   │   ├── GamingSEO
│   │   ├── ForzaColorSheetSEO
│   │   ├── StatusAlert
│   │   ├── KeyboardShortcuts
│   │   └── OfflineIndicator
│   │
│   ├── /tuneforge
│   │   ├── TokyoBackground
│   │   ├── CarStatsRadarChart
│   │   ├── Breadcrumbs
│   │   └── TuningCalculator (lib)
│   │
│   ├── /tuneforge/car/[slug]
│   │   ├── TuneCalcClient
│   │   │   ├── TokyoBackground
│   │   │   ├── CarStatsRadarChart
│   │   │   └── Breadcrumbs
│   │
│   ├── /garage
│   │   └── GarageClient
│   │       ├── TokyoBackground
│   │       ├── Breadcrumbs
│   │       └── Car Stats Display
│   │
│   ├── /telemetry
│   │   ├── TokyoBackground
│   │   └── TelemetryDashboard (stub)
│   │
│   ├── /image-match
│   │   ├── TokyoBackground
│   │   └── Image Processing
│   │
│   ├── /mobile-dash
│   │   └── MobileTelemetryDash (stub)
│   │
│   └── /location-finder
│       ├── MapDisplay
│       ├── LocationCard
│       ├── ScenicFinder
│       ├── SpeedCameraList
│       ├── NeonRoadMap
│       └── MapCalibrator
│
├── Authentication Pages
│   ├── /login
│   │   └── AuthProvider → LoginContent
│   ├── /signup
│   │   └── AuthProvider → SignupForm
│   ├── /profile
│   │   └── AuthProvider → ProtectedRoute → ProfileContent
│   ├── /favorites
│   │   └── AuthProvider → ProtectedRoute → FavoritesContent
│   ├── /forgot-password
│   └── /reset-password
│
├── Information Pages
│   ├── /about
│   │   ├── TokyoBackground
│   │   └── EasterEgg420
│   ├── /help
│   │   └── TokyoBackground
│   ├── /how-to-use
│   ├── /contact
│   ├── /blog
│   ├── /privacy
│   └── /terms
│
├── Special Features
│   ├── /transitions
│   │   └── TransitionGallery
│   │       ├── TransitionWrapper
│   │       └── PageTransitions
│   └── /ui-showcase
│       ├── GlassCard components
│       ├── Neumorphic components
│       ├── MicroInteractions
│       └── AnimatedBackgrounds
│
├── Developer Tools
│   └── /dev/analytics
│       └── Dev Analytics Dashboard
│
└── API Routes
    ├── /api/auth/* (Authentication)
    ├── /api/tuneforge/* (Tuning data)
    ├── /api/favorites (Favorites)
    ├── /api/fh5-locations (Locations)
    ├── /api/ml/* (ML services)
    ├── /api/scans (Scans)
    ├── /api/dev/analytics (Analytics)
    └── /api/og (OG images)
```

## Component Dependency Graph

```
Core Dependencies:
┌─────────────────────────────────────────┐
│         React & Next.js Core              │
└────────────┬──────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────┐     ┌────▼────┐
│  Pages │     │Components│
└───┬────┘     └────┬────┘
    │               │
    │        ┌────┴────────┐
    │        │  Shared UI   │
    │        └────┬────────┘
    │             │
    │     ┌───────┴───────┐
    │     │   Libraries    │
    │     │  (hooks, lib)  │
    │     └───────────────┘
    │
    │  ┌───┴────────┐
    │  │   API Routes │
    │  └────────────┘
    │
    │  ┌───┴────────┐
    │  │  Contexts    │
    │  └────────────┘
```

## Data Flow Diagram

```
User Interaction
     │
     ▼
┌─────────────┐
│   Pages     │
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       │              │              │
       ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Components│  │   Hooks   │  │   Lib     │
└─────┬────┘  └────┬─────┘  └────┬─────┘
      │            │              │
      │            │              │
      ▼            ▼              ▼
┌──────────────────────────────────────┐
│         API Routes                  │
└────────────────┬───────────────────┘
                 │
                 ▼
┌──────────────────────────────────────┐
│         Database (Turso/IndexedDB)  │
└──────────────────────────────────────┘
```

## Authentication Flow

```
Unauthenticated User
        │
        ▼
┌───────────┐
│ Login Page │
└─────┬─────┘
      │
      ▼
┌──────────────────┐
│ AuthProvider     │
│ (login function) │
└─────┬────────────┘
      │
      ▼
┌───────────┐
│ /api/auth │
│   /login  │
└─────┬─────┘
      │
      ▼
┌──────────────────┐
│ Session Token    │
│ (localStorage)   │
└─────┬────────────┘
      │
      ▼
┌──────────────────┐
│ Protected Routes │
│ (Favorites, Profile)│
└──────────────────┘
```

## Recent Build Fixes

- Fixed AuthProvider wrapping in favorites, login, profile, signup pages
- Fixed TypeScript errors in components (PWAInstallButton, TokyoBackground)
- Fixed property name errors (make → manufacturer)
- Fixed import errors in scripts/page.tsx
- Fixed syntax error in tuneforge/page.tsx

## Performance Optimizations

- Virtual scrolling for large datasets
- Dynamic imports for heavy components
- Code splitting by route
- Image optimization
- CSS optimization
- Service worker for offline access
