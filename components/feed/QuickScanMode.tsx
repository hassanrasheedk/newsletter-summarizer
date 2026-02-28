'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useFeedStore } from '@/store/feed'
import type { NewsletterIssue } from '@/types'

const IMPORTANCE_DOT = {
  high: 'bg-[oklch(0.62_0.18_162)]',
  medium: 'bg-[oklch(0.72_0.19_75)]',
  low: 'bg-muted-foreground',
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
          <span
            className={cn('h-2 w-2 shrink-0 rounded-full', IMPORTANCE_DOT[issue.importanceLevel])}
          />
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
  )
}
