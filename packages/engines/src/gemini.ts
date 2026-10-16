import type { Answer, Citation, Engine, FetchLike } from './types'

// Paid-tier list prices (USD), https://ai.google.dev/gemini-api/docs/pricing, checked 2026-10-16.
// Search grounding on Gemini 3+ bills each search query the model runs; the first 5,000 a month are free.
const PRICES: Record<string, { input: number; output: number }> = {
  'gemini-3.5-flash-lite': { input: 0.3 / 1e6, output: 2.5 / 1e6 },
  'gemini-3.8-flash': { input: 0.75 / 1e6, output: 3.75 / 1e6 },
}
export const GEMINI_SEARCH_PRICE = 14 / 1000
export const GEMINI_FREE_SEARCHES_PER_MONTH = 5000

export interface GeminiOpts {
  apiKey: string
  /** Defaults to the cheapest model that supports Google Search grounding. */
  model?: string
  fetchImpl?: FetchLike
}

// Interactions API: https://ai.google.dev/gemini-api/docs/google-search
interface Interaction {
  steps?: Array<{
    type: string
    arguments?: { queries?: string[] }
    content?: Array<{ type: string; text?: string; annotations?: Array<{ type: string; url?: string; title?: string }> }>
  }>
  usage?: { total_input_tokens?: number; total_output_tokens?: number; total_thought_tokens?: number }
  error?: { message?: string }
}

export function gemini(o: GeminiOpts): Engine {
  const model = o.model ?? 'gemini-3.5-flash-lite'
  const price = PRICES[model] ?? PRICES['gemini-3.8-flash']!

  async function interact(input: string, search: boolean, maxTokens: number): Promise<Interaction> {
    const res = await (o.fetchImpl ?? fetch)('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: { 'x-goog-api-key': o.apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        input,
        ...(search ? { tools: [{ type: 'google_search' }] } : {}),
        // Thinking tokens bill as output; buyer questions don't need deep reasoning.
        generation_config: { max_output_tokens: maxTokens, thinking_level: 'low' },
      }),
    })
    const body = await res.json().catch(() => ({})) as Interaction
    if (!res.ok) throw new Error(body.error?.message ?? `Gemini ${res.status}`)
    return body
  }

  const tokenCost = (i: Interaction) =>
    (i.usage?.total_input_tokens ?? 0) * price.input +
    ((i.usage?.total_output_tokens ?? 0) + (i.usage?.total_thought_tokens ?? 0)) * price.output

  const textOf = (i: Interaction) => (i.steps ?? [])
    .filter(s => s.type === 'model_output')
    .flatMap(s => s.content ?? [])
    .filter(c => c.type === 'text')
    .map(c => c.text ?? '')
    .join('')

  return {
    id: 'gemini', label: 'Gemini', model, surface: 'api',

    async ask(question): Promise<Answer> {
      const i = await interact(question, true, 2048)
      const steps = i.steps ?? []
      // Empty queries aren't billed.
      const searchCalls = steps.filter(s => s.type === 'google_search_call').flatMap(s => s.arguments?.queries ?? []).filter(q => q.trim()).length
      const seen = new Set<string>()
      const citations: Citation[] = []
      for (const c of steps.filter(s => s.type === 'model_output').flatMap(s => s.content ?? [])) {
        for (const a of c.annotations ?? []) {
          if (a.type !== 'url_citation' || !a.url || seen.has(a.url)) continue
          seen.add(a.url)
          citations.push({ url: a.url, title: a.title })
        }
      }
      return { text: textOf(i), citations, model, searchCalls, costUsd: tokenCost(i) + searchCalls * GEMINI_SEARCH_PRICE }
    },

    async complete(prompt, maxTokens = 600) {
      const i = await interact(prompt, false, maxTokens)
      return { text: textOf(i), costUsd: tokenCost(i) }
    },
  }
}
