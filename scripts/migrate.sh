#!/bin/bash

# Turso Database Migration Runner
# Run this script to set up the scans table

echo "🚀 Running Turso database migration..."

# Check if turso CLI is installed
if ! command -v turso &> /dev/null; then
    echo "❌ Turso CLI not found. Install it first:"
    echo "   curl -sSfL https://get.tur.so/install.sh | bash"
    exit 1
fi

# Get database name from environment or use default
DB_NAME="${TURSO_DB_NAME:-forza-color-repo}"

echo "📊 Database: $DB_NAME"
echo ""

# Run migration
turso db shell "$DB_NAME" < migrations/001_create_scans_table.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "Verifying tables..."
    turso db shell "$DB_NAME" "SELECT name FROM sqlite_master WHERE type='table';"
else
    echo ""
    echo "❌ Migration failed. Check your database connection."
    exit 1
fi
