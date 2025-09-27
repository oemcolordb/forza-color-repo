# Development Guidelines & Patterns

## Code Quality Standards

### TypeScript Usage
- **Strict typing**: All components use explicit TypeScript interfaces and types
- **Type definitions**: Centralized in `app/types/color.ts` for consistency
- **Interface patterns**: Props interfaces follow `ComponentNameProps` naming convention
- **Type safety**: No `any` types - use proper type definitions or generics

### Component Architecture
- **Functional components**: All components use React functional components with hooks
- **Props destructuring**: Consistent destructuring of props in component parameters
- **Default props**: Use default parameter values instead of defaultProps
- **Component naming**: PascalCase for components, camelCase for functions and variables

### File Organization
- **Component structure**: Each component in its own file with matching filename
- **Test co-location**: Tests in `__tests__` subdirectories near components
- **Import organization**: External imports first, then internal imports, then relative imports
- **Export patterns**: Default exports for components, named exports for utilities

## Styling Conventions

### Tailwind CSS Patterns
- **Utility-first approach**: Extensive use of Tailwind utility classes
- **Responsive design**: Mobile-first responsive classes (`sm:`, `md:`, `lg:`)
- **Dark mode support**: Conditional classes based on `isDarkMode` prop
- **Color consistency**: Custom color palette defined in `tailwind.config.js`

### Theme Implementation
```typescript
// Standard theme pattern used throughout
const themeClasses = isDarkMode 
  ? 'bg-slate-800 text-slate-100 border-slate-700' 
  : 'bg-white text-gray-900 border-gray-300'
```

### Animation Standards
- **Custom animations**: Defined in Tailwind config with meaningful names
- **Performance-conscious**: Use `transform` and `opacity` for smooth animations
- **Accessibility**: Respect `prefers-reduced-motion` where applicable
- **Consistent timing**: Standard duration values (300ms, 500ms, 1000ms)

## State Management Patterns

### React Hooks Usage
- **useState**: For local component state with descriptive variable names
- **useEffect**: Proper dependency arrays and cleanup functions
- **useCallback**: For event handlers and functions passed as props
- **useMemo**: For expensive calculations and derived state
- **Custom hooks**: Extracted reusable logic (e.g., `useAnalytics`, `usePerformance`)

### State Structure
```typescript
// Consistent state naming and initialization
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [data, setData] = useState<DataType[]>([])
```

### Event Handling
- **Callback patterns**: All event handlers use `useCallback` for performance
- **Error boundaries**: Comprehensive error handling with try-catch blocks
- **Loading states**: Consistent loading state management across components

## Performance Optimization

### Rendering Optimization
- **Virtual scrolling**: Implemented for large datasets (color grids)
- **Lazy loading**: Components and images loaded on demand
- **Memoization**: Strategic use of `React.memo`, `useMemo`, and `useCallback`
- **Code splitting**: Dynamic imports for route-based and component-based splitting

### Image Handling
- **Next.js Image**: Optimized image loading with multiple formats
- **Lazy loading**: Intersection Observer for performance-critical images
- **Responsive images**: Multiple sizes for different screen densities
- **Fallback strategies**: Multiple loading strategies for image processing

### Bundle Optimization
- **Tree shaking**: Careful imports to avoid unused code
- **Dynamic imports**: Lazy loading of heavy components and utilities
- **Vendor chunking**: Separate chunks for third-party libraries
- **Critical CSS**: Inlined critical styles for faster initial render

## Data Handling Patterns

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

### API Integration
- **Service layer**: Centralized data access through service modules
- **Error handling**: Consistent error handling with user-friendly messages
- **Caching strategies**: Multi-level caching (browser, edge, server)
- **Data validation**: Input validation and sanitization

### Search and Filtering
- **Debounced search**: Performance-optimized search with debouncing
- **Multiple filters**: Combinable filters for manufacturer, type, and text search
- **Case-insensitive**: All text searches are case-insensitive
- **Partial matching**: Flexible matching for color names and manufacturers

## Testing Standards

### Test Structure
- **Descriptive names**: Test descriptions clearly state what is being tested
- **Arrange-Act-Assert**: Clear test structure with setup, action, and verification
- **Mock management**: Proper mock setup and cleanup between tests
- **Edge cases**: Tests cover both happy path and error scenarios

### Component Testing
```typescript
// Standard test patterns
describe('ComponentName', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly with required props', () => {
    // Test implementation
  })

  it('handles user interactions properly', () => {
    // Test implementation
  })
})
```

### Testing Tools
- **Jest**: Primary testing framework with jsdom environment
- **Testing Library**: React Testing Library for component testing
- **User-centric tests**: Tests focus on user behavior rather than implementation details
- **Accessibility testing**: Tests include accessibility considerations

## Security Practices

### Input Validation
- **File upload validation**: Comprehensive file type and size validation
- **Image processing**: Safe image handling with multiple fallback strategies
- **XSS prevention**: Proper sanitization of user inputs
- **Content Security Policy**: Strict CSP headers via edge functions

### Data Privacy
- **Local storage**: User preferences stored locally only
- **No tracking**: Privacy-focused analytics implementation
- **Secure headers**: Security headers implemented via Netlify edge functions
- **HTTPS enforcement**: All connections forced to HTTPS

## Accessibility Guidelines

### WCAG Compliance
- **Semantic HTML**: Proper use of semantic elements and ARIA labels
- **Keyboard navigation**: Full keyboard accessibility for all interactive elements
- **Screen reader support**: Descriptive labels and announcements
- **Color contrast**: Sufficient contrast ratios in both light and dark modes

### Interactive Elements
```typescript
// Standard accessibility pattern
<button
  onClick={handleClick}
  aria-label="Descriptive action label"
  className="focus:outline-none focus:ring-2 focus:ring-offset-2"
>
  Button Text
</button>
```

### Focus Management
- **Focus indicators**: Visible focus states for all interactive elements
- **Focus trapping**: Proper focus management in modals and overlays
- **Skip links**: Navigation aids for keyboard users
- **Logical tab order**: Intuitive tab sequence through interface

## Error Handling

### Error Boundaries
- **Component-level**: Error boundaries wrap major component sections
- **Graceful degradation**: Fallback UI when components fail
- **Error reporting**: Comprehensive error logging and user feedback
- **Recovery mechanisms**: Ways for users to recover from errors

### User Feedback
- **Loading states**: Clear loading indicators during async operations
- **Error messages**: User-friendly error messages with actionable advice
- **Success feedback**: Confirmation of successful actions
- **Progress indicators**: Visual feedback for long-running operations

## Documentation Standards

### Code Comments
- **JSDoc comments**: Comprehensive documentation for complex functions
- **Inline comments**: Explanations for non-obvious code sections
- **TODO comments**: Clear action items with context
- **Type documentation**: Detailed interface and type documentation

### README Structure
- **Clear setup instructions**: Step-by-step development setup
- **Feature documentation**: Comprehensive feature descriptions
- **API documentation**: Clear API usage examples
- **Deployment guides**: Production deployment instructions