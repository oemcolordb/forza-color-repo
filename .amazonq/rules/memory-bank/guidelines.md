# Development Guidelines & Patterns

## Code Quality Standards

### TypeScript Usage
- **Strict Type Safety**: All components use explicit TypeScript interfaces
- **Interface Definitions**: Centralized type definitions in `app/types/color.ts`
- **Type Imports**: Use `import type` for type-only imports
- **Generic Constraints**: Proper use of generics with constraints where needed

### Component Architecture
- **Functional Components**: All React components use function syntax with hooks
- **Props Interface**: Every component has a dedicated props interface
- **Default Props**: Use default parameters in function signatures
- **Component Naming**: PascalCase for components, camelCase for functions

### State Management Patterns
- **useState Hook**: Local component state with proper typing
- **useEffect Dependencies**: Exhaustive dependency arrays with proper cleanup
- **useCallback/useMemo**: Performance optimization for expensive operations
- **Custom Hooks**: Extracted logic into reusable hooks (`useAnalytics`, `usePerformance`)

## Structural Conventions

### File Organization
- **Component Structure**: Each component in its own file with matching name
- **Test Colocation**: Tests in `__tests__` subdirectories next to components
- **Type Definitions**: Centralized in `types/` directory
- **Service Layer**: Business logic separated into `services/` directory

### Import Patterns
```typescript
// External libraries first
import React, { useState, useCallback } from 'react'
import type { CarColor } from '../types/color'

// Internal components and utilities
import Header from './components/Header'
import { useAnalytics } from './hooks/useAnalytics'
```

### Export Patterns
- **Default Exports**: For main component/function per file
- **Named Exports**: For utilities and secondary functions
- **Type Exports**: Separate type-only exports when needed

## Styling Standards

### Tailwind CSS Usage
- **Utility-First**: Extensive use of Tailwind utility classes
- **Conditional Classes**: Template literals for dynamic styling
- **Dark Mode**: Systematic dark mode support with `isDarkMode` props
- **Responsive Design**: Mobile-first responsive classes

### Theme Implementation
```typescript
const themeClasses = isDarkMode 
  ? 'bg-slate-800 text-slate-100' 
  : 'bg-white text-gray-900'
```

### Animation Classes
- **Custom Animations**: Defined in `tailwind.config.js`
- **Performance**: CSS-based animations over JavaScript
- **Accessibility**: Respect user motion preferences

## Performance Patterns

### Optimization Techniques
- **Virtual Scrolling**: Implemented in `VirtualGrid.tsx` for large datasets
- **Lazy Loading**: Dynamic imports and component-level lazy loading
- **Memoization**: Strategic use of `React.memo`, `useMemo`, `useCallback`
- **Code Splitting**: Route-based and component-based splitting

### Data Handling
- **Pagination**: Incremental loading with `ITEMS_PER_PAGE` constant
- **Filtering**: Client-side filtering with `useMemo` optimization
- **Caching**: Service worker and browser caching strategies

## Error Handling

### Error Boundaries
- **Component Wrapping**: `ErrorBoundary` component wraps main application
- **Graceful Degradation**: Fallback UI for component failures
- **Error Logging**: Console error logging with context

### Validation Patterns
```typescript
const validateFile = useCallback((file: File): string | null => {
  if (!validTypes.includes(file.type)) {
    return 'Please upload a valid image file'
  }
  return null
}, [])
```

## Testing Standards

### Test Structure
- **Jest + Testing Library**: Primary testing framework
- **Component Testing**: Focus on user interactions and behavior
- **Mock Functions**: Proper mocking of callbacks and external dependencies
- **Accessibility Testing**: Screen reader and keyboard navigation tests

### Test Patterns
```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly', () => {
    // Test implementation
  })
})
```

## API & Data Patterns

### Color Data Structure
```typescript
interface CarColor {
  make: string
  model: string
  year: number | null
  colorName: string
  colorType: string
  color1: { h: number; s: number; b: number }
  color2: { h: number; s: number; b: number }
}
```

### Service Layer
- **Data Services**: Centralized data management in `services/`
- **Async Operations**: Proper async/await usage with error handling
- **Type Safety**: All service functions properly typed

## Accessibility Standards

### ARIA Implementation
- **Semantic HTML**: Proper use of semantic elements
- **ARIA Labels**: Descriptive labels for interactive elements
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper heading hierarchy and descriptions

### Focus Management
- **Focus Indicators**: Visible focus states for all interactive elements
- **Tab Order**: Logical tab sequence through interface
- **Skip Links**: Navigation shortcuts for screen readers

## Performance Monitoring

### Analytics Integration
- **Custom Hooks**: `useAnalytics` for event tracking
- **Performance Metrics**: `usePerformance` for timing measurements
- **User Interactions**: Track color views, searches, and favorites

### Optimization Strategies
- **Bundle Analysis**: Regular bundle size monitoring
- **Image Optimization**: Proper image formats and lazy loading
- **Critical CSS**: Above-the-fold CSS optimization

## Security Practices

### Input Validation
- **File Upload**: Strict file type and size validation
- **XSS Prevention**: Proper sanitization of user inputs
- **Content Security**: Security headers implementation

### Data Protection
- **Local Storage**: Safe handling of user preferences and favorites
- **Environment Variables**: Proper secret management
- **API Security**: Rate limiting and input validation