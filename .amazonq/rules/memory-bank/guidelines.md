# Development Guidelines & Standards

## Code Quality Standards

### TypeScript Implementation
- **Strict Type Safety**: All components use TypeScript with comprehensive type definitions
- **Interface Definitions**: Clear props interfaces for every component (e.g., `VirtualGridProps`, `CarColor`)
- **Type Imports**: Consistent use of `import type` for type-only imports to optimize bundle size
- **Null Safety**: Proper handling of nullable values with optional chaining and null checks

### Component Architecture Patterns
- **Functional Components**: All React components use functional components with hooks exclusively
- **Props Interface**: Every component has explicitly defined props interface with TypeScript
- **Component Composition**: Modular design with clear separation of concerns and reusable components
- **Error Boundaries**: Comprehensive error handling with ErrorBoundary wrapper in layout

### File Naming & Organization
- **Components**: PascalCase with descriptive names (e.g., `ColorCard.tsx`, `VirtualGrid.tsx`, `LazyColorGrid.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAnalytics.ts`, `usePerformance.ts`)
- **Services**: camelCase descriptive names (e.g., `colorData.ts`, `colorDataLazy.ts`)
- **Types**: camelCase in dedicated types directory (e.g., `color.ts`)
- **Tests**: Component name + `.test.tsx` pattern (e.g., `ColorCard.test.tsx`)

### Import Organization Standards
```typescript
// 1. React and React-related imports
import React, { useState, useEffect, useMemo, useCallback } from 'react'

// 2. Type-only imports
import type { CarColor } from '../types/color'

// 3. Component imports (alphabetical)
import ColorCard from './ColorCard'
import Header from './components/Header'

// 4. Hook imports
import { useAnalytics } from './hooks/useAnalytics'

// 5. Service and utility imports
import { getColorData } from '../services/colorDataLazy'
```

## Performance Optimization Patterns

### React Performance Strategies
- **useMemo**: Expensive calculations cached with dependency arrays (filtering, sorting, transformations)
- **useCallback**: Event handlers wrapped to prevent unnecessary re-renders
- **Virtual Scrolling**: Implemented for large datasets (10,000+ items) with calculated visible items
- **Lazy Loading**: Dynamic imports for large data files and optional components

### Data Management Optimization
- **Multi-Layer Caching**: Service-level caching with null checks and promise caching
- **Pagination**: Client-side pagination with `ITEMS_PER_PAGE = 50` constant
- **Efficient Filtering**: Memoized filtering with lowercase comparisons and multiple criteria
- **Lazy Data Loading**: Progressive loading with `colorDataLazy.ts` service pattern

### Bundle & Performance Optimization
```typescript
// Lazy loading pattern
const colorData = await measureAsync('Load Color Data', async () => {
  const { default: data } = await import('../../services/colorData')
  return data
})

// Memoized filtering
const filteredColors = useMemo(() => {
  return colors.filter(color => {
    const searchLower = searchQuery.toLowerCase()
    return matchesSearch && matchesMake && matchesModel
  })
}, [colors, searchQuery, selectedMake])
```

## State Management Patterns

### Local State Management
- **useState**: Component-specific state with descriptive names and proper typing
- **useEffect**: Side effects with proper dependency arrays and cleanup functions
- **Custom Hooks**: Extracted reusable logic for analytics, performance monitoring

### State Naming Conventions
```typescript
// Consistent state variable naming
const [colors, setColors] = useState<CarColor[]>([])
const [loading, setLoading] = useState(true)
const [searchQuery, setSearchQuery] = useState('')
const [selectedMake, setSelectedMake] = useState('')
const [isDarkMode, setIsDarkMode] = useState(true)
```

### Persistence & Synchronization
- **localStorage Integration**: Automatic sync for favorites, theme preferences, and history
- **Error Handling**: Graceful fallbacks for localStorage failures with try-catch blocks
- **State Synchronization**: useEffect hooks for syncing state with localStorage

## Styling & Design Standards

### Tailwind CSS Implementation
- **Utility-First Approach**: Consistent use of Tailwind utility classes throughout components
- **Custom Theme Extension**: Extended color palette with primary, secondary, accent color scales
- **Dark Mode Strategy**: Class-based dark mode with `'class'` strategy and theme toggles
- **Responsive Design**: Mobile-first responsive design with breakpoint prefixes

### Theme Implementation Pattern
```typescript
// Consistent theme class patterns
const themeClasses = isDarkMode 
  ? 'bg-slate-800 text-slate-100' 
  : 'bg-white text-gray-900'

// Conditional styling with theme awareness
className={`w-full ${
  isDarkMode 
    ? 'bg-slate-800 border-slate-700 text-slate-100' 
    : 'bg-white border-gray-300 text-gray-900'
} border-2 rounded-md`}
```

### Animation & Interaction Standards
- **Custom Animations**: Defined in `tailwind.config.js` with hardware acceleration
- **Performance-Conscious**: Use of `transform3d` for GPU acceleration
- **Accessibility**: Respects user preferences for reduced motion
- **Consistent Timing**: Standardized animation durations and easing functions

## Testing Standards & Patterns

### Test Structure & Organization
- **Describe Blocks**: Organized by component with clear test grouping
- **beforeEach Setup**: Consistent mock cleanup with `jest.clearAllMocks()`
- **Mock Data**: Comprehensive mock objects that match TypeScript interfaces
- **Descriptive Tests**: Clear test descriptions that explain expected behavior

### Testing Implementation Patterns
```typescript
// Mock setup pattern
const mockColor: CarColor = {
  make: 'Ferrari',
  model: 'F40',
  year: 1987,
  colorName: 'Rosso Corsa',
  colorType: 'Normal',
  color1: { h: 0, s: 0.8, b: 0.9 },
  color2: { h: 0, s: 0.8, b: 0.9 },
}

// Event testing pattern
fireEvent.click(screen.getByLabelText('Add to favorites'))
expect(mockOnToggleFavorite).toHaveBeenCalled()

// Theme testing pattern
expect(container.firstChild).toHaveClass('bg-slate-800/80')
```

### Test Environment Configuration
- **Jest Setup**: Comprehensive browser API mocks in `jest.setup.js`
- **DOM Testing**: IntersectionObserver, ResizeObserver, matchMedia mocks
- **localStorage Mocking**: Complete localStorage mock implementation
- **Component Testing**: React Testing Library for user-centric testing

## Error Handling & Resilience

### Component-Level Error Handling
- **Error Boundaries**: Comprehensive ErrorBoundary implementation in layout
- **Try-Catch Blocks**: Async operations wrapped with proper error handling
- **Graceful Degradation**: Fallback UI states for error conditions
- **Loading States**: Proper loading indicators during async operations

### Service-Level Error Handling
```typescript
// Async error handling pattern
try {
  const colorData = await measureAsync('Load Color Data', async () => {
    const { default: data } = await import('../../services/colorData')
    return data
  })
} catch (error) {
  console.error('Failed to load colors:', error)
} finally {
  setLoading(false)
}
```

## Performance Monitoring & Analytics

### Custom Hook Integration
- **useAnalytics**: Event tracking with structured data and user interactions
- **usePerformance**: Timing measurements with `measureAsync` for operations
- **Performance Metrics**: Monitoring of data loading, filtering, and rendering performance

### Virtual Scrolling Implementation
```typescript
// Virtual scrolling calculation pattern
const { visibleItems, totalHeight } = useMemo(() => {
  const totalRows = Math.ceil(colors.length / ITEMS_PER_ROW)
  const startRow = Math.floor(scrollTop / (ITEM_HEIGHT + GAP))
  const endRow = Math.min(totalRows, startRow + Math.ceil(containerHeight / (ITEM_HEIGHT + GAP)) + 2)
  
  // Calculate visible items with positioning
  const visibleItems = []
  for (let row = Math.max(0, startRow - 1); row < endRow; row++) {
    // Item positioning logic
  }
  
  return { visibleItems, totalHeight }
}, [colors, scrollTop, containerHeight])
```

## Data Processing & Transformation

### Color Data Processing
- **HSB to HSL Conversion**: Standardized color space conversion functions
- **Data Validation**: Input validation and sanitization for color data
- **Pattern Matching**: Sophisticated pattern matching for automotive color names
- **Deduplication**: Array deduplication with complex object comparison

### Service Architecture Patterns
```typescript
// Lazy loading service pattern
let colorDataCache: CarColor[] | null = null
let colorDataPromise: Promise<CarColor[]> | null = null

export const getColorData = (): Promise<CarColor[]> => {
  if (colorDataCache) return Promise.resolve(colorDataCache)
  if (colorDataPromise) return colorDataPromise
  
  colorDataPromise = import('./colorData').then(module => {
    colorDataCache = module.default
    return colorDataCache || []
  })
  
  return colorDataPromise
}
```

## Security & Best Practices

### Content Security & Headers
- **Security Headers**: Comprehensive security header configuration in Next.js
- **XSS Prevention**: Proper data sanitization and validation
- **Environment Variables**: Secure handling with `NEXT_PUBLIC_` prefix for client-side variables

### Accessibility Standards
- **ARIA Labels**: Comprehensive aria-label usage for interactive elements
- **Semantic HTML**: Proper semantic element usage throughout components
- **Keyboard Navigation**: Full keyboard accessibility support
- **Screen Reader Support**: Proper labeling and role attributes for assistive technology