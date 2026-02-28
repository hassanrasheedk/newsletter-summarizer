import { NextRequest, NextResponse } from 'next/server'
import { getIssues } from '@/lib/db'

export async function GET(req: NextRequest) {
  const limit = Number(req.nextUrl.searchParams.get('limit') ?? 50)
  const offset = Number(req.nextUrl.searchParams.get('offset') ?? 0)
  const issues = getIssues(limit, offset)
  return NextResponse.json({ issues })
}
