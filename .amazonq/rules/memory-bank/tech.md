# Technology Stack & Development

## Core Technologies

### Frontend Framework
- **Next.js 15.1.3** - React framework with App Router
- **React 19.0.0** - UI library with latest features
- **TypeScript 5.8.2** - Type-safe JavaScript development

### Styling & UI
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **PostCSS 8.5.1** - CSS processing and optimization
- **Autoprefixer 10.4.20** - CSS vendor prefix automation

### AI & External Services
- **Google Generative AI 0.21.0** - AI-powered color analysis and extraction
- **Critters 0.0.23** - Critical CSS extraction for performance

### Development Tools
- **ESLint 9.17.0** - Code linting and quality enforcement
- **Jest 29.7.0** - Testing framework
- **Testing Library** - React component testing utilities
  - `@testing-library/react 16.3.0`
  - `@testing-library/jest-dom 6.8.0`

## Build System & Dependencies

### Package Management
- **npm** - Primary package manager
- **Node.js 18.0+** - Runtime requirement (specified in .nvmrc)

### Build Configuration
- **next.config.js** - Next.js build configuration
- **tailwind.config.js** - Tailwind CSS customization
- **postcss.config.js** - PostCSS processing setup
- **tsconfig.json** - TypeScript compiler configuration

### Testing Setup
- **jest.config.js** - Jest testing configuration
- **jest.setup.js** - Test environment setup
- **jest-environment-jsdom** - DOM testing environment

## Development Commands

### Core Development
```bash
npm run dev          # Start development server (Next.js dev mode)
npm run build        # Build for production (Next.js build + export)
npm run start        # Start production server
```

### Code Quality
```bash
npm run lint         # Run ESLint code analysis
npm run test         # Run Jest test suite
npm run test:watch   # Run tests in watch mode
```

### Environment Setup
```bash
npm install          # Install all dependencies
cp .env.local.example .env.local  # Setup environment variables
```

## Deployment & Infrastructure

### Hosting Platform
- **Netlify** - Primary deployment platform
- **Edge Functions** - Serverless computing at the edge
- **Build Settings**:
  - Build command: `npm run build`
  - Publish directory: `out`

### Environment Variables
- `NEXT_PUBLIC_GEMINI_API_KEY` - Google AI API key
- `NEXT_PUBLIC_APP_URL` - Application base URL

### Performance Optimizations
- **Static Site Generation (SSG)** - Pre-built pages for performance
- **Edge Functions** - Geographically distributed computing
- **Service Worker** - Offline functionality and caching
- **Critical CSS** - Above-the-fold CSS optimization

## Data Processing Tools

### Scraping & Data Collection
- **Node.js Scripts** - Custom data extraction tools
- **autocolorlibrary-*.json** - Processed color datasets
- **scrape-*.js** - Web scraping utilities for color data

### Data Management
- **JSON-based Storage** - Structured color data files
- **Script-based Processing** - Automated data cleaning and organization
- **Duplicate Detection** - Data quality assurance tools

## Development Workflow

### Local Development
1. Clone repository
2. Install dependencies with `npm install`
3. Setup environment variables
4. Run `npm run dev` for development server
5. Access application at `http://localhost:3000`

### Testing Strategy
- **Unit Tests** - Component and utility function testing
- **Integration Tests** - Service and API endpoint testing
- **Performance Tests** - Virtual scrolling and rendering optimization

### Code Quality Standards
- **TypeScript** - Strict type checking enabled
- **ESLint** - Enforced code style and best practices
- **Prettier** - Consistent code formatting (implied by ESLint config)