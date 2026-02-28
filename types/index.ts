export type Category =
  | 'Tech'
  | 'Finance'
  | 'AI'
  | 'Health'
  | 'Politics'
  | 'Culture'
  | 'Business'
  | 'Science'
  | 'Other'

export type ImportanceLevel = 'high' | 'medium' | 'low'

export type ViewMode = 'feed' | 'quickscan' | 'digest'

export interface SocialScore {
  hnMentions: number
  redditMentions: number
  twitterMentions?: number
  totalBuzz: 'low' | 'medium' | 'high'
}

export interface NewsletterSource {
  id: string
  senderEmail: string
  senderName: string
  domain: string
  category: Category
  credibilityScore: number
  isActive: boolean
  createdAt: string
}

export interface NewsletterIssue {
  id: string
  sourceId: string
  subject: string
  receivedAt: string
  rawHtml: string
  cleanedText: string

  // AI-generated
  summary: string
  keyPoints: string[]
  whyItMatters: string
  category: Category
  tags: string[]

  // Scoring
  importanceScore: number
  importanceLevel: ImportanceLevel
  socialScore: SocialScore

  isRead: boolean
  isSaved: boolean
}

export interface SummarizeResult {
  summary: string
  keyPoints: string[]
  whyItMatters: string
  category: Category
  tags: string[]
  importanceScore: number
}
