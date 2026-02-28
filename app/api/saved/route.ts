import { NextRequest, NextResponse } from 'next/server'
import { getSavedIssues, toggleSaved } from '@/lib/db'

export async function GET() {
  const issues = getSavedIssues()
  return NextResponse.json({ issues })
}

export async function POST(req: NextRequest) {
  const { id } = (await req.json()) as { id: string }
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  toggleSaved(id)
  return NextResponse.json({ ok: true })
}
