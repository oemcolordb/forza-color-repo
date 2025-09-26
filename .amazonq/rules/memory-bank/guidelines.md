# Development Guidelines

## Code Quality Standards

### TypeScript Usage (10/10 files)
- **Strict typing**: All components use explicit TypeScript interfaces and types
- **Interface definitions**: Props interfaces defined for every component (e.g., `PaginationProps`, `FilterControlsProps`)
- **Type imports**: Use `import type` for type-only imports to optimize bundle size
- **Optional properties**: Use `?` for optional properties (e.g., `year?: number`, `colorType?: string`)

### Component Structure (5/5 React components)
- **Functional components**: All components use `React.FC` functional component pattern
- **Props destructuring**: Props destructured in function parameters for cleaner code
- **Default exports**: All components use default exports with named component functions

### Import Organization
```typescript
// External libraries first
import React from 'react';
import { GoogleGenAI } from '@google/genai';

// Internal components and types
import Header from './components/Header';
import type { CarColor } from './types';
```

## Naming Conventions

### File Naming
- **PascalCase**: Component files use PascalCase (e.g., `ColorCard.tsx`, `FilterControls.tsx`)
- **camelCase**: Service files use camelCase (e.g., `colorData.ts`)
- **Descriptive names**: File names clearly indicate component purpose

### Variable Naming
- **camelCase**: All variables and functions use camelCase
- **Descriptive names**: Variables have clear, descriptive names (`filteredColors`, `paginatedColors`)
- **Boolean prefixes**: Boolean variables use `is`, `has`, or `should` prefixes where appropriate

### Component Naming
- **PascalCase**: All component names use PascalCase
- **Descriptive**: Names clearly indicate component functionality (`ColorDetailsModal`, `FilterControls`)

## Styling Standards

### Tailwind CSS Usage (5/5 components)
- **Utility-first**: Extensive use of Tailwind utility classes
- **Responsive design**: Mobile-first approach with responsive breakpoints (`sm:`, `md:`, `lg:`, `xl:`)
- **Color scheme**: Consistent slate color palette (`slate-900`, `slate-800`, `slate-700`)
- **Gradient usage**: Brand gradients using `from-fuchsia-500 to-cyan-400`

### CSS Class Patterns
```typescript
// Consistent spacing and layout
className="flex items-center justify-center space-x-4 py-8"

// Responsive grid systems
className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"

// Interactive states
className="hover:bg-slate-700 transition-colors disabled:opacity-50"
```

## State Management Patterns

### React Hooks Usage (App.tsx)
- **useState**: Local component state management
- **useMemo**: Performance optimization for expensive calculations
- **useEffect**: Side effects and cleanup (keyboard listeners, API calls)

### State Organization
```typescript
// Grouped related state
const [searchQuery, setSearchQuery] = useState('');
const [selectedMake, setSelectedMake] = useState('');
const [selectedColor, setSelectedColor] = useState<CarColor | null>(null);
const [currentPage, setCurrentPage] = useState(1);
```

### Memoization Strategy
- **Derived state**: Use `useMemo` for filtered and computed data
- **Expensive operations**: Memoize array operations and transformations
- **Dependency arrays**: Proper dependency management in hooks

## Event Handling Patterns

### Callback Props (4/5 components)
- **Function props**: Components receive callback functions as props
- **Event bubbling**: Proper event handling with `stopPropagation()` where needed
- **Keyboard accessibility**: ESC key handling for modals

### Form Handling
```typescript
// Controlled inputs with proper typing
onChange={(e) => setSearchQuery(e.target.value)}
value={searchQuery}
```

## Accessibility Standards

### ARIA Labels (3/5 components)
- **Button labels**: All interactive elements have `aria-label` attributes
- **Modal accessibility**: Proper `role="dialog"` and `aria-modal="true"`
- **Screen reader support**: Descriptive labels for complex interactions

### Keyboard Navigation
- **ESC key**: Modal dismissal with keyboard
- **Focus management**: Proper focus handling in interactive components
- **Disabled states**: Clear visual and functional disabled states

## Error Handling Patterns

### API Error Handling (ColorDetailsModal.tsx)
```typescript
try {
  // API call
} catch (e) {
  console.error("Gemini API Error:", e);
  setError("Could not fetch details from the Gemini API.");
} finally {
  setLoading(false);
}
```

### Graceful Degradation
- **Optional features**: API integration fails gracefully when keys missing
- **Loading states**: Proper loading indicators during async operations
- **Error boundaries**: User-friendly error messages

## Performance Optimization

### Memoization (App.tsx)
- **useMemo**: Expensive filtering and pagination calculations
- **Dependency optimization**: Minimal dependency arrays to prevent unnecessary re-renders

### Key Props
```typescript
// Unique keys for list items
key={`${color.make}-${color.model}-${color.colorName}-${color.year}-${index}-${currentPage}`}
```

## Testing Standards

### Test Structure (colorData.test.ts)
- **Vitest framework**: Modern testing with Vitest
- **Testing Library**: React Testing Library for component testing
- **Type validation**: Tests verify data structure and types
- **Property validation**: Comprehensive property checking for data objects

### Test Organization
```typescript
describe('carColors data', () => {
  it('should be an array of car color objects', () => {
    // Test implementation
  });
});
```

## Configuration Patterns

### Environment Variables (vite.config.ts)
- **Build-time injection**: Environment variables injected at build time
- **Multiple formats**: Support for different env var naming conventions
- **Type safety**: Environment variables properly typed

### Build Configuration
- **Plugin system**: Modular Vite plugin configuration
- **Path aliases**: Clean import paths with `@` alias
- **Test integration**: Unified configuration for build and test