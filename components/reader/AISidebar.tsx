'use client'

import { useEffect, useState } from 'react'
import { Sparkles, TrendingUp } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { NewsletterIssue } from '@/types'

interface Props {
  id: string
}

const BUZZ_BADGE = {
  high: 'bg-[oklch(0.62_0.18_162/0.15)] text-[oklch(0.62_0.18_162)]',
  medium: 'bg-[oklch(0.72_0.19_75/0.15)] text-[oklch(0.72_0.19_75)]',
  low: 'bg-muted text-muted-foreground',
}

export function AISidebar({ id }: Props) {
  const [issue, setIssue] = useState<NewsletterIssue | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/emails/${id}`)
      .then((r) => r.json())
      .then((data: { issue: NewsletterIssue }) => setIssue(data.issue))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  return (
    <aside className="hidden lg:flex w-72 xl:w-80 flex-col border-l border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Sparkles size={14} className="text-primary" />
        <span className="text-sm font-semibold">AI Summary</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-5 p-4">
          {loading ? (
            <>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-24 w-full" />
            </>
          ) : issue ? (
            <>
              {/* Summary */}
              <section className="flex flex-col gap-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">TL;DR</p>
                <p className="text-sm leading-relaxed">{issue.summary || 'No summary available.'}</p>
              </section>

              <Separator />

              {/* Key Points */}
              {issue.keyPoints.length > 0 && (
                <section className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Key Points</p>
                  <ul className="flex flex-col gap-2">
                    {issue.keyPoints.map((pt, i) => (
                      <li key={i} className="text-xs flex gap-2 leading-relaxed">
                        <span className="text-primary shrink-0 mt-0.5">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <Separator />

              {/* Why It Matters */}
              {issue.whyItMatters && (
                <section className="flex flex-col gap-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Why It Matters</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{issue.whyItMatters}</p>
                </section>
              )}

              <Separator />

              {/* Social Signals */}
              <section className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={12} className="text-muted-foreground" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Social Signals</p>
                </div>
                <Badge
                  variant="outline"
                  className={cn('text-[10px] w-fit', BUZZ_BADGE[issue.socialScore.totalBuzz])}
                >
                  {issue.socialScore.totalBuzz.toUpperCase()} BUZZ
                </Badge>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>HN: {issue.socialScore.hnMentions}</span>
                  <span>Reddit: {issue.socialScore.redditMentions}</span>
                </div>
              </section>

              {/* Tags */}
              {issue.tags.length > 0 && (
                <section className="flex flex-wrap gap-1.5">
                  {issue.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </section>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Could not load AI summary.</p>
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}
