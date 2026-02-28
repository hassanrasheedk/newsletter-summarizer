import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import type { Category } from '@/types'

interface PatchBody {
  isActive?: boolean
  category?: Category
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = (await req.json()) as PatchBody
  const db = getDb()

  if (body.isActive !== undefined) {
    db.prepare('UPDATE newsletter_sources SET isActive = ? WHERE id = ?').run(
      body.isActive ? 1 : 0, id
    )
  }
  if (body.category) {
    db.prepare('UPDATE newsletter_sources SET category = ? WHERE id = ?').run(
      body.category, id
    )
  }
  return NextResponse.json({ ok: true })
}
