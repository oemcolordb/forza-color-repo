# Offline Mode & Service Worker Setup

## Overview

This application uses a Service Worker to enable offline functionality and PWA capabilities. This document explains how it works, how to verify it's working, and troubleshooting steps.

## Architecture

### Components

1. **Service Worker** (`/public/sw.js`)
   - Runs in a separate thread
   - Intercepts network requests and caches responses
   - Serves cached content when offline
   - Automatically detects version changes

2. **Registration** (`app/layout.js`)
   - Registers the SW on page load
   - Handles registration errors gracefully
   - In dev mode: Can be enabled via `localStorage.setItem('DEV_SW_ENABLED', 'true')`

3. **Status Monitor** (`app/components/ServiceWorkerStatus.tsx`)
   - Shows registration status in bottom-right corner
   - Displays current cache version
   - Notifies of available updates
   - Only visible in dev mode (unless showDev toggled)

4. **Diagnostics** (`app/dev/sw-diagnostics`)
   - Comprehensive debugging page
   - Shows all registered caches
   - Lists version information
   - Provides cache management tools

5. **Version API** (`app/api/version/route.ts`)
   - Returns current app version
   - Used by SW to detect updates
   - Syncs with package.json

## Caching Strategy

### Static Assets (Cache First)
- `/_next/static/*` - JavaScript, CSS bundles
- `/images/*` - Image files
- `/manifest.json` - PWA manifest
- `/offline.html` - Fallback page

**Strategy**: Check cache first, fall back to network

### Navigation Pages (Network First with 8s Timeout)
- HTML pages and navigation requests
- Try to fetch fresh, fall back to cache if timeout

**Strategy**: Try network with aggressive timeout, use cache if slow/offline

### API Requests (Always Fresh)
- `/api/*` endpoints
- No caching of API responses

**Strategy**: Always try to fetch fresh

### Dynamic Content (Network First)
- Other requests
- Try network first, use cache as fallback

**Strategy**: Network first, fallback to cache

## Version Management

### How Version Detection Works

1. Service Worker reads version from `/api/version` on:
   - First install
   - Every activation
   - During diagnostics checks

2. Cache names include version:
   ```
   forza-colors-v1.0.0
   forza-static-v1.0.0
   forza-dynamic-v1.0.0
   ```

3. On version change:
   - Old caches are automatically deleted
   - New caches are created
   - Clients are notified via message passing

### Version Synchronization

The app version comes from:
- **Production**: `package.json` version
- **Vercel**: Git commit SHA
- **Local Dev**: 'local'

All displayed in the diagnostics page.

## Testing Offline Mode

### Development (localhost)

1. **Enable Service Worker in Dev Mode**
   ```javascript
   // In browser console:
   localStorage.setItem('DEV_SW_ENABLED', 'true')
   location.reload()
   ```

2. **Verify Registration**
   - Open DevTools → Application → Service Workers
   - Should see `/sw.js` listed as "activated"

3. **View Status Component**
   - Look for green indicator in bottom-right corner
   - Click to see cache version and available actions

4. **Go Offline and Test**
   - DevTools → Network → Offline
   - Navigate to different pages
   - Cached pages should load
   - API calls should show offline.html

### Production

1. **Verify in DevTools**
   ```
   DevTools → Application → Service Workers
   ```
   Should show:
   - Registration status: "activated and running"
   - Scope: "/"
   - Update status: checked

2. **Check Caches**
   ```
   DevTools → Application → Cache Storage
   ```
   Should see:
   - `forza-colors-v1.0.0`
   - `forza-static-v1.0.0`
   - `forza-dynamic-v1.0.0`

3. **Test Offline**
   - DevTools → Network → Offline
   - Refresh page
   - Should still load with cached content

## Troubleshooting

### Service Worker Won't Register

**Symptoms**: "SW Inactive" in status component

**Causes & Fixes**:

1. **Not HTTPS**
   - Service Workers require secure context
   - Fix: Deploy to HTTPS or test locally

2. **Localhost not enabled**
   - SW registration disabled on localhost by default
   - Fix: Run `localStorage.setItem('DEV_SW_ENABLED', 'true')`

3. **Browser doesn't support**
   - Check browser compatibility
   - Fix: Use modern browser (Chrome, Firefox, Safari 11+, Edge)

4. **Syntax Error in SW**
   - SW won't install if there are syntax errors
   - Check: DevTools → Console for errors

### Cache Issues

**Symptoms**: Seeing old content even after deployment

**Causes & Fixes**:

1. **Version mismatch**
   - Check: `/dev/sw-diagnostics` → Cache Storage
   - Fix: Clear caches and reload

2. **Dynamic cache too old**
   - The dynamic cache persists across deployments
   - Fix: Manual cache clear from diagnostics page

3. **Browser cache conflict**
   - Fix: Hard refresh `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### Offline Page Shows When Should Be Online

**Symptoms**: Always seeing offline.html even with connection

**Cause**: Health check at `/api/health` failing

**Fix**:
1. Verify `/api/health` endpoint responds
2. Check network tab for actual errors
3. See offline.html console logs for details

## Monitoring & Analytics

### Health Check

The app pings `/api/health` every 5 seconds from offline.html:
- Returns 200 if healthy
- Returns 503 if degraded
- Used to auto-reconnect

### Version Updates

When a version update is detected:
1. Users see notification in status component
2. Click "Update" to reload with new version
3. New caches are created and old ones cleaned

## Performance Impact

### Size
- Service Worker: ~4KB (minified)
- offline.html: ~2KB

### Runtime Overhead
- Initial registration: ~50ms
- Cache lookup: ~1-5ms per request
- Memory: ~10MB cache storage per user

## Security

### What SW Can't Do
- Access DOM (it's a separate thread)
- Make cross-origin requests without CORS
- Store sensitive data (use encrypted storage)

### Best Practices
- All cached content is served as-is (no real-time updates to cached static files)
- API endpoints are never cached (always fresh)
- offline.html doesn't store auth tokens
- Version updates trigger full reload

## Advanced Features

### Message Passing

Clients can listen to SW messages:
```javascript
navigator.serviceWorker.addEventListener('message', event => {
  if (event.data.type === 'VERSION_UPDATE') {
    console.log('New version:', event.data.version)
  }
})
```

### Background Sync

Setup for future offline-action syncing:
```javascript
registration.sync.register('sync-tag')
```

### Notifications

SW can trigger notifications (with user permission):
```javascript
self.registration.showNotification('Title', { body: 'Message' })
```

## Disabling Offline Mode

To disable Service Worker globally:
1. Remove registration code from `app/layout.js`
2. Add cache buster header to sw.js
3. Deploy and hard-refresh all users

## Further Reading

- [MDN Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [Workbox Patterns](https://developers.google.com/web/tools/workbox/modules)
