# Visual Diagrams - Vinyl Creator Context Menu System

## 🎨 Context Menu Layout (Detailed)

```
┌─────────────────────────────────────────────────────┐
│  🎨 Vinyl Design: "Racing Stripes"                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                      │
│  📊 Group By:  [●Layer] [○Color] [○Role]           │
│  ┌──────────────────────────────────────────────┐  │
│  │ 🔍 Search shapes...                          │  │
│  └──────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│  ▼ Layer 0 (Base) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ┌───┬──────────────────────────────────┬──────┐  │
│  │🟦 │ Background Rectangle             │  ▶️  │  │
│  │   │ L0 • base • #0066CC              │      │  │
│  │   │ Transform: x:0 y:0 rot:0°        │      │  │
│  └───┴──────────────────────────────────┴──────┘  │
│  ┌───┬──────────────────────────────────┬──────┐  │
│  │🟥 │ Main Stripe                      │  ▶️  │  │
│  │   │ L0 • accent • #FF0000            │      │  │
│  │   │ Transform: x:50 y:0 rot:0°       │      │  │
│  └───┴──────────────────────────────────┴──────┘  │
├─────────────────────────────────────────────────────┤
│  ▼ Layer 1 (Accents) ━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ┌───┬──────────────────────────────────┬──────┐  │
│  │⚪ │ Side Stripe Left                 │  ▶️  │  │
│  │   │ L1 • accent • #FFFFFF            │      │  │
│  │   │ Transform: x:45 y:10 rot:0°      │      │  │
│  └───┴──────────────────────────────────┴──────┘  │
│  ┌───┬──────────────────────────────────┬──────┐  │
│  │⚪ │ Side Stripe Right                │  ▶️  │  │
│  │   │ L1 • accent • #FFFFFF            │      │  │
│  │   │ Transform: x:55 y:10 rot:0°      │      │  │
│  └───┴──────────────────────────────────┴──────┘  │
├─────────────────────────────────────────────────────┤
│  ▼ Layer 2 (Details) ━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ┌───┬──────────────────────────────────┬──────┐  │
│  │⭐ │ Highlight Line                   │  ▶️  │  │
│  │   │ L2 • highlight • #FFFF00         │      │  │
│  │   │ Transform: x:50 y:5 rot:0°       │      │  │
│  │   │ Opacity: 0.8                     │      │  │
│  └───┴──────────────────────────────────┴──────┘  │
├─────────────────────────────────────────────────────┤
│  📊 Statistics                                      │
│  • 5 shapes across 3 layers                        │
│  • Complexity: Simple                              │
│  • Estimated build time: 5 seconds                 │
│                                                      │
│  [🔄 Refresh] [📥 Import] [✖ Close]                │
└─────────────────────────────────────────────────────┘
```

## 🎬 Reconstruction Panel (Full Interface)

```
┌─────────────────────────────────────────────────────────────┐
│  🎬 Reconstruction Mode: "Racing Stripes"                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│  Progress: ████████████████░░░░░░░░░░░░░░░░░░░░ 60%       │
│  Step 3 of 5 • 2 seconds elapsed • 1.3s remaining          │
├─────────────────────────────────────────────────────────────┤
│  ⏯️  Playback Controls                                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │  [◀◀] [◀] [⏸] [▶] [▶▶]    Speed: [1x ▼]         │    │
│  │   │    │   │   │    │                              │    │
│  │  First Prev Pause Next Last                        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  🎛️  Options                                                │
│  [🔁 Loop: OFF] [🎯 Auto-zoom: ON] [📸 Capture]           │
├─────────────────────────────────────────────────────────────┤
│  📍 Current Step Details                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  ⚪ Side Stripe Left                               │    │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │    │
│  │  Layer: 1 (Accents)                                │    │
│  │  Role: Accent                                      │    │
│  │  Color: #FFFFFF (White)                            │    │
│  │  Position: x:45, y:10                              │    │
│  │  Rotation: 0°                                      │    │
│  │  Opacity: 100%                                     │    │
│  │                                                     │    │
│  │  📝 Description:                                   │    │
│  │  "Add the left side accent stripe to create       │    │
│  │   visual depth and racing aesthetic"              │    │
│  │                                                     │    │
│  │  ⚠️  Dependencies:                                 │    │
│  │  • Main Stripe (completed ✓)                      │    │
│  │  • Background Rectangle (completed ✓)             │    │
│  └────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  📊 Build Order Timeline                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  [✓]  [✓]  [●]  [ ]  [ ]                          │    │
│  │   1    2    3    4    5                            │    │
│  │   │    │    │    │    │                            │    │
│  │  Base Main Left Right High                         │    │
│  │                                                     │    │
│  │  Click any step to jump directly                   │    │
│  └────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  🎯 Quick Actions                                           │
│  [💾 Save Progress] [📤 Export Tutorial] [🔄 Restart]      │
│  [📋 Copy Build Order] [🎨 Edit Design] [❌ Exit]          │
└─────────────────────────────────────────────────────────────┘
```

## 🌟 Simple Design Example: Star Composition

```
Step-by-Step Build Process:

Step 1: Background Circle
┌─────────────┐
│             │
│      ●      │  🟡 Yellow circle (base layer)
│             │
└─────────────┘

Step 2-6: Add Triangular Points
┌─────────────┐
│      △      │
│   △  ●  △   │  🟠 Orange triangles (accent layer)
│   △     △   │     Rotated 72° apart
└─────────────┘

Step 7: Add Highlight
┌─────────────┐
│   ✨ △      │
│   △  ●  △   │  ⚪ White highlight (top-left)
│   △     △   │     80% opacity
└─────────────┘

Step 8: Add Shadow
┌─────────────┐
│   ✨ △      │
│   △  ●  △   │  ⚫ Gray shadow (bottom-right)
│   △     △ 🌑│     50% opacity
└─────────────┘

Final Result: ⭐ Complete 5-pointed star with depth
```

## 🏎️ Complex Design Example: Racing Car Phases

```
Phase 1: Base Silhouette (Steps 1-15)
┌────────────────────────────────────────┐
│                                        │
│    ╔════════════════════╗             │
│    ║                    ║             │  Main body outline
│    ║    BODY SHAPE      ║             │  15 curved segments
│    ╚════════════════════╝             │  Red color (#FF0000)
│   ●                      ●            │
└────────────────────────────────────────┘

Phase 2: Wheels (Steps 16-27)
┌────────────────────────────────────────┐
│                                        │
│    ╔════════════════════╗             │
│    ║                    ║             │  Add wheel assemblies
│    ║    BODY SHAPE      ║             │  Outer rim (black)
│    ╚════════════════════╝             │  Inner hub (gray)
│   ◉                      ◉            │  5 spokes each
└────────────────────────────────────────┘

Phase 3: Windows (Steps 28-35)
┌────────────────────────────────────────┐
│    ┌──┐  ┌────┐                       │
│    │▓▓│  │▓▓▓▓│                       │  Windshield + side windows
│    ╔════════════════════╗             │  Light blue (#87CEEB)
│    ║                    ║             │  70% opacity
│    ║    BODY SHAPE      ║             │
│    ╚════════════════════╝             │
│   ◉                      ◉            │
└────────────────────────────────────────┘

Phase 4: Details (Steps 36-53)
┌────────────────────────────────────────┐
│    ┌──┐  ┌────┐          ╱╲           │
│ ◉◉ │▓▓│  │▓▓▓▓│          ╲╱           │  Headlights (yellow)
│    ╔════════════════════╗         ◉◉  │  Taillights (red)
│    ║                    ║             │  Spoiler (black)
│    ║    BODY SHAPE      ║             │  Mirrors, handles
│    ╚════════════════════╝             │
│   ◉                      ◉            │
└────────────────────────────────────────┘

Phase 5: Highlights/Shadows (Steps 54-65)
┌────────────────────────────────────────┐
│    ┌──┐  ┌────┐          ╱╲           │
│ ◉◉ │▓▓│  │▓▓▓▓│          ╲╱           │
│    ╔════════════════════╗         ◉◉  │  White highlights (40%)
│    ║ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ║             │  Black shadows (30%)
│    ║    BODY SHAPE      ║             │  Creates 3D depth
│    ╚════════════════════╝             │
│   ◉▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓◉            │
└────────────────────────────────────────┘

Final: 🏎️ Complete racing car with 65+ shapes
```

## 🔄 Animation Flow Diagram

```
User Interaction Flow:
┌─────────────┐
│ Right-Click │
│  on Canvas  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Context Menu    │
│ Appears         │
│ • Layer groups  │
│ • Shape list    │
│ • Thumbnails    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ User Selects    │
│ Shape & Clicks  │
│ ▶️ Button       │
└──────┬──────────┘
       │
       ▼
┌─────────────────────────┐
│ Reconstruction Engine   │
│ Initializes             │
│ • Load design           │
│ • Set current step = 0  │
│ • Prepare animation     │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Animation Loop Starts   │
│ ┌─────────────────────┐ │
│ │ 1. Fade in shape    │ │
│ │ 2. Apply glow       │ │
│ │ 3. Update progress  │ │
│ │ 4. Wait (speed)     │ │
│ │ 5. Next step        │ │
│ └─────────────────────┘ │
│ Repeat until complete   │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────┐
│ User Controls   │
│ • Pause/Play    │
│ • Speed adjust  │
│ • Step nav      │
│ • Loop toggle   │
└─────────────────┘
```

## 📊 State Machine Diagram

```
Reconstruction Engine States:

    ┌─────────┐
    │  IDLE   │ ◄─────────────────┐
    └────┬────┘                   │
         │ play()                 │
         ▼                        │
    ┌─────────┐                  │
    │ PLAYING │                  │ reset()
    └────┬────┘                  │
         │ pause()               │
         ▼                        │
    ┌─────────┐                  │
    │ PAUSED  │                  │
    └────┬────┘                  │
         │ play()                │
         ▼                        │
    ┌─────────┐                  │
    │ PLAYING │                  │
    └────┬────┘                  │
         │ complete()            │
         ▼                        │
    ┌──────────┐                 │
    │ COMPLETE │─────────────────┘
    └──────────┘

State Transitions:
• IDLE → PLAYING: User clicks play
• PLAYING → PAUSED: User clicks pause
• PAUSED → PLAYING: User resumes
• PLAYING → COMPLETE: Last step reached
• COMPLETE → IDLE: User resets
• ANY → IDLE: User clicks reset
```

## 🎯 Component Hierarchy

```
VinylDesigner (Main Container)
│
├── Canvas (SVG Rendering)
│   ├── Background Layer
│   ├── Shape Layers (0-100)
│   │   └── Individual Shapes
│   ├── Highlight Effects
│   └── Grid Overlay
│
├── ContextMenu (Right-click)
│   ├── Header
│   │   ├── Design Name
│   │   └── Group Selector
│   ├── Shape Groups
│   │   ├── Group Header
│   │   └── Shape Items
│   │       ├── Thumbnail
│   │       ├── Metadata
│   │       └── Action Button
│   └── Footer
│       └── Statistics
│
└── ReconstructionPanel
    ├── Progress Bar
    ├── Playback Controls
    │   ├── Navigation Buttons
    │   ├── Speed Selector
    │   └── Loop Toggle
    ├── Step Details
    │   ├── Shape Info
    │   ├── Description
    │   └── Dependencies
    ├── Timeline
    │   └── Step Indicators
    └── Quick Actions
```

---

**Legend:**
- ● = Circle/Dot
- ◉ = Circle with center
- ▓ = Shaded area
- ═ = Double line
- ─ = Single line
- ┌┐└┘ = Box corners
- ▶️ = Play button
- ✓ = Completed
- ● = Current step
- [ ] = Incomplete step
