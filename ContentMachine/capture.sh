#!/bin/bash
# capture.sh — YouTube clip capture for Content Machine
#
# Usage:
#   bash capture.sh "https://youtu.be/xxx?t=240" "Why this moment matters"
#   bash capture.sh "https://youtube.com/watch?v=xxx&t=4m0s" "Note"
#
# Output:
#   vault/clips/<id>.mp4          ← trimmed video clip (±30s)
#   vault/clips/<id>.txt          ← Whisper transcript
#   vault/captures/<date>-<id>.md ← full capture entry
#   vault/captures.json           ← updated captures index (for the UI)
#
# Requires: yt-dlp, ffmpeg, openai-whisper
# Run setup-capture.sh once to install everything.

set -euo pipefail

URL="${1:-}"
NOTE="${2:-}"
END_OVERRIDE="${3:-}"  # optional end timestamp in seconds

WHISPER_MODEL="$HOME/.cache/whisper-cpp/ggml-tiny.en.bin"

if ! command -v whisper-cli &>/dev/null; then
  echo "❌ whisper-cli not found. Run setup first:"
  echo "   bash /Users/mac/Claude/ContentMachine/setup-capture.sh"
  exit 1
fi

if [ ! -f "$WHISPER_MODEL" ]; then
  echo "❌ Whisper model not found. Run setup first:"
  echo "   bash /Users/mac/Claude/ContentMachine/setup-capture.sh"
  exit 1
fi

if [ -z "$URL" ]; then
  echo "Usage: bash capture.sh 'URL' 'your note'"
  exit 1
fi

VAULT_DIR="/Users/mac/Claude/ContentMachine/vault"
CLIPS_DIR="$VAULT_DIR/clips"
CAPTURES_DIR="$VAULT_DIR/captures"
CAPTURES_JSON="$VAULT_DIR/captures.json"

mkdir -p "$CLIPS_DIR" "$CAPTURES_DIR"
[ -f "$CAPTURES_JSON" ] || echo "[]" > "$CAPTURES_JSON"

# ─── Parse URL ───────────────────────────────────────────────────────────────

VIDEO_ID=$(echo "$URL" | grep -oE '(?:v=|youtu\.be/)([a-zA-Z0-9_-]{11})' \
           | grep -oE '[a-zA-Z0-9_-]{11}' | head -1 || true)

if [ -z "$VIDEO_ID" ]; then
  echo "❌ Could not parse a YouTube video ID from: $URL"
  echo "   Supported formats: youtu.be/ID?t=240 | youtube.com/watch?v=ID&t=240"
  exit 1
fi

# Handle timestamp formats: t=240 (seconds), t=4m0s, t=4m, t=60s
T_RAW=$(echo "$URL" | grep -oE '[?&]t=[0-9smhSMH]+' | sed 's/[?&]t=//' | head -1 || true)

if [ -z "$T_RAW" ]; then
  T_SECONDS=0
elif echo "$T_RAW" | grep -qE '^[0-9]+$'; then
  T_SECONDS="$T_RAW"
else
  HOURS=$(echo "$T_RAW" | grep -oiE '[0-9]+h' | grep -oE '[0-9]+' || echo "0")
  MINS=$(echo "$T_RAW"  | grep -oiE '[0-9]+m' | grep -oE '[0-9]+' || echo "0")
  SECS=$(echo "$T_RAW"  | grep -oiE '[0-9]+s' | grep -oE '[0-9]+' || echo "0")
  T_SECONDS=$(( HOURS * 3600 + MINS * 60 + SECS ))
fi

DISPLAY_MINS=$(( T_SECONDS / 60 ))
DISPLAY_SECS=$(printf "%02d" $(( T_SECONDS % 60 )))
DISPLAY_TIME="${DISPLAY_MINS}:${DISPLAY_SECS}"

BASE_URL="https://www.youtube.com/watch?v=${VIDEO_ID}"
CLEAN_URL="https://youtu.be/${VIDEO_ID}?t=${T_SECONDS}"
DATE_STAMP=$(date '+%Y-%m-%d')
SLUG="${VIDEO_ID}-t${T_SECONDS}"
CAPTURE_ID="${SLUG}-${DATE_STAMP}"
CLIP_PATH="${CLIPS_DIR}/${SLUG}.mp4"
TRANSCRIPT_PATH="${CLIPS_DIR}/${SLUG}.txt"
CAPTURE_MD="${CAPTURES_DIR}/${DATE_STAMP}-${SLUG}.md"

echo ""
echo "📹 Content Machine — YouTube Capture"
echo "   URL:       $CLEAN_URL"
echo "   Timestamp: $DISPLAY_TIME"
echo ""

# ─── Video metadata ──────────────────────────────────────────────────────────

echo "🔍 Fetching video info..."
VIDEO_TITLE=$(yt-dlp --get-title --no-playlist "$BASE_URL" 2>/dev/null || echo "Unknown")
VIDEO_UPLOADER=$(yt-dlp --get-filename -o "%(uploader)s" --no-playlist "$BASE_URL" 2>/dev/null || echo "Unknown")
echo "   \"$VIDEO_TITLE\" by $VIDEO_UPLOADER"

# ─── Download clip ───────────────────────────────────────────────────────────

START=$T_SECONDS
if [ -n "$END_OVERRIDE" ]; then
  END=$END_OVERRIDE
else
  START=$(( T_SECONDS - 30 ))
  [ $START -lt 0 ] && START=0
  END=$(( T_SECONDS + 30 ))
fi

echo ""
echo "📥 Downloading clip (${START}s – ${END}s)..."

# yt-dlp --download-sections uses ffmpeg internally when available,
# fetching only the needed segment from the server (much faster than full download).
yt-dlp \
  --download-sections "*${START}-${END}" \
  --force-keyframes-at-cuts \
  -f "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=720]+bestaudio/best[height<=720]" \
  --merge-output-format mp4 \
  --no-playlist \
  -o "$CLIP_PATH" \
  "$BASE_URL" 2>&1 | grep -E "^\[download\]|^\[ffmpeg\]|^ERROR" || true

if [ ! -f "$CLIP_PATH" ]; then
  echo "❌ Download failed. The video may be unavailable or region-locked."
  exit 1
fi

CLIP_SIZE=$(du -sh "$CLIP_PATH" | cut -f1)
echo "   ✓ Clip saved ($CLIP_SIZE): $CLIP_PATH"

# ─── Transcribe ──────────────────────────────────────────────────────────────

echo ""
echo "🎙️  Transcribing with Whisper (tiny.en)..."

# whisper-cli requires 16kHz mono WAV — convert the clip first
WAV_PATH="${CLIPS_DIR}/${SLUG}.wav"
ffmpeg -i "$CLIP_PATH" -ar 16000 -ac 1 -c:a pcm_s16le "$WAV_PATH" -y -loglevel quiet

whisper-cli \
  -m "$WHISPER_MODEL" \
  -f "$WAV_PATH" \
  -otxt \
  -of "${CLIPS_DIR}/${SLUG}" \
  -l en \
  --no-prints 2>/dev/null || \
whisper-cli \
  -m "$WHISPER_MODEL" \
  -f "$WAV_PATH" \
  -otxt \
  -of "${CLIPS_DIR}/${SLUG}" \
  -l en 2>/dev/null

rm -f "$WAV_PATH"

WHISPER_OUT="${CLIPS_DIR}/${SLUG}.txt"

TRANSCRIPT=""
if [ -f "$WHISPER_OUT" ]; then
  TRANSCRIPT=$(cat "$WHISPER_OUT" | tr '\n' ' ' | sed 's/  */ /g' | xargs)
  TRANSCRIPT_PATH="$WHISPER_OUT"
else
  echo "   ⚠ Transcript not found — continuing without it"
fi

echo "   ✓ \"${TRANSCRIPT:0:100}…\""

# ─── Write capture markdown ───────────────────────────────────────────────────

cat > "$CAPTURE_MD" << MDEOF
# ${VIDEO_TITLE}

**Source:** ${CLEAN_URL}
**Creator:** ${VIDEO_UPLOADER}
**Timestamp:** ${DISPLAY_TIME} (${T_SECONDS}s)
**Captured:** ${DATE_STAMP}
**Status:** draft

---

## My Note

${NOTE}

---

## Transcript Snippet

${TRANSCRIPT}

---

## Files

- Clip:       \`${CLIP_PATH}\`
- Transcript: \`${TRANSCRIPT_PATH}\`

---

*To draft a post from this capture, say in Claude Code:*
*"Draft from capture: ${CAPTURE_ID}"*
MDEOF

echo ""
echo "   ✓ Capture entry: $CAPTURE_MD"

# ─── Update captures.json ─────────────────────────────────────────────────────
# Export all values as env vars so Python never sees shell-substituted strings
# (avoids apostrophes / special chars in titles breaking Python string literals)

export CM_CAPTURE_ID="$CAPTURE_ID"
export CM_VIDEO_ID="$VIDEO_ID"
export CM_VIDEO_TITLE="$VIDEO_TITLE"
export CM_UPLOADER="$VIDEO_UPLOADER"
export CM_TIMESTAMP="$T_SECONDS"
export CM_DISPLAY_TIME="$DISPLAY_TIME"
export CM_CLEAN_URL="$CLEAN_URL"
export CM_NOTE="$NOTE"
export CM_TRANSCRIPT="$TRANSCRIPT"
export CM_CLIP_PATH="$CLIP_PATH"
export CM_DATE="$DATE_STAMP"
export CM_CAPTURES_FILE="$CAPTURES_JSON"

python3 - <<'PYEOF'
import json, os

captures_file = os.environ['CM_CAPTURES_FILE']
with open(captures_file, 'r') as f:
    captures = json.load(f)

new_entry = {
    "id":          os.environ['CM_CAPTURE_ID'],
    "videoId":     os.environ['CM_VIDEO_ID'],
    "videoTitle":  os.environ['CM_VIDEO_TITLE'],
    "uploader":    os.environ['CM_UPLOADER'],
    "timestamp":   int(os.environ['CM_TIMESTAMP']),
    "displayTime": os.environ['CM_DISPLAY_TIME'],
    "cleanUrl":    os.environ['CM_CLEAN_URL'],
    "note":        os.environ['CM_NOTE'],
    "transcript":  os.environ['CM_TRANSCRIPT'],
    "clipPath":    os.environ['CM_CLIP_PATH'],
    "captured":    os.environ['CM_DATE'],
    "status":      "draft"
}

captures.insert(0, new_entry)

with open(captures_file, 'w') as f:
    json.dump(captures, f, indent=2, ensure_ascii=False)

print(f"   ✓ captures.json updated ({len(captures)} total)")
PYEOF

# ─── Done ────────────────────────────────────────────────────────────────────

echo ""
echo "✅ Captured!"
echo ""
echo "   \"$VIDEO_TITLE\""
echo "   $DISPLAY_TIME → $CLEAN_URL"
echo ""
echo "Next steps:"
echo "  • Run deploy.sh to sync this to the UI"
echo "  • Say in Claude Code: Draft from capture ${CAPTURE_ID}"
echo ""

# macOS notification
osascript -e "display notification \"${DISPLAY_TIME} — $VIDEO_TITLE\" with title \"Clip Captured ✓\" subtitle \"Transcript ready\"" 2>/dev/null || true
