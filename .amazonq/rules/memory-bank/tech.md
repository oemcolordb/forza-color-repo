# Technology Stack & Development

## Programming Languages & Versions

### Core Languages
- **TypeScript 5.8.2**: Primary language for type-safe development
- **JavaScript**: Used in configuration files and scripts
- **CSS**: Global styles and animations
- **HTML**: JSX/TSX templates in React components

### Runtime Environment
- **Node.js**: Version specified in .nvmrc file
- **React 19.0.0**: Latest React with concurrent features
- **Next.js 15.1.3**: Full-stack React framework with App Router

## Framework & Libraries

### Frontend Framework
- **Next.js 15.1.3**: 
  - App Router for file-based routing
  - Static site generation (SSG) with export
  - Image optimization and performance features
  - Edge runtime support

### UI & Styling
- **Tailwind CSS 3.4.17**: Utility-first CSS framework
- **PostCSS 8.5.1**: CSS processing and optimization
- **Autoprefixer 10.4.20**: CSS vendor prefixing
- **Critters 0.0.23**: Critical CSS inlining

### AI & External APIs
- **Google Generative AI 0.21.0**: Gemini API integration for enhanced features

## Development Tools & Testing

### Code Quality
- **ESLint 9.17.0**: Code linting and style enforcement
- **TypeScript Compiler**: Type checking and compilation
- **Prettier**: Code formatting (implied by project structure)

### Testing Framework
- **Jest 29.7.0**: JavaScript testing framework
- **Testing Library React 16.3.0**: React component testing utilities
- **Testing Library Jest DOM 6.8.0**: Custom Jest matchers
- **Jest Environment JSDOM 29.7.0**: DOM testing environment

### Type Definitions
- **@types/node 22.14.0**: Node.js type definitions
- **@types/react 19.0.1**: React type definitions
- **@types/react-dom 19.0.1**: React DOM type definitions
- **@types/jest 29.5.14**: Jest type definitions

## Build System & Configuration

### Build Tools
- **Next.js Build System**: Webpack-based with optimizations
- **TypeScript Compiler**: Type checking and transpilation
- **PostCSS**: CSS processing pipeline
- **Bundle Analyzer**: Development bundle analysis

### Configuration Files
- **next.config.js**: Next.js configuration with performance optimizations
- **tailwind.config.js**: Tailwind CSS customization
- **tsconfig.json**: TypeScript compiler configuration
- **jest.config.js**: Jest testing configuration
- **eslint.json**: ESLint rules and configuration
- **postcss.config.js**: PostCSS plugin configuration

### Environment Configuration
- **Environment Variables**: API keys and app configuration
- **Netlify Configuration**: Deployment and edge function settings
- **Package Scripts**: Development, build, and test commands

## Development Commands

### Core Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run lint        # Run ESLint
npm test            # Run Jest tests
npm run test:watch  # Run tests in watch mode
```

### Development Workflow
1. **Development**: `npm run dev` for hot reloading
2. **Testing**: `npm test` for unit tests
3. **Linting**: `npm run lint` for code quality
4. **Building**: `npm run build` for production
5. **Deployment**: Automatic via Netlify on git push

## Performance Optimizations

### Next.js Optimizations
- **Static Export**: Pre-built static files for fast loading
- **Image Optimization**: WebP/AVIF formats with responsive sizing
- **Bundle Splitting**: Vendor chunks and code splitting
- **Tree Shaking**: Unused code elimination
- **CSS Optimization**: Critical CSS inlining with Critters

### Runtime Optimizations
- **Edge Functions**: Netlify edge computing for caching and security
- **Virtual Scrolling**: Efficient rendering of large color lists
- **Lazy Loading**: On-demand component and data loading
- **Service Worker**: PWA caching strategies

### Development Optimizations
- **TypeScript**: Compile-time error catching
- **ESLint**: Code quality enforcement
- **Hot Reloading**: Fast development iteration
- **Bundle Analysis**: Performance monitoring in development

## Deployment & Infrastructure

### Hosting Platform
- **Netlify**: Static site hosting with edge functions
- **CDN**: Global content delivery network
- **Edge Computing**: Geolocation and caching optimization

### CI/CD Pipeline
- **Git Integration**: Automatic deployment on push
- **Build Process**: Next.js static export
- **Environment Variables**: Secure configuration management
- **Performance Monitoring**: Built-in analytics and optimization