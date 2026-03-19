# Vinyl Creator Context Menu System - Complete Design Specification

## 🎯 Executive Summary

A sophisticated context menu system for vinyl sticker design that enables users to understand complex multi-layered designs through interactive reconstruction visualization. The system breaks down intricate designs into individual shapes and demonstrates step-by-step assembly.

---

## 📋 Core Functionalities

### 1. Image-Based Shape Composition
- **Import vinyl shape images** and automatically decompose into individual SVG paths
- **Layer management** with z-index control (0-100 layers supported)
- **Shape metadata tracking**: name, role, color, opacity, transform properties
- **Thumbnail generation** for each shape (64x64px preview)

### 2. Context Menu Integration
- **Trigger Methods**:
  - Right-click on canvas
  - Long-press (500ms) on touch devices
  - Keyboard shortcut: `Ctrl/Cmd + M`
- **Smart Positioning**: Auto-adjusts to stay within viewport bounds
- **Persistent State**: Remembers last grouping mode per session

### 3. Step-by-Step Reconstruction Guide
- **Animation System**:
  - Fade-in effect for each shape (300ms duration)
  - Highlight current step with glow effect
  - Smooth transitions between steps
- **Playback Controls**:
  - Play/Pause toggle
  - Speed control (0.5x, 1x, 2x, 4x)
  - Step forward/backward buttons
  - Jump to specific step
  - Loop mode toggle

---

## 🎨 UI/UX Flow

### Context Menu Layout

```
┌─────────────────────────────────────┐
│  🎨 Vinyl Design: "Racing Stripes"  │ ← Header
├─────────────────────────────────────┤
│  📊 Group By: [Layer▼] [Color] [Role]│ ← Grouping Controls
├─────────────────────────────────────┤
│  ▼ Layer 1 (Base)                   │ ← Group Header
│  ┌───┬─────────────────────┬────┐  │
│  │🟦 │ Background Rectangle │ ▶️ │  │ ← Shape Item
│  │   │ L1 • base           │    │  │
│  └───┴─────────────────────┴────┘  │
│  ┌───┬─────────────────────┬────┐  │
│  │🟥 │ Main Stripe         │ ▶️ │  │
│  │   │ L1 • accent         │    │  │
│  └───┴─────────────────────┴────┘  │
├─────────────────────────────────────┤
│  ▼ Layer 2 (Details)                │
│  ┌───┬─────────────────────┬────┐  │
│  │⚪ │ Highlight Line      │ ▶️ │  │
│  │   │ L2 • highlight      │    │  │
│  └───┴─────────────────────┴────┘  │
├─────────────────────────────────────┤
│  📊 5 shapes • 2 layers • Simple    │ ← Footer Stats
│  [✖ Close]                          │
└─────────────────────────────────────┘
```

### Reconstruction Panel Layout

```
┌─────────────────────────────────────────────┐
│  🎬 Reconstruction: "Racing Stripes"        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │ ← Progress Bar
│  Step 3 of 5                                │
├─────────────────────────────────────────────┤
│  [◀◀] [◀] [⏸] [▶] [▶▶]  Speed: [1x▼]     │ ← Playback Controls
│  [🔁 Loop] [📸 Capture] [💾 Save]          │
├─────────────────────────────────────────────┤
│  Current Step:                              │
│  ┌─────────────────────────────────────┐   │
│  │ 🟥 Main Stripe                      │   │
│  │ Layer 1 • Accent                    │   │
│  │ "Add the primary racing stripe"    │   │
│  └─────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  Build Order Timeline:                      │
│  [✓] [✓] [●] [ ] [ ]                       │ ← Step Indicators
│   1   2   3   4   5                         │
└─────────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### Shape Tracking System

```typescript
// Core Data Structures
interface Shape {
  id: string;                    // Unique identifier (UUID)
  name: string;                  // User-friendly name
  role: ShapeRole;               // base | accent | shadow | highlight | detail
  layer: number;                 // Z-index (0-100)
  color: string;                 // Hex color code
  pathData: string;              // SVG path data
  transform: Transform;          // Position, scale, rotation
  opacity: number;               // 0.0 - 1.0
  thumbnail?: string;            // Base64 encoded preview
  metadata?: {
    buildStep?: number;          // Order in reconstruction
    description?: string;        // Step description
    dependencies?: string[];     // Required shapes before this
  };
}

interface VinylDesign {
  id: string;
  name: string;
  description: string;
  shapes: Shape[];
  buildOrder: string[];          // Shape IDs in assembly order
  complexity: 'simple' | 'medium' | 'complex';
  metadata: {
    totalShapes: number;
    totalLayers: number;
    estimatedBuildTime: number;  // in seconds
    difficulty: 1-5;
  };
}

// Reconstruction State Management
interface ReconstructionState {
  isPlaying: boolean;
  currentStep: number;
  speed: 0.5 | 1 | 2 | 4;
  loopEnabled: boolean;
  highlightedShapeId: string | null;
  completedSteps: Set<number>;
}
```

### Reconstruction Algorithm

```typescript
class ReconstructionEngine {
  private design: VinylDesign;
  private state: ReconstructionState;
  private animationFrameId: number | null = null;
  private lastStepTime: number = 0;

  constructor(design: VinylDesign) {
    this.design = design;
    this.state = {
      isPlaying: false,
      currentStep: 0,
      speed: 1,
      loopEnabled: false,
      highlightedShapeId: null,
      completedSteps: new Set()
    };
  }

  // Start reconstruction animation
  play(): void {
    if (this.state.isPlaying) return;
    
    this.state.isPlaying = true;
    this.lastStepTime = performance.now();
    this.animate();
  }

  // Pause animation
  pause(): void {
    this.state.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // Animation loop
  private animate = (): void => {
    if (!this.state.isPlaying) return;

    const now = performance.now();
    const stepDuration = 1000 / this.state.speed; // Base: 1 second per step

    if (now - this.lastStepTime >= stepDuration) {
      this.nextStep();
      this.lastStepTime = now;
    }

    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  // Advance to next step
  nextStep(): void {
    if (this.state.currentStep >= this.design.buildOrder.length - 1) {
      if (this.state.loopEnabled) {
        this.reset();
      } else {
        this.pause();
      }
      return;
    }

    this.state.currentStep++;
    this.state.completedSteps.add(this.state.currentStep);
    this.state.highlightedShapeId = this.design.buildOrder[this.state.currentStep];
    
    this.notifyStepChange();
  }

  // Go to previous step
  previousStep(): void {
    if (this.state.currentStep <= 0) return;
    
    this.state.completedSteps.delete(this.state.currentStep);
    this.state.currentStep--;
    this.state.highlightedShapeId = this.design.buildOrder[this.state.currentStep];
    
    this.notifyStepChange();
  }

  // Jump to specific step
  goToStep(step: number): void {
    if (step < 0 || step >= this.design.buildOrder.length) return;
    
    this.state.currentStep = step;
    this.state.completedSteps.clear();
    
    for (let i = 0; i <= step; i++) {
      this.state.completedSteps.add(i);
    }
    
    this.state.highlightedShapeId = this.design.buildOrder[step];
    this.notifyStepChange();
  }

  // Reset to beginning
  reset(): void {
    this.state.currentStep = 0;
    this.state.completedSteps.clear();
    this.state.highlightedShapeId = this.design.buildOrder[0];
    this.notifyStepChange();
  }

  // Get shapes visible up to current step
  getVisibleShapes(): Shape[] {
    const visibleIds = this.design.buildOrder.slice(0, this.state.currentStep + 1);
    return this.design.shapes.filter(shape => visibleIds.includes(shape.id));
  }

  // Get current step info
  getCurrentStepInfo(): {
    step: number;
    total: number;
    shape: Shape;
    description: string;
    progress: number;
  } {
    const shapeId = this.design.buildOrder[this.state.currentStep];
    const shape = this.design.shapes.find(s => s.id === shapeId)!;
    
    return {
      step: this.state.currentStep + 1,
      total: this.design.buildOrder.length,
      shape,
      description: shape.metadata?.description || `Add ${shape.name}`,
      progress: (this.state.currentStep + 1) / this.design.buildOrder.length * 100
    };
  }

  // Event notification
  private notifyStepChange(): void {
    // Emit event for UI updates
    window.dispatchEvent(new CustomEvent('reconstruction:step-change', {
      detail: this.getCurrentStepInfo()
    }));
  }
}
```

### Context Menu Manager

```typescript
class ContextMenuManager {
  private menuElement: HTMLElement | null = null;
  private position: { x: number; y: number } = { x: 0, y: 0 };
  private groupMode: 'layer' | 'color' | 'role' = 'layer';

  // Show menu at position
  show(x: number, y: number, design: VinylDesign): void {
    this.position = this.adjustPosition(x, y);
    this.render(design);
  }

  // Adjust position to stay in viewport
  private adjustPosition(x: number, y: number): { x: number; y: number } {
    const menuWidth = 320;
    const menuHeight = 400;
    const padding = 10;

    let adjustedX = x;
    let adjustedY = y;

    // Check right boundary
    if (x + menuWidth + padding > window.innerWidth) {
      adjustedX = window.innerWidth - menuWidth - padding;
    }

    // Check bottom boundary
    if (y + menuHeight + padding > window.innerHeight) {
      adjustedY = window.innerHeight - menuHeight - padding;
    }

    // Check left boundary
    if (adjustedX < padding) {
      adjustedX = padding;
    }

    // Check top boundary
    if (adjustedY < padding) {
      adjustedY = padding;
    }

    return { x: adjustedX, y: adjustedY };
  }

  // Group shapes by selected mode
  groupShapes(shapes: Shape[]): Map<string, Shape[]> {
    const groups = new Map<string, Shape[]>();

    shapes.forEach(shape => {
      let key: string;
      
      switch (this.groupMode) {
        case 'layer':
          key = `Layer ${shape.layer}`;
          break;
        case 'color':
          key = shape.color;
          break;
        case 'role':
          key = shape.role.charAt(0).toUpperCase() + shape.role.slice(1);
          break;
      }

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(shape);
    });

    // Sort groups
    return new Map([...groups.entries()].sort((a, b) => {
      if (this.groupMode === 'layer') {
        return parseInt(a[0].split(' ')[1]) - parseInt(b[0].split(' ')[1]);
      }
      return a[0].localeCompare(b[0]);
    }));
  }

  // Generate thumbnail for shape
  generateThumbnail(shape: Shape): string {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Create SVG and render to canvas
    const svg = `
      <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
        <path d="${shape.pathData}" fill="${shape.color}" opacity="${shape.opacity}" />
      </svg>
    `;

    const img = new Image();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, 64, 64);
      URL.revokeObjectURL(url);
    };
    img.src = url;

    return canvas.toDataURL();
  }
}
```

---

## 📊 Visual Examples

### Example 1: Simple Design - Star (5-10 shapes)

**Design Composition:**
```
Star Design
├── Layer 0 (Base)
│   └── Yellow Circle (background)
├── Layer 1 (Main Shape)
│   ├── Triangle 1 (top point)
│   ├── Triangle 2 (right point)
│   ├── Triangle 3 (bottom-right point)
│   ├── Triangle 4 (bottom-left point)
│   └── Triangle 5 (left point)
└── Layer 2 (Details)
    ├── White highlight (top-left)
    └── Gray shadow (bottom-right)

Total: 8 shapes, 3 layers
Complexity: Simple
Build Time: ~8 seconds
```

**Reconstruction Steps:**
1. **Step 1**: Fade in yellow circle (background)
2. **Step 2**: Add top triangle with 45° rotation
3. **Step 3**: Add right triangle with 117° rotation
4. **Step 4**: Add bottom-right triangle with 189° rotation
5. **Step 5**: Add bottom-left triangle with 261° rotation
6. **Step 6**: Add left triangle with 333° rotation
7. **Step 7**: Add white highlight with glow effect
8. **Step 8**: Add gray shadow with blur effect

**Animation Characteristics:**
- Each shape fades in over 300ms
- Current shape pulses with glow effect
- Previous shapes dim to 60% opacity
- Smooth rotation animations for triangles

### Example 2: Complex Design - Racing Car Silhouette (50+ shapes)

**Design Composition:**
```
Racing Car Silhouette
├── Layer 0 (Base Silhouette) - 15 shapes
│   ├── Body outline (main curve)
│   ├── Roof section
│   ├── Hood section
│   ├── Trunk section
│   └── ... (11 more body segments)
├── Layer 1 (Wheels) - 12 shapes
│   ├── Front wheel outer
│   ├── Front wheel inner
│   ├── Front wheel spokes (5 shapes)
│   ├── Rear wheel outer
│   ├── Rear wheel inner
│   └── Rear wheel spokes (5 shapes)
├── Layer 2 (Windows) - 8 shapes
│   ├── Windshield
│   ├── Side window front
│   ├── Side window rear
│   └── ... (5 more window segments)
├── Layer 3 (Details) - 18 shapes
│   ├── Headlights (2)
│   ├── Taillights (2)
│   ├── Door handles (2)
│   ├── Side mirrors (2)
│   ├── Spoiler segments (4)
│   ├── Grille elements (3)
│   └── ... (3 more details)
└── Layer 4 (Highlights/Shadows) - 12 shapes
    ├── Body highlights (6)
    └── Shadow effects (6)

Total: 65 shapes, 5 layers
Complexity: Complex
Build Time: ~65 seconds (1x speed)
```

**Reconstruction Strategy:**
- **Phase 1 (Steps 1-15)**: Build base silhouette from front to back
- **Phase 2 (Steps 16-27)**: Add wheels with radial assembly
- **Phase 3 (Steps 28-35)**: Install windows from front to back
- **Phase 4 (Steps 36-53)**: Add detail elements by functional group
- **Phase 5 (Steps 54-65)**: Apply highlights and shadows for depth

**Advanced Features for Complex Designs:**
- **Grouped Animation**: Related shapes (e.g., wheel spokes) animate together
- **Dependency Highlighting**: Shows which shapes must be placed first
- **Zoom Focus**: Auto-zooms to current shape being added
- **Progress Milestones**: Visual markers at 25%, 50%, 75%, 100%
- **Skip to Phase**: Jump directly to major construction phases

---

## 🎮 User Interaction Flows

### Flow 1: Basic Reconstruction
```
1. User right-clicks on canvas
2. Context menu appears at cursor position
3. User clicks ▶️ button next to "Body outline"
4. Reconstruction panel opens
5. Animation begins automatically
6. User watches step-by-step assembly
7. Animation completes, showing full design
```

### Flow 2: Interactive Learning
```
1. User opens context menu
2. Switches grouping to "Role"
3. Expands "Base" group
4. Clicks on "Background Circle"
5. Shape highlights on canvas
6. User clicks ▶️ to start reconstruction from that shape
7. User pauses at step 3
8. User clicks "Previous" to review step 2
9. User adjusts speed to 0.5x for detailed viewing
10. User enables loop mode
11. Animation repeats continuously
```

### Flow 3: Design Analysis
```
1. User imports complex car design
2. Opens context menu
3. Groups by "Layer"
4. Sees 5 layer groups with shape counts
5. Clicks on "Layer 3 (Details)"
6. Reviews all 18 detail shapes
7. Starts reconstruction for "Headlight Left"
8. Observes dependencies (requires body outline first)
9. Jumps to step showing body outline
10. Continues to headlight installation
11. Captures screenshot of specific step
12. Saves reconstruction sequence as tutorial
```

---

## 🚀 Implementation Checklist

### Phase 1: Core Infrastructure ✅
- [x] Define TypeScript interfaces for Shape and VinylDesign
- [x] Create ReconstructionEngine class
- [x] Implement ContextMenuManager
- [x] Build shape grouping logic
- [x] Create thumbnail generation system

### Phase 2: UI Components ✅
- [x] Build ContextMenu component
- [x] Create ReconstructionPanel component
- [x] Implement Canvas with shape rendering
- [x] Add playback controls
- [x] Design progress indicators

### Phase 3: Animation System 🔄
- [ ] Implement fade-in animations
- [ ] Add glow/highlight effects
- [ ] Create smooth transitions
- [ ] Build zoom/focus system
- [ ] Add grouped shape animations

### Phase 4: Advanced Features 📋
- [ ] Dependency tracking system
- [ ] Phase-based navigation
- [ ] Screenshot capture
- [ ] Tutorial export
- [ ] Collaborative sharing

### Phase 5: Optimization 📋
- [ ] Performance profiling for 100+ shapes
- [ ] Lazy loading for complex designs
- [ ] Canvas rendering optimization
- [ ] Memory management
- [ ] Mobile touch optimization

---

## 📱 Responsive Design Considerations

### Desktop (1920x1080+)
- Context menu: 320px width, max 500px height
- Reconstruction panel: 400px width, docked right
- Canvas: Fills remaining space
- All controls visible simultaneously

### Tablet (768x1024)
- Context menu: 280px width, max 400px height
- Reconstruction panel: Overlay mode, 90% width
- Canvas: Full width when panel closed
- Swipe gestures for panel control

### Mobile (375x667)
- Context menu: Full width bottom sheet
- Reconstruction panel: Full screen overlay
- Canvas: Full screen
- Touch-optimized controls (larger buttons)
- Simplified grouping (single mode at a time)

---

## 🎯 Success Metrics

### User Engagement
- **Context Menu Usage**: 80%+ of users open menu within first session
- **Reconstruction Views**: Average 3+ reconstructions per design
- **Completion Rate**: 70%+ users watch full reconstruction
- **Speed Adjustments**: 40%+ users modify playback speed

### Learning Effectiveness
- **Design Understanding**: 90%+ users report better understanding after reconstruction
- **Build Confidence**: 75%+ users attempt to recreate design
- **Time to Competency**: 50% reduction in learning curve

### Technical Performance
- **Menu Load Time**: < 100ms for designs with 100 shapes
- **Animation FPS**: Maintain 60fps during reconstruction
- **Memory Usage**: < 50MB for complex designs
- **Touch Response**: < 50ms latency on mobile devices

---

## 🔮 Future Enhancements

1. **AI-Powered Suggestions**: Recommend optimal build order
2. **Voice Narration**: Audio descriptions for each step
3. **AR Preview**: View reconstruction in augmented reality
4. **Collaborative Mode**: Multiple users build together
5. **Version History**: Track design iterations
6. **Export Formats**: PDF tutorial, video recording, GIF animation
7. **Accessibility**: Screen reader support, keyboard-only navigation
8. **Localization**: Multi-language support for descriptions

---

## 📚 Developer Resources

### Key Files
- `/types/vinyl.ts` - Core type definitions
- `/components/ContextMenu.tsx` - Context menu UI
- `/components/ReconstructionPanel.tsx` - Reconstruction controls
- `/components/Canvas.tsx` - SVG rendering engine
- `/lib/ReconstructionEngine.ts` - Animation logic

### Testing Strategy
```typescript
// Unit Tests
- Shape grouping logic
- Position adjustment algorithm
- Thumbnail generation
- Build order validation

// Integration Tests
- Context menu interactions
- Reconstruction playback
- State management
- Event handling

// E2E Tests
- Complete user flows
- Cross-browser compatibility
- Touch device support
- Performance benchmarks
```

### Performance Optimization Tips
1. **Virtualize long shape lists** (>50 items)
2. **Debounce thumbnail generation** (batch process)
3. **Use CSS transforms** for animations (GPU acceleration)
4. **Implement shape caching** (memoize rendered paths)
5. **Lazy load reconstruction data** (on-demand)

---

**Document Version**: 1.0.0  
**Last Updated**: 2024  
**Author**: UX/UI Design Team  
**Status**: Implementation Ready ✅
