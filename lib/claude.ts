import OpenAI from 'openai'
import type { SummarizeResult } from '@/types'

let _client: OpenAI | null = null
function getClient() {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _client
}

const SYSTEM_PROMPT = `You are a newsletter analyst. Extract the most important information concisely. Be direct and avoid filler words. Always respond with valid JSON only.`

export async function summarizeNewsletter(
  subject: string,
  content: string,
  model = 'gpt-5-mini'
): Promise<SummarizeResult> {
  const truncatedContent = content.slice(0, 8000)

  const response = await getClient().chat.completions.create({
    model,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Summarize this newsletter issue:
Subject: ${subject}
Content: ${truncatedContent}

Respond in JSON:
{
  "summary": "3-sentence TL;DR",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "whyItMatters": "1-paragraph plain English explanation of why this is important",
  "category": "Tech|Finance|AI|Health|Politics|Culture|Business|Science|Other",
  "tags": ["tag1", "tag2", "tag3"],
  "importanceScore": <integer 0-100, use the full range with this strict distribution:
    85-100 → CRITICAL: Breaking news, major market disruption, critical security vulnerability, paradigm-shifting announcement. ~5% of newsletters.
    70-84  → HIGH: Significant industry development, strong original research, important trend with clear near-term impact. ~15% of newsletters.
    45-69  → MEDIUM: Solid informative content, useful updates, good analysis without urgency. Most newsletters belong here (~45%).
    25-44  → LOW: Routine roundups, minor announcements, rehashed content, low information density. ~25% of newsletters.
    0-24   → MINIMAL: Purely promotional, no original insight, filler content. ~10% of newsletters.
    Be critical and use the full range. The median score should be 45-55. Do NOT cluster scores above 70 — that tier is reserved for genuinely exceptional content.>
}`,
      },
    ],
  })

  const text = response.choices[0]?.message?.content ?? '{}'
  return JSON.parse(text) as SummarizeResult
}
