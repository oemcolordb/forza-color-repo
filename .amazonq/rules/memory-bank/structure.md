# Project Structure & Architecture

## Directory Organization

### Core Application (`/app/`)
- **`page.tsx`** - Main application entry point with color grid and search functionality
- **`layout.tsx`** - Root layout with global providers, metadata, and font configuration
- **`globals.css`** - Global styles, CSS variables, and base styling
- **`critical.css`** - Critical path CSS for above-the-fold content optimization
- **`animations.css`** - Custom animation definitions and keyframes
- **`error.tsx`** - Global error page component
- **`not-found.tsx`** - 404 error page component

### Components (`/app/components/`)
- **`ColorCard.tsx`** - Individual color display component with interaction handlers
- **`ColorStats.tsx`** - Color analytics and statistics dashboard
- **`VirtualGrid.tsx`** - Virtual scrolling grid for performance optimization
- **`LazyColorGrid.tsx`** - Lazy-loaded color grid implementation
- **`ModelBrowser.tsx`** - Vehicle model browsing and selection interface
- **`Header.tsx`** - Application header with navigation and theme toggle
- **`Footer.tsx`** - Application footer with links and information
- **`LoadingSpinner.tsx`** - Reusable loading state component
- **`ErrorBoundary.tsx`** - React error boundary for error handling
- **`ExportButton.tsx`** - Color data export functionality
- **`ShareButton.tsx`** - Color sharing functionality with social integration
- **`SecurityHeaders.tsx`** - Security header management component

### Hooks (`/app/hooks/`)
- **`useAnalytics.ts`** - Analytics tracking and event management
- **`usePerformance.ts`** - Performance monitoring and measurement utilities

### Types (`/app/types/`)
- **`color.ts`** - TypeScript type definitions for color data structures

### Services (`/services/`)
- **`colorData.ts`** - Core color data management and storage
- **`colorDataLazy.ts`** - Lazy loading color data service with caching
- **`colorDataManager.ts`** - Advanced color data operations and utilities
- **`aiCache.ts`** - AI service caching layer for Gemini API

### Scripts (`/scripts/`)
- **`matchColorToModels.js`** - Color-to-model matching utilities and algorithms
- **`updateColorData.js`** - Data update and maintenance automation scripts

### Netlify Functions (`/netlify/`)
- **`functions/`** - Serverless API endpoints
  - `analytics.js` - Analytics data collection and processing
  - `color-details.js` - Color detail retrieval API
  - `export-colors.js` - Color export functionality
  - `get-makes.js` - Vehicle manufacturer data API
  - `search-colors.js` - Color search API with filtering
- **`edge-functions/`** - Edge computing functions for global performance
  - `ab-test.js` - A/B testing logic and routing
  - `color-cache.js` - Color data caching at the edge
  - `geolocation.js` - Location-based features and routing
  - `rate-limit.js` - API rate limiting and protection
  - `security-headers.js` - Security header injection

### Testing (`/app/components/__tests__/`)
- **`ColorCard.test.tsx`** - Component unit tests with comprehensive coverage
- **`jest.config.js`** - Jest testing configuration and setup
- **`jest.setup.js`** - Test environment setup and global mocks

### Data Files (Root Level)
- **`autocolorlibrary-*.json`** - Color database files from various sources
- **`scrape-*.js`** - Data scraping and extraction automation scripts

## Architectural Patterns

### Component Architecture
- **Functional Components**: All components use React functional components with hooks
- **Component Composition**: Modular, reusable components with clear separation of concerns
- **Error Boundaries**: Comprehensive error handling at multiple component levels
- **Performance Optimization**: Virtual scrolling, lazy loading, and React.memo usage

### Data Management Architecture
- **Service Layer**: Centralized data services for color management and operations
- **Lazy Loading Strategy**: Progressive data loading for large datasets (10,000+ colors)
- **Multi-Layer Caching**: Service-level caching, AI cache, and edge function caching
- **Type Safety**: Full TypeScript coverage for all data structures and operations

### Performance Architecture
- **Virtual Scrolling**: Efficient rendering of large color grids without DOM bloat
- **Code Splitting**: Automatic bundle splitting with Next.js App Router
- **Image Optimization**: Next.js image optimization with WebP/AVIF formats
- **Edge Computing**: Netlify edge functions for global low-latency performance

### Deployment Architecture
- **Static Export**: Next.js static export for optimal hosting and CDN distribution
- **Serverless Functions**: API endpoints deployed as serverless functions
- **Edge Functions**: Global edge computing for performance-critical operations
- **Progressive Web App**: PWA capabilities with service worker for offline usage

## Key Relationships & Data Flow

### Component Hierarchy
```
Layout (Root)
├── Header (Navigation & Theme)
├── Page (Main Content)
│   ├── Filter Controls
│   ├── ColorStats (Analytics)
│   ├── ModelBrowser (Navigation)
│   ├── LazyColorGrid (Display)
│   │   └── ColorCard (Individual Items)
│   └── Loading/Error States
└── Footer (Information)
```

### Data Flow Architecture
1. **Color Data Loading**: Services → Lazy Loading → Component State
2. **User Interactions**: UI Events → Hooks → State Updates → Re-rendering
3. **Search & Filtering**: Input → Service Layer → Filtered Results → UI Update
4. **Performance Monitoring**: Hooks → Analytics Service → External Tracking

### Service Dependencies
- **Color Services** ← JSON Data Files ← Scraping Scripts
- **AI Services** ← Google Gemini API ← Caching Layer
- **Analytics Services** ← Performance Hooks ← Component Events
- **Export/Share Services** ← Color Data Services ← User Selections

### State Management Flow
- **Local State**: Component-level state with useState and useEffect
- **Derived State**: Computed values with useMemo for performance
- **Persistent State**: localStorage integration for favorites and preferences
- **Global State**: Context-free architecture with prop drilling for simplicity