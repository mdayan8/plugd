import type { Answer, Engine, EngineId, FetchLike } from './types'

// Default model per engine, each asked with OpenRouter's web search on.
export const OPENROUTER_MODELS: Record<EngineId, { label: string; model: string }> = {
  chatgpt: { label: 'ChatGPT', model: 'openai/gpt-5.4-mini' },
  claude: { label: 'Claude', model: 'anthropic/claude-haiku-5.5' },
  gemini: { label: 'Gemini', model: 'google/gemini-3.5-flash-lite' },
  perplexity: { label: 'Perplexity', model: 'perplexity/sonar' },
}

export interface OpenRouterOpts {
  apiKey: string
  engine: EngineId
  model?: string
  fetchImpl?: FetchLike
}

export interface ChatResult { text: string; citations: { url: string; title?: string }[]; cost: number }

export async function openRouterChat(o: { apiKey: string; fetchImpl?: FetchLike }, model: string, prompt: string, web: boolean, maxTokens: number): Promise<ChatResult> {
  const res = await (o.fetchImpl ?? fetch)('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${o.apiKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://github.com/mdayan8/plugd', 'X-Title': 'Plugd' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      usage: { include: true },
      ...(web ? { plugins: [{ id: 'web', max_results: 5 }] } : {}),
    }),
  })
  const body = await res.json().catch(() => ({})) as any
  if (!res.ok) throw new Error(body?.error?.message ?? `OpenRouter ${res.status}`)
  const msg = body.choices?.[0]?.message ?? {}
  const text = typeof msg.content === 'string' ? msg.content : Array.isArray(msg.content) ? msg.content.map((c: any) => c.text ?? '').join('') : ''
  const citations = (msg.annotations ?? []).filter((a: any) => a.type === 'url_citation' && a.url_citation?.url).map((a: any) => ({ url: a.url_citation.url, title: a.url_citation.title }))
  return { text, citations, cost: Number(body.usage?.cost ?? 0) }
}

export function openRouter(o: OpenRouterOpts): Engine {
  const model = o.model ?? OPENROUTER_MODELS[o.engine].model
  return {
    id: o.engine, label: OPENROUTER_MODELS[o.engine].label, model, surface: 'api',
    async ask(question): Promise<Answer> {
      const r = await openRouterChat(o, model, question, true, 900)
      // OpenRouter's web plugin runs one search per request and folds its fee into usage.cost.
      return { text: r.text, citations: r.citations, model, searchCalls: 1, costUsd: r.cost }
    },
    async complete(prompt, maxTokens = 600) {
      const r = await openRouterChat(o, model, prompt, false, maxTokens)
      return { text: r.text, costUsd: r.cost }
    },
  }
}
