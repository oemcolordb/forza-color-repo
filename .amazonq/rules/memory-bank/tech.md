# Technology Stack & Development

## Core Technologies

### Frontend Framework

- **Next.js 15.1.3**: React framework with App Router, static generation, and ISR
- **React 19.0.0**: Latest React with concurrent features and improved performance
- **TypeScript 5.8.2**: Type safety, enhanced IDE support, and compile-time error checking

### Styling & UI

- **Tailwind CSS 3.4.17**: Utility-first CSS framework for rapid UI development
- **PostCSS 8.5.1**: CSS processing, autoprefixing, and optimization
- **Custom CSS**: Animations, critical styles, and performance-optimized stylesheets

### Development Tools

- **ESLint 9.17.0**: Code linting with Next.js configuration
- **Jest 29.7.0**: Testing framework with jsdom environment
- **React Testing Library 16.3.0**: Component testing utilities

## Multi-Platform Support

### Desktop Applications

- **Electron 38.2.0**: Cross-platform desktop apps with web technologies
- **Tauri 2.8.4**: Lightweight native desktop apps with Rust backend
- **Electron Builder 26.0.12**: Desktop app packaging and distribution

### Web Deployment

- **Netlify**: Primary hosting with edge functions and CDN
- **Netlify Functions**: Serverless backend for API endpoints
- **Edge Functions**: Performance optimization at edge locations

## AI & External Services

- **Google Generative AI 0.21.0**: Gemini API integration for color analysis
- **Sharp 0.34.4**: High-performance image processing and optimization
- **Critters 0.0.23**: Critical CSS extraction and inlining

## Development Commands

### Primary Development

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build with static export
npm run start        # Start production server
npm run lint         # Run ESLint code analysis
```

### Testing & Quality

```bash
npm run test         # Run Jest test suite
npm run test:watch   # Run tests in watch mode
```

### Desktop Applications

```bash
npm run electron     # Start Electron desktop app
npm run electron:build  # Build Electron app for distribution
npm run tauri        # Start Tauri development
npm run tauri:build  # Build native Tauri application
npm run dist         # Build and package Tauri app
```

## Build Configuration

### Next.js Configuration (`next.config.js`)

- Static export for deployment compatibility
- Image optimization with Sharp
- Performance optimizations and bundle analysis
- Custom webpack configurations for multi-platform builds

### TypeScript Configuration (`tsconfig.json`)

- Strict type checking enabled
- Path mapping for clean imports
- Next.js App Router support
- Incremental compilation for faster builds

### Tailwind Configuration (`tailwind.config.js`)

- Custom color palette extensions
- Responsive breakpoints
- Animation utilities
- Dark mode support with class strategy

## Testing Setup

### Jest Configuration (`jest.config.js`)

- jsdom environment for DOM testing
- TypeScript support with ts-jest
- Module path mapping
- Setup files for testing utilities

### Testing Libraries

- **@testing-library/jest-dom**: Custom Jest matchers for DOM
- **@testing-library/react**: React component testing utilities
- **Jest Environment jsdom**: Browser-like environment for tests

## Environment Variables

### Required Configuration (`.env.local`)

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development Setup

1. Copy `.env.local.example` to `.env.local`
2. Configure Gemini API key for AI features
3. Set application URL for proper routing

## Performance Optimizations

### Build Optimizations

- **Tree Shaking**: Automatic dead code elimination
- **Code Splitting**: Dynamic imports for non-critical components
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Static Generation**: Pre-rendered pages for optimal performance

### Runtime Optimizations

- **Virtual Scrolling**: Efficient large dataset rendering
- **Lazy Loading**: On-demand component and data loading
- **Image Optimization**: Next.js Image with Sharp processing
- **Caching**: Multi-level caching strategy (memory, localStorage, CDN)

## Development Requirements

### System Requirements

- **Node.js**: Version 18.0 or higher (specified in `.nvmrc`)
- **npm**: Package manager (or yarn alternative)
- **Git**: Version control and repository management

### IDE Recommendations

- **VS Code**: Recommended with TypeScript and ESLint extensions
- **TypeScript**: Enhanced IntelliSense and error detection
- **Tailwind CSS IntelliSense**: Class name autocompletion

## Deployment Targets

### Web Deployment

- **Netlify**: Primary deployment with automatic builds
- **Static Export**: Compatible with any static hosting provider
- **CDN**: Global content delivery for optimal performance

### Desktop Distribution

- **Electron**: Windows, macOS, and Linux desktop applications
- **Tauri**: Native performance with smaller bundle sizes
- **Portable**: Self-contained server for offline usage

### Mobile Support

- **PWA**: Progressive Web App capabilities
- **Responsive Design**: Mobile-optimized interface
- **Touch Interactions**: Optimized for touch devices
