#!/bin/bash
# Two-way sync between ~/Claude on the Mac and GitHub (daniel-os).
# Runs every 30 minutes via launchd. Safe to run by hand: bash ~/Claude/scripts/sync/autosync.sh
set -u
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
DIR="$HOME/Claude"
LOG="$DIR/.sync.log"
notify() { osascript -e "display notification \"$1\" with title \"Claude folder sync\"" >/dev/null 2>&1; }
cd "$DIR" || exit 1
echo "--- $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG"

git add -A
# Never push credentials
if git diff --cached -U0 | grep -E '^\+' | grep -qE 'ghp_[A-Za-z0-9]{20,}|github_pat_|sk-[A-Za-z0-9]{20,}|xox[bp]-|AKIA[0-9A-Z]{16}'; then
  git reset -q
  notify "Sync paused: a password or token was found in a changed file. Ask Claude to check."
  echo "BLOCKED: secret detected" >> "$LOG"; exit 1
fi
if ! git diff --cached --quiet; then
  git commit -q -m "Auto-sync from Mac $(date '+%Y-%m-%d %H:%M')" >> "$LOG" 2>&1
fi

if ! git pull -q --rebase --autostash origin main >> "$LOG" 2>&1; then
  git rebase --abort >/dev/null 2>&1
  notify "Sync paused: the same file changed on GitHub and on this Mac. Ask Claude to sort it out."
  echo "CONFLICT: pull failed" >> "$LOG"; exit 1
fi
git push -q origin HEAD:main >> "$LOG" 2>&1 || { notify "Sync couldn't reach GitHub. Will retry in 30 minutes."; exit 1; }
echo "OK" >> "$LOG"
