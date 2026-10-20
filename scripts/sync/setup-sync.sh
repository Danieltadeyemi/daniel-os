#!/bin/bash
# One-time setup: turns ~/Claude into a synced copy of github.com/Danieltadeyemi/daniel-os
set -e
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
DIR="$HOME/Claude"
REPO="https://github.com/Danieltadeyemi/daniel-os.git"
PLIST="$HOME/Library/LaunchAgents/com.daniel.claude-autosync.plist"

echo "1/5 Checking GitHub login..."
gh auth status >/dev/null 2>&1 || gh auth login --hostname github.com --git-protocol https --web
gh auth setup-git

echo "2/5 Backing up current folder to ~/Claude-backup-$(date +%Y%m%d)..."
cp -R "$DIR" "$HOME/Claude-backup-$(date +%Y%m%d)"

echo "3/5 Linking ~/Claude to GitHub..."
cd "$DIR"
if [ ! -d .git ]; then
  git init -q -b main
  git remote add origin "$REPO"
fi
git fetch -q origin main
git reset -q origin/main          # line the folder up with GitHub's history
git checkout -- .                 # bring in files that exist on GitHub but not here (nothing is lost: a full backup was made in step 2)
git config user.name "Daniel Adeyemi"
git config user.email "danieltadeyemi@gmail.com"

echo "4/5 Removing the old GitHub token from local dashboard files..."
for f in DashboardSrc/my-plate/src/App.tsx DashboardSrc/my-plate/bundle.html Dashboard/dashboard.html; do
  [ -f "$f" ] && sed -i '' -E 's/ghp_[A-Za-z0-9]{20,}/REDACTED_GITHUB_TOKEN/g' "$f"
done

echo "5/5 Scheduling sync every 30 minutes..."
mkdir -p "$HOME/Library/LaunchAgents"
cat > "$PLIST" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.daniel.claude-autosync</string>
  <key>ProgramArguments</key><array><string>/bin/bash</string><string>$DIR/scripts/sync/autosync.sh</string></array>
  <key>StartInterval</key><integer>1800</integer>
  <key>RunAtLoad</key><true/>
</dict></plist>
PL
launchctl unload "$PLIST" 2>/dev/null || true
launchctl load "$PLIST"

bash "$DIR/scripts/sync/autosync.sh" && echo "Done. ~/Claude now syncs with GitHub every 30 minutes." || echo "Setup finished, but the first sync reported a problem. See ~/Claude/.sync.log"
