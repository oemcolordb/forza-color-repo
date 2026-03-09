# 🚀 Vercel + Turso (SQLite) - Complete Setup Guide

## Why Turso for Vercel?

✅ **Perfect Match:**

- Turso = SQLite for the edge (built by Vercel's team)
- Global replication across Vercel regions
- Sub-10ms latency worldwide
- Serverless-friendly (no connection pooling needed)
- Free tier: 500 databases, 1GB storage, 1B row reads/month

---

## Quick Setup (5 minutes)

### 1. Install Turso CLI

**PowerShell (Windows):**

```powershell
irm https://get.tur.so/install.ps1 | iex
```

**Mac/Linux:**

```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

### 2. Login & Create Database

```bash
# Login to Turso
turso auth login

# Create database
turso db create forza-color-repo

# Get connection details
turso db show forza-color-repo --url
turso db tokens create forza-color-repo
```

### 3. Add to Vercel

**Option A: Vercel Dashboard**

1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Add:
   - `TURSO_DATABASE_URL` = `libsql://forza-color-repo-xxx.turso.io`
   - `TURSO_AUTH_TOKEN` = `eyJ...`
3. Redeploy

**Option B: Vercel CLI**

```bash
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN
```

### 4. Run Migration

**PowerShell:**

```powershell
Get-Content migrations\001_create_scans_table.sql | turso db shell forza-color-repo
```

**Bash:**

```bash
turso db shell forza-color-repo < migrations/001_create_scans_table.sql
```

### 5. Verify

```bash
turso db shell forza-color-repo "SELECT name FROM sqlite_master WHERE type='table';"
```

Expected output:

```
scans
users
```

---

## Vercel Integration Features

### ✅ Already Configured:

**1. API Routes** (`/app/api/scans/route.ts`)

```typescript
import { createClient } from '@libsql/client'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})
```

**2. Vercel Functions** (`vercel.json`)

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

**3. Environment Variables**

- Automatically injected into Vercel Functions
- Secure (not exposed to client)
- Available in all regions

---

## Advanced Features

### 1. Multi-Region Replication

```bash
# Create replicas in multiple regions
turso db replicate forza-color-repo --location iad  # US East
turso db replicate forza-color-repo --location lhr  # London
turso db replicate forza-color-repo --location nrt  # Tokyo

# Verify
turso db show forza-color-repo
```

### 2. Database Branching (Dev/Prod)

```bash
# Create dev branch
turso db create forza-color-repo-dev --from-db forza-color-repo

# Use in development
# .env.local
TURSO_DATABASE_URL=libsql://forza-color-repo-dev.turso.io
```

### 3. Connection Pooling (Optional)

```typescript
// For high-traffic apps
import { createClient } from '@libsql/client'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
  syncUrl: process.env.TURSO_SYNC_URL, // Optional: local replica
  syncInterval: 60, // Sync every 60 seconds
})
```

---

## Database Management

### View Data

```bash
# Open SQL shell
turso db shell forza-color-repo

# Run queries
SELECT * FROM scans LIMIT 10;
SELECT COUNT(*) FROM scans;
SELECT userId, COUNT(*) as scan_count FROM scans GROUP BY userId;
```

### Backup & Restore

```bash
# Backup
turso db dump forza-color-repo > backup.sql

# Restore
turso db shell forza-color-repo < backup.sql
```

### Monitor Usage

```bash
# Check database stats
turso db show forza-color-repo

# View usage
turso org usage
```

---

## Performance Optimization

### 1. Indexes (Already Added)

```sql
CREATE INDEX idx_scans_user ON scans(userId);
CREATE INDEX idx_scans_created ON scans(createdAt DESC);
```

### 2. Query Optimization

```typescript
// Good: Use indexes
const result = await client.execute({
  sql: 'SELECT * FROM scans WHERE userId = ? ORDER BY createdAt DESC LIMIT 50',
  args: [userId],
})

// Bad: Full table scan
const result = await client.execute({
  sql: 'SELECT * FROM scans WHERE imageName LIKE ?',
  args: ['%test%'],
})
```

### 3. Batch Operations

```typescript
// Insert multiple scans efficiently
const batch = scans.map(scan => ({
  sql: 'INSERT INTO scans (userId, imageName, ...) VALUES (?, ?, ...)',
  args: [scan.userId, scan.imageName, ...]
}))

await client.batch(batch)
```

---

## Monitoring & Debugging

### 1. Vercel Logs

```bash
# View function logs
vercel logs

# Filter by function
vercel logs --filter="api/scans"
```

### 2. Turso Logs

```bash
# View database activity
turso db inspect forza-color-repo

# Check connection status
turso db show forza-color-repo --http-url
```

### 3. Error Handling

```typescript
try {
  const result = await client.execute(query)
} catch (error) {
  console.error('Database error:', error)
  // Log to Vercel Analytics
  if (process.env.VERCEL) {
    console.log('[TURSO_ERROR]', {
      query: query.sql,
      error: error.message,
    })
  }
}
```

---

## Cost Optimization

### Free Tier Limits:

- ✅ 500 databases
- ✅ 1 GB storage per database
- ✅ 1 billion row reads/month
- ✅ 25 million row writes/month

### Tips:

1. Use indexes to reduce row reads
2. Limit query results (LIMIT clause)
3. Cache frequently accessed data
4. Use database branching for dev/staging

---

## Troubleshooting

### "Failed to connect to database"

**Check:**

```bash
# Verify database exists
turso db list

# Test connection
turso db shell forza-color-repo "SELECT 1;"

# Regenerate token if expired
turso db tokens create forza-color-repo
```

### "Environment variables not set"

**Vercel:**

1. Settings → Environment Variables
2. Ensure variables are set for all environments (Production, Preview, Development)
3. Redeploy after adding variables

### "Table does not exist"

```bash
# Run migration again
Get-Content migrations\001_create_scans_table.sql | turso db shell forza-color-repo

# Verify tables
turso db shell forza-color-repo "SELECT name FROM sqlite_master WHERE type='table';"
```

---

## Migration Guide

### Adding New Tables

1. Create migration file: `migrations/002_add_new_table.sql`
2. Run migration:

```bash
turso db shell forza-color-repo < migrations/002_add_new_table.sql
```

### Modifying Existing Tables

```sql
-- SQLite doesn't support ALTER COLUMN, use this pattern:

-- 1. Create new table
CREATE TABLE scans_new (
  id INTEGER PRIMARY KEY,
  userId TEXT NOT NULL,
  -- new columns here
);

-- 2. Copy data
INSERT INTO scans_new SELECT * FROM scans;

-- 3. Drop old table
DROP TABLE scans;

-- 4. Rename new table
ALTER TABLE scans_new RENAME TO scans;

-- 5. Recreate indexes
CREATE INDEX idx_scans_user ON scans(userId);
```

---

## Production Checklist

- [x] Turso database created
- [x] Migration executed
- [x] Environment variables set in Vercel
- [x] Indexes created for performance
- [x] API routes tested locally
- [x] Error handling implemented
- [ ] Multi-region replication (optional)
- [ ] Monitoring setup
- [ ] Backup strategy defined

---

## Next Steps

1. **Test API Endpoints:**

   ```bash
   # After deployment
   curl "https://your-app.vercel.app/api/scans?userId=test"
   ```

2. **Monitor Usage:**

   ```bash
   turso org usage
   ```

3. **Scale as Needed:**
   - Add replicas for global users
   - Upgrade plan if exceeding free tier
   - Implement caching layer

---

## Resources

- 📚 Turso Docs: https://docs.turso.tech
- 🚀 Vercel Docs: https://vercel.com/docs
- 💬 Turso Discord: https://discord.gg/turso
- 🐛 GitHub Issues: Your repo issues page

---

**You're all set!** Turso (SQLite) is now running on Vercel's edge network! 🎉
