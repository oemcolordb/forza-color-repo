# Turso Quick Setup - Copy and paste these commands

# 1. Install Turso CLI
irm https://get.tur.so/install.ps1 | iex

# 2. Restart PowerShell, then login
turso auth login

# 3. List existing databases
turso db list

# 4. Create database (if needed)
turso db create forza-color-repo

# 5. Get database URL
turso db show forza-color-repo --url

# 6. Create auth token
turso db tokens create forza-color-repo

# 7. Run migration
Get-Content migrations\001_create_scans_table.sql | turso db shell forza-color-repo

# 8. Verify tables
turso db shell forza-color-repo "SELECT name FROM sqlite_master WHERE type='table';"

# 9. Add to .env.local (replace with your values)
# TURSO_DATABASE_URL=libsql://forza-color-repo-xxx.turso.io
# TURSO_AUTH_TOKEN=eyJ...
