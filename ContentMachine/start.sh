#!/bin/bash
# start.sh — Start the Content Machine local server
# Usage: bash /Users/mac/Claude/ContentMachine/start.sh

set -e

CM_DIR="/Users/mac/Claude/ContentMachine"
cd "$CM_DIR"

# Install server deps if needed
if [ ! -d node_modules/express ]; then
  echo "📦 Installing server dependencies..."
  npm install --silent
fi

# Build the app first so the server has a fresh bundle to serve
echo "🔨 Building app..."
bash "$CM_DIR/deploy.sh" 2>&1 | grep -E "✅|❌|🚀|📋|🔨" || true

echo ""
echo "🚀 Starting server..."
open "http://localhost:3000"
node server.js
