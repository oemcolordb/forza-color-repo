# 🔧 Vercel Build Fix Guide

## Common Build Errors & Solutions

### 1. Module Not Found Errors

**Error:** `Module not found: Can't resolve 'X'`

**Fix:**

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### 2. TypeScript Errors

**Error:** `Type error: ...`

**Fix in `tsconfig.json`:**

```json
{
  "compilerOptions": {
    "skipLibCheck": true,
    "strict": false
  }
}
```

### 3. Vercel Toolbar Issues

**Error:** `@vercel/toolbar` build failure

**Fixed:** Removed from `next.config.ts`

### 4. Environment Variables

**Required in Vercel Dashboard:**

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `NEXT_PUBLIC_DISCORD_CLIENT_ID` (optional)
- `NEXT_PUBLIC_XBOX_CLIENT_ID` (optional)

**Set in Vercel:**

1. Go to Project Settings
2. Environment Variables
3. Add each variable
4. Redeploy

### 5. Build Command

**In Vercel Project Settings:**

- Build Command: `npm run build`
- Install Command: `npm install --legacy-peer-deps`
- Output Directory: `.next`

### 6. Node Version

**Add `.nvmrc`:**

```
20
```

**Or in `package.json`:**

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## Quick Fix Checklist

- [ ] Remove `@vercel/toolbar` from next.config.ts ✅
- [ ] Add `vercel.json` with build config ✅
- [ ] Add `.vercelignore` ✅
- [ ] Set environment variables in Vercel
- [ ] Use `--legacy-peer-deps` for install
- [ ] Clear build cache in Vercel
- [ ] Redeploy

---

## Manual Deploy Test

```bash
# Test build locally
npm run build

# If successful, push to git
git add .
git commit -m "Fix Vercel build"
git push

# Vercel will auto-deploy
```

---

## Still Failing?

### Check Vercel Build Logs:

1. Go to Vercel Dashboard
2. Click your project
3. Click failed deployment
4. View "Build Logs"
5. Find the actual error

### Common Issues:

**Import errors:**

```typescript
// Bad
import colorData from '../../services/colordata'

// Good
import colorData from '../../services/colorData'
```

**Missing dependencies:**

```bash
npm install @react-three/fiber @react-three/drei three
```

**API route errors:**

```typescript
// Ensure all API routes export properly
export async function GET(request: Request) {}
export async function POST(request: Request) {}
```

---

## Force Clean Build

In Vercel Dashboard:

1. Settings → General
2. Scroll to "Build & Development Settings"
3. Click "Clear Build Cache"
4. Redeploy

---

## Contact Support

If still failing, share:

- Build log (last 50 lines)
- `package.json`
- `next.config.ts`
- Error message

Build should work now! 🚀
