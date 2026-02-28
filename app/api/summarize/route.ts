import { NextRequest, NextResponse } from 'next/server'
import { summarizeNewsletter } from '@/lib/claude'

export async function POST(req: NextRequest) {
  const { subject, content, model } = (await req.json()) as { subject: string; content: string; model?: string }

  if (!subject || !content) {
    return NextResponse.json({ error: 'Missing subject or content' }, { status: 400 })
  }

  const result = await summarizeNewsletter(subject, content, model)
  return NextResponse.json(result)
}
