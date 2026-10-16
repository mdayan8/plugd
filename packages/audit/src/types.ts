export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface Finding {
  id: string
  severity: Severity
  title: string
  detail: string
  urls?: string[]
}

export interface PageInfo {
  url: string
  status: number
  title?: string
  description?: string
  lang?: string
  canonical?: string
  siteName?: string
  h1?: string
  noindex: boolean
  nosnippet: boolean
  maxSnippet?: number
  bingNoarchive: boolean
  bingNocache: boolean
  schemaTypes: string[]
  words: number
  modified?: string
}

export type BotKind = 'search' | 'training' | 'user'
export interface BotAccess { token: string; company: string; kind: BotKind; allowed: boolean }

export interface Site {
  url: string // normalised origin, e.g. https://acme.com
  domain: string
  brand: string
  description?: string
}

export interface EngineAnswer {
  engine: EngineId
  model: string
  question: string
  text: string
  citations: { url: string; title?: string }[]
  mentioned: boolean
  cited: boolean
  position?: number // 1-based rank among brands recommended, when mentioned
  brands: string[] // brands the answer recommends, in order
  costUsd: number
  error?: string
}

export type EngineId = 'chatgpt' | 'claude' | 'gemini' | 'perplexity'

export interface AiVisibility {
  questions: string[]
  answers: EngineAnswer[]
  mentionRate: number // 0..1 across all answers
  citationRate: number
  byEngine: Record<string, { mentioned: number; cited: number; total: number }>
  topCompetitors: { name: string; count: number }[]
  topSources: { domain: string; count: number }[]
  costUsd: number
}

export type FixKind = 'robots' | 'schema' | 'meta' | 'page' | 'outreach' | 'llms_txt'
export interface Fix {
  id: string
  kind: FixKind
  impact: 'high' | 'medium' | 'low'
  effort: 'minutes' | 'hours' | 'days'
  title: string
  why: string
  /** Ready-to-use artifact: a file, snippet or outline the agent can apply. */
  artifact?: { path?: string; language: string; content: string }
  /** Plain-language steps for a human or a coding agent. */
  steps: string[]
}

export interface AuditReport {
  version: 1
  site: Site
  scannedAt: string
  score: { total: number; access: number; content: number; visibility: number | null }
  bots: BotAccess[]
  robotsTxt: { found: boolean; content?: string }
  llmsTxt: boolean
  cdnBlocked: string[] // bot tokens that got a different (blocked) response
  pages: PageInfo[]
  findings: Finding[]
  ai: AiVisibility | null
  fixes: Fix[]
}
