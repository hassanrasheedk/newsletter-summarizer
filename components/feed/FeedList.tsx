'use client'

import { useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { useFeedStore } from '@/store/feed'
import { NewsletterCard } from './NewsletterCard'
import { QuickScanMode } from './QuickScanMode'

export function FeedList() {
  const { newsletters, viewMode, isLoading, setNewsletters, setLoading, searchQuery, refreshTick } = useFeedStore()

  useEffect(() => {
    setLoading(true)
    fetch('/api/issues')
      .then((r) => r.json())
      .then((data: { issues?: unknown[] }) => {
        if (data.issues) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setNewsletters(data.issues as any)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [setNewsletters, setLoading, refreshTick])

  const filtered = newsletters.filter((n) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return n.subject.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q)
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center p-8">
        <p className="text-muted-foreground text-sm">
          {searchQuery ? 'No results for your search.' : 'No newsletters yet. Hit Sync to fetch your inbox.'}
        </p>
      </div>
    )
  }

  if (viewMode === 'quickscan') {
    return (
      <div className="flex-1 overflow-y-auto">
        <QuickScanMode issues={filtered} />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid gap-3 max-w-2xl">
        {filtered.map((issue) => (
          <NewsletterCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  )
}
