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
  "importanceScore": 0-100
}`,
      },
    ],
  })

  const text = response.choices[0]?.message?.content ?? '{}'
  return JSON.parse(text) as SummarizeResult
}
