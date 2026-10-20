# macOS Shortcut Setup — YouTube Capture

This gives you a keyboard shortcut (e.g. Cmd+Shift+Y) that:
1. Grabs the YouTube URL from your clipboard
2. Asks for your note in a one-line dialog
3. Runs the capture script in the background
4. Sends a macOS notification when the transcript is ready

---

## Prerequisites

Run setup once first:
```
bash /Users/mac/Claude/ContentMachine/setup-capture.sh
```

---

## Create the Shortcut

1. Open **Shortcuts** app (Spotlight → "Shortcuts")
2. Click **+** (New Shortcut) in the top toolbar
3. Name it: **Content Machine Capture**

### Add these actions in order:

**Action 1 — Get clipboard**
- Search: "Get Contents of Clipboard"
- Add it (no config needed)

**Action 2 — Validate it's YouTube**
- Search: "If"
- Set: "Clipboard" → "contains" → "youtu"
- (We'll add the Otherwise at the end)

**Action 3 — Ask for note**
- Inside the If block, search: "Ask for Input"
- Set prompt to: **"What caught you about this moment?"**
- Input type: Text

**Action 4 — Run the script**
- Search: "Run Shell Script"
- Paste this exactly:
  ```
  URL=$(pbpaste)
  NOTE="$1"
  bash /Users/mac/Claude/ContentMachine/capture.sh "$URL" "$NOTE" > /tmp/cm-capture.log 2>&1 &
  echo "Capture started"
  ```
- Pass input: **to stdin** → change to **as arguments**
- Shell: `/bin/zsh`

**Action 5 — Notify**
- Search: "Show Notification"
- Title: **Capturing…**
- Body: **Transcript will be ready in ~30 seconds**

**Action 6 — Otherwise (for non-YouTube URLs)**
- Click "Add Otherwise" at the bottom of the If block
- Search: "Show Notification"
- Title: **Not a YouTube URL**
- Body: **Copy a YouTube URL first, then run the shortcut**

**Action 7 — End If**
- Click "End If"

---

## Assign the keyboard shortcut

1. In the shortcut editor, click the **ⓘ** icon (top right)
2. Under "Run with:" → click **Add Keyboard Shortcut**
3. Press **Cmd+Shift+Y** (or whatever you prefer)

---

## How to use it while watching YouTube

1. Watch video, see great moment
2. Right-click the video → **"Copy video URL at current time"** (this includes `?t=XXX`)
3. Press **Cmd+Shift+Y**
4. Type your quick note → press Return
5. macOS notification appears → go back to watching
6. ~30–60 seconds later: "Clip Captured ✓" notification

---

## First-time permission

The first time Shortcuts runs a shell script, macOS will ask:
> "Shortcuts wants to run a shell script"

Click **Allow**. This is a one-time prompt.

---

## After capturing

The clip and transcript are saved to:
- `vault/clips/<id>.mp4` — the video clip (ready to share)
- `vault/captures/<date>-<id>.md` — your note + transcript

To see it in the UI and draft a post:
```
bash /Users/mac/Claude/ContentMachine/deploy.sh
```

Or say in Claude Code: **"Draft from capture [ID]"**
