#!/bin/bash
set -e

echo "========================================"
echo "🚀 Life OS Backend Startup"
echo "========================================"
echo "Current directory: $(pwd)"
echo "DATABASE_URL is set: ${DATABASE_URL:+YES}"
echo "DATABASE_URL is empty: ${DATABASE_URL:-NO}"
echo "========================================"

echo ""
echo "📊 Step 1: Running Prisma migrations..."
npx prisma db push --accept-data-loss --schema=./prisma/schema.prisma

echo ""
echo "✅ Migrations complete!"
echo "========================================"

echo ""
echo "🌐 Step 2: Starting server..."
node dist/index.js
