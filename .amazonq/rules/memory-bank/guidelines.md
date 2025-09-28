# Development Guidelines & Patterns

## Code Quality Standards

### TypeScript Usage
- **Strict typing**: All components use explicit TypeScript interfaces and types
- **Type definitions**: Centralized in `/app/types/` directory (e.g., `CarColor` interface)
- **Props interfaces**: Every React component has a dedicated props interface
- **Null safety**: Consistent handling of optional properties with `?.` operator and null checks

### Component Architecture
- **Functional components**: All components use React functional components with hooks
- **React.memo**: Performance-critical components wrapped with `React.memo` for optimization
- **Custom hooks**: Reusable logic extracted into custom hooks (`useAnalytics`, `usePerformance`)
- **Component composition**: Complex components broken into smaller, focused sub-components

### File Organization
- **Consistent naming**: PascalCase for components, camelCase for utilities
- **Co-location**: Test files placed in `__tests__` directories alongside components
- **Barrel exports**: Clean import/export patterns throughout the codebase
- **Separation of concerns**: Clear distinction between components, services, and utilities

## Structural Conventions

### React Component Patterns
```typescript
// Standard component structure
interface ComponentProps {
  // Props with explicit types
  isDarkMode: boolean
  onAction?: (param: Type) => void
}

const Component: React.FC<ComponentProps> = React.memo(({ 
  isDarkMode, 
  onAction 
}) => {
  // Hooks at the top
  const [state, setState] = useState<Type>(initialValue)
  
  // Memoized values
  const computedValue = useMemo(() => {
    // computation
  }, [dependencies])
  
  // Event handlers with useCallback
  const handleEvent = useCallback(() => {
    // handler logic
  }, [dependencies])
  
  return (
    // JSX with conditional classes
  )
})

Component.displayName = 'Component'
export default Component
```

### State Management Patterns
- **Local state**: `useState` for component-specific state
- **Derived state**: `useMemo` for computed values from props/state
- **Effect management**: `useEffect` with proper dependency arrays and cleanup
- **Performance optimization**: `useCallback` for event handlers to prevent re-renders

### Conditional Rendering
- **Theme-based styling**: Consistent dark/light mode pattern using `isDarkMode` prop
- **Responsive design**: Mobile-first approach with `isMobile` state detection
- **Feature flags**: Progressive enhancement with capability detection

## Semantic Patterns

### Color Data Management
```typescript
// Standard color object structure
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

### Event Handling Patterns
- **Callback props**: Consistent naming (`onSelect`, `onToggle`, `onAction`)
- **Event prevention**: Proper `e.preventDefault()` and `e.stopPropagation()` usage
- **Async operations**: Error handling with try-catch blocks and loading states
- **User feedback**: Loading indicators and error messages for all async operations

### Performance Optimization
- **Virtual scrolling**: Implemented for large datasets (10,000+ colors)
- **Lazy loading**: Dynamic imports for non-critical components
- **Memoization**: Strategic use of `useMemo` and `useCallback`
- **Image optimization**: Next.js Image component with Sharp processing

## Internal API Usage & Patterns

### Service Layer Integration
```typescript
// Color data service usage
import { default: colorData } from '../services/colorData'

// Lazy loading pattern
const loadColors = async () => {
  try {
    const { default: data } = await import('../services/colorData')
    return data
  } catch (error) {
    console.error('Failed to load color data:', error)
    return []
  }
}
```

### Custom Hook Patterns
```typescript
// Analytics hook usage
const { track } = useAnalytics()
track({ action: 'view', colorName: color.colorName, make: color.make })

// Performance measurement
const { measureAsync } = usePerformance()
const result = await measureAsync('Operation Name', async () => {
  // async operation
})
```

### Local Storage Integration
```typescript
// Consistent localStorage patterns
useEffect(() => {
  const saved = localStorage.getItem('forza-favorites')
  if (saved) setFavorites(JSON.parse(saved))
}, [])

useEffect(() => {
  localStorage.setItem('forza-favorites', JSON.stringify(favorites))
}, [favorites])
```

## Frequently Used Code Idioms

### Conditional Class Names
```typescript
// Theme-based conditional classes
className={`base-classes ${
  isDarkMode 
    ? 'dark-theme-classes' 
    : 'light-theme-classes'
}`}

// State-based conditional rendering
{isLoading ? (
  <LoadingSpinner />
) : (
  <Content />
)}
```

### Array Processing Patterns
```typescript
// Filtering with multiple conditions
const filteredColors = useMemo(() => {
  return colors.filter(color => {
    const matchesSearch = !searchQuery || 
      color.colorName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesMake = !selectedMake || color.make === selectedMake
    return matchesSearch && matchesMake
  })
}, [colors, searchQuery, selectedMake])

// Unique value extraction
const makes = useMemo(() => {
  const uniqueMakes = Array.from(new Set(colors.map(color => color.make)))
  return uniqueMakes.sort()
}, [colors])
```

### Error Handling Patterns
```typescript
// Comprehensive error handling
try {
  const result = await operation()
  setData(result)
} catch (error) {
  console.error('Operation failed:', error)
  setError(error instanceof Error ? error.message : 'Unknown error')
} finally {
  setLoading(false)
}
```

## Popular Annotations & Comments

### JSDoc-style Comments
```typescript
/**
 * Extracts colors from image data using advanced algorithms
 * @param imageData - Canvas ImageData object
 * @returns Array of extracted colors with metadata
 */
const extractColorsFromImage = useCallback((imageData: ImageData): ExtractedColor[] => {
  // Implementation
}, [])
```

### Inline Documentation
```typescript
// Sample every pixel for better accuracy
for (let i = 0; i < data.length; i += 4) {
  // Skip transparent/semi-transparent pixels
  if (alpha < 200) continue
  
  // Use smaller grouping for better color accuracy
  const key = `${Math.floor(r/5)*5}-${Math.floor(g/5)*5}-${Math.floor(b/5)*5}`
}
```

### Configuration Comments
```typescript
// Change background every 30 minutes based on timestamp
const thirtyMinuteSlots = Math.floor(now.getTime() / (30 * 60 * 1000))

// Resize for performance - max 300px
const maxSize = 300
const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
```

## Testing Standards

### Component Testing Patterns
```typescript
// Standard test structure
describe('ComponentName', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly with required props', () => {
    render(<Component {...requiredProps} />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('handles user interactions', () => {
    const mockHandler = jest.fn()
    render(<Component onAction={mockHandler} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(mockHandler).toHaveBeenCalledWith(expectedArgs)
  })
})
```

### Mock Patterns
```typescript
// Consistent mock object structure
const mockColor: CarColor = {
  make: 'Ferrari',
  model: 'F40',
  year: 1987,
  colorName: 'Rosso Corsa',
  colorType: 'Normal',
  color1: { h: 0, s: 0.8, b: 0.9 },
  color2: { h: 0, s: 0.8, b: 0.9 },
}
```

## Styling Conventions

### Tailwind CSS Patterns
```typescript
// Responsive design classes
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"

// Theme-aware styling
className={`transition-colors ${
  isDarkMode 
    ? 'bg-slate-800 text-slate-100' 
    : 'bg-white text-gray-900'
}`}

// Interactive states
className="hover:scale-105 transition-transform cursor-pointer"
```

### Animation Classes
```typescript
// Custom animations from tailwind.config.js
className="animate-fade-in-up"
className="animate-bounce-in"
className="animate-shimmer"
```

This codebase demonstrates modern React development practices with strong TypeScript integration, performance optimization, and comprehensive testing coverage.