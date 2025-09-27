# Technology Stack & Development

## Core Technologies

### Frontend Framework
- **Next.js 15.1.3**: React framework with App Router, SSG, and performance optimizations
- **React 19.0.0**: Latest React with concurrent features and improved hooks
- **TypeScript 5.8.2**: Type safety and enhanced developer experience

### Styling & UI
- **Tailwind CSS 3.4.17**: Utility-first CSS framework for rapid UI development
- **PostCSS 8.5.1**: CSS processing and optimization
- **Autoprefixer 10.4.20**: Automatic vendor prefix handling
- **Custom CSS**: Animations and critical styles for performance

### Build System & Optimization
- **Webpack**: Module bundling with custom optimization configurations
- **Critters 0.0.23**: Critical CSS inlining for performance
- **Bundle Analysis**: Development-time bundle size analysis
- **Code Splitting**: Automatic and manual code splitting strategies

## Development Tools

### Testing Framework
- **Jest 29.7.0**: JavaScript testing framework
- **@testing-library/react 16.3.0**: React component testing utilities
- **@testing-library/jest-dom 6.8.0**: Custom Jest matchers for DOM testing
- **jsdom**: Browser environment simulation for testing

### Code Quality
- **ESLint 9.17.0**: JavaScript/TypeScript linting
- **eslint-config-next 15.1.3**: Next.js specific ESLint configuration
- **TypeScript Compiler**: Static type checking and compilation

### AI Integration
- **@google/generative-ai 0.21.0**: Google Gemini API for color analysis and recommendations

## Deployment & Infrastructure

### Hosting Platform
- **Netlify**: Static site hosting with edge functions and CDN
- **Static Export**: Next.js static export for optimal performance
- **Edge Functions**: JavaScript functions running at edge locations

### Performance Configuration
```javascript
// Next.js optimizations
output: 'export'
trailingSlash: true
images: { unoptimized: true }
experimental: {
  optimizeCss: true,
  scrollRestoration: true
}
```

### Build Commands
```bash
npm run dev          # Development server (Next.js dev)
npm run build        # Production build (Next.js build)
npm run start        # Production server (Next.js start)
npm run lint         # ESLint code analysis
npm run test         # Jest test suite
npm run test:watch   # Jest in watch mode
```

## Environment Configuration

### Required Environment Variables
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Forza Color Universe
NEXT_PUBLIC_APP_DESCRIPTION=Explore automotive colors
```

### Development Setup
1. **Node.js**: Version 18.0+ (specified in .nvmrc)
2. **Package Manager**: npm or yarn
3. **Environment**: Copy .env.local.example to .env.local

## Performance Optimizations

### Bundle Optimization
- **Vendor Chunking**: Separate vendor libraries into dedicated chunks
- **Tree Shaking**: Elimination of unused code
- **Minification**: Code compression for production builds
- **Console Removal**: Production console.log removal (except errors/warnings)

### Image Optimization
- **Multiple Formats**: WebP and AVIF support
- **Responsive Images**: Device-specific image sizes
- **Lazy Loading**: Intersection Observer-based lazy loading
- **Unoptimized Mode**: Static export compatibility

### Runtime Performance
- **Virtual Scrolling**: Efficient rendering of large datasets
- **Lazy Components**: Dynamic component loading
- **Memoization**: React.memo and useMemo optimizations
- **Service Worker**: Offline caching and background sync

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Lint code
npm run lint
```

### Production Build
```bash
# Build for production
npm run build

# Test production build locally
npm run start
```

### Testing Strategy
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: Component interaction testing
- **Performance Tests**: Bundle size and runtime performance monitoring
- **Accessibility Tests**: WCAG compliance verification

## Browser Support

### Target Browsers
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Progressive Enhancement**: Graceful degradation for older browsers

### Web APIs Used
- **Intersection Observer**: Lazy loading and virtual scrolling
- **Web Share API**: Native sharing functionality
- **Service Worker**: Offline capabilities and caching
- **Local Storage**: User preferences and favorites
- **Canvas API**: Image color extraction
- **File API**: Image upload and processing

## Security Considerations

### Content Security Policy
- **Strict CSP**: Implemented via Netlify edge functions
- **XSS Protection**: Input sanitization and output encoding
- **HTTPS Only**: Secure connection enforcement

### Data Privacy
- **No Personal Data**: No collection of personally identifiable information
- **Local Storage**: User preferences stored locally only
- **Analytics**: Privacy-focused analytics implementation