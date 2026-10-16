import { checkVisibility, ENGINES, EST_COST, type AiOpts } from './ai'
import { PROBE_UAS } from './bots'
import { get } from './fetcher'
import { findings as computeFindings, score as computeScore } from './findings'
import { analyzePage, sitemapUrls } from './page'
import { fixPlan } from './plan'
import { botAccess, sitemapsFrom } from './robots'
import type { AuditReport, PageInfo, Site } from './types'

export * from './types'
export { ENGINES, EST_COST, aliasesFor, mentions } from './ai'
export { AI_BOTS } from './bots'
export { recommendedRobots, parseRobotsGroups } from './plan'
export { analyzePage } from './page'
export { botAccess } from './robots'

export interface AuditOpts {
  maxPages?: number
  allowLocal?: boolean
  brand?: string
  ai?: Omit<AiOpts, 'onProgress'> | null
  onStep?: (msg: string) => void
  onAiProgress?: (done: number, total: number) => void
}

export function normalizeUrl(input: string): string {
  const withScheme = /^https?:\/\//i.test(input.trim()) ? input.trim() : `https://${input.trim()}`
  return new URL(withScheme).origin
}

function brandFrom(home: PageInfo | undefined, domain: string): string {
  if (home?.siteName) return home.siteName
  const first = home?.title?.split(/\s[|–—\-:·]\s/)[0]?.trim()
  if (first && first.length <= 40) return first
  const label = domain.split('.')[0]!
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function estimateAiCost(questions: number, engines = Object.keys(ENGINES) as (keyof typeof EST_COST)[]): number {
  return questions * engines.reduce((s, e) => s + EST_COST[e], 0) + 0.01
}

export async function audit(input: string, o: AuditOpts = {}): Promise<AuditReport> {
  const origin = normalizeUrl(input)
  const g = (u: string, ua?: string) => get(u, { ua, allowLocal: o.allowLocal })
  const step = o.onStep ?? (() => {})

  step('Reading robots.txt')
  const robotsRes = await g(`${origin}/robots.txt`)
  const robotsFound = robotsRes.status === 200 && !/<html/i.test(robotsRes.text.slice(0, 200))
  const robotsTxt = robotsFound ? robotsRes.text : undefined
  const bots = botAccess(`${origin}/robots.txt`, robotsTxt)

  step('Fetching the homepage')
  const homeRes = await g(`${origin}/`)
  if (homeRes.error) throw new Error(`Couldn't reach ${origin}: ${homeRes.error}`)
  const finalOrigin = new URL(homeRes.url).origin
  const domain = new URL(finalOrigin).hostname.replace(/^www\./, '')
  const pages: PageInfo[] = [analyzePage(homeRes.url, homeRes.status, homeRes.text)]

  step('Reading your sitemap')
  let urls: string[] = []
  let sitemap = false
  for (const sm of [...sitemapsFrom(`${origin}/robots.txt`, robotsTxt), `${finalOrigin}/sitemap.xml`].slice(0, 3)) {
    const r = await g(sm)
    if (r.status !== 200 || !/<(urlset|sitemapindex)/i.test(r.text)) continue
    sitemap = true
    const { pages: p, children } = sitemapUrls(r.text)
    urls.push(...p)
    for (const c of children.slice(0, 2)) { const cr = await g(c); if (cr.status === 200) urls.push(...sitemapUrls(cr.text).pages) }
    if (urls.length) break
  }
  urls = [...new Set(urls)].filter(u => { try { return new URL(u).hostname.replace(/^www\./, '') === domain && new URL(u).pathname !== '/' } catch { return false } }).slice(0, (o.maxPages ?? 10) - 1)

  if (urls.length) step(`Checking ${urls.length} more page${urls.length > 1 ? 's' : ''}`)
  pages.push(...await Promise.all(urls.map(async u => { const r = await g(u); return analyzePage(u, r.status, r.text) })))

  step('Checking whether your CDN lets AI bots in')
  const browser = homeRes.status
  const cdnBlocked: string[] = []
  for (const [token, ua] of Object.entries(PROBE_UAS)) {
    if (token === 'browser') continue
    const r = await g(`${finalOrigin}/`, ua)
    if (browser < 400 && (r.status >= 400 || r.status === 0)) cdnBlocked.push(token)
  }
  const llms = await g(`${finalOrigin}/llms.txt`)
  const llmsTxt = llms.status === 200 && !/<html/i.test(llms.text.slice(0, 200))

  const home = pages[0]!
  const site: Site = { url: finalOrigin, domain, brand: o.brand ?? brandFrom(home, domain), description: home.description }

  let ai: AuditReport['ai'] = null
  if (o.ai) {
    step('Asking ChatGPT, Claude, Gemini and Perplexity')
    const context = [home.title, home.description, home.h1].filter(Boolean).join(' · ')
    ai = await checkVisibility({ ...o.ai, onProgress: o.onAiProgress }, site, context)
  }

  const f = computeFindings({ bots, robotsFound, cdnBlocked, pages, sitemap, llmsTxt, ai, brand: site.brand })
  return {
    version: 1,
    site,
    scannedAt: new Date().toISOString(),
    score: computeScore({ bots, cdnBlocked, pages, sitemap, ai }),
    bots,
    robotsTxt: { found: robotsFound, content: robotsTxt },
    llmsTxt,
    cdnBlocked,
    pages,
    findings: f,
    ai,
    fixes: fixPlan({ site, findings: f, bots, robotsTxt, pages, cdnBlocked, ai }),
  }
}
