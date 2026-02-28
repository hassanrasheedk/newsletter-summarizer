'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useFeedStore } from '@/store/feed'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { NewsletterIssue } from '@/types'

const IMPORTANCE_DOT = {
  high: 'bg-[oklch(0.62_0.18_162)]',
  medium: 'bg-[oklch(0.72_0.19_75)]',
  low: 'bg-muted-foreground',
}

const IMPORTANCE_LABELS = {
  high: 'Must Read',
  medium: 'Worth Reading',
  low: 'FYI',
}

interface Props {
  issues: NewsletterIssue[]
}

export function QuickScanMode({ issues }: Props) {
  const { markRead } = useFeedStore()

  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm">
        No newsletters to scan.
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-border bg-muted/20">
        <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Priority key:</span>
        {(['high', 'medium', 'low'] as const).map((level) => (
          <span key={level} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className={cn('h-2 w-2 rounded-full shrink-0', IMPORTANCE_DOT[level])} />
            {IMPORTANCE_LABELS[level]}
          </span>
        ))}
      </div>

      <div className="flex flex-col divide-y divide-border">
        {issues.map((issue) => (
          <Link
            key={issue.id}
            href={`/read/${issue.id}`}
            onClick={() => markRead(issue.id)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 transition-colors',
              issue.isRead && 'opacity-50'
            )}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={cn('h-2 w-2 shrink-0 rounded-full cursor-default', IMPORTANCE_DOT[issue.importanceLevel])}
                />
              </TooltipTrigger>
              <TooltipContent>{IMPORTANCE_LABELS[issue.importanceLevel]}</TooltipContent>
            </Tooltip>
            <span className="font-medium truncate flex-1">{issue.subject}</span>
            {issue.summary && (
              <span className="hidden sm:block text-xs text-muted-foreground truncate max-w-xs">
                {issue.summary.slice(0, 80)}…
              </span>
            )}
            <span className="shrink-0 text-xs text-muted-foreground">
              {new Date(issue.receivedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
