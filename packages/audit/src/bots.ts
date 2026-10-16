import type { BotKind } from './types'

// Official AI crawler tokens (sources linked in blog/robots-txt-ai-crawlers).
// search = needed to be cited in AI answers · training = model training only · user = live fetch on a user's request
export const AI_BOTS: { token: string; company: string; kind: BotKind }[] = [
  { token: 'OAI-SearchBot', company: 'OpenAI', kind: 'search' },
  { token: 'ChatGPT-User', company: 'OpenAI', kind: 'user' },
  { token: 'GPTBot', company: 'OpenAI', kind: 'training' },
  { token: 'Claude-SearchBot', company: 'Anthropic', kind: 'search' },
  { token: 'Claude-User', company: 'Anthropic', kind: 'user' },
  { token: 'ClaudeBot', company: 'Anthropic', kind: 'training' },
  { token: 'PerplexityBot', company: 'Perplexity', kind: 'search' },
  { token: 'Perplexity-User', company: 'Perplexity', kind: 'user' },
  { token: 'Googlebot', company: 'Google (Search, AI Overviews, AI Mode)', kind: 'search' },
  { token: 'Google-Extended', company: 'Google (Gemini training)', kind: 'training' },
  { token: 'Bingbot', company: 'Microsoft (Bing, Copilot)', kind: 'search' },
  { token: 'Applebot', company: 'Apple', kind: 'search' },
  { token: 'Applebot-Extended', company: 'Apple', kind: 'training' },
  { token: 'DuckAssistBot', company: 'DuckDuckGo', kind: 'user' },
  { token: 'meta-webindexer', company: 'Meta', kind: 'search' },
  { token: 'meta-externalagent', company: 'Meta', kind: 'training' },
  { token: 'Amzn-SearchBot', company: 'Amazon', kind: 'search' },
  { token: 'Amazonbot', company: 'Amazon', kind: 'training' },
  { token: 'MistralAI-Index', company: 'Mistral', kind: 'search' },
  { token: 'MistralAI-User', company: 'Mistral', kind: 'user' },
  { token: 'CCBot', company: 'Common Crawl', kind: 'training' },
]

// Realistic UA strings used only for the "does your CDN/WAF block AI bots?" heuristic.
export const PROBE_UAS: Record<string, string> = {
  browser: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0 Safari/537.36',
  'OAI-SearchBot': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.3; +https://openai.com/searchbot',
  'Claude-SearchBot': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-SearchBot/1.0; +https://www.anthropic.com)',
  PerplexityBot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
}
