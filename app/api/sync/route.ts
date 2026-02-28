import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { listMessageIds, getMessage } from '@/lib/gmail'
import { isNewsletter, extractDomain, extractSenderName } from '@/lib/newsletter-detector'
import { summarizeNewsletter } from '@/lib/claude'
import { scoreNewsletter } from '@/lib/social-scorer'
import { upsertSource, upsertIssue } from '@/lib/db'
import type { NewsletterSource, NewsletterIssue, ImportanceLevel } from '@/types'
import { randomUUID } from 'crypto'

export async function POST() {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const ids = await listMessageIds(session.accessToken, 'in:inbox', 100)
  let synced = 0

  for (const id of ids.slice(0, 30)) {
    const msg = await getMessage(session.accessToken, id).catch(() => null)
    if (!msg || !isNewsletter(msg)) continue

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
      summarizeNewsletter(msg.subject, msg.cleanedText),
      scoreNewsletter(msg.subject),
    ])

    const aiResult = ai.status === 'fulfilled' ? ai.value : null
    const socialResult = social.status === 'fulfilled' ? social.value : { hnMentions: 0, redditMentions: 0, totalBuzz: 'low' as const }
    const score = aiResult?.importanceScore ?? 50
    const importanceLevel: ImportanceLevel = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low'

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
    }
    upsertIssue(issue)
    synced++
  }

  return NextResponse.json({ synced })
}
