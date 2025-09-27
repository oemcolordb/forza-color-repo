# Project Structure & Architecture

## Directory Organization

### Core Application (`/app`)
```
app/
├── components/          # React UI components
│   ├── __tests__/      # Component test files
│   ├── ColorCard.tsx   # Individual color display component
│   ├── ColorPalette.tsx # Color collection display
│   ├── LazyColorGrid.tsx # Performance-optimized color grid
│   ├── VirtualGrid.tsx # Virtual scrolling implementation
│   ├── ImageColorExtractor.tsx # Image color analysis
│   ├── TokyoBackground.tsx # Animated background component
│   ├── WindSystem.tsx  # Visual effects system
│   └── [other components]
├── hooks/              # Custom React hooks
│   ├── useAnalytics.ts # Analytics tracking
│   └── usePerformance.ts # Performance monitoring
├── types/              # TypeScript type definitions
│   └── color.ts        # Color-related types
├── lib/                # Utility libraries
├── layout.tsx          # Root application layout
├── page.tsx            # Home page component
├── globals.css         # Global styles
└── animations.css      # Animation definitions
```

### Data Services (`/services`)
```
services/
├── colorData.ts        # Main color data management
├── colorDataLazy.ts    # Lazy loading implementation
├── colorDataManager.ts # Data management utilities
└── aiCache.ts          # AI-powered caching system
```

### Serverless Functions (`/netlify`)
```
netlify/
├── functions/          # Netlify serverless functions
│   ├── analytics.js    # Analytics data processing
│   ├── color-details.js # Color information API
│   ├── export-colors.js # Color export functionality
│   ├── get-makes.js    # Manufacturer data API
│   └── search-colors.js # Color search API
└── edge-functions/     # Edge computing functions
    ├── color-cache.js  # Edge caching
    ├── rate-limit.js   # Request rate limiting
    └── security-headers.js # Security header management
```

### Data Processing (`/scripts`)
```
scripts/
├── addForzaColors.js   # Color data import scripts
├── matchColorToModels.js # Color-to-model matching
├── updateColorData.js  # Data update utilities
├── analyzeColorTypes.js # Color type analysis
└── [other data scripts]
```

### Static Assets (`/public`)
```
public/
├── manifest.json       # PWA manifest
├── robots.txt          # SEO robots file
├── sw.js              # Service worker
├── icon.svg           # Application icon
└── [image assets]     # Background and UI images
```

## Architectural Patterns

### Component Architecture
- **Atomic Design**: Components organized by complexity (atoms, molecules, organisms)
- **Container/Presentational**: Clear separation between data logic and UI presentation
- **Compound Components**: Complex components built from smaller, reusable parts
- **Render Props**: Flexible component composition patterns

### Data Management
- **Service Layer**: Centralized data access through service modules
- **Lazy Loading**: On-demand data loading for performance optimization
- **Caching Strategy**: Multi-level caching (browser, edge, server)
- **State Management**: React hooks for local state, context for global state

### Performance Architecture
- **Virtual Scrolling**: Efficient rendering of large color collections
- **Code Splitting**: Dynamic imports for route-based and component-based splitting
- **Bundle Optimization**: Webpack configuration for optimal bundle sizes
- **Image Optimization**: Next.js image optimization with multiple formats

### API Architecture
- **Serverless Functions**: Netlify functions for backend operations
- **Edge Functions**: Edge computing for performance-critical operations
- **RESTful Design**: Clean API endpoints following REST principles
- **Error Handling**: Comprehensive error boundaries and fallback mechanisms

## Core Components & Relationships

### Color Display System
- `ColorCard` → Individual color presentation
- `ColorPalette` → Collection of related colors
- `LazyColorGrid` → Performance-optimized grid layout
- `VirtualGrid` → Virtual scrolling implementation

### Search & Filter System
- `SearchBar` → User input interface
- `FilterPanel` → Advanced filtering options
- `ColorStats` → Analytics and statistics display
- `ColorTrends` → Trend analysis visualization

### Data Flow
1. **Data Services** → Load and manage color data
2. **Search Logic** → Process user queries and filters
3. **Virtual Grid** → Efficiently render visible items
4. **Color Cards** → Display individual color information
5. **Analytics** → Track user interactions and preferences

### Visual Effects System
- `TokyoBackground` → Animated background with Tokyo theme
- `WindSystem` → Particle effects and animations
- `LoadingSpinner` → Loading state indicators
- CSS animations → Smooth transitions and micro-interactions

## Integration Points

### External Services
- **Google Generative AI**: Color analysis and recommendations
- **Netlify**: Hosting, functions, and edge computing
- **Analytics**: User behavior tracking and insights

### Browser APIs
- **Service Worker**: Offline functionality and caching
- **Web Share API**: Native sharing capabilities
- **Intersection Observer**: Lazy loading and virtual scrolling
- **Local Storage**: User preferences and favorites

### Build System Integration
- **Next.js**: React framework with SSG/SSR capabilities
- **Tailwind CSS**: Utility-first styling system
- **TypeScript**: Type safety and developer experience
- **Jest**: Testing framework for components and utilities