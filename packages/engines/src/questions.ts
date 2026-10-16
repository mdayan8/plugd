import { parseJson } from './brands'
import type { Engine } from './types'

/** Realistic buyer questions for a site's category, without naming the brand. Prompt: prompts/buyer-questions.md. */
export async function generateQuestions(engine: Pick<Engine, 'complete'>, site: { brand: string; domain: string }, context: string, n: number): Promise<{ questions: string[]; costUsd: number }> {
  const prompt = `You help a company measure whether AI assistants recommend it.
Company: ${site.brand} (${site.domain})
What the site says: ${context.slice(0, 1500)}

Write ${n} realistic questions a potential customer would type into ChatGPT when looking for a product or service like this, WITHOUT naming ${site.brand}. Mix: "best X for Y", "alternatives to <a well-known competitor>", "X vs Y", "how do I <job it solves>", and pricing questions. Keep each under 15 words, in the site's language.
Return only JSON: {"questions": ["..."]}`
  const r = await engine.complete(prompt, 600)
  const qs = parseJson<{ questions?: string[] }>(r.text, {}).questions ?? []
  return { questions: qs.map(q => q.trim()).filter(Boolean).slice(0, n), costUsd: r.costUsd }
}
