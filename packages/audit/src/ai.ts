import { extractBrands, generateQuestions, hostOf, mentions, openRouter, OPENROUTER_MODELS, openRouterChat, parseJson, pool } from '@getplugd/engines'
import type { AiVisibility, EngineAnswer, EngineId, Site } from './types'

export { hostOf, mentions, parseJson }

export const ENGINES = OPENROUTER_MODELS
export const HELPER_MODEL = 'anthropic/claude-haiku-5.5'
// Rough per-question cost (search fee + typical tokens), shown before spending.
export const EST_COST: Record<EngineId, number> = { chatgpt: 0.014, claude: 0.012, gemini: 0.017, perplexity: 0.007 }

export interface AiOpts {
  apiKey: string
  questions?: number
  engines?: EngineId[]
  models?: Partial<Record<EngineId, string>>
  customQuestions?: string[]
  fetchImpl?: typeof fetch
  onProgress?: (done: number, total: number) => void
}

export function aliasesFor(site: Site): string[] {
  const label = site.domain.split('.')[0]!
  return [...new Set([site.brand, site.domain, label.length > 3 ? label : ''].filter(Boolean).map(s => s.toLowerCase()))]
}


// Helper calls (questions, brand extraction) run on one cheap model through the same OpenRouter key.
const helper = (o: AiOpts) => openRouter({ apiKey: o.apiKey, engine: 'claude', model: HELPER_MODEL, fetchImpl: o.fetchImpl })

export async function checkVisibility(o: AiOpts, site: Site, context: string): Promise<AiVisibility> {
  const engines = o.engines ?? (Object.keys(ENGINES) as EngineId[])
  let helperCost = 0
  let questions = o.customQuestions ?? []
  if (!questions.length) { const g = await generateQuestions(helper(o), site, context, o.questions ?? 10); questions = g.questions; helperCost += g.costUsd }
  if (!questions.length) throw new Error('Could not generate buyer questions for this site. Pass your own with --question.')
  const aliases = aliasesFor(site)
  const jobs = questions.flatMap(q => engines.map(e => ({ q, e })))
  let done = 0

  const answers = await pool(jobs, 6, async ({ q, e }): Promise<EngineAnswer> => {
    const model = o.models?.[e] ?? ENGINES[e].model
    try {
      const r = await openRouterChat(o, model, q, true, 900)
      const b = await extractBrands(helper(o), r.text)
      helperCost += b.costUsd
      const mentioned = mentions(r.text, aliases)
      const idx = b.brands.findIndex(x => mentions(x, aliases) || aliases.some(a => x.toLowerCase().includes(a)))
      return { engine: e, model, question: q, text: r.text, citations: r.citations, mentioned, cited: r.citations.some(c => hostOf(c.url).endsWith(site.domain)), position: idx >= 0 ? idx + 1 : undefined, brands: b.brands, costUsd: r.cost }
    } catch (err) {
      return { engine: e, model, question: q, text: '', citations: [], mentioned: false, cited: false, brands: [], costUsd: 0, error: (err as Error).message }
    } finally {
      o.onProgress?.(++done, jobs.length)
    }
  })

  const ok = answers.filter(a => !a.error)
  if (!ok.length) throw new Error(answers[0]?.error ?? 'Every AI check failed')
  const byEngine: AiVisibility['byEngine'] = {}
  for (const a of ok) {
    const k = ENGINES[a.engine].label
    byEngine[k] ??= { mentioned: 0, cited: 0, total: 0 }
    byEngine[k].total++; if (a.mentioned) byEngine[k].mentioned++; if (a.cited) byEngine[k].cited++
  }
  const tally = (xs: string[]) => [...xs.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map<string, number>())].sort((a, b) => b[1] - a[1])
  const competitors = tally(ok.flatMap(a => a.brands.filter(b => !mentions(b, aliases)).map(b => b.trim())))
  const sources = tally(ok.flatMap(a => [...new Set(a.citations.map(c => hostOf(c.url)).filter(h => h && !h.endsWith(site.domain)))]))

  return {
    questions,
    answers,
    mentionRate: ok.filter(a => a.mentioned).length / ok.length,
    citationRate: ok.filter(a => a.cited).length / ok.length,
    byEngine,
    topCompetitors: competitors.slice(0, 8).map(([name, count]) => ({ name, count })),
    topSources: sources.slice(0, 10).map(([domain, count]) => ({ domain, count })),
    costUsd: answers.reduce((s, a) => s + a.costUsd, 0) + helperCost,
  }
}
