import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { audit, estimateAiCost, normalizeUrl, type AuditReport } from '@plugd/audit'
import { planMarkdown, reportMarkdown } from './markdown'
import { alertMarkdown, reportLines, reportMarkdown as historyMarkdown } from './report'
import { enginesFromEnv, ensureConfig, estimateTrack, loadConfig, loadHistory, track } from './track'

const VERSION = '0.3.0'

// Last report per site, so get_fix_plan doesn't re-crawl or re-spend AI credits.
const cache = new Map<string, AuditReport>()

export async function runMcp(o: { allowLocal: boolean }): Promise<void> {
  const key = process.env.OPENROUTER_API_KEY
  const server = new McpServer({ name: 'plugd', version: VERSION })

  server.registerTool('audit_site', {
    title: 'Audit AI search visibility',
    description: `Audits a website for AI search visibility: whether AI crawlers (OAI-SearchBot, Claude-SearchBot, PerplexityBot, Googlebot, Bingbot…) can read it, structured data and meta issues, and${key ? ' what ChatGPT, Claude, Gemini and Perplexity actually answer when buyers ask about its category (spends the user\'s OpenRouter credits, roughly $0.05 per question)' : ' (no OPENROUTER_API_KEY set, so AI answers are not measured)'}. Returns a score, findings and a ranked fix plan. Call get_fix_plan next to get ready-to-apply code.`,
    inputSchema: {
      url: z.string().describe('Site to audit, e.g. "acme.com" or "https://acme.com"'),
      brand: z.string().optional().describe('Brand name as customers say it, if different from the site title'),
      check_ai: z.boolean().optional().describe('Ask the AI engines (needs OPENROUTER_API_KEY). Default true when a key is set.'),
      questions: z.number().int().min(1).max(20).optional().describe('How many buyer questions to ask each engine. Default 10.'),
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
  }, async ({ url, brand, check_ai, questions }) => {
    const useAi = Boolean(key) && check_ai !== false
    const n = questions ?? 10
    const report = await audit(url, { allowLocal: o.allowLocal, brand, ai: useAi ? { apiKey: key!, questions: n } : null, onStep: m => console.error(`[plugd] ${m}`) })
    cache.set(report.site.url, report)
    const note = useAi ? `\n\n_AI checks cost $${report.ai?.costUsd.toFixed(2)} (estimate was $${estimateAiCost(n).toFixed(2)})._` : ''
    return { content: [{ type: 'text', text: reportMarkdown(report) + note }] }
  })

  server.registerTool('get_fix_plan', {
    title: 'Get the AI visibility fix plan',
    description: 'Returns the ranked fix plan for a site with ready-to-apply artifacts: a corrected robots.txt, JSON-LD structured data, meta tags, outlines for pages that answer the buyer questions where the brand is missing, and outreach targets. Uses the latest audit_site result for that site, or runs a quick crawl-only audit. Apply code changes in the user\'s repo; outreach items are for a human.',
    inputSchema: { url: z.string().describe('Site, e.g. "acme.com"') },
    annotations: { readOnlyHint: true, openWorldHint: true },
  }, async ({ url }) => {
    let report = cache.get(normalizeUrl(url)) ?? [...cache.values()].find(r => r.site.domain === new URL(normalizeUrl(url)).hostname.replace(/^www\./, ''))
    if (!report) {
      report = await audit(url, { allowLocal: o.allowLocal, ai: null, onStep: m => console.error(`[plugd] ${m}`) })
      cache.set(report.site.url, report)
    }
    return { content: [{ type: 'text', text: planMarkdown(report) }] }
  })

  server.registerTool('track_questions', {
    title: 'Track AI answers for buyer questions',
    description: `Asks AI engines the site's saved buyer questions with live web search, scores whether each answer names and cites the brand, and appends the answers to local history (.plugd/ in the current folder by default). The first call for a site reads its homepage and writes the questions (or uses the ones you pass); later calls reuse them so runs compare. SPENDS THE USER'S OWN API CREDITS (Gemini with GEMINI_API_KEY, or OpenRouter): roughly $0.01–0.03 per question per engine, capped by max_cost. Confirm with the user before calling. Returns the trend so far.`,
    inputSchema: {
      url: z.string().optional().describe('Site to track, e.g. "acme.com". Needed on the first call for a folder.'),
      engines: z.array(z.enum(['gemini', 'chatgpt', 'claude', 'perplexity'])).optional().describe('Default: gemini when GEMINI_API_KEY is set, otherwise all four through OpenRouter.'),
      max_cost: z.number().positive().max(5).optional().describe('Stop starting new checks once this many US dollars are spent. Default 0.50.'),
      questions: z.array(z.string()).max(30).optional().describe('Your own buyer questions; only used on the first call for a folder.'),
      dir: z.string().optional().describe('History folder. Default ".plugd".'),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  }, async ({ url, engines: ids, max_cost, questions, dir = '.plugd' }) => {
    const engines = enginesFromEnv(ids)
    const { config } = await ensureConfig({ dir, target: url, engine: engines[0]!, questions, allowLocal: o.allowLocal, log: m => console.error(`[plugd] ${m}`) })
    const maxCost = max_cost ?? 0.5
    const res = await track({ dir, config, engines, maxCost })
    const failed = res.records.filter(r => r.error)
    const notes = [
      `This run: ${res.records.length - failed.length} answers, $${res.spentUsd.toFixed(3)} at list prices (estimate up to $${estimateTrack(engines.map(e => e.id), config.questions.length).toFixed(2)}, cap $${maxCost.toFixed(2)}).`,
      res.skipped ? `${res.skipped} checks skipped at the cost cap.` : '',
      failed.length ? `${failed.length} checks failed: ${failed[0]!.error}` : '',
    ].filter(Boolean)
    return { content: [{ type: 'text', text: [...reportLines(config, loadHistory(dir)), '', ...notes].join('\n') }] }
  })

  server.registerTool('get_history', {
    title: 'Get AI visibility history',
    description: 'Reads the local tracking history (from track_questions or `npx getplugd track`) and returns, per run and engine, how often AI named and cited the brand with 95% ranges, who was named instead, which sources the engines used, the questions where the brand was missing, and an alert if a run clearly dropped. Free: makes no API calls.',
    inputSchema: { dir: z.string().optional().describe('History folder. Default ".plugd".') },
    annotations: { readOnlyHint: true, openWorldHint: false },
  }, async ({ dir = '.plugd' }) => {
    const config = loadConfig(dir)
    if (!config) return { content: [{ type: 'text', text: `Nothing tracked in ${dir} yet. Call track_questions with a url first.` }] }
    const records = loadHistory(dir)
    const alert = alertMarkdown(config, records)
    return { content: [{ type: 'text', text: historyMarkdown(config, records) + (alert ? `\n## Alert\n\n${alert}\n` : '') }] }
  })

  await server.connect(new StdioServerTransport())
  console.error(`[plugd] MCP server ready (stdio)${key ? '' : ' · no OPENROUTER_API_KEY: AI answer checks disabled'}`)
}
