import type { RawMessage } from './gmail'

const KNOWN_NEWSLETTER_DOMAINS = [
  'substack.com',
  'beehiiv.com',
  'mailchimp.com',
  'convertkit.com',
  'ghost.io',
  'ghost.org',
  'buttondown.email',
  'revue.co',
  'tinyletter.com',
  'campaign-archive.com',
  'list-manage.com',
  'constantcontact.com',
  'sendgrid.net',
  'mailgun.org',
]

export function isNewsletter(msg: RawMessage): boolean {
  // 1. List-Unsubscribe header present
  if (msg.headers['list-unsubscribe']) return true

  // 2. List-ID header
  if (msg.headers['list-id']) return true

  // 3. Precedence: bulk or list
  const precedence = msg.headers['precedence']?.toLowerCase()
  if (precedence === 'bulk' || precedence === 'list') return true

  // 4. Known sender domain
  const fromLower = msg.from.toLowerCase()
  if (KNOWN_NEWSLETTER_DOMAINS.some((d) => fromLower.includes(d))) return true

  // 5. X-Mailer hints
  const mailer = msg.headers['x-mailer']?.toLowerCase() ?? ''
  const newsletterMailers = ['mailchimp', 'sendgrid', 'convertkit', 'beehiiv', 'substack']
  if (newsletterMailers.some((m) => mailer.includes(m))) return true

  return false
}

export function extractDomain(email: string): string {
  const match = email.match(/@([\w.-]+)/)
  return match ? match[1].toLowerCase() : ''
}

export function extractSenderName(from: string): string {
  // "Display Name <email@domain.com>" → "Display Name"
  const match = from.match(/^([^<]+)</)
  if (match) return match[1].trim()
  // bare email
  return from.split('@')[0] ?? from
}
