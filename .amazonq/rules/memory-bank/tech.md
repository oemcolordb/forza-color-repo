# Technology Stack & Development

## Core Technologies

### Frontend Framework & Runtime
- **Next.js 15.1.3** - React framework with App Router for modern web development
- **React 19.0.0** - Latest React with concurrent features and improved performance
- **TypeScript 5.8.2** - Type-safe JavaScript development with strict mode enabled
- **Node.js 18.0+** - JavaScript runtime environment (minimum requirement)

### Styling & Design System
- **Tailwind CSS 3.4.17** - Utility-first CSS framework with custom configuration
- **PostCSS 8.5.1** - CSS processing and transformation pipeline
- **Autoprefixer 10.4.20** - Automatic CSS vendor prefix management
- **Inter Font** - Google Fonts integration with display swap optimization

### Testing & Quality Assurance
- **Jest 29.7.0** - JavaScript testing framework with comprehensive coverage
- **Testing Library React 16.3.0** - React component testing utilities
- **Testing Library Jest DOM 6.8.0** - Custom Jest matchers for DOM testing
- **Jest Environment JSDOM 29.7.0** - Browser environment simulation for tests
- **ESLint 9.17.0** - Code linting and quality enforcement
- **ESLint Config Next 15.1.3** - Next.js specific linting rules and configurations

### AI & External Services
- **Google Generative AI 0.21.0** - Gemini API integration for AI-powered features
- **Netlify Platform** - Hosting, edge functions, and serverless deployment

## Build System & Configuration

### Next.js Configuration Features
- **Static Export**: `output: 'export'` for static site generation and CDN optimization
- **Image Optimization**: Multi-format support (WebP, AVIF) with responsive sizing
- **Performance Optimizations**: CSS optimization, scroll restoration, modern browser targeting
- **Bundle Splitting**: Vendor chunk separation and intelligent cache optimization
- **Security Headers**: Comprehensive security header configuration (CSP, HSTS, etc.)
- **Webpack Customization**: Custom webpack configuration for advanced optimizations

### Environment Configuration
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_APP_NAME=Forza Color Universe
NEXT_PUBLIC_APP_DESCRIPTION=Explore 10,000+ automotive colors
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### TypeScript Configuration
- **Strict Mode**: Enabled for maximum type safety
- **Path Mapping**: Configured for clean import statements
- **JSX Transform**: React 18+ JSX transform enabled
- **Module Resolution**: Node.js module resolution strategy

## Development Workflow

### Core Development Commands
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build optimized production bundle
npm run start        # Start production server
npm run lint         # Run ESLint code quality checks
npm run test         # Execute Jest test suite
npm run test:watch   # Run tests in watch mode for development
```

### Development Server Features
- **Hot Module Replacement**: Instant updates during development
- **Fast Refresh**: React component state preservation during updates
- **TypeScript Integration**: Real-time type checking and error reporting
- **Automatic Port Detection**: Fallback ports if 3000 is occupied

## Deployment & Hosting

### Netlify Deployment Configuration
- **Build Command**: `npm run build`
- **Publish Directory**: `out` (Next.js static export output)
- **Node Version**: Specified in `.nvmrc` for consistent builds
- **Environment Variables**: Configured in Netlify dashboard for security

### Performance Optimizations
- **Static Site Generation**: Pre-built HTML for optimal loading performance
- **Edge Functions**: Global edge computing for reduced latency
- **CDN Integration**: Automatic global content distribution
- **Image Optimization**: Responsive images with modern format support
- **Bundle Analysis**: Webpack bundle analyzer integration for optimization

### Serverless Architecture
- **Netlify Functions**: API endpoints deployed as serverless functions
- **Edge Functions**: Performance-critical operations at the edge
- **Automatic Scaling**: Serverless auto-scaling based on demand
- **Global Distribution**: Functions deployed across multiple regions

## File Structure Standards

### CSS Architecture
- **Global Styles**: `globals.css` for application-wide base styles
- **Critical CSS**: `critical.css` for above-the-fold content optimization
- **Animation Definitions**: `animations.css` for custom keyframes and transitions
- **Tailwind Integration**: Utility-first approach with custom theme extensions

### Testing Configuration
- **Jest Setup**: `jest.config.js` with JSDOM environment and custom matchers
- **Global Test Setup**: `jest.setup.js` for browser API mocks and utilities
- **Component Tests**: Co-located in `__tests__` directories for organization
- **Coverage Reporting**: Configured for comprehensive test coverage analysis

### Build Optimizations
- **Tree Shaking**: Automatic dead code elimination
- **Code Splitting**: Route-based and component-based splitting
- **Minification**: JavaScript and CSS minification for production
- **Compression**: Gzip and Brotli compression support

## API Integration & Services

### Google Gemini AI Integration
- **Service Architecture**: Centralized AI service with caching layer
- **Error Handling**: Comprehensive error boundaries for AI feature failures
- **Rate Limiting**: Built-in rate limiting for API usage optimization
- **Caching Strategy**: Multi-layer caching to reduce API calls and costs

### Data Management Services
- **Color Data Service**: Centralized color data management with lazy loading
- **Performance Monitoring**: Custom hooks for performance measurement and analytics
- **Local Storage Integration**: Persistent user preferences and favorites
- **Export Services**: Multiple format support for color data export

### Netlify Functions API
- **Analytics Endpoint**: Server-side analytics data collection and processing
- **Color Search API**: Optimized search functionality with filtering capabilities
- **Data Export API**: Server-side color data export with format conversion
- **Rate Limiting**: API protection and usage management across endpoints