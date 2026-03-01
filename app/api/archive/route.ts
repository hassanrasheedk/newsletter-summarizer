import { NextRequest, NextResponse } from 'next/server'
import { archiveIssue } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { id } = (await req.json()) as { id: string }
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  archiveIssue(id)
  return NextResponse.json({ ok: true })
}
