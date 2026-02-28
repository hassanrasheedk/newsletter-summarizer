'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Star, BookOpen, Clock, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { NewsletterIssue } from '@/types'

const IMPORTANCE_STYLES = {
  high:   'bg-[oklch(0.62_0.18_162/0.15)] text-[oklch(0.62_0.18_162)] border-[oklch(0.62_0.18_162/0.3)]',
  medium: 'bg-[oklch(0.72_0.19_75/0.15)]  text-[oklch(0.72_0.19_75)]  border-[oklch(0.72_0.19_75/0.3)]',
  low:    'bg-muted text-muted-foreground border-border',
}

function readingTime(text: string) {
  return Math.max(1, Math.round((text ?? '').split(/\s+/).length / 200))
}

export function SavedView() {
  const [issues, setIssues] = useState<NewsletterIssue[]>([])
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    fetch('/api/saved')
      .then((r) => r.json())
      .then((d: { issues: NewsletterIssue[] }) => setIssues(d.issues ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function unsave(id: string) {
    await fetch('/api/saved', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setIssues((prev) => prev.filter((i) => i.id !== id))
    toast.success('Removed from saved')
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Star size={22} className="text-primary fill-primary" />
              Saved
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {loading ? '…' : `${issues.length} saved newsletter${issues.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <Star size={40} className="text-muted-foreground/30" />
            <div>
              <p className="font-semibold">Nothing saved yet</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Hit the ★ on any newsletter card to save it here for later.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/feed">Browse feed →</Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
            {issues.map((issue, idx) => (
              <div key={issue.id} className="flex items-start gap-4 px-5 py-4 hover:bg-muted/30 transition-colors group animate-slide-up"
                style={{ animationDelay: `${idx * 40}ms` }}>

                {/* Left: importance + text */}
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
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{issue.summary}</p>
                  )}
                  {(issue.tags ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {issue.tags.slice(0, 4).map((tag) => (
                        <Link key={tag} href={`/tags?tag=${encodeURIComponent(tag)}`}>
                          <Badge variant="secondary" className="text-[10px] h-4 cursor-pointer hover:bg-primary/20">
                            {tag}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: meta + actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(issue.receivedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                    <Clock size={9} />{readingTime(issue.cleanedText)}m
                  </span>
                  <div className="flex gap-1.5 mt-1">
                    <Button asChild size="sm" variant="outline" className="h-6 px-2 text-[11px] gap-1">
                      <Link href={`/read/${issue.id}`}>
                        <BookOpen size={10} />Read
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => unsave(issue.id)}
                      title="Remove from saved"
                    >
                      <Trash2 size={10} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && issues.length > 0 && (
          <>
            <Separator />
            <p className="text-xs text-muted-foreground text-center">
              Hover a card and click the trash icon to unsave
            </p>
          </>
        )}
      </div>
    </div>
  )
}
