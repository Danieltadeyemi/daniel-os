---
name: campaign-of-the-week
description: Brand Editor: build Daniel's weekly #CampaignOfTheWeek post from his daily ad reactions, keeping a backlog ahead of Monday.
---
# Campaign of the Week (Brand Editor)

Weekly, Monday post on LinkedIn and X.

## Source
Google Sheet "Best Ad Campaigns 1954 - 2025" (Drive id `1KoxoUoX32O_7qzDKapuwoz-_kOqvowJJUtY51hZRgtE`, owned by Daniel's personal account, shared to work). One tab per year; columns Campaign, Brand, Award, Year, Video Link, Picked, Date Picked. A script picks 3 ads a day and marks Picked + Date Picked.

## Loop
1. **Capture (daily, ~30s):** Daniel sends a reaction ("Ad 2: love that…"). Match it to that day's picks; log to `ContentMachine/vault/campaign-backlog.md`.
2. **Backlog:** for each ad with a reaction, research context (agency, year, results, why it worked) and draft LinkedIn + X. **Daniel's reaction is the core; research supports it.** Never draft without his reaction.
3. **Thursday check:** fewer than 2 ready posts → nudge. Otherwise present the strongest for Monday approval.
4. **Recent finds:** links Daniel sends with a reaction join the same backlog.
5. Find the video link (YouTube/Vimeo); Daniel downloads it.

## Voice (read before drafting)
- `ContentMachine/context/style-guide.md` then `ContentMachine/context/content-lessons.md` (lessons override the guide).
- Witty, bold, opinionated; strong opening; no em dashes; no hashtags except **#CampaignOfTheWeek**; no clichés or passive voice; check against the humanize-writing skill.
- LinkedIn carries depth; X is punchy. Video posts frame without spoiling and close on "watch till the end".
- Daniel posts and schedules himself. Nothing is posted by Claude.
