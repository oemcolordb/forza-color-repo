# Project Structure & Architecture

## Directory Organization

### Core Application (`/app`)
- **`components/`** - React UI components with specialized functionality
  - `ColorCard.tsx` - Individual color display component
  - `VirtualGrid.tsx` - Performance-optimized grid rendering
  - `ImageColorExtractor.tsx` - AI-powered color extraction from images
  - `LazyColorGrid.tsx` - Lazy-loaded color grid implementation
  - `__tests__/` - Component unit tests
- **`hooks/`** - Custom React hooks for shared logic
  - `useAnalytics.ts` - Analytics tracking functionality
  - `usePerformance.ts` - Performance monitoring utilities
- **`types/`** - TypeScript type definitions
  - `color.ts` - Color data structure definitions
- **`layout.tsx`** - Root application layout
- **`page.tsx`** - Main application entry point

### Data Services (`/services`)
- **`colorData.ts`** - Primary color data management
- **`colorDataLazy.ts`** - Lazy loading implementation for color data
- **`colorDataManager.ts`** - Advanced color data operations
- **`aiCache.ts`** - AI service caching layer

### Data Processing (`/scripts`)
- **Color Data Management**
  - `updateColorData.js` - Update existing color database
  - `addNewColorsToDatabase.js` - Add new colors to database
  - `matchColorToModels.js` - Match colors to vehicle models
- **Data Quality**
  - `removeDuplicateColors.js` - Remove duplicate entries
  - `fixDuplicateKeys.js` - Fix data integrity issues
  - `analyzeColorTypes.js` - Analyze color type distribution

### Deployment (`/netlify`)
- **`functions/`** - Serverless API endpoints
  - `search-colors.js` - Color search functionality
  - `color-details.js` - Individual color data retrieval
  - `export-colors.js` - Color data export functionality
- **`edge-functions/`** - Edge computing functions
  - `color-cache.js` - Color data caching
  - `security-headers.js` - Security header management
  - `rate-limit.js` - API rate limiting

### Static Assets (`/public`)
- `manifest.json` - PWA manifest
- `sw.js` - Service worker for offline functionality
- `robots.txt` - Search engine directives

## Architectural Patterns

### Component Architecture
- **Atomic Design**: Components organized by complexity (atoms → molecules → organisms)
- **Container/Presentational**: Clear separation between data logic and UI presentation
- **Compound Components**: Complex components built from smaller, reusable parts

### Data Flow
- **Unidirectional Data Flow**: Props down, events up pattern
- **Service Layer**: Centralized data management through services
- **Lazy Loading**: On-demand data loading for performance optimization
- **Virtual Scrolling**: Efficient rendering of large datasets

### Performance Patterns
- **Code Splitting**: Dynamic imports for route-based splitting
- **Memoization**: React.memo and useMemo for expensive computations
- **Virtualization**: Virtual grid for handling 10,000+ color items
- **Caching**: Multi-layer caching (browser, edge, service worker)

### State Management
- **Local State**: React hooks for component-specific state
- **Shared State**: Context API for cross-component state
- **Persistent State**: localStorage for user preferences and favorites
- **Server State**: Netlify functions for dynamic data

## Key Relationships

### Component Dependencies
- `VirtualGrid` → `ColorCard` (renders individual color items)
- `ImageColorExtractor` → AI services (color analysis)
- `LazyColorGrid` → `colorData` services (data fetching)

### Service Dependencies
- `colorDataManager` → `colorData` (extends base functionality)
- `aiCache` → Google Generative AI (caching layer)
- Netlify functions → `colorData` services (API endpoints)

### Build Dependencies
- Next.js App Router for routing and SSR
- Tailwind CSS for styling system
- TypeScript for type safety
- Jest for testing framework