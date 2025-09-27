# Development Guidelines & Patterns

## Code Quality Standards

### TypeScript Usage
- **Strict Type Safety**: All components use explicit TypeScript interfaces and types
- **Interface Definitions**: Comprehensive interfaces for data structures (e.g., `CarColor`, `ExtractedColor`)
- **Type Imports**: Use `import type` for type-only imports to optimize bundle size
- **Generic Types**: Leverage generics for reusable components and functions
- **Null Safety**: Explicit handling of nullable values with optional chaining

### Component Architecture
- **Functional Components**: Exclusively use React functional components with hooks
- **React.memo**: Performance optimization for components that receive stable props
- **Custom Hooks**: Extract reusable logic into custom hooks (`useAnalytics`, `usePerformance`)
- **Props Interface**: Every component has a well-defined props interface
- **Display Names**: Set displayName for memo components for better debugging

### File Organization
- **Barrel Exports**: Use index files for clean imports
- **Test Colocation**: Tests in `__tests__` directories alongside components
- **Type Definitions**: Centralized in `/types` directory
- **Service Layer**: Separate business logic in `/services` directory
- **Hook Extraction**: Custom hooks in dedicated `/hooks` directory

## Coding Patterns & Conventions

### State Management
- **useState Hook**: Local component state with proper typing
- **useEffect Dependencies**: Exhaustive dependency arrays with ESLint compliance
- **useCallback**: Memoize event handlers and functions passed as props
- **useMemo**: Expensive computations and derived state optimization
- **Local Storage Integration**: Persistent state with localStorage sync patterns

### Event Handling
- **Callback Props**: Consistent naming pattern (`onSelect`, `onToggleFavorite`, `onColorsFound`)
- **Event Delegation**: Efficient event handling for large lists
- **Async Operations**: Proper error handling with try-catch blocks
- **Loading States**: Explicit loading state management for async operations

### Performance Optimization
- **Virtual Scrolling**: Implemented for large datasets (10,000+ items)
- **Lazy Loading**: Dynamic imports for large data files
- **Memoization**: React.memo and useMemo for expensive operations
- **Bundle Splitting**: Code splitting with dynamic imports
- **Image Optimization**: WebP/AVIF formats with responsive sizing

### Error Handling
- **Error Boundaries**: Comprehensive error catching with ErrorBoundary component
- **Graceful Degradation**: Fallback strategies for failed operations
- **User Feedback**: Clear error messages with actionable suggestions
- **Validation**: Input validation with helpful error messages
- **Try-Catch Blocks**: Proper async error handling throughout

## Styling & UI Patterns

### Tailwind CSS Usage
- **Utility-First**: Consistent use of Tailwind utility classes
- **Responsive Design**: Mobile-first responsive patterns
- **Dark Mode**: Class-based dark mode with system preference detection
- **Custom Animations**: Extended Tailwind config with custom keyframes
- **Color System**: Structured color palette with semantic naming

### Component Styling
- **Conditional Classes**: Dynamic class application based on props/state
- **Theme Consistency**: Consistent dark/light mode implementations
- **Animation Patterns**: Smooth transitions and micro-interactions
- **Accessibility**: WCAG compliant styling with proper contrast ratios
- **Loading States**: Visual feedback for async operations

### Layout Patterns
- **Grid Systems**: CSS Grid and Flexbox for responsive layouts
- **Container Patterns**: Consistent container and spacing patterns
- **Modal Overlays**: Standardized modal and overlay implementations
- **Navigation**: Sticky navigation with backdrop blur effects

## Data Management Patterns

### API Integration
- **Service Layer**: Centralized data fetching in service files
- **Caching Strategy**: Multi-level caching (memory, localStorage, edge functions)
- **Lazy Loading**: On-demand data loading for performance
- **Error Recovery**: Retry mechanisms and fallback strategies
- **Type Safety**: Strongly typed API responses and data structures

### State Synchronization
- **localStorage Sync**: Automatic persistence of user preferences
- **URL State**: Search parameters for shareable application state
- **Derived State**: Computed values using useMemo for efficiency
- **State Normalization**: Efficient data structures for large datasets

### Performance Patterns
- **Pagination**: Efficient data loading with virtual scrolling
- **Filtering**: Client-side filtering with debounced search
- **Memoization**: Expensive computations cached appropriately
- **Bundle Optimization**: Code splitting and tree shaking

## Testing Standards

### Test Structure
- **Jest Configuration**: Comprehensive test setup with jsdom environment
- **Testing Library**: React Testing Library for component testing
- **Mock Functions**: Proper mocking of external dependencies
- **Test Coverage**: Comprehensive test coverage for critical components
- **Accessibility Testing**: Screen reader and keyboard navigation tests

### Test Patterns
- **Arrange-Act-Assert**: Clear test structure and organization
- **User-Centric Tests**: Testing user interactions rather than implementation
- **Mock Cleanup**: Proper cleanup between test runs
- **Edge Cases**: Testing error conditions and edge cases
- **Integration Tests**: Testing component interactions and data flow

## Security & Best Practices

### Input Validation
- **File Upload Security**: Comprehensive file type and size validation
- **XSS Prevention**: Proper sanitization of user inputs
- **CSRF Protection**: Security headers and proper request handling
- **Content Security Policy**: Strict CSP headers for security

### Performance Security
- **Bundle Analysis**: Regular bundle size monitoring
- **Memory Management**: Proper cleanup of event listeners and intervals
- **Resource Loading**: Efficient resource loading and caching strategies
- **Error Logging**: Secure error logging without sensitive data exposure

## Development Workflow

### Code Organization
- **Single Responsibility**: Components and functions with clear, single purposes
- **DRY Principle**: Reusable utilities and shared components
- **Separation of Concerns**: Clear separation between UI, logic, and data layers
- **Consistent Naming**: Descriptive and consistent naming conventions

### Documentation
- **JSDoc Comments**: Comprehensive function and component documentation
- **README Files**: Clear setup and usage instructions
- **Type Documentation**: Self-documenting code through TypeScript interfaces
- **Change Logs**: Detailed change tracking and version management

### Build & Deployment
- **Static Generation**: Next.js static export for optimal performance
- **Environment Configuration**: Proper environment variable management
- **CI/CD Pipeline**: Automated testing and deployment workflows
- **Performance Monitoring**: Built-in analytics and performance tracking