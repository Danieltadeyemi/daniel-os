# Content Machine
*Personal content system. Read this file before any content-related task in this directory.*

---

## What This Is

A personal content machine that turns thinking, conversations, and lived experience into published posts. Built for a Growth/Marketing expert who brings his whole self to content — professional expertise, family, relationships, and worldview.

**Connected sources:**
- Slack (all channels, DMs, threads) — via Slack MCP
- Google Drive (Docs, meeting notes, transcripts) — via Google Drive MCP
- Gmail personal (danieltadeyemi@gmail.com) — via Gmail MCP
- Gmail work (daniel@startbutton.africa) — via Gmail MCP
- Notion (notes, databases, brain dumps) — via Notion MCP

---

## Context Files (Read First)

Before any drafting or production step, load:
1. `context/style-guide.md` — voice, rules, worldview, what to never do
2. `context/content-lessons.md` — confirmed lessons from past posts. These override the style guide.

---

## The Pipeline

Run end-to-end or step-by-step. Each step has its own prompt file.

| Step | File | Who | What happens |
|------|------|-----|-------------|
| 0 | `prompts/00-spark.md` | Human | Answer a question to surface a latent idea |
| 1 | `prompts/01-oracle.md` | AI | Mine Slack + Google Drive for content ideas |
| 2 | `vault/ideas.md` | Human | Pick an idea from the Vault |
| 3 | `prompts/03-interview.md` | AI + Human | 6-interviewer panel extracts specificity |
| 4 | Production | AI | Interview → raw .md file (exact words, never paraphrased) |
| 5 | `prompts/05-refinement.md` | AI | Draft post from raw file + style guide + content-lessons |
| 6 | `prompts/06-council.md` | AI | 6 expert reviewers score draft |
| 7 | `prompts/07-revision.md` | AI | Iterate until council scores 9/10 |
| 8 | `prompts/08-repurpose.md` | AI | One anchor → derivatives per platform |
| 9 | Final review | Human | Fine-tooth comb. Final sign-off. |
| 10 | `prompts/09-learning-loop.md` | AI | Compare first draft to final, update content-lessons.md |

---

## How to Invoke Each Step

Say any of the following and Claude will know what to do:

- **"Run the Oracle"** → searches Slack and Drive, surfaces ideas, updates Vault
- **"Spark me"** → presents question prompts to surface a latent idea
- **"Run the interview on idea #[X]"** → starts the 6-interviewer panel on that Vault idea
- **"Draft the post"** → runs refinement after interview is complete
- **"Run the council"** → scores current draft, splits fixes into editorial vs. info gaps
- **"Revise until 9"** → runs revision loop until council scores 9/10
- **"Repurpose"** → creates platform-specific derivatives from approved anchor post
- **"Run the learning loop"** → extracts lessons from final vs. first draft, updates content-lessons.md

### YouTube Capture

- **"Capture [URL] — [note]"** → runs `capture.sh`, downloads ±30s clip, transcribes with Whisper, writes to vault/captures/
- **"Draft from capture [ID]"** → reads the capture file + style guide, drafts a post in Daniel's voice
- **"List captures"** → lists all entries in vault/captures.json with IDs, notes, and status

**Example:** `Capture https://youtu.be/abc123?t=240 — He reframed how I think about distribution`

After a capture, run `bash /Users/mac/Claude/ContentMachine/deploy.sh` to sync it to the UI.

---

## File Structure

```
/ContentMachine
├── CLAUDE.md                     ← this file
├── context/
│   ├── style-guide.md            ← voice and rules
│   └── content-lessons.md        ← lessons from past posts
├── prompts/
│   ├── 00-spark.md
│   ├── 01-oracle.md
│   ├── 03-interview.md
│   └── [remaining steps added as built]
├── vault/
│   ├── ideas.md                  ← qualified content ideas
│   ├── captures.json             ← YouTube captures index (read by the UI)
│   ├── captures/                 ← one .md file per YouTube capture
│   ├── clips/                    ← trimmed .mp4 video clips + .txt transcripts
│   └── posts/                    ← raw files + drafts per post
├── src/                          ← React source for the web UI
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── App.tsx               ← edit this to change the UI
│       └── captures.json         ← auto-synced from vault/captures.json by deploy.sh
├── scripts/
│   └── bundle-artifact.sh        ← builds the single HTML bundle
├── app/                          ← built HTML + git repo → Netlify
│   ├── content-machine.html
│   └── netlify.toml
├── capture.sh                    ← YouTube clip capture engine
├── setup-capture.sh              ← one-time dependency installer
└── deploy.sh                     ← build + deploy to Netlify
```

---

## Rules

1. The raw interview file is sacred. Never paraphrase the creator's words.
2. content-lessons.md overrides the style guide when they conflict.
3. No post goes to final without a council score of 9/10.
4. The learning loop runs after every approved post — no exceptions.
5. The Oracle runs on Slack and Google Drive. Meeting notes live in Google Drive as Docs.
