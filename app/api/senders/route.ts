import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { listMessageSenders } from '@/lib/gmail'
import { getTrackedSenderEmails, upsertSource } from '@/lib/db'
import { extractDomain, extractSenderName } from '@/lib/newsletter-detector'
import type { NewsletterSource } from '@/types'

// GET /api/senders — returns recent inbox senders with isTracked flag
export async function GET() {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const [senders, trackedEmails] = await Promise.all([
    listMessageSenders(session.accessToken, 200),
    Promise.resolve(getTrackedSenderEmails()),
  ])

  const trackedSet = new Set(trackedEmails)

  return NextResponse.json({
    senders: senders.map((s) => ({
      ...s,
      isTracked: trackedSet.has(s.email),
    })),
  })
}

// POST /api/senders — manually track (or untrack) a sender as a newsletter source
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { email, name, domain, isTracked } = (await req.json()) as {
    email: string
    name: string
    domain: string
    isTracked: boolean
  }

  const sourceId = `src_${Buffer.from(email).toString('base64url').slice(0, 16)}`

  const source: NewsletterSource = {
    id: sourceId,
    senderEmail: email,
    senderName: name,
    domain: domain || extractDomain(email),
    category: 'Other',
    credibilityScore: 50,
    isActive: isTracked,
    createdAt: new Date().toISOString(),
  }

  upsertSource(source)
  return NextResponse.json({ ok: true, sourceId })
}
