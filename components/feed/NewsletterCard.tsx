'use client'

import { BookOpen, Sparkles, Archive, Star, Clock, Flame, MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useFeedStore } from '@/store/feed'
import type { NewsletterIssue } from '@/types'

const IMPORTANCE_STYLES = {
  high: 'bg-[oklch(0.62_0.18_162/0.15)] text-[oklch(0.62_0.18_162)] border-[oklch(0.62_0.18_162/0.3)]',
  medium: 'bg-[oklch(0.72_0.19_75/0.15)] text-[oklch(0.72_0.19_75)] border-[oklch(0.72_0.19_75/0.3)]',
  low: 'bg-muted text-muted-foreground border-border',
}

const IMPORTANCE_LABELS = {
  high: 'Must Read',
  medium: 'Worth Reading',
  low: 'FYI',
}

interface Props {
  issue: NewsletterIssue
}

function readingTime(text: string): number {
  return Math.max(1, Math.round(text.split(/\s+/).length / 200))
}

function BuzzIndicator({ buzz }: { buzz: 'high' | 'medium' | 'low' }) {
  if (buzz === 'high') {
    return (
      <span className="flex items-center gap-1 text-[oklch(0.62_0.18_162)] text-xs font-medium">
        <Flame size={11} />
        Trending
      </span>
    )
  }
  if (buzz === 'medium') {
    return (
      <span className="flex items-center gap-1 text-muted-foreground text-xs">
        <MessageCircle size={11} />
        Being discussed
      </span>
    )
  }
  return null
}

export function NewsletterCard({ issue }: Props) {
  const router = useRouter()
  const { markRead, toggleSaved } = useFeedStore()

  function handleRead() {
    markRead(issue.id)
    router.push(`/read/${issue.id}`)
  }

  function handleAction(e: React.MouseEvent, action: () => void) {
    e.stopPropagation()
    action()
  }

  return (
    <Card
      onClick={handleRead}
      className={cn(
        'group cursor-pointer transition-all duration-150 hover:border-primary/40 hover:shadow-md animate-slide-up',
        issue.isRead && 'opacity-55'
      )}
    >
      <CardContent className="p-4 flex flex-col gap-2.5">
        {/* Header row */}
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn('text-[10px] font-semibold uppercase tracking-wide shrink-0', IMPORTANCE_STYLES[issue.importanceLevel])}
          >
            {IMPORTANCE_LABELS[issue.importanceLevel]}
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

        {/* Footer: buzz + reading time + actions */}
        <div className="border-t border-border pt-2 mt-0.5 flex items-center gap-2">
          <BuzzIndicator buzz={issue.socialScore.totalBuzz} />

          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
            <Clock size={10} />
            <span>{readingTime(issue.cleanedText)} min read</span>
          </div>

          {/* Action buttons — stop card click propagation */}
          <div className="flex items-center gap-1 pl-2 border-l border-border" onClick={(e) => e.stopPropagation()}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                  <Sparkles size={12} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>AI summary</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn('h-7 w-7 p-0', issue.isSaved ? 'text-amber-400 hover:text-amber-300' : 'text-muted-foreground hover:text-foreground')}
                  onClick={(e) => handleAction(e, () => toggleSaved(issue.id))}
                >
                  <Star size={12} className={issue.isSaved ? 'fill-current' : ''} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{issue.isSaved ? 'Remove from saved' : 'Save for later'}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                  <Archive size={12} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Archive</TooltipContent>
            </Tooltip>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs gap-1.5 ml-1"
              onClick={(e) => handleAction(e, handleRead)}
            >
              <BookOpen size={11} />
              Open
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
