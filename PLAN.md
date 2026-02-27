# Newsletter Summarizer — Product & Engineering Plan

> An AI-powered local-first newsletter intelligence app that connects to your email, extracts newsletters, summarizes them with Claude, ranks them using social/news corroboration, and presents everything in a clean, distraction-free interface.

---

## 1. Research Summary — Best-in-Class Inspiration

| App | What We're Stealing |
|---|---|
| **Meco** | OAuth Gmail/Outlook integration, Newsflash quick-scroll feed |
| **Readwise Reader** | Two-column layout, AI ghostreader, highlight & annotate |
| **Matter** | Frictionless card-based feed, Co-Reader AI, social sharing |
| **Readless** | Topic synthesis (merge duplicate coverage), digest scheduling, 90% time savings UX |
| **Stoop** | Discovery/browse flow, mobile-first bottom nav |
| **Mailbrew** | Multi-source aggregation (newsletters + Twitter/Reddit/news) |
| **Omnivore** | Open-source, self-hostable, floating sidebar |

**Key gaps we fill that no single app does:**
- Social corroboration scoring (how much is Twitter/Reddit/HN talking about this topic?)
- Importance ranking using external signal correlation
- All features free, runs locally, no SaaS subscription
- Explain mode: AI explains why something matters in plain English

---

## 2. Core Features

### 2.1 Email Connection
- **Gmail OAuth 2.0** — secure token-based access, read-only scope
- **IMAP fallback** — for non-Gmail providers (Outlook, Fastmail, etc.)
- Auto-detect newsletters using heuristics:
  - `List-Unsubscribe` header present
  - Sender domain patterns (substack.com, beehiiv.com, mailchimp.com, convertkit.com, etc.)
  - Volume: > 1 email/week from same sender
  - HTML-heavy formatting
- Deduplicate: merge multiple newsletters on same topic into one card

### 2.2 AI Processing Pipeline
Each newsletter goes through:
1. **Extract** — strip tracking pixels, clean HTML → plain text
2. **Summarize** — Claude API: 3-sentence TL;DR + 5 bullet key points
3. **Rank** — importance score (0-100) based on:
   - Social signal score (HN, Reddit, Twitter mentions of topic/link)
   - Recency
   - Sender credibility (based on past open/read rate)
   - Topic relevance to user's interests
4. **Explain** — "Why does this matter?" one-paragraph plain English explanation
5. **Tag** — auto-categorize: Tech, Finance, Health, AI, Politics, Culture, etc.

### 2.3 Social Corroboration
Query these APIs to gauge real-world importance:
- **Hacker News** — Algolia HN API (free), search for article title/URL
- **Reddit** — Reddit public API, search for topic keywords
- **Google News** — search for headline correlations
- **Twitter/X** — optional, if user provides API key

Corroboration score shown as a small signal bar on each card:
- 🔴 Low buzz  🟡 Medium  🟢 High social traction

### 2.4 Feed & Reading UX
- **Home feed** — ranked cards, sorted by importance score
- **Quick scan mode** — headline + 1-line summary only (Meco Newsflash style)
- **Deep read mode** — full email with floating AI sidebar
- **Digest view** — grouped by topic (all "AI news" merged into one card)
- **Archive** — all past newsletters, searchable

---

## 3. UX & Design

### 3.1 Design Philosophy
- **Local-first, privacy-respecting** — data stays on your machine
- **Information density without overwhelm** — show what matters, hide the rest
- **Speed** — feel instantaneous, skeleton loading, optimistic UI

### 3.2 Layout

#### Desktop (≥1024px) — Three-Pane Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│  ● Newsletter Summarizer          🔍 Search    ⚙ Settings           │
├──────────┬──────────────────────────────┬──────────────────────────┤
│          │                              │                           │
│ SIDEBAR  │    FEED (sorted by rank)     │   AI SIDEBAR              │
│          │                              │                           │
│ 📥 Inbox │  ┌─────────────────────┐     │  📝 Summary               │
│ ⭐ Saved  │  │ [HIGH] The Batch    │     │  "This week's AI          │
│ 🏷 Tags   │  │ 🟢 42 HN mentions   │     │  newsletter covers..."    │
│          │  │ AI tools shipped... │     │                           │
│ SOURCES  │  │ TL;DR: ...          │     │  🔑 Key Points            │
│ ─────── │  └─────────────────────┘     │  • Point 1                │
│ Gmail ✓  │                              │  • Point 2                │
│          │  ┌─────────────────────┐     │  • Point 3                │
│ TOPICS   │  │ [MED] Morning Brew  │     │                           │
│ ─────── │  │ 🟡 12 Reddit posts  │     │  💡 Why It Matters        │
│ 🤖 AI    │  │ Markets fell 2%...  │     │  "This matters because..." │
│ 💰 Finance│  └─────────────────────┘     │                           │
│ 💻 Tech  │                              │  🌐 Social Signals         │
│          │  ...                         │  HN: 42  Reddit: 8        │
└──────────┴──────────────────────────────┴──────────────────────────┘
```

#### Mobile (< 768px) — Bottom Tab Navigation
```
┌─────────────────────────┐
│ Newsletter Summarizer   │
├─────────────────────────┤
│                         │
│  Card 1 (swipeable)     │
│  ┌───────────────────┐  │
│  │ The Batch         │  │
│  │ 🟢 High buzz      │  │
│  │ AI tools this wk  │  │
│  │ TL;DR here...     │  │
│  └───────────────────┘  │
│                         │
│  Card 2...              │
│                         │
├─────────────────────────┤
│  🏠   🔍   ⭐   ⚙      │
└─────────────────────────┘
```

### 3.3 Card Anatomy
Each newsletter card contains:
```
┌──────────────────────────────────────────┐
│ [IMPORTANCE BADGE]  Sender Name    Time  │
│ Subject line (bold)                      │
│ ─────────────────────────────────────── │
│ TL;DR: One sentence summary here...     │
│ • Key point 1                           │
│ • Key point 2                           │
│ ─────────────────────────────────────── │
│ 🟢 Social: HN:42 Reddit:12  📖 4 min   │
│ [Read More]  [Explain]  [Archive]  [⭐] │
└──────────────────────────────────────────┘
```

### 3.4 Color & Typography
- **Background**: `#0F0F0F` (dark) / `#FAFAFA` (light)
- **Cards**: `#1A1A1A` dark / `#FFFFFF` light with subtle shadow
- **Accent**: `#6366F1` (indigo) — importance badges, CTAs
- **High importance**: `#10B981` green badge
- **Medium**: `#F59E0B` amber badge
- **Low**: `#6B7280` gray badge
- **Font**: Inter for UI, Georgia/Lora for reading content
- **Card radius**: 12px, spacing: 16px gaps

### 3.5 Onboarding Flow
```
Step 1: Welcome screen → "Connect your email"
Step 2: Gmail OAuth popup → grant read-only access
Step 3: Scanning inbox animation (progress bar)
Step 4: "Found 23 newsletters" → show detected list
Step 5: User confirms/removes any false positives
Step 6: Processing screen → AI summarizing
Step 7: Feed appears with ranked cards ✓
```

---

## 4. Technical Architecture

### 4.1 Tech Stack
| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | Fast, SSR, file-based routing |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS v4 + shadcn/ui | Speed + consistency |
| AI | Anthropic Claude API (claude-sonnet-4-6) | Best summarization |
| Email (Gmail) | Google OAuth 2.0 + Gmail API | Secure read access |
| Email (IMAP) | `node-imap` / `imapflow` | Non-Gmail providers |
| Email parsing | `mailparser` | Parse raw MIME emails |
| Social APIs | HN Algolia, Reddit JSON API | Free, no auth needed |
| Local storage | SQLite via `better-sqlite3` | Local-first, fast |
| State | Zustand | Simple client state |
| Server | Next.js API routes | No separate backend needed |

### 4.2 Data Models

```typescript
// Newsletter source
interface NewsletterSource {
  id: string
  senderEmail: string
  senderName: string
  domain: string      // substack.com, beehiiv.com, etc.
  category: Category
  credibilityScore: number  // based on user engagement history
  isActive: boolean
}

// Individual newsletter issue
interface NewsletterIssue {
  id: string
  sourceId: string
  subject: string
  receivedAt: Date
  rawHtml: string
  cleanedText: string

  // AI-generated
  summary: string         // 3-sentence TL;DR
  keyPoints: string[]     // 5 bullet points
  whyItMatters: string    // plain English importance
  category: Category
  tags: string[]

  // Scoring
  importanceScore: number   // 0-100
  socialScore: SocialScore
  isRead: boolean
  isSaved: boolean
}

interface SocialScore {
  hnMentions: number
  redditMentions: number
  twitterMentions?: number
  totalBuzz: 'low' | 'medium' | 'high'
}
```

### 4.3 File Structure
```
newsletter-summarizer/
├── app/
│   ├── (auth)/
│   │   └── connect/          # Onboarding & email connection
│   ├── (app)/
│   │   ├── feed/             # Main feed page
│   │   ├── read/[id]/        # Individual newsletter reader
│   │   ├── digest/           # Topic digest view
│   │   └── settings/         # Settings page
│   └── api/
│       ├── auth/             # Gmail OAuth handlers
│       ├── emails/           # Fetch & parse emails
│       ├── summarize/        # Claude API summarization
│       ├── social/           # HN + Reddit scoring
│       └── sync/             # Background sync job
├── components/
│   ├── feed/
│   │   ├── NewsletterCard.tsx
│   │   ├── FeedHeader.tsx
│   │   └── QuickScanMode.tsx
│   ├── reader/
│   │   ├── EmailContent.tsx
│   │   └── AISidebar.tsx
│   ├── onboarding/
│   │   └── ConnectEmail.tsx
│   └── ui/                   # shadcn components
├── lib/
│   ├── gmail.ts              # Gmail API client
│   ├── imap.ts               # IMAP client
│   ├── claude.ts             # Anthropic SDK wrapper
│   ├── newsletter-detector.ts # Heuristics to find newsletters
│   ├── social-scorer.ts      # HN + Reddit scoring
│   └── db.ts                 # SQLite helpers
├── store/
│   └── feed.ts               # Zustand store
└── .env.local                # ANTHROPIC_API_KEY, GOOGLE_CLIENT_ID, etc.
```

### 4.4 AI Summarization Prompt Design

```
System: You are a newsletter analyst. Extract the most important information
concisely. Be direct and avoid filler words.

User: Summarize this newsletter issue:
Subject: {subject}
Content: {cleanedText}

Respond in JSON:
{
  "summary": "3-sentence TL;DR",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "whyItMatters": "1-paragraph plain English explanation of why this is important",
  "category": "Tech|Finance|AI|Health|Politics|Culture|Business|Science|Other",
  "tags": ["tag1", "tag2", "tag3"],
  "importanceScore": 0-100
}
```

---

## 5. Development Phases

### Phase 1 — Foundation (Week 1)
- [ ] Init Next.js 15 project with TypeScript + Tailwind + shadcn
- [ ] Set up SQLite database schema
- [ ] Gmail OAuth 2.0 integration (read-only scope)
- [ ] Email fetching + newsletter detection heuristics
- [ ] Basic HTML email parser (mailparser)
- [ ] Feed page with hardcoded mock data

### Phase 2 — AI Pipeline (Week 2)
- [ ] Claude API integration for summarization
- [ ] Batch processing: summarize inbox on connect
- [ ] Background sync (poll every 15 min for new emails)
- [ ] Social scoring: HN + Reddit APIs
- [ ] Importance ranking algorithm
- [ ] Real data in feed

### Phase 3 — Full UI (Week 3)
- [ ] Complete card design with all metadata
- [ ] Three-pane desktop layout
- [ ] AI sidebar with explain mode
- [ ] Quick scan mode
- [ ] Topic digest / grouped view
- [ ] Dark/light mode
- [ ] Mobile responsive layout

### Phase 4 — Polish (Week 4)
- [ ] Onboarding flow (animated steps)
- [ ] Settings page (sync frequency, AI verbosity, categories)
- [ ] Search across newsletters
- [ ] IMAP support for non-Gmail
- [ ] Performance: virtual scrolling for large feeds
- [ ] Export highlights to Markdown

---

## 6. Environment Variables

```env
# AI
ANTHROPIC_API_KEY=

# Gmail OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback

# App
NEXTAUTH_SECRET=
DATABASE_PATH=./data/newsletters.db
```

---

## 7. Key Differentiators vs Existing Apps

| Feature | Our App | Meco | Readwise | Readless |
|---|---|---|---|---|
| Social corroboration score | ✅ | ❌ | ❌ | ❌ |
| "Why it matters" AI explain | ✅ | ❌ | ❌ | ❌ |
| Free, runs locally | ✅ | ❌ ($10/mo) | ❌ | ❌ ($5/mo) |
| No data leaves your machine | ✅ | ❌ | ❌ | ❌ |
| Topic synthesis / dedup | ✅ | ❌ | ❌ | ✅ |
| Three-pane desktop layout | ✅ | ❌ | ✅ | ❌ |
| IMAP + Gmail support | ✅ | Gmail only | RSS only | Forwarding |
