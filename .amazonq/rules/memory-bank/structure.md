# Project Structure & Architecture

## Directory Organization

### Core Application (`/app`)
- **`/components`**: React components organized by functionality
  - UI components (ColorCard, Header, Footer)
  - Feature components (ColorPalette, ModelBrowser, VirtualGrid)
  - Utility components (LoadingSpinner, ErrorBoundary)
  - Test files in `__tests__/` subdirectory
- **`/hooks`**: Custom React hooks for analytics and performance
- **`/types`**: TypeScript type definitions for color data structures
- **`/lib`**: Utility libraries and helper functions
- **Root files**: Layout, page components, global styles, and error handling

### Services Layer (`/services`)
- **`colorData.ts`**: Main color data service and management
- **`colorDataLazy.ts`**: Lazy loading implementation for color data
- **`colorDataManager.ts`**: Advanced color data operations
- **`aiCache.ts`**: AI-powered caching and optimization

### Deployment & Functions (`/netlify`)
- **`/edge-functions`**: Edge computing functions for performance
  - A/B testing, caching, geolocation, rate limiting, security
- **`/functions`**: Serverless functions for API endpoints
  - Analytics, color details, export, search functionality

### Data Processing (`/scripts`)
- Color data processing and manipulation scripts
- Database update and maintenance utilities
- Color matching and deduplication tools
- Data analysis and type generation scripts

### Static Assets (`/public`)
- Images, icons, and media files
- PWA manifest and service worker
- SEO and metadata files

## Core Components & Relationships

### Data Flow Architecture
```
Color Data (JSON) → Services Layer → React Components → User Interface
                 ↓
              Edge Functions → Caching → Performance Optimization
```

### Component Hierarchy
- **Layout** (app/layout.tsx)
  - **Header** (navigation, search, theme toggle)
  - **Main Content** (page-specific components)
    - **ColorGrid** (virtual scrolling, lazy loading)
    - **ColorCard** (individual color display)
    - **Filters** (search, manufacturer, type filters)
  - **Footer** (links, information)

### Service Integration
- **ColorData Service**: Centralized color data management
- **Performance Hooks**: Analytics and performance monitoring
- **Edge Functions**: Caching, security, and optimization
- **AI Integration**: Google Gemini API for enhanced features

## Architectural Patterns

### Next.js App Router Pattern
- File-based routing with app directory structure
- Server and client component separation
- Static site generation with export configuration
- Edge runtime optimization

### Component Architecture
- Functional components with React hooks
- TypeScript for type safety
- Modular component design with single responsibility
- Test-driven development with Jest and Testing Library

### Performance Patterns
- Virtual scrolling for large datasets
- Lazy loading and code splitting
- Image optimization with Next.js Image component
- Bundle optimization with webpack configuration

### Data Management
- JSON-based color database
- Client-side caching and local storage
- Edge function caching for API responses
- Lazy loading strategies for large datasets

### Styling Architecture
- Tailwind CSS utility-first approach
- CSS modules for component-specific styles
- Dark/light theme system with CSS variables
- Responsive design with mobile-first approach

## Key Integrations

### External Services
- **Google Gemini AI**: Enhanced color analysis and features
- **Netlify**: Hosting, edge functions, and deployment
- **Analytics**: Performance and usage tracking

### Development Tools
- **TypeScript**: Type safety and developer experience
- **ESLint**: Code quality and consistency
- **Jest**: Unit testing and test coverage
- **Tailwind CSS**: Utility-first styling framework