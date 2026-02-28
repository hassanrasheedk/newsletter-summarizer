'use client'

import { useEffect, useState } from 'react'
import { Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { NewsletterIssue } from '@/types'

interface Props {
  id: string
}

function readingTime(text: string): number {
  return Math.max(1, Math.round(text.split(/\s+/).length / 200))
}

export function EmailContent({ id }: Props) {
  const [issue, setIssue] = useState<NewsletterIssue | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/emails/${id}`)
      .then((r) => r.json())
      .then((data: { issue: NewsletterIssue }) => setIssue(data.issue))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="p-8 max-w-3xl mx-auto flex flex-col gap-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (!issue) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>Newsletter not found.</p>
        <Button asChild variant="link" className="mt-2">
          <Link href="/feed">← Back to feed</Link>
        </Button>
      </div>
    )
  }

  return (
    <article className="p-8 max-w-3xl mx-auto">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 gap-1.5 text-muted-foreground">
        <Link href="/feed">
          <ArrowLeft size={14} />
          Feed
        </Link>
      </Button>

      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold leading-snug">{issue.subject}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{issue.sourceId}</span>
          <span>·</span>
          <span>{new Date(issue.receivedAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {readingTime(issue.cleanedText)} min read
          </span>
        </div>
      </header>

      {issue.rawHtml ? (
        <iframe
          srcDoc={issue.rawHtml}
          sandbox="allow-same-origin"
          className="w-full border-0 rounded-lg"
          style={{ minHeight: '80vh' }}
          onLoad={(e) => {
            const iframe = e.currentTarget
            const height = iframe.contentDocument?.documentElement?.scrollHeight
            if (height) iframe.style.height = `${height}px`
          }}
        />
      ) : (
        <div className="[font-family:Georgia,serif] leading-relaxed text-sm whitespace-pre-wrap">
          {issue.cleanedText}
        </div>
      )}
    </article>
  )
}
