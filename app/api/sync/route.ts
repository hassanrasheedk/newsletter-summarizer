import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { listMessageIds, getMessage } from '@/lib/gmail'
import { isNewsletter, extractDomain, extractSenderName } from '@/lib/newsletter-detector'
import { summarizeNewsletter } from '@/lib/claude'
import { scoreNewsletter } from '@/lib/social-scorer'
import { upsertSource, upsertIssue, getExistingIssueIds, getTrackedSenderEmails, getStats } from '@/lib/db'
import type { NewsletterSource, NewsletterIssue, ImportanceLevel } from '@/types'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({})) as { model?: string }
  const model = body.model ?? 'gpt-5-mini'

  const isFirstSync = getStats().total === 0
  const query = isFirstSync ? 'in:inbox newer_than:14d' : 'in:inbox newer_than:7d'
  const fetchLimit = isFirstSync ? 500 : 200
  const processLimit = isFirstSync ? 200 : 50

  const ids = await listMessageIds(session.accessToken, query, fetchLimit)
  let synced = 0

  // Skip emails already in the database
  const existingIds = new Set(getExistingIssueIds(ids))
  const newIds = ids.filter((id) => !existingIds.has(id))

  // Also include manually-tracked senders that wouldn't pass newsletter header checks
  const manuallyTracked = new Set(getTrackedSenderEmails())

  for (const id of newIds.slice(0, processLimit)) {
    const msg = await getMessage(session.accessToken, id).catch(() => null)
    if (!msg) continue

    const fromEmail = msg.from.match(/<([^>]+)>/)?.[1]?.toLowerCase() ?? msg.from.toLowerCase()
    const isManuallyTracked = manuallyTracked.has(fromEmail)

    if (!isNewsletter(msg) && !isManuallyTracked) continue

    const domain = extractDomain(msg.from)
    const senderName = extractSenderName(msg.from)
    const sourceId = `src_${Buffer.from(msg.from).toString('base64url').slice(0, 16)}`

    const source: NewsletterSource = {
      id: sourceId,
      senderEmail: msg.from,
      senderName,
      domain,
      category: 'Other',
      credibilityScore: 50,
      isActive: true,
      createdAt: new Date().toISOString(),
    }
    upsertSource(source)

    const [ai, social] = await Promise.allSettled([
      summarizeNewsletter(msg.subject, msg.cleanedText, model),
      scoreNewsletter(msg.subject),
    ])

    const aiResult = ai.status === 'fulfilled' ? ai.value : null
    const socialResult = social.status === 'fulfilled' ? social.value : { hnMentions: 0, redditMentions: 0, totalBuzz: 'low' as const }
    const score = aiResult?.importanceScore ?? 50
    const importanceLevel: ImportanceLevel =
      score >= 85 ? 'critical' :
      score >= 70 ? 'high' :
      score >= 45 ? 'medium' :
      score >= 25 ? 'low' : 'minimal'

    const issue: NewsletterIssue = {
      id: id,
      sourceId,
      subject: msg.subject,
      receivedAt: msg.date,
      rawHtml: msg.rawHtml,
      cleanedText: msg.cleanedText,
      summary: aiResult?.summary ?? '',
      keyPoints: aiResult?.keyPoints ?? [],
      whyItMatters: aiResult?.whyItMatters ?? '',
      category: aiResult?.category ?? 'Other',
      tags: aiResult?.tags ?? [],
      importanceScore: score,
      importanceLevel,
      socialScore: socialResult,
      isRead: false,
      isSaved: false,
      isArchived: false,
    }
    upsertIssue(issue)
    synced++
  }

  return NextResponse.json({ synced })
}
