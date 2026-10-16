import type { AiVisibility, BotAccess, Finding, Fix, PageInfo, Site } from './types'

interface Group { agents: string[]; rules: string[] }

// Minimal robots.txt grouping (RFC 9309): consecutive User-agent lines open a group; rules follow.
export function parseRobotsGroups(txt: string): { groups: Group[]; sitemaps: string[] } {
  const groups: Group[] = []
  const sitemaps: string[] = []
  let cur: Group | null = null
  let lastWasAgent = false
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim()
    if (!line) continue
    const [k, ...rest] = line.split(':')
    const key = k!.trim().toLowerCase()
    const val = rest.join(':').trim()
    if (key === 'sitemap') { sitemaps.push(val); continue }
    if (key === 'user-agent') {
      if (!cur || !lastWasAgent) { cur = { agents: [], rules: [] }; groups.push(cur) }
      cur.agents.push(val); lastWasAgent = true
    } else if (cur) { cur.rules.push(`${k!.trim()}: ${val}`); lastWasAgent = false }
  }
  return { groups, sitemaps }
}

// Rewrites robots.txt so AI search + user-fetch bots are allowed, keeps your private-path rules,
// keeps training opt-outs exactly as they are, and keeps every other group untouched.
export function recommendedRobots(current: string | undefined, bots: BotAccess[], origin: string): string {
  const { groups, sitemaps } = parseRobotsGroups(current ?? '')
  // Only touch bots that are blocked today; every other group stays exactly as written.
  const visible = bots.filter(b => b.kind !== 'training' && !b.allowed).map(b => b.token)
  if (!visible.length && current) return current
  const visibleLc = new Set(visible.map(t => t.toLowerCase()))
  const star = groups.find(g => g.agents.includes('*'))
  // Private paths from the * group still apply to AI bots; a blanket "Disallow: /" does not.
  const privatePaths = (star?.rules ?? []).filter(r => /^disallow:\s*\/.+/i.test(r))
  // Groups lose only the bots we're unblocking; a group left with no agents is dropped.
  const kept = groups
    .map(g => ({ ...g, agents: g.agents.filter(a => !visibleLc.has(a.toLowerCase())) }))
    .filter(g => g.agents.length)

  const out: string[] = ['# AI search + answer engines: allowed so they can read and cite you', ...visible.map(t => `User-agent: ${t}`), 'Allow: /', ...privatePaths, '']
  for (const g of kept) out.push(...g.agents.map(a => `User-agent: ${a}`), ...(g.rules.length ? g.rules : ['Allow: /']), '')
  if (!kept.some(g => g.agents.includes('*'))) out.push('User-agent: *', 'Allow: /', '')
  out.push(...(sitemaps.length ? sitemaps : [`${origin}/sitemap.xml`]).map(s => `Sitemap: ${s}`))
  return out.join('\n').trim() + '\n'
}

function orgSchema(site: Site, home?: PageInfo): string {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': `${site.url}/#org`, name: site.brand, url: site.url, logo: `${site.url}/logo.png`, description: home?.description ?? site.description ?? '', sameAs: ['https://www.linkedin.com/company/REPLACE', 'https://x.com/REPLACE'] },
      { '@type': 'WebSite', '@id': `${site.url}/#website`, name: site.brand, url: site.url, publisher: { '@id': `${site.url}/#org` } },
      { '@type': 'SoftwareApplication', name: site.brand, url: site.url, applicationCategory: 'BusinessApplication', operatingSystem: 'Web', description: home?.description ?? '', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, publisher: { '@id': `${site.url}/#org` } },
    ],
  }
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)

function pageFixFor(q: string, site: Site, ai: AiVisibility): Fix {
  const answers = ai.answers.filter(a => a.question === q && !a.error)
  const rivals = [...new Set(answers.flatMap(a => a.brands))].filter(b => !b.toLowerCase().includes(site.brand.toLowerCase())).slice(0, 5)
  const sources = [...new Set(answers.flatMap(a => a.citations.map(c => { try { return new URL(c.url).hostname.replace(/^www\./, '') } catch { return '' } })))].filter(Boolean).slice(0, 5)
  const alt = /alternativ/i.test(q), vs = /\bvs\.?\b|versus|compare/i.test(q)
  const title = alt && rivals[0] ? `${rivals[0]} alternatives: how ${site.brand} compares` : vs ? `${q.replace(/\?$/, '')}: an honest comparison` : `${q.replace(/\?$/, '')}`
  const path = alt && rivals[0] ? `/alternatives/${slug(rivals[0])}` : vs ? `/compare/${slug(q)}` : `/guides/${slug(q)}`
  return {
    id: `page-${slug(q)}`, kind: 'page', impact: 'high', effort: 'hours',
    title: `Publish a page that answers “${q}”`,
    why: `${answers.filter(a => !a.mentioned).length} of ${answers.length} engines answered this without naming ${site.brand}${rivals.length ? `; they named ${rivals.join(', ')}` : ''}.`,
    artifact: {
      path, language: 'markdown',
      content: [
        `# ${title}`, '',
        `> Answer the question in the first two sentences, plainly. Name ${site.brand} and who it's for.`, '',
        '## Quick answer', `- One-paragraph verdict that includes ${site.brand}${rivals.length ? ` and ${rivals.slice(0, 3).join(', ')}` : ''}.`, '',
        '## Comparison', '| | ' + [site.brand, ...rivals.slice(0, 3)].join(' | ') + ' |', '|---|' + '---|'.repeat(Math.min(rivals.length, 3) + 1), '| Best for | … |', '| Pricing | … |', '| Key difference | … |', '',
        '## How to choose', '- Criteria a buyer actually uses, with concrete numbers.', '',
        '## Common questions', '- 3–5 real questions buyers ask, each answered directly in the first sentence.', '',
        `<!-- Sources AI cited for this question: ${sources.join(', ') || 'none'}. Be fair to competitors; AI engines reward balanced, factual pages. -->`,
      ].join('\n'),
    },
    steps: [`Create ${path} with the outline above, written by someone who knows the product.`, 'Link to it from your homepage or nav so crawlers find it.', 'Re-run the audit in 2–4 weeks to see if engines pick it up.'],
  }
}

export function fixPlan(i: { site: Site; findings: Finding[]; bots: BotAccess[]; robotsTxt?: string; pages: PageInfo[]; cdnBlocked: string[]; ai: AiVisibility | null }): Fix[] {
  const has = (id: string) => i.findings.some(f => f.id === id || f.id.startsWith(id))
  const home = i.pages[0]
  const fixes: Fix[] = []

  if (has('search-bots-blocked') || has('user-bots-blocked')) fixes.push({
    id: 'robots', kind: 'robots', impact: 'high', effort: 'minutes',
    title: 'Allow AI search crawlers in robots.txt',
    why: i.findings.find(f => f.id === 'search-bots-blocked')?.detail ?? 'Live AI fetches are blocked.',
    artifact: { path: 'robots.txt', language: 'text', content: recommendedRobots(i.robotsTxt, i.bots, i.site.url) },
    steps: ['Replace your robots.txt with the version below (it keeps your private paths and training opt-outs).', 'If your framework generates robots.txt (e.g. Next.js app/robots.ts), update the generator instead.', 'Deploy, then re-run the audit.'],
  })
  if (has('cdn-blocks-bots')) fixes.push({
    id: 'cdn', kind: 'robots', impact: 'high', effort: 'minutes',
    title: 'Let verified AI search bots through your CDN / firewall',
    why: i.findings.find(f => f.id === 'cdn-blocks-bots')!.detail,
    steps: ['Cloudflare: Security → Bots → AI Crawl Control → allow the Search category (OAI-SearchBot, Claude-SearchBot, PerplexityBot). Don’t block “Training” if it also blocks Googlebot/Bingbot.', 'Other CDNs/WAFs: allowlist the verified IP ranges published by OpenAI, Anthropic and Perplexity.'],
  })
  if (has('home-noindex') || has('home-nosnippet') || has('bing-noarchive') || has('home-maxsnippet')) fixes.push({
    id: 'meta-robots', kind: 'meta', impact: 'high', effort: 'minutes',
    title: 'Remove restrictive robots meta tags from the homepage',
    why: 'noindex / nosnippet / noarchive / tiny max-snippet keep you out of AI answers.',
    artifact: { language: 'html', content: '<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">' },
    steps: ['Replace the existing robots meta tag in the homepage <head> with the one below.', 'Check your framework or SEO plugin settings so it isn’t re-added.'],
  })
  if (has('no-org-schema') || has('no-product-schema')) fixes.push({
    id: 'schema', kind: 'schema', impact: 'low', effort: 'minutes',
    title: 'Add Organization + product structured data',
    why: 'Keeps your brand, category and price unambiguous for search and AI engines. Hygiene, not a citation lever: studies found no lift in AI citations from schema alone.',
    artifact: { language: 'html', content: orgSchema(i.site, home) },
    steps: ['Paste into the <head> of your homepage (or your root layout).', 'Replace the REPLACE links, logo URL and price with real values; delete any line that doesn’t apply.', 'Validate at https://validator.schema.org.'],
  })
  if (has('no-description')) fixes.push({
    id: 'description', kind: 'meta', impact: 'medium', effort: 'minutes',
    title: 'Write a homepage meta description',
    why: 'AI engines often reuse it to describe you.',
    artifact: { language: 'html', content: `<meta name="description" content="${i.site.brand} is <what it is> for <who>. <key benefit in one line>.">` },
    steps: ['One sentence: what it is, who it’s for, and why it’s different. Max ~155 characters.'],
  })
  if (has('thin-home')) fixes.push({
    id: 'thin-home', kind: 'page', impact: 'medium', effort: 'hours',
    title: 'Put the “what, who for, why” in plain HTML on the homepage',
    why: i.findings.find(f => f.id === 'thin-home')!.detail,
    steps: ['Server-render the hero and a short “what is ' + i.site.brand + '” section.', 'Add 3–5 concrete facts: category, who it’s for, pricing model, integrations, a number that proves it works.'],
  })

  if (i.ai) {
    const gaps = i.ai.questions
      .map(q => ({ q, missed: i.ai!.answers.filter(a => a.question === q && !a.error && !a.mentioned).length, total: i.ai!.answers.filter(a => a.question === q && !a.error).length }))
      .filter(g => g.total && g.missed / g.total >= 0.5)
      .sort((a, b) => b.missed - a.missed)
      .slice(0, 5)
    for (const g of gaps) fixes.push(pageFixFor(g.q, i.site, i.ai))
    const third = i.ai.topSources.slice(0, 6)
    if (third.length) fixes.push({
      id: 'outreach', kind: 'outreach', impact: 'high', effort: 'days',
      title: 'Get mentioned on the sources AI already trusts',
      why: `AI cited these sites when answering your buyers' questions: ${third.map(s => `${s.domain} (${s.count})`).join(', ')}. Most AI citations come from third-party coverage, not brand sites.`,
      steps: [...third.map(s => `${s.domain}: find the cited page and see if ${i.site.brand} belongs there (review listing, comparison, community thread, video). Reach out or contribute genuinely, and disclose who you are.`), 'Never post fake reviews or undisclosed promotion. It breaks platform rules and backfires.'],
    })
  }

  if (has('no-llms-txt')) fixes.push({
    id: 'llms-txt', kind: 'llms_txt', impact: 'low', effort: 'minutes',
    title: 'Optional: add /llms.txt',
    why: 'Unproven for AI search, but cheap. Agents browsing your site may use it.',
    artifact: { path: 'llms.txt', language: 'markdown', content: [`# ${i.site.brand}`, '', `> ${home?.description ?? `${i.site.brand}: what it is, in one line.`}`, '', '## Key pages', ...i.pages.filter(p => p.status < 400 && p.title).slice(0, 10).map(p => `- [${p.title}](${p.url})`)].join('\n') + '\n' },
    steps: ['Save as /llms.txt at your site root.'],
  })
  const w = { high: 0, medium: 1, low: 2 }, e = { minutes: 0, hours: 1, days: 2 }
  return fixes.sort((a, b) => w[a.impact] - w[b.impact] || e[a.effort] - e[b.effort])
}
