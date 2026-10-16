import { hostOf, mentions, OPENROUTER_MODELS, openRouterChat, parseJson } from '@getplugd/engines'
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


export async function generateQuestions(o: AiOpts, site: Site, context: string, n: number): Promise<{ questions: string[]; cost: number }> {
  const prompt = `You help a company measure whether AI assistants recommend it.
Company: ${site.brand} (${site.domain})
What the site says: ${context.slice(0, 1500)}

Write ${n} realistic questions a potential customer would type into ChatGPT when looking for a product or service like this, WITHOUT naming ${site.brand}. Mix: "best X for Y", "alternatives to <a well-known competitor>", "X vs Y", "how do I <job it solves>", and pricing questions. Keep each under 15 words, in the site's language.
Return only JSON: {"questions": ["..."]}`
  const r = await openRouterChat(o, HELPER_MODEL, prompt, false, 600)
  const qs = parseJson<{ questions?: string[] }>(r.text, {}).questions ?? []
  return { questions: qs.map(q => q.trim()).filter(Boolean).slice(0, n), cost: r.cost }
}

async function brandsIn(o: AiOpts, answer: string): Promise<{ brands: string[]; cost: number }> {
  if (!answer.trim()) return { brands: [], cost: 0 }
  const r = await openRouterChat(o, HELPER_MODEL, `List the brands, products or companies this answer recommends or names as options, in the order they appear. Return only JSON: {"brands": ["..."]}\n\nANSWER:\n${answer.slice(0, 6000)}`, false, 300)
  return { brands: parseJson<{ brands?: string[] }>(r.text, {}).brands?.slice(0, 15) ?? [], cost: r.cost }
}

async function pool<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length)
  let next = 0
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) { const i = next++; out[i] = await fn(items[i]!) }
  }))
  return out
}

export async function checkVisibility(o: AiOpts, site: Site, context: string): Promise<AiVisibility> {
  const engines = o.engines ?? (Object.keys(ENGINES) as EngineId[])
  let helperCost = 0
  let questions = o.customQuestions ?? []
  if (!questions.length) { const g = await generateQuestions(o, site, context, o.questions ?? 10); questions = g.questions; helperCost += g.cost }
  if (!questions.length) throw new Error('Could not generate buyer questions for this site. Pass your own with --question.')
  const aliases = aliasesFor(site)
  const jobs = questions.flatMap(q => engines.map(e => ({ q, e })))
  let done = 0

  const answers = await pool(jobs, 6, async ({ q, e }): Promise<EngineAnswer> => {
    const model = o.models?.[e] ?? ENGINES[e].model
    try {
      const r = await openRouterChat(o, model, q, true, 900)
      const b = await brandsIn(o, r.text)
      helperCost += b.cost
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
