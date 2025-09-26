# Project Structure

## Directory Organization

```
forza-color-repo/
├── components/           # React UI components
│   ├── ColorCard.tsx    # Individual color display card
│   ├── ColorDetailsModal.tsx  # Modal for detailed color view
│   ├── FilterControls.tsx     # Color filtering interface
│   ├── Header.tsx       # Application header
│   └── Pagination.tsx   # Pagination controls
├── services/            # Business logic and data services
│   ├── colorData.ts     # Color data management and API
│   └── colorData.test.ts # Unit tests for color services
├── .amazonq/           # Amazon Q configuration
│   └── rules/          # Project rules and documentation
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
├── types.ts            # TypeScript type definitions
├── vite.config.ts      # Vite build configuration
├── tsconfig.json       # TypeScript configuration
├── package.json        # Dependencies and scripts
└── README.md           # Project documentation
```

## Core Components Architecture

### Component Hierarchy
```
App.tsx (Root)
├── Header.tsx
├── FilterControls.tsx
├── ColorCard.tsx (Multiple instances)
├── ColorDetailsModal.tsx
└── Pagination.tsx
```

### Component Relationships
- **App.tsx**: Central state management, coordinates all components
- **Header.tsx**: Branding and navigation, independent component
- **FilterControls.tsx**: Manages filter state, communicates with App via callbacks
- **ColorCard.tsx**: Displays individual color data, triggers modal on interaction
- **ColorDetailsModal.tsx**: Overlay component for detailed color information
- **Pagination.tsx**: Handles data pagination, integrates with filtering system

## Data Flow Architecture

### State Management Pattern
- **Centralized State**: App.tsx manages global application state
- **Props Down**: Data flows down through component props
- **Events Up**: User interactions bubble up through callback functions
- **Local State**: Components maintain internal UI state when appropriate

### Service Layer
- **colorData.ts**: Encapsulates all color data operations
- **API Integration**: Handles external data fetching and processing
- **Data Transformation**: Converts raw data to application-specific formats
- **Caching Strategy**: Implements efficient data caching mechanisms

## Architectural Patterns

### Component Design Patterns
- **Functional Components**: All components use React functional component pattern
- **Custom Hooks**: Reusable logic extracted into custom hooks
- **Composition**: Components designed for reusability and composition
- **Single Responsibility**: Each component has a focused, single purpose

### Data Management Patterns
- **Service Layer**: Business logic separated from UI components
- **Type Safety**: Comprehensive TypeScript typing throughout
- **Immutable Updates**: State updates follow immutability principles
- **Error Boundaries**: Graceful error handling and user feedback