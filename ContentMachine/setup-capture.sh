#!/bin/bash
# setup-capture.sh — Install YouTube capture dependencies
# Run once before using capture.sh
# Usage: bash /Users/mac/Claude/ContentMachine/setup-capture.sh

set -e

echo ""
echo "🔧 Content Machine — Capture Setup"
echo ""

# yt-dlp
if command -v yt-dlp &>/dev/null; then
  echo "✓ yt-dlp $(yt-dlp --version)"
else
  echo "📥 Installing yt-dlp..."
  brew install yt-dlp
  echo "✓ yt-dlp installed"
fi

# ffmpeg
if command -v ffmpeg &>/dev/null; then
  echo "✓ ffmpeg $(ffmpeg -version 2>&1 | head -1 | awk '{print $3}')"
else
  echo "📥 Installing ffmpeg..."
  brew install ffmpeg
  echo "✓ ffmpeg installed"
fi

# whisper-cpp — C++ port of Whisper, installed via brew (no Python/PyTorch needed)
if command -v whisper-cli &>/dev/null; then
  echo "✓ whisper-cli installed"
else
  echo "📥 Installing whisper-cpp..."
  brew install whisper-cpp
  echo "✓ whisper-cli installed"
fi

# Download the tiny.en model (~75MB, cached forever)
WHISPER_MODEL_DIR="$HOME/.cache/whisper-cpp"
WHISPER_MODEL="$WHISPER_MODEL_DIR/ggml-tiny.en.bin"
mkdir -p "$WHISPER_MODEL_DIR"

if [ -f "$WHISPER_MODEL" ]; then
  echo "✓ Whisper tiny.en model already downloaded"
else
  echo "📥 Downloading Whisper tiny.en model (~75MB)..."
  curl -L --progress-bar \
    "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin" \
    -o "$WHISPER_MODEL"
  echo "✓ Model saved to $WHISPER_MODEL"
fi

# Create vault directories
mkdir -p /Users/mac/Claude/ContentMachine/vault/clips
mkdir -p /Users/mac/Claude/ContentMachine/vault/captures

# Initialize captures.json if missing
if [ ! -f /Users/mac/Claude/ContentMachine/vault/captures.json ]; then
  echo "[]" > /Users/mac/Claude/ContentMachine/vault/captures.json
  echo "✓ captures.json initialized"
fi

echo ""
echo "✅ All set. Test it:"
echo "   bash /Users/mac/Claude/ContentMachine/capture.sh 'https://youtu.be/dQw4w9WgXcQ?t=30' 'Test capture'"
echo ""
