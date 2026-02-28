'use client'

import { BookOpen, Sparkles, Archive, Star, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useFeedStore } from '@/store/feed'
import type { NewsletterIssue } from '@/types'

const BUZZ_COLORS = {
  low: 'text-muted-foreground',
  medium: 'text-[oklch(0.72_0.19_75)]',
  high: 'text-[oklch(0.62_0.18_162)]',
}

const IMPORTANCE_STYLES = {
  high: 'bg-[oklch(0.62_0.18_162/0.15)] text-[oklch(0.62_0.18_162)] border-[oklch(0.62_0.18_162/0.3)]',
  medium: 'bg-[oklch(0.72_0.19_75/0.15)] text-[oklch(0.72_0.19_75)] border-[oklch(0.72_0.19_75/0.3)]',
  low: 'bg-muted text-muted-foreground border-border',
}

interface Props {
  issue: NewsletterIssue
}

function readingTime(text: string): number {
  return Math.max(1, Math.round(text.split(/\s+/).length / 200))
}

export function NewsletterCard({ issue }: Props) {
  const router = useRouter()
  const { markRead, toggleSaved } = useFeedStore()

  function handleRead() {
    markRead(issue.id)
    router.push(`/read/${issue.id}`)
  }

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-150 hover:border-primary/40 hover:shadow-sm animate-slide-up',
        issue.isRead && 'opacity-60'
      )}
    >
      <CardContent className="p-4 flex flex-col gap-2.5">
        {/* Header row */}
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn('text-[10px] font-semibold uppercase tracking-wide', IMPORTANCE_STYLES[issue.importanceLevel])}
          >
            {issue.importanceLevel}
          </Badge>
          <span className="text-xs text-muted-foreground truncate flex-1">{issue.subject.split(' - ')[0] || issue.subject}</span>
          <span className="text-xs text-muted-foreground shrink-0">
            {new Date(issue.receivedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Subject */}
        <h3 className="text-sm font-semibold leading-snug line-clamp-2">{issue.subject}</h3>

        {/* Summary */}
        {issue.summary && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{issue.summary}</p>
        )}

        {/* Key points */}
        {(issue.keyPoints ?? []).length > 0 && (
          <ul className="flex flex-col gap-1">
            {(issue.keyPoints ?? []).slice(0, 3).map((pt, i) => (
              <li key={i} className="text-xs text-muted-foreground flex gap-1.5 leading-relaxed">
                <span className="shrink-0 mt-0.5 text-primary">•</span>
                <span className="line-clamp-1">{pt}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="border-t border-border pt-2 mt-0.5 flex items-center gap-3">
          {/* Social score */}
          <div className={cn('text-xs flex items-center gap-1.5', BUZZ_COLORS[issue.socialScore.totalBuzz])}>
            <span className="font-medium">
              {issue.socialScore.totalBuzz === 'high' ? '🟢' : issue.socialScore.totalBuzz === 'medium' ? '🟡' : '🔴'}
            </span>
            <span>HN:{issue.socialScore.hnMentions}</span>
            <span>r/{issue.socialScore.redditMentions}</span>
          </div>

          {/* Reading time */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
            <Clock size={10} />
            <span>{readingTime(issue.cleanedText)} min</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <Button size="sm" className="h-7 text-xs gap-1.5 flex-1" onClick={handleRead}>
            <BookOpen size={11} />
            Read
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                <Sparkles size={11} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Explain with AI</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn('h-7 w-7 p-0', issue.isSaved && 'text-primary')}
                onClick={() => toggleSaved(issue.id)}
              >
                <Star size={11} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{issue.isSaved ? 'Unsave' : 'Save'}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground">
                <Archive size={11} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Archive</TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  )
}
