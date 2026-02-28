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
