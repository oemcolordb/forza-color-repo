# 🚀 Quick Setup - Turso Database Migration

## Option 1: Automated Script (Recommended)

### Windows:
```bash
.\scripts\migrate.bat
```

### Mac/Linux:
```bash
chmod +x scripts/migrate.sh
./scripts/migrate.sh
```

---

## Option 2: Manual Setup

### Step 1: Install Turso CLI

**Windows (PowerShell):**
```powershell
irm https://get.tur.so/install.ps1 | iex
```

**Mac/Linux:**
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

### Step 2: Login to Turso
```bash
turso auth login
```

### Step 3: Create Database (if not exists)
```bash
turso db create forza-color-repo
```

### Step 4: Run Migration
```bash
turso db shell forza-color-repo < migrations/001_create_scans_table.sql
```

### Step 5: Verify Tables
```bash
turso db shell forza-color-repo "SELECT name FROM sqlite_master WHERE type='table';"
```

Expected output:
```
scans
users
```

---

## Option 3: Turso Web Console

1. Go to https://turso.tech/app
2. Select your database
3. Click "SQL Console"
4. Copy/paste from `migrations/001_create_scans_table.sql`
5. Click "Run"

---

## Verify Setup

Test the API endpoint:

```bash
# Start dev server
npm run dev

# Test GET (should return empty array)
curl "http://localhost:3000/api/scans?userId=test-user"

# Test POST
curl -X POST http://localhost:3000/api/scans \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "imageName": "test.jpg",
    "extractedColors": "[]",
    "matches": "[]"
  }'

# Verify saved
curl "http://localhost:3000/api/scans?userId=test-user"
```

---

## Troubleshooting

### "turso: command not found"
- Restart terminal after installation
- Check PATH includes Turso binary

### "database not found"
```bash
# List your databases
turso db list

# Use correct database name
turso db shell YOUR_DATABASE_NAME < migrations/001_create_scans_table.sql
```

### "TURSO_DATABASE_URL not set"
Add to `.env.local`:
```env
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-token-here
```

Get values:
```bash
turso db show forza-color-repo --url
turso db tokens create forza-color-repo
```

---

## ✅ Success Checklist

- [ ] Turso CLI installed
- [ ] Logged in to Turso
- [ ] Database created
- [ ] Migration executed
- [ ] Tables verified
- [ ] Environment variables set
- [ ] API endpoints tested

---

**Ready to use!** Visit `/image-match` and start saving scans! 🎨
