'use client'

import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { DigestCategorySection } from './DigestCategorySection'
import type { DigestResponse } from '@/app/api/digest/route'

export function DigestView() {
  const [data, setData] = useState<DigestResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/digest')
      .then((r) => r.json())
      .then((d: DigestResponse) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-6 max-w-3xl w-full">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (!data || data.categories.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-4xl">📬</p>
        <p className="font-semibold">No newsletters yet</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Sync your inbox from the Feed page to generate a digest.
        </p>
      </div>
    )
  }

  const generatedAt = new Date(data.generatedAt).toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold">Topic Digest</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {data.total} newsletters across {data.categories.length} topics
            </p>
          </div>
          <p className="text-xs text-muted-foreground">{generatedAt}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {data.categories.slice(0, 4).map((cat) => (
            <div key={cat.name} className="rounded-lg border border-border bg-card px-4 py-3 flex flex-col gap-1">
              <p className="text-xs text-muted-foreground">{cat.name}</p>
              <p className="text-2xl font-bold tabular-nums">{cat.count}</p>
              <p className="text-[11px] text-muted-foreground">avg relevance: {cat.avgScore}</p>
            </div>
          ))}
        </div>

        {/* Category sections */}
        <div className="flex flex-col gap-4">
          {data.categories.map((cat) => (
            <DigestCategorySection key={cat.name} category={cat} />
          ))}
        </div>
      </div>
    </div>
  )
}
