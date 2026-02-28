'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Tag, X, BookOpen, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { NewsletterIssue } from '@/types'
import type { TagCount } from '@/lib/db'

const IMPORTANCE_STYLES = {
  high:   'bg-[oklch(0.62_0.18_162/0.15)] text-[oklch(0.62_0.18_162)] border-[oklch(0.62_0.18_162/0.3)]',
  medium: 'bg-[oklch(0.72_0.19_75/0.15)]  text-[oklch(0.72_0.19_75)]  border-[oklch(0.72_0.19_75/0.3)]',
  low:    'bg-muted text-muted-foreground border-border',
}

function readingTime(text: string) {
  return Math.max(1, Math.round((text ?? '').split(/\s+/).length / 200))
}

// Tag bubble — size scales with count
function TagPill({ tag, count, active, onClick }: {
  tag: string; count: number; active: boolean; onClick: () => void
}) {
  const size = count >= 5 ? 'text-sm px-3 py-1.5' : count >= 3 ? 'text-xs px-2.5 py-1' : 'text-[11px] px-2 py-0.5'
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border font-medium transition-all',
        size,
        active
          ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
          : 'bg-card border-border text-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary'
      )}
    >
      {tag}
      <span className={cn('ml-1.5 tabular-nums', active ? 'opacity-80' : 'text-muted-foreground')}>
        {count}
      </span>
    </button>
  )
}

export function TagsView() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTag = searchParams.get('tag') ?? null

  const [allTags, setAllTags] = useState<TagCount[]>([])
  const [issues, setIssues] = useState<NewsletterIssue[]>([])
  const [tagsLoading, setTagsLoading] = useState(true)
  const [issuesLoading, setIssuesLoading] = useState(false)

  useEffect(() => {
    fetch('/api/tags')
      .then((r) => r.json())
      .then((d: { tags: TagCount[] }) => setAllTags(d.tags ?? []))
      .catch(() => {})
      .finally(() => setTagsLoading(false))
  }, [])

  const loadIssues = useCallback((tag: string) => {
    setIssuesLoading(true)
    fetch(`/api/tags?tag=${encodeURIComponent(tag)}`)
      .then((r) => r.json())
      .then((d: { issues: NewsletterIssue[] }) => setIssues(d.issues ?? []))
      .catch(() => {})
      .finally(() => setIssuesLoading(false))
  }, [])

  useEffect(() => {
    if (activeTag) loadIssues(activeTag)
    else setIssues([])
  }, [activeTag, loadIssues])

  function selectTag(tag: string) {
    if (tag === activeTag) router.push('/tags')
    else router.push(`/tags?tag=${encodeURIComponent(tag)}`)
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col gap-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tag size={22} className="text-primary" />
            Tags
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {tagsLoading ? '…' : `${allTags.length} tags across your newsletters`}
          </p>
        </div>

        {/* Tag cloud */}
        {tagsLoading ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <Skeleton key={i} className="h-7 rounded-full" style={{ width: `${60 + (i % 5) * 20}px` }} />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {allTags.map(({ tag, count }) => (
              <TagPill
                key={tag}
                tag={tag}
                count={count}
                active={activeTag === tag}
                onClick={() => selectTag(tag)}
              />
            ))}
          </div>
        )}

        {/* Active tag results */}
        {activeTag && (
          <>
            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">
                  #{activeTag}
                </h2>
                {!issuesLoading && (
                  <span className="text-sm text-muted-foreground">
                    {issues.length} newsletter{issues.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs text-muted-foreground"
                onClick={() => router.push('/tags')}
              >
                <X size={12} /> Clear
              </Button>
            </div>

            {issuesLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : issues.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No newsletters found for this tag.
              </p>
            ) : (
              <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
                {issues.map((issue, idx) => (
                  <div
                    key={issue.id}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-muted/30 transition-colors animate-slide-up"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={cn('text-[9px] font-bold uppercase tracking-wide shrink-0', IMPORTANCE_STYLES[issue.importanceLevel])}
                        >
                          {issue.importanceLevel}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{issue.category}</span>
                      </div>
                      <h3 className="text-sm font-semibold leading-snug">{issue.subject}</h3>
                      {issue.summary && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {issue.summary}
                        </p>
                      )}
                      {/* Other tags on this issue */}
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {(issue.tags ?? []).filter(t => t !== activeTag).slice(0, 4).map((tag) => (
                          <button key={tag} onClick={() => selectTag(tag)}>
                            <Badge variant="secondary" className="text-[10px] h-4 cursor-pointer hover:bg-primary/20">
                              {tag}
                            </Badge>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(issue.receivedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                        <Clock size={9} />{readingTime(issue.cleanedText)}m
                      </span>
                      <Button asChild size="sm" variant="outline" className="h-6 px-2 text-[11px] gap-1 mt-1">
                        <Link href={`/read/${issue.id}`}>
                          <BookOpen size={10} />Read
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Hint when no tag selected */}
        {!activeTag && !tagsLoading && allTags.length > 0 && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            Click any tag to see matching newsletters
          </p>
        )}

      </div>
    </div>
  )
}
