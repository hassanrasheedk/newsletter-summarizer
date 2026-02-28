import { google } from 'googleapis'
import { simpleParser } from 'mailparser'

export function getGmailClient(accessToken: string) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  return google.gmail({ version: 'v1', auth })
}

export interface RawMessage {
  id: string
  subject: string
  from: string
  date: string
  rawHtml: string
  cleanedText: string
  headers: Record<string, string>
}

export async function listMessageIds(
  accessToken: string,
  query = 'in:inbox',
  maxResults = 100
): Promise<string[]> {
  const gmail = getGmailClient(accessToken)
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults,
  })
  return (res.data.messages ?? []).map((m) => m.id!).filter(Boolean)
}

export async function getMessage(
  accessToken: string,
  messageId: string
): Promise<RawMessage> {
  const gmail = getGmailClient(accessToken)
  const res = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'raw',
  })

  const raw = Buffer.from(res.data.raw!, 'base64url').toString('utf-8')
  const parsed = await simpleParser(raw)

  const headers: Record<string, string> = {}
  parsed.headerLines?.forEach((h) => {
    headers[h.key.toLowerCase()] = h.line
  })

  const rawHtml = parsed.html || ''
  const cleanedText = stripHtml(rawHtml) || parsed.text || ''

  return {
    id: messageId,
    subject: parsed.subject ?? '(no subject)',
    from: parsed.from?.text ?? '',
    date: (parsed.date ?? new Date()).toISOString(),
    rawHtml,
    cleanedText,
    headers,
  }
}

export interface SenderInfo {
  from: string        // full "Name <email>" string
  name: string
  email: string
  domain: string
  count: number       // how many emails in the scanned batch
}

export async function listMessageSenders(
  accessToken: string,
  maxResults = 200
): Promise<SenderInfo[]> {
  const gmail = getGmailClient(accessToken)

  // Fetch message IDs
  const listRes = await gmail.users.messages.list({
    userId: 'me',
    q: 'in:inbox',
    maxResults,
  })
  const ids = (listRes.data.messages ?? []).map((m) => m.id!).filter(Boolean)

  // Fetch only From/Subject metadata in parallel batches of 20
  const BATCH = 20
  const senderMap = new Map<string, SenderInfo>()

  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH)
    const results = await Promise.allSettled(
      batch.map((id) =>
        gmail.users.messages.get({
          userId: 'me',
          id,
          format: 'metadata',
          metadataHeaders: ['From'],
        })
      )
    )

    for (const r of results) {
      if (r.status !== 'fulfilled') continue
      const headers = r.value.data.payload?.headers ?? []
      const from = headers.find((h) => h.name?.toLowerCase() === 'from')?.value ?? ''
      if (!from) continue

      const emailMatch = from.match(/<([^>]+)>/)
      const email = (emailMatch ? emailMatch[1] : from).toLowerCase().trim()
      const nameMatch = from.match(/^([^<]+)</)
      const name = nameMatch ? nameMatch[1].trim().replace(/^"+|"+$/g, '') : email.split('@')[0]
      const domain = email.split('@')[1] ?? ''

      if (!email || !domain) continue

      const existing = senderMap.get(email)
      if (existing) {
        existing.count++
      } else {
        senderMap.set(email, { from, name, email, domain, count: 1 })
      }
    }
  }

  return [...senderMap.values()].sort((a, b) => b.count - a.count)
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
