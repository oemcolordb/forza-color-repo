# Project Structure & Architecture

## Directory Organization

### Core Application (`/app`)

```
app/
├── components/          # React UI components
│   ├── __tests__/      # Component test files
│   ├── ColorCard.tsx   # Individual color display
│   ├── ColorPalette.tsx # Color collection views
│   ├── VirtualGrid.tsx # Performance-optimized grids
│   ├── TokyoBackground.tsx # Animated backgrounds
│   └── WindSystem.tsx  # Interactive animations
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── types/              # TypeScript definitions
├── layout.tsx          # Root layout component
├── page.tsx            # Main application page
└── globals.css         # Global styles
```

### Services Layer (`/services`)

```
services/
├── colorData.ts        # Main color data management
├── colorDataLazy.ts    # Lazy loading utilities
├── colorDataManager.ts # Data operations
└── aiCache.ts          # AI service caching
```

### Data Processing (`/scripts`)

```
scripts/
├── addNewColorsToDatabase.js    # Database updates
├── matchColorToModels.js        # Color-model associations
├── updateColorData.js           # Data synchronization
├── analyzeColorTypes.js         # Type analysis
└── removeDuplicateColors.js     # Data cleanup
```

### Deployment & Infrastructure

```
netlify/
├── functions/          # Serverless functions
│   ├── search-colors.js
│   ├── color-details.js
│   └── analytics.js
└── edge-functions/     # Edge computing
    ├── color-cache.js
    ├── rate-limit.js
    └── security-headers.js

electron/               # Desktop application
├── main.js            # Electron main process
└── preload.js         # Preload scripts

src-tauri/             # Native desktop (Rust)
├── src/main.rs        # Tauri main application
└── tauri.conf.json    # Configuration
```

## Architectural Patterns

### Component Architecture

- **Atomic Design**: Components organized by complexity (atoms → molecules → organisms)
- **Container/Presentational**: Clear separation of logic and presentation
- **Compound Components**: Complex components with sub-components (ColorCard, ColorPalette)

### Data Flow Architecture

- **Unidirectional Data Flow**: Props down, events up pattern
- **Service Layer**: Centralized data management in `/services`
- **Lazy Loading**: Performance optimization with dynamic imports
- **Caching Strategy**: Multi-level caching (memory, localStorage, edge)

### Performance Architecture

- **Virtual Scrolling**: Efficient rendering of large color datasets
- **Code Splitting**: Dynamic imports for non-critical components
- **Image Optimization**: Next.js Image component with Sharp processing
- **Bundle Optimization**: Tree shaking and dead code elimination

## Core Components Relationships

### Color Display System

```
ColorPalette (Container)
├── VirtualGrid (Performance)
│   └── ColorCard (Presentation)
│       ├── ColorStats (Analytics)
│       └── ShareButton (Actions)
└── LazyColorGrid (Optimization)
```

### Background & Animation System

```
TokyoBackground (Visual)
├── WindSystem (Physics)
├── MobileOptimizedBackground (Responsive)
└── MusicPlayer (Audio)
```

### Data Management Flow

```
colorData.ts (Core)
├── colorDataManager.ts (Operations)
├── colorDataLazy.ts (Loading)
└── aiCache.ts (Intelligence)
```

## Multi-Platform Architecture

### Web Application (Primary)

- **Framework**: Next.js 15 with App Router
- **Deployment**: Netlify with edge functions
- **Performance**: Static generation + ISR

### Desktop Applications

- **Electron**: Cross-platform desktop with web technologies
- **Tauri**: Native performance with Rust backend
- **Portable**: Self-contained HTTP server version

### Mobile Optimization

- **PWA**: Progressive Web App capabilities
- **Responsive**: Mobile-first design approach
- **Touch**: Optimized touch interactions

## Configuration & Build System

### Build Tools

- **Next.js**: Primary build system and framework
- **TypeScript**: Type safety and development experience
- **Tailwind CSS**: Utility-first styling system
- **PostCSS**: CSS processing and optimization

### Quality Assurance

- **ESLint**: Code linting and style enforcement
- **Jest**: Unit and integration testing
- **React Testing Library**: Component testing utilities
- **TypeScript**: Compile-time type checking

### Environment Management

- **Development**: Hot reloading with Next.js dev server
- **Production**: Optimized builds with static export
- **Testing**: Isolated test environment with jsdom
- **Deployment**: Automated builds on Netlify

## Data Architecture

### Color Data Structure

- **Primary Dataset**: JSON files with color information
- **Indexing**: Manufacturer, model, and type-based organization
- **Relationships**: Color-to-model associations and variants
- **Metadata**: HSB values, color types, and manufacturer details

### Performance Optimizations

- **Lazy Loading**: On-demand data fetching
- **Virtual Scrolling**: Efficient large dataset rendering
- **Caching**: Multi-level caching strategy
- **Compression**: Optimized data formats and delivery
