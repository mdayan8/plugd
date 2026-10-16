import type { Citation, Engine } from './types'

// Models sometimes wrap JSON in prose or code fences.
export function parseJson<T>(text: string, fallback: T): T {
  const m = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
  try { return m ? JSON.parse(m[0]) : fallback } catch { return fallback }
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
/** Whole-word, case-insensitive match of any alias. Deterministic on purpose: "were you mentioned" is never left to a model. */
export const mentions = (text: string, aliases: string[]) => aliases.some(a => new RegExp(`(^|[^a-z0-9])${esc(a)}([^a-z0-9]|$)`, 'i').test(text))
export const hostOf = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, '') } catch { return '' } }

/** Gemini cites through redirect URLs and puts the real domain in the title; other engines give the real URL. */
export const citedDomain = (c: Citation) => {
  const h = hostOf(c.url)
  return h.endsWith('vertexaisearch.cloud.google.com') && c.title ? c.title.replace(/^www\./, '').toLowerCase() : h
}
export const cites = (citations: Citation[], domain: string) => citations.some(c => { const d = citedDomain(c); return d === domain || d.endsWith(`.${domain}`) })

/** The brands an answer recommends or names, in the order they appear. Uses the engine's own model, so one key is enough. */
export async function extractBrands(engine: Pick<Engine, 'complete'>, answer: string): Promise<{ brands: string[]; costUsd: number }> {
  if (!answer.trim()) return { brands: [], costUsd: 0 }
  const r = await engine.complete(`List the brands, products or companies this answer recommends or names as options, in the order they appear. Return only JSON: {"brands": ["..."]}\n\nANSWER:\n${answer.slice(0, 6000)}`, 300)
  return { brands: parseJson<{ brands?: string[] }>(r.text, {}).brands?.map(b => b.trim()).filter(Boolean).slice(0, 15) ?? [], costUsd: r.costUsd }
}
