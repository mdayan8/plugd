import { describe, expect, it } from 'vitest'
import robotsParser from 'robots-parser'
import { checkVisibility, mentions, parseJson, aliasesFor } from './ai'
import { findings, score } from './findings'
import { analyzePage, sitemapUrls } from './page'
import { fixPlan, recommendedRobots } from './plan'
import { botAccess } from './robots'
import type { Site } from './types'

const ROBOTS = `User-agent: *
Disallow: /admin
Disallow: /api/

User-agent: GPTBot
User-agent: OAI-SearchBot
Disallow: /

User-agent: PerplexityBot
Disallow: /

Sitemap: https://acme.com/sitemap.xml`

const allowed = (r: string | undefined, token: string) => botAccess('https://acme.com/robots.txt', r).find(b => b.token === token)!.allowed

describe('robots evaluation', () => {
  it('reads per-bot groups', () => {
    expect(allowed(ROBOTS, 'OAI-SearchBot')).toBe(false)
    expect(allowed(ROBOTS, 'GPTBot')).toBe(false)
    expect(allowed(ROBOTS, 'PerplexityBot')).toBe(false)
    expect(allowed(ROBOTS, 'ClaudeBot')).toBe(true) // falls back to *, which allows /
    expect(allowed(undefined, 'Googlebot')).toBe(true)
    expect(allowed('User-agent: *\nDisallow: /', 'Bingbot')).toBe(false)
  })
})

describe('recommended robots.txt', () => {
  const bots = botAccess('https://acme.com/robots.txt', ROBOTS)
  const out = recommendedRobots(ROBOTS, bots, 'https://acme.com')
  it('unblocks AI search bots but keeps private paths', () => {
    expect(allowed(out, 'OAI-SearchBot')).toBe(true)
    expect(allowed(out, 'PerplexityBot')).toBe(true)
    const r = botAccess('https://acme.com/robots.txt', out)
    expect(r.every(b => b.kind === 'training' || b.allowed)).toBe(true)
    expect(out).toContain('Disallow: /admin')
  })
  it('keeps the training opt-out it found and the sitemap', () => {
    expect(allowed(out, 'GPTBot')).toBe(false)
    expect(out).toContain('Sitemap: https://acme.com/sitemap.xml')
  })
  it('leaves bots that were already allowed (and their own rules) untouched', () => {
    const cur = `${ROBOTS}\n\nUser-agent: Googlebot\nDisallow: /private-for-google`
    const o = recommendedRobots(cur, botAccess('https://acme.com/robots.txt', cur), 'https://acme.com')
    expect(o).toMatch(/User-agent: Googlebot\nDisallow: \/private-for-google/)
    expect(o.split('\n').filter(l => l === 'User-agent: Googlebot')).toHaveLength(1)
    const fine = 'User-agent: *\nAllow: /'
    expect(recommendedRobots(fine, botAccess('https://a.co/robots.txt', fine), 'https://a.co')).toBe(fine)
  })
  it('a blanket "Disallow: /" for * does not hide the site from AI search', () => {
    const o2 = recommendedRobots('User-agent: *\nDisallow: /', botAccess('https://a.co/robots.txt', 'User-agent: *\nDisallow: /'), 'https://a.co')
    expect(allowed(o2, 'Claude-SearchBot')).toBe(true)
    expect(robotsParser('https://a.co/robots.txt', o2).isAllowed('https://a.co/', 'SomeRandomBot')).toBe(false) // * group kept as-is
  })
})

describe('page analysis', () => {
  const html = `<html lang="en"><head><title>Acme — Analytics for indie SaaS</title>
  <meta name="description" content="Cookieless analytics."><meta name="robots" content="index, max-snippet:30">
  <meta property="og:site_name" content="Acme">
  <script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Organization","name":"Acme"},{"@type":["SoftwareApplication","Product"]}]}</script>
  <script type="application/ld+json">{ broken json</script></head>
  <body><h1>Know your traffic</h1><p>${'word '.repeat(400)}</p><script>var x = 'not counted'</script></body></html>`
  const p = analyzePage('https://acme.com/', 200, html)
  it('extracts meta, schema and text', () => {
    expect(p).toMatchObject({ title: 'Acme — Analytics for indie SaaS', description: 'Cookieless analytics.', siteName: 'Acme', h1: 'Know your traffic', lang: 'en', maxSnippet: 30, noindex: false })
    expect(p.schemaTypes.sort()).toEqual(['Organization', 'Product', 'SoftwareApplication'])
    expect(p.words).toBeGreaterThan(395)
  })
  it('reads sitemaps and sitemap indexes', () => {
    expect(sitemapUrls('<urlset><url><loc>https://a.co/x</loc></url></urlset>').pages).toEqual(['https://a.co/x'])
    expect(sitemapUrls('<sitemapindex><sitemap><loc>https://a.co/s1.xml</loc></sitemap></sitemapindex>').children).toEqual(['https://a.co/s1.xml'])
  })
})

describe('findings + score + plan', () => {
  const bots = botAccess('https://acme.com/robots.txt', ROBOTS)
  const home = analyzePage('https://acme.com/', 200, '<html><head><title>Acme</title></head><body><h1>Hi</h1></body></html>')
  const f = findings({ bots, robotsFound: true, cdnBlocked: [], pages: [home], sitemap: true, llmsTxt: false, ai: null, brand: 'Acme' })
  it('flags blocked search bots as critical and sorts by severity', () => {
    expect(f[0]).toMatchObject({ id: 'search-bots-blocked', severity: 'critical' })
    expect(f.map(x => x.id)).toEqual(expect.arrayContaining(['no-org-schema', 'no-description', 'thin-home', 'training-bots-blocked', 'no-llms-txt']))
  })
  it('scores out of 100 without AI', () => {
    const s = score({ bots, cdnBlocked: [], pages: [home], sitemap: true, ai: null })
    expect(s.visibility).toBeNull()
    expect(s.total).toBeGreaterThanOrEqual(0)
    expect(s.total).toBeLessThan(60)
  })
  it('turns findings into ranked fixes with artifacts', () => {
    const site: Site = { url: 'https://acme.com', domain: 'acme.com', brand: 'Acme' }
    const plan = fixPlan({ site, findings: f, bots, robotsTxt: ROBOTS, pages: [home], cdnBlocked: [], ai: null })
    expect(plan[0]!.id).toBe('robots')
    expect(plan.find(x => x.id === 'schema')!.artifact!.content).toContain('"Organization"')
    expect(plan.at(-1)!.impact).toBe('low')
  })
})

describe('mention matching', () => {
  const al = aliasesFor({ url: 'https://plausible.io', domain: 'plausible.io', brand: 'Plausible' })
  it('matches brand and domain on word boundaries', () => {
    expect(mentions('Try Plausible for privacy', al)).toBe(true)
    expect(mentions('see plausible.io', al)).toBe(true)
    expect(mentions('That is implausible.', al)).toBe(false)
  })
  it('parses JSON wrapped in prose', () => {
    expect(parseJson('Sure! ```json\n{"brands":["A","B"]}\n```', {})).toEqual({ brands: ['A', 'B'] })
    expect(parseJson('nope', { x: 1 })).toEqual({ x: 1 })
  })
})

describe('AI visibility (mocked OpenRouter)', () => {
  const site: Site = { url: 'https://acme.com', domain: 'acme.com', brand: 'Acme' }
  const reply = (content: string, annotations: unknown[] = [], cost = 0.01) => new Response(JSON.stringify({ choices: [{ message: { content, annotations } }], usage: { cost } }))
  const fetchImpl = (async (_url: string, init: RequestInit) => {
    const body = JSON.parse(String(init.body))
    const prompt: string = body.messages[0].content
    if (prompt.startsWith('You help a company')) return reply('{"questions":["best analytics for saas?","tallyhq alternatives?"]}')
    if (prompt.startsWith('List the brands')) return reply(prompt.includes('Acme') ? '{"brands":["Tallyhq","Acme"]}' : '{"brands":["Tallyhq","Metricor"]}', [], 0.0005)
    if (body.model.startsWith('perplexity')) return new Response(JSON.stringify({ error: { message: 'rate limited' } }), { status: 429 })
    const cites = [{ type: 'url_citation', url_citation: { url: 'https://www.reddit.com/r/SaaS/x', title: 'r' } }]
    if (body.model.startsWith('openai') && prompt.startsWith('best')) return reply('Pick Tallyhq or Acme.', [...cites, { type: 'url_citation', url_citation: { url: 'https://acme.com/compare' } }])
    return reply('Tallyhq and Metricor are popular.', cites)
  }) as unknown as typeof fetch

  it('measures mentions, citations, competitors and sources; survives one engine failing', async () => {
    let progress = 0
    const v = await checkVisibility({ apiKey: 'k', fetchImpl, onProgress: d => (progress = d) }, site, 'analytics')
    expect(v.questions).toHaveLength(2)
    expect(v.answers).toHaveLength(8)
    expect(progress).toBe(8)
    expect(v.answers.filter(a => a.error)).toHaveLength(2) // perplexity 429s
    const hit = v.answers.find(a => a.mentioned)!
    expect(hit).toMatchObject({ engine: 'chatgpt', cited: true, position: 2 })
    expect(v.mentionRate).toBeCloseTo(1 / 6)
    expect(v.topCompetitors[0]).toEqual({ name: 'Tallyhq', count: 6 })
    expect(v.topSources[0]!.domain).toBe('reddit.com')
    expect(v.costUsd).toBeGreaterThan(0.06)
  })
})
