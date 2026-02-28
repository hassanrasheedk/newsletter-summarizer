# Newsletter Summarizer

An AI-powered newsletter reader that connects to your Gmail, automatically detects newsletters, summarises them with GPT-4o, and surfaces what actually matters — locally, with your data staying on your machine.

![Feed view](https://placehold.co/900x500/1a1a1a/6366f1?text=Newsletter+Summarizer)

## Features

- **Inbox** — card-based feed with AI-generated TL;DR, key points, importance score, and social signals (HN + Reddit buzz)
- **Digest** — newsletters grouped by category (Tech, AI, Finance, …) with aggregate stats and expandable summaries
- **Reader** — full email content alongside a sticky AI sidebar: summary, key points, why it matters
- **Saved** — bookmark issues for later; one-click unsave
- **Tags** — tag cloud auto-generated from AI analysis; click any tag to filter
- **Settings** — manage connected sources, toggle sync per-sender, change category, swap AI model, trigger manual sync

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript |
| Auth | NextAuth v5 — Google OAuth, Gmail read-only scope |
| AI | OpenAI SDK — `gpt-4o-mini` / `gpt-4o` (user-selectable) |
| Database | better-sqlite3 — local SQLite with WAL mode |
| Styling | Tailwind CSS v4 + shadcn/ui, OKLCH dark theme |
| State | Zustand |
| Email | Gmail API via googleapis + mailparser |
| Social | Hacker News Algolia API + Reddit search |

## Quick Start (Docker)

```bash
make start
```

First run creates `.env` from the template and exits, asking you to fill in credentials. Fill them in, then run `make start` again — the app builds and starts at **http://localhost:3000**.

```
make start   # build & start in background
make stop    # stop containers
make logs    # tail logs
```

SQLite data lives in `./data/` and persists across restarts.

## Credentials

You need three things:

### 1. OpenAI API key
Get one at [platform.openai.com](https://platform.openai.com). Add to `.env`:
```
OPENAI_API_KEY=sk-...
```

### 2. Google OAuth app
1. Go to [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services → Credentials**
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Add authorised redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Enable the **Gmail API** under **APIs & Services → Enabled APIs**
5. Add your Gmail address as a **test user** (OAuth consent screen → Test users)

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### 3. NextAuth secret
```bash
openssl rand -base64 32
```
Paste the output as `NEXTAUTH_SECRET` in `.env`.

## Local Development (no Docker)

```bash
cp .env.example .env.local   # fill in credentials
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

```
Gmail API
   ↓
/api/sync  →  newsletter-detector.ts  (List-Unsubscribe header, known domains)
               ↓
           lib/claude.ts  (OpenAI: summary, key points, importance score, tags)
               ↓
           lib/social-scorer.ts  (HN Algolia + Reddit — buzz signal)
               ↓
           lib/db.ts  (SQLite: newsletter_sources + newsletter_issues)
               ↓
        Next.js API routes → React UI
```

Sync runs on demand (Settings → Sync now). On first connect the onboarding wizard scans your last 500 emails, detects newsletter senders, and lets you confirm which to follow.

## Project Structure

```
app/
  (auth)/connect/     # onboarding
  (app)/feed/         # inbox
  (app)/digest/       # category digest
  (app)/read/[id]/    # reader + AI sidebar
  (app)/saved/        # bookmarks
  (app)/tags/         # tag cloud
  (app)/settings/     # preferences
  api/                # route handlers
components/
  feed/               # NewsletterCard, FeedHeader, FeedList, QuickScanMode
  digest/             # DigestView, DigestCategorySection
  reader/             # EmailContent, AISidebar
  saved/              # SavedView
  tags/               # TagsView
  settings/           # SettingsView
lib/
  auth.ts             # NextAuth config
  db.ts               # SQLite helpers
  gmail.ts            # Gmail API client
  claude.ts           # OpenAI wrapper (summarize)
  newsletter-detector.ts
  social-scorer.ts
store/
  feed.ts             # Zustand store
types/
  index.ts
```
