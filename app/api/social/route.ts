import { NextRequest, NextResponse } from 'next/server'
import { scoreNewsletter } from '@/lib/social-scorer'

export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get('title')
  const url = req.nextUrl.searchParams.get('url') ?? undefined

  if (!title) {
    return NextResponse.json({ error: 'Missing title' }, { status: 400 })
  }

  const score = await scoreNewsletter(title, url)
  return NextResponse.json(score)
}
