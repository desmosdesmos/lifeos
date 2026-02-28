#!/bin/bash
set -e

echo "🚀 Starting Life OS Backend..."

# Apply database schema
echo "📊 Applying database schema..."
npx prisma db push --accept-data-loss

echo "✅ Database schema applied!"

# Start the server
echo "🌐 Starting server..."
node dist/index.js
