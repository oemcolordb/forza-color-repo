# TypeScript Migration Guide

## Current Status

- ✅ Core components: TypeScript
- ⚠️ Services: Mixed (JS/TS)
- ⚠️ Edge functions: JavaScript
- ⚠️ Scripts: JavaScript

## Priority Migration List

### High Priority (Bug Prevention)
1. `services/colorData.js` → `colorData.ts`
2. `services/telemetryBridge.js` → `telemetryBridge.ts`
3. `app/lib/colorUtils.js` → `colorUtils.ts`

### Medium Priority
4. `netlify/edge-functions/*.js` → `*.ts`
5. `app/components/*.js` → `*.tsx`
6. `scripts/*.js` → `*.ts`

### Low Priority
7. Configuration files (keep as JS)

## Migration Steps

### 1. Add Type Definitions
```typescript
// Before (JS)
export function hsbToRgb(h, s, b) {
  // ...
}

// After (TS)
export function hsbToRgb(h: number, s: number, b: number): [number, number, number] {
  // ...
}
```

### 2. Define Interfaces
```typescript
interface HSBColor {
  h: number
  s: number
  b: number
}
```

### 3. Update Imports
```typescript
// Use .js extension for imports (Next.js requirement)
import { hsbToRgb } from './colorUtils.js'
```

## Benefits

- ✅ Catch bugs at compile time
- ✅ Better IDE autocomplete
- ✅ Safer refactoring
- ✅ Self-documenting code

## Run Type Check

```bash
npm run type-check
```
