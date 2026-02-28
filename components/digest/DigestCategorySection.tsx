'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { NewsletterIssue } from '@/types'
import type { DigestCategory } from '@/app/api/digest/route'

const CATEGORY_ICONS: Record<string, string> = {
  AI: '🤖', Tech: '💻', Finance: '💰', Business: '📈',
  Politics: '🏛️', Health: '💊', Science: '🔬',
  Culture: '🎨', Sports: '⚽', Other: '📌',
}

const IMPORTANCE_STYLES = {
  high:   'bg-[oklch(0.62_0.18_162/0.15)] text-[oklch(0.62_0.18_162)] border-[oklch(0.62_0.18_162/0.3)]',
  medium: 'bg-[oklch(0.72_0.19_75/0.15)]  text-[oklch(0.72_0.19_75)]  border-[oklch(0.72_0.19_75/0.3)]',
  low:    'bg-muted text-muted-foreground border-border',
}

const IMPORTANCE_LABELS = {
  high: 'Must Read',
  medium: 'Worth Reading',
  low: 'FYI',
}

function readingTime(text: string) {
  return Math.max(1, Math.round((text ?? '').split(/\s+/).length / 200))
}

function IssueRow({ issue }: { issue: NewsletterIssue }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-muted/40 transition-colors"
      >
        <span className="mt-0.5 shrink-0">
          {expanded
            ? <ChevronDown size={14} className="text-muted-foreground" />
            : <ChevronRight size={14} className="text-muted-foreground" />
          }
        </span>

        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={cn('text-[9px] font-bold uppercase tracking-wide shrink-0', IMPORTANCE_STYLES[issue.importanceLevel])}
            >
              {IMPORTANCE_LABELS[issue.importanceLevel]}
            </Badge>
            <span className="text-sm font-medium leading-snug truncate">{issue.subject}</span>
          </div>
          {!expanded && issue.summary && (
            <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
              {issue.summary}
            </p>
          )}
        </div>

        <div className="shrink-0 flex flex-col items-end gap-1 ml-2">
          <span className="text-[11px] text-muted-foreground">
            {new Date(issue.receivedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
          <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
            <Clock size={9} />{readingTime(issue.cleanedText)}m
          </span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pl-11 flex flex-col gap-3 animate-slide-up">
          {issue.summary && (
            <p className="text-sm leading-relaxed text-muted-foreground">{issue.summary}</p>
          )}

          {(issue.keyPoints ?? []).length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {issue.keyPoints.map((pt, i) => (
                <li key={i} className="text-xs flex gap-2 leading-relaxed">
                  <span className="text-primary shrink-0 mt-0.5">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          )}

          {issue.whyItMatters && (
            <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Why it matters</p>
              <p className="text-xs leading-relaxed">{issue.whyItMatters}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex flex-wrap gap-1">
              {(issue.tags ?? []).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] h-5">{tag}</Badge>
              ))}
            </div>
            <Link
              href={`/read/${issue.id}`}
              className="ml-auto text-xs text-primary hover:underline shrink-0"
            >
              Read full →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export function DigestCategorySection({ category }: { category: DigestCategory }) {
  const [open, setOpen] = useState(true)
  const icon = CATEGORY_ICONS[category.name] ?? '📌'

  return (
    <section className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Category header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/30 transition-colors"
      >
        <span className="text-xl leading-none">{icon}</span>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">{category.name}</h2>
            <span className="text-xs text-muted-foreground">
              {category.count} {category.count === 1 ? 'newsletter' : 'newsletters'}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex flex-wrap gap-1">
              {category.topTags.slice(0, 4).map((tag) => (
                <span key={tag} className="text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 ml-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">relevance</span>
            <span className="text-sm font-bold tabular-nums">{category.avgScore}</span>
          </div>
          <Progress value={category.avgScore} className="h-1 w-20" />
        </div>

        <ChevronDown
          size={16}
          className={cn('ml-3 text-muted-foreground transition-transform shrink-0', !open && '-rotate-90')}
        />
      </button>

      {/* Issues list */}
      {open && (
        <div className="border-t border-border divide-y-0">
          {category.issues.map((issue) => (
            <IssueRow key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </section>
  )
}
