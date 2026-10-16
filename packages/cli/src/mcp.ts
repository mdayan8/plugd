import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { audit, estimateAiCost, normalizeUrl, type AuditReport } from '@plugd/audit'
import { planMarkdown, reportMarkdown } from './markdown'

const VERSION = '0.2.0'

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

  await server.connect(new StdioServerTransport())
  console.error(`[plugd] MCP server ready (stdio)${key ? '' : ' · no OPENROUTER_API_KEY: AI answer checks disabled'}`)
}
