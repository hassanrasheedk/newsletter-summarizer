import type { SocialScore } from '@/types'

interface HNHit {
  objectID: string
  title: string
  points: number
  num_comments: number
}

interface HNSearchResult {
  hits: HNHit[]
}

interface RedditPost {
  data: {
    score: number
    num_comments: number
  }
}

interface RedditSearchResult {
  data: {
    children: RedditPost[]
  }
}

export async function scoreNewsletter(
  title: string,
  _url?: string
): Promise<SocialScore> {
  const [hnMentions, redditMentions] = await Promise.allSettled([
    fetchHNScore(title),
    fetchRedditScore(title),
  ])

  const hn = hnMentions.status === 'fulfilled' ? hnMentions.value : 0
  const reddit = redditMentions.status === 'fulfilled' ? redditMentions.value : 0

  const total = hn + reddit

  return {
    hnMentions: hn,
    redditMentions: reddit,
    totalBuzz: total >= 20 ? 'high' : total >= 5 ? 'medium' : 'low',
  }
}

async function fetchHNScore(query: string): Promise<number> {
  const encoded = encodeURIComponent(query.slice(0, 100))
  const res = await fetch(
    `https://hn.algolia.com/api/v1/search?query=${encoded}&tags=story&hitsPerPage=5`,
    { next: { revalidate: 3600 } }
  )
  if (!res.ok) return 0
  const data = (await res.json()) as HNSearchResult
  return data.hits.reduce((sum, h) => sum + (h.points ?? 0) + (h.num_comments ?? 0), 0)
}

async function fetchRedditScore(query: string): Promise<number> {
  const encoded = encodeURIComponent(query.slice(0, 100))
  const res = await fetch(
    `https://www.reddit.com/search.json?q=${encoded}&sort=relevance&limit=5&t=week`,
    {
      headers: { 'User-Agent': 'newsletter-summarizer/1.0' },
      next: { revalidate: 3600 },
    }
  )
  if (!res.ok) return 0
  const data = (await res.json()) as RedditSearchResult
  return data.data.children.reduce(
    (sum, p) => sum + (p.data.score ?? 0) + (p.data.num_comments ?? 0),
    0
  )
}
