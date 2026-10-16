export type EngineId = 'chatgpt' | 'claude' | 'gemini' | 'perplexity'

export interface Citation { url: string; title?: string }

export interface Answer {
  text: string
  citations: Citation[]
  model: string
  /** Web searches the engine ran. Gemini bills each one; the free monthly allowance counts these. */
  searchCalls: number
  costUsd: number
}

/** What every engine provider implements. `surface` is where the answer came from: always the API for now. */
export interface Engine {
  id: EngineId
  label: string
  model: string
  surface: 'api'
  /** Ask a buyer question with live web search on, the way a person would ask the assistant. */
  ask(question: string): Promise<Answer>
  /** A plain completion with no web search, for helper work like brand extraction. */
  complete(prompt: string, maxTokens?: number): Promise<{ text: string; costUsd: number }>
}

export type FetchLike = typeof fetch
