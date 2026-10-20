#!/bin/bash
# Content Machine — build + deploy
# Usage: bash /Users/mac/Claude/ContentMachine/deploy.sh

set -e

CM_DIR="/Users/mac/Claude/ContentMachine"
SRC_DIR="$CM_DIR/src"
APP_DIR="$CM_DIR/app"
VAULT_DIR="$CM_DIR/vault"
BUNDLE_SCRIPT="$CM_DIR/scripts/bundle-artifact.sh"

# ── 1. Sync captures into build source ───────────────────────────────────────
echo "📋 Syncing captures..."
if [ -f "$VAULT_DIR/captures.json" ]; then
  cp "$VAULT_DIR/captures.json" "$SRC_DIR/src/captures.json"
  CAPTURE_COUNT=$(python3 -c "import json; print(len(json.load(open('$VAULT_DIR/captures.json'))))" 2>/dev/null || echo "?")
  echo "   $CAPTURE_COUNT capture(s) synced"
else
  echo "[]" > "$SRC_DIR/src/captures.json"
  echo "   No captures yet"
fi

# ── 2. Build bundle ───────────────────────────────────────────────────────────
echo "🔨 Building bundle..."
cd "$SRC_DIR"
bash "$BUNDLE_SCRIPT"

# ── 3. Copy to app folder ─────────────────────────────────────────────────────
echo "📦 Copying to app folder..."
cp "$SRC_DIR/bundle.html" "$APP_DIR/content-machine.html"

# ── 4. Deploy to GitHub → Netlify ─────────────────────────────────────────────
echo "🚀 Deploying to GitHub..."
cd "$APP_DIR"
git add content-machine.html
git commit -m "Deploy: update content machine UI $(date '+%Y-%m-%d %H:%M')"
git push

echo "✅ Done. Netlify will auto-deploy in ~30 seconds."
echo "   https://prismatic-sunshine-a14295.netlify.app/"
