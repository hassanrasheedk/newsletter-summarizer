import { NextResponse } from 'next/server'
import { getIssues } from '@/lib/db'
import type { NewsletterIssue, Category } from '@/types'

export interface DigestCategory {
  name: string
  count: number
  avgScore: number
  topTags: string[]
  issues: NewsletterIssue[]
}

export interface DigestResponse {
  categories: DigestCategory[]
  total: number
  generatedAt: string
}

function primaryCategory(raw: string): string {
  // "Tech|Business|AI" → "Tech"
  return raw.split('|')[0].trim() || 'Other'
}

const CATEGORY_ORDER = [
  'AI', 'Tech', 'Finance', 'Business', 'Politics',
  'Health', 'Science', 'Culture', 'Sports', 'Other',
]

export async function GET() {
  const issues = getIssues(200)

  // Group by primary category
  const map = new Map<string, NewsletterIssue[]>()
  for (const issue of issues) {
    const cat = primaryCategory(issue.category)
    if (!map.has(cat)) map.set(cat, [])
    map.get(cat)!.push(issue)
  }

  // Build sorted category list
  const allCats = [...map.keys()]
  const sorted = [
    ...CATEGORY_ORDER.filter((c) => allCats.includes(c)),
    ...allCats.filter((c) => !CATEGORY_ORDER.includes(c)),
  ]

  const categories: DigestCategory[] = sorted.map((name) => {
    const catIssues = map.get(name)!
    const avgScore = Math.round(
      catIssues.reduce((s, i) => s + i.importanceScore, 0) / catIssues.length
    )
    // Collect and rank tags by frequency
    const tagFreq = new Map<string, number>()
    for (const issue of catIssues) {
      for (const tag of issue.tags ?? []) {
        tagFreq.set(tag, (tagFreq.get(tag) ?? 0) + 1)
      }
    }
    const topTags = [...tagFreq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([t]) => t)

    return {
      name,
      count: catIssues.length,
      avgScore,
      topTags,
      issues: catIssues.sort((a, b) => b.importanceScore - a.importanceScore),
    }
  })

  return NextResponse.json({
    categories,
    total: issues.length,
    generatedAt: new Date().toISOString(),
  } satisfies DigestResponse)
}
