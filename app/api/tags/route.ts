import { NextRequest, NextResponse } from 'next/server'
import { getAllTags, getIssuesByTag } from '@/lib/db'

export async function GET(req: NextRequest) {
  const tag = req.nextUrl.searchParams.get('tag')
  if (tag) {
    const issues = getIssuesByTag(tag)
    return NextResponse.json({ issues })
  }
  const tags = getAllTags()
  return NextResponse.json({ tags })
}
