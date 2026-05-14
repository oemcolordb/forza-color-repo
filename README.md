# 🏎️ Forza Color Universe

A comprehensive automotive paint color database, tuning platform, and telemetry dashboard for the Forza Horizon and Motorsport series.

## 🚀 Features

- **Color Database**: Access thousands of OEM and custom paint codes.
- **TuneForge**: Advanced tuning calculator for optimizing car performance.
- **AI Paint Scanner**: Extract accurate HSB colors from screenshots using machine learning.
- **Telemetry Dashboard**: Real-time data visualization via WebSocket connection to the game.
- **Location Finder**: interactive maps and scenic location guides.
- **PWA Support**: Installable on desktop and mobile for offline access.

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **3D Rendering**: React Three Fiber, Three.js
- **Backend**: Next.js API Routes, Python AI Services
- **Database**: Turso (SQLite), IndexedDB (Local)
- **Deployment**: Vercel / Netlify

## 📂 Repository Structure

- `app/`: Next.js application source (pages, components, API)
- `scripts/`: Data extraction, repair, and maintenance tools
- `public/`: Static assets and color data JSONs
- `python-services/`: Backend AI and ML processing logic
- `Forza-color-repo Research/`: Reference materials and PDFs

---

## 🧹 Maintenance & Cleanup Guide

> [!IMPORTANT]
> Because of environment restrictions on terminal commands, some cleanup must be performed manually.

### 1. Delete Leftover Encrypted Files
After unlocking the source code, delete all `.enc` files to reduce bloat:
```powershell
Get-ChildItem -Recurse -Filter "*.enc" | Remove-Item
```

### 2. Clean Root Directory Clutter
Remove the following non-source files from the root:
- All `Designer-*.json`, `Gemini_Generated_*.json`, and `Screenshot*.json` files.
- All `build-cleanup-check*.txt`, `netlify-build-log*.txt`, and `playwright-*.txt` logs.
- The 37MB `Gengar With Smiley Tongue Sticker` file.
- `proxy.js` and `server.js` (if they are no longer used for local testing).

### 3. Rotate Exposed Secrets
Check the `AUDIT_REPORT.md` for a list of exposed credentials and rotate them immediately.

### 4. Consolidate Libs
Move logic from `src/lib/` and the root `lib/` into `app/lib/` to follow a consistent structure.
