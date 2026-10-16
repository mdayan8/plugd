import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { cites, extractBrands, mentions, pool, type Citation, type Engine } from '@getplugd/engines'
import { EST_COST, type EngineId } from '@plugd/audit'

// What's tracked lives in a folder you can commit: plugd.json (site + frozen questions) and history.jsonl (one line per answer).
export interface TrackConfig { site: string; domain: string; brand: string; aliases: string[]; questions: string[]; createdAt: string }

export interface TrackRecord {
  v: 1
  runId: string
  at: string
  domain: string
  engine: EngineId
  surface: 'api'
  model: string
  question: string
  text: string
  citations: Citation[]
  brands: string[]
  mentioned: boolean
  cited: boolean
  searchCalls: number
  costUsd: number
  error?: string
}

const cfgPath = (dir: string) => join(dir, 'plugd.json')
const histPath = (dir: string) => join(dir, 'history.jsonl')

export const loadConfig = (dir: string): TrackConfig | null => existsSync(cfgPath(dir)) ? JSON.parse(readFileSync(cfgPath(dir), 'utf8')) : null
export function saveConfig(dir: string, c: TrackConfig): void {
  mkdirSync(dir, { recursive: true })
  writeFileSync(cfgPath(dir), JSON.stringify(c, null, 2) + '\n')
}
export const loadHistory = (dir: string): TrackRecord[] => existsSync(histPath(dir))
  ? readFileSync(histPath(dir), 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l) as TrackRecord)
  : []

// Worst-case cost per question: the answer plus brand extraction. Gemini's figure assumes ~2 billed searches at list
// price; the first 5,000 searches a month on a billed Google project are free, so real cost is usually far lower.
export const PER_QUESTION: Record<EngineId, number> = { gemini: 0.032, chatgpt: EST_COST.chatgpt + 0.002, claude: EST_COST.claude + 0.002, perplexity: EST_COST.perplexity + 0.002 }
export const estimateTrack = (engines: EngineId[], questions: number) => questions * engines.reduce((s, e) => s + PER_QUESTION[e], 0)

export interface TrackOpts {
  dir: string
  config: TrackConfig
  engines: Engine[]
  /** Stop starting new checks once this much has been spent (USD). */
  maxCost?: number
  concurrency?: number
  now?: () => Date
  onProgress?: (done: number, total: number) => void
}

export interface TrackResult { runId: string; records: TrackRecord[]; skipped: number; spentUsd: number }

export async function track(o: TrackOpts): Promise<TrackResult> {
  const now = o.now ?? (() => new Date())
  const runId = now().toISOString()
  const jobs = o.config.questions.flatMap(question => o.engines.map(engine => ({ question, engine })))
  let spent = 0, done = 0, skipped = 0
  mkdirSync(o.dir, { recursive: true })

  const results = await pool(jobs, o.concurrency ?? 4, async ({ question, engine }): Promise<TrackRecord | null> => {
    // Reserve the worst case before starting, so parallel checks can't overshoot the cap.
    const reserve = PER_QUESTION[engine.id]
    if (o.maxCost !== undefined && spent + reserve > o.maxCost) { skipped++; o.onProgress?.(++done, jobs.length); return null }
    spent += reserve
    const base = { v: 1 as const, runId, at: now().toISOString(), domain: o.config.domain, engine: engine.id, surface: engine.surface, model: engine.model, question }
    let rec: TrackRecord
    try {
      const a = await engine.ask(question)
      const b = await extractBrands(engine, a.text)
      rec = { ...base, model: a.model, text: a.text, citations: a.citations, brands: b.brands, mentioned: mentions(a.text, o.config.aliases), cited: cites(a.citations, o.config.domain), searchCalls: a.searchCalls, costUsd: a.costUsd + b.costUsd }
    } catch (err) {
      rec = { ...base, text: '', citations: [], brands: [], mentioned: false, cited: false, searchCalls: 0, costUsd: 0, error: (err as Error).message }
    }
    spent += rec.costUsd - reserve
    // Append as each answer lands, so an interrupted run keeps what it paid for.
    appendFileSync(histPath(o.dir), JSON.stringify(rec) + '\n')
    o.onProgress?.(++done, jobs.length)
    return rec
  })

  const records = results.filter((r): r is TrackRecord => r !== null)
  return { runId, records, skipped, spentUsd: records.reduce((s, r) => s + r.costUsd, 0) }
}
