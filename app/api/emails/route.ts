import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { listMessageIds, getMessage } from '@/lib/gmail'
import { isNewsletter } from '@/lib/newsletter-detector'

export async function GET() {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const ids = await listMessageIds(session.accessToken, 'in:inbox', 50)
  const messages = await Promise.allSettled(
    ids.slice(0, 20).map((id) => getMessage(session.accessToken!, id))
  )

  const newsletters = messages
    .filter((r) => r.status === 'fulfilled')
    .map((r) => (r as PromiseFulfilledResult<Awaited<ReturnType<typeof getMessage>>>).value)
    .filter(isNewsletter)

  return NextResponse.json({ newsletters })
}
