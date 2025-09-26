# Technology Stack

## Programming Languages
- **TypeScript 5.8.2**: Primary language for type-safe development
- **JavaScript (ES Modules)**: Module system and runtime environment
- **HTML5**: Semantic markup and structure
- **CSS3**: Styling with Tailwind CSS framework

## Frontend Framework
- **React 19.1.1**: Modern React with latest features
- **React DOM 19.1.1**: DOM rendering and manipulation
- **JSX/TSX**: Component templating syntax

## Build System & Development Tools
- **Vite 6.2.0**: Fast build tool and development server
- **@vitejs/plugin-react 5.0.0**: React integration for Vite
- **TypeScript Compiler**: Type checking and transpilation

## Styling & UI
- **Tailwind CSS 4.1.13**: Utility-first CSS framework
- **@tailwindcss/vite 4.1.13**: Vite integration for Tailwind
- **Responsive Design**: Mobile-first approach

## AI & External Services
- **@google/genai (latest)**: Google Gemini AI integration
- **Environment Variables**: Secure API key management

## Testing Framework
- **Vitest 3.2.4**: Fast unit testing framework
- **@testing-library/react 16.3.0**: React component testing utilities
- **@testing-library/jest-dom 6.8.0**: Custom Jest matchers
- **jsdom 27.0.0**: DOM simulation for testing

## Development Dependencies
- **@types/node 22.14.0**: Node.js type definitions
- **@types/react 19.1.13**: React type definitions

## Package Management
- **npm**: Package manager with lock file for reproducible builds
- **ES Modules**: Modern module system throughout

## Development Commands

### Setup
```bash
npm install                 # Install all dependencies
```

### Development
```bash
npm run dev                # Start development server
npm start                  # Alternative start command
```

### Building
```bash
npm run build              # Build for production (TypeScript + Vite)
```

### Testing
```bash
npm test                   # Run test suite with Vitest
```

## Configuration Files
- **vite.config.ts**: Vite build configuration with React plugin
- **tsconfig.json**: TypeScript compiler options
- **package.json**: Project metadata and dependencies
- **.env.local**: Environment variables (API keys)

## Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **ES2020+ Features**: Leverages modern JavaScript features

## Deployment Targets
- **Static Hosting**: Netlify, Vercel, GitHub Pages compatible
- **CDN Distribution**: Optimized for global content delivery
- **Mobile Web**: Progressive Web App capabilities