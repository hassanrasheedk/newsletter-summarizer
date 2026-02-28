import Database from 'better-sqlite3'
import path from 'path'
import type { NewsletterSource, NewsletterIssue, SocialScore } from '@/types'

const DB_PATH = process.env.DATABASE_PATH ?? './data/newsletters.db'

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(path.resolve(DB_PATH))
    _db.pragma('journal_mode = WAL')
    initSchema(_db)
  }
  return _db
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS newsletter_sources (
      id TEXT PRIMARY KEY,
      senderEmail TEXT NOT NULL,
      senderName TEXT NOT NULL,
      domain TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Other',
      credibilityScore REAL NOT NULL DEFAULT 50,
      isActive INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS newsletter_issues (
      id TEXT PRIMARY KEY,
      sourceId TEXT NOT NULL,
      subject TEXT NOT NULL,
      receivedAt TEXT NOT NULL,
      rawHtml TEXT NOT NULL DEFAULT '',
      cleanedText TEXT NOT NULL DEFAULT '',
      summary TEXT NOT NULL DEFAULT '',
      keyPoints TEXT NOT NULL DEFAULT '[]',
      whyItMatters TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'Other',
      tags TEXT NOT NULL DEFAULT '[]',
      importanceScore REAL NOT NULL DEFAULT 50,
      importanceLevel TEXT NOT NULL DEFAULT 'medium',
      socialScore TEXT NOT NULL DEFAULT '{"hnMentions":0,"redditMentions":0,"totalBuzz":"low"}',
      isRead INTEGER NOT NULL DEFAULT 0,
      isSaved INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (sourceId) REFERENCES newsletter_sources(id)
    );
  `)
}

// ── Sources ──────────────────────────────────────────────────────────────────

export function upsertSource(source: NewsletterSource): void {
  const db = getDb()
  db.prepare(`
    INSERT INTO newsletter_sources (id, senderEmail, senderName, domain, category, credibilityScore, isActive, createdAt)
    VALUES (@id, @senderEmail, @senderName, @domain, @category, @credibilityScore, @isActive, @createdAt)
    ON CONFLICT(id) DO UPDATE SET
      senderName = excluded.senderName,
      domain = excluded.domain,
      category = excluded.category,
      credibilityScore = excluded.credibilityScore,
      isActive = excluded.isActive
  `).run({ ...source, isActive: source.isActive ? 1 : 0 })
}

export function getSources(): NewsletterSource[] {
  const db = getDb()
  return db.prepare('SELECT * FROM newsletter_sources WHERE isActive = 1').all() as NewsletterSource[]
}

// ── Issues ───────────────────────────────────────────────────────────────────

export function upsertIssue(issue: NewsletterIssue): void {
  const db = getDb()
  db.prepare(`
    INSERT INTO newsletter_issues (id, sourceId, subject, receivedAt, rawHtml, cleanedText, summary, keyPoints, whyItMatters, category, tags, importanceScore, importanceLevel, socialScore, isRead, isSaved)
    VALUES (@id, @sourceId, @subject, @receivedAt, @rawHtml, @cleanedText, @summary, @keyPoints, @whyItMatters, @category, @tags, @importanceScore, @importanceLevel, @socialScore, @isRead, @isSaved)
    ON CONFLICT(id) DO UPDATE SET
      summary = excluded.summary,
      keyPoints = excluded.keyPoints,
      whyItMatters = excluded.whyItMatters,
      category = excluded.category,
      tags = excluded.tags,
      importanceScore = excluded.importanceScore,
      importanceLevel = excluded.importanceLevel,
      socialScore = excluded.socialScore
  `).run({
    ...issue,
    keyPoints: JSON.stringify(issue.keyPoints),
    tags: JSON.stringify(issue.tags),
    socialScore: JSON.stringify(issue.socialScore),
    isRead: issue.isRead ? 1 : 0,
    isSaved: issue.isSaved ? 1 : 0,
  })
}

export function getIssues(limit = 50, offset = 0): NewsletterIssue[] {
  const db = getDb()
  const rows = db.prepare(
    'SELECT * FROM newsletter_issues ORDER BY importanceScore DESC, receivedAt DESC LIMIT ? OFFSET ?'
  ).all(limit, offset) as Record<string, unknown>[]
  return rows.map(deserializeIssue)
}

export function getIssueById(id: string): NewsletterIssue | null {
  const db = getDb()
  const row = db.prepare('SELECT * FROM newsletter_issues WHERE id = ?').get(id) as Record<string, unknown> | undefined
  return row ? deserializeIssue(row) : null
}

export function markRead(id: string): void {
  const db = getDb()
  db.prepare('UPDATE newsletter_issues SET isRead = 1 WHERE id = ?').run(id)
}

export function toggleSaved(id: string): void {
  const db = getDb()
  db.prepare('UPDATE newsletter_issues SET isSaved = CASE WHEN isSaved = 1 THEN 0 ELSE 1 END WHERE id = ?').run(id)
}

export interface DbStats {
  total: number; read: number; saved: number; avgScore: number; sources: number
}

export function getStats(): DbStats {
  const db = getDb()
  const s = db.prepare(
    'SELECT COUNT(*) as total, SUM(isRead) as read, SUM(isSaved) as saved, ROUND(AVG(importanceScore),1) as avgScore FROM newsletter_issues'
  ).get() as { total: number; read: number; saved: number; avgScore: number }
  const sources = (db.prepare('SELECT COUNT(*) as c FROM newsletter_sources WHERE isActive=1').get() as { c: number }).c
  return { ...s, sources }
}

export function getSavedIssues(): NewsletterIssue[] {
  const db = getDb()
  const rows = db.prepare(
    'SELECT * FROM newsletter_issues WHERE isSaved = 1 ORDER BY importanceScore DESC, receivedAt DESC'
  ).all() as Record<string, unknown>[]
  return rows.map(deserializeIssue)
}

export interface TagCount { tag: string; count: number }

export function getAllTags(): TagCount[] {
  const db = getDb()
  const rows = db.prepare('SELECT tags FROM newsletter_issues').all() as { tags: string }[]
  const freq = new Map<string, number>()
  for (const row of rows) {
    for (const tag of JSON.parse(row.tags) as string[]) {
      freq.set(tag, (freq.get(tag) ?? 0) + 1)
    }
  }
  return [...freq.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}

export function getTrackedSenderEmails(): string[] {
  const db = getDb()
  const rows = db.prepare(
    'SELECT senderEmail FROM newsletter_sources WHERE isActive = 1'
  ).all() as { senderEmail: string }[]
  return rows.map((r) => r.senderEmail.toLowerCase())
}

export function getExistingIssueIds(ids: string[]): string[] {
  if (ids.length === 0) return []
  const db = getDb()
  const placeholders = ids.map(() => '?').join(',')
  const rows = db.prepare(
    `SELECT id FROM newsletter_issues WHERE id IN (${placeholders})`
  ).all(...ids) as { id: string }[]
  return rows.map((r) => r.id)
}

export function getIssuesByTag(tag: string): NewsletterIssue[] {
  const db = getDb()
  const rows = db.prepare(
    `SELECT DISTINCT ni.* FROM newsletter_issues ni, json_each(ni.tags) je
     WHERE je.value = ?
     ORDER BY ni.importanceScore DESC, ni.receivedAt DESC`
  ).all(tag) as Record<string, unknown>[]
  return rows.map(deserializeIssue)
}

function deserializeIssue(row: Record<string, unknown>): NewsletterIssue {
  return {
    ...row,
    keyPoints: JSON.parse(row.keyPoints as string),
    tags: JSON.parse(row.tags as string),
    socialScore: JSON.parse(row.socialScore as string) as SocialScore,
    isRead: Boolean(row.isRead),
    isSaved: Boolean(row.isSaved),
  } as NewsletterIssue
}
