import type { AiVisibility, BotAccess, Finding, PageInfo } from './types'

const CORE_SEARCH = ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot']

export function findings(i: { bots: BotAccess[]; robotsFound: boolean; cdnBlocked: string[]; pages: PageInfo[]; sitemap: boolean; llmsTxt: boolean; ai: AiVisibility | null; brand: string }): Finding[] {
  const out: Finding[] = []
  const home = i.pages[0]
  const blocked = (k: BotAccess['kind']) => i.bots.filter(b => b.kind === k && !b.allowed).map(b => b.token)

  const s = blocked('search')
  if (s.length) out.push({
    id: 'search-bots-blocked', severity: s.some(t => CORE_SEARCH.includes(t)) ? 'critical' : 'high',
    title: `robots.txt blocks ${s.length} AI search crawler${s.length > 1 ? 's' : ''}`,
    detail: `${s.join(', ')} can't read your site, so those engines can't cite you. Search crawlers are separate from training crawlers: allowing them doesn't let anyone train on your content.`,
  })
  const u = blocked('user')
  if (u.length) out.push({ id: 'user-bots-blocked', severity: 'medium', title: `robots.txt blocks live AI fetches (${u.join(', ')})`, detail: 'When someone asks an assistant about a page of yours, it fetches it live with these agents. Blocking them hides your pages from those conversations.' })
  const t = blocked('training')
  if (t.length) out.push({ id: 'training-bots-blocked', severity: 'info', title: `You've opted out of AI training for ${t.length} crawler${t.length > 1 ? 's' : ''}`, detail: `${t.join(', ')}. That's a valid choice and doesn't affect AI search visibility.` })
  if (!i.robotsFound) out.push({ id: 'no-robots', severity: 'low', title: 'No robots.txt found', detail: 'Everything is allowed by default, which is fine. A robots.txt with your sitemap helps crawlers find pages faster.' })
  if (i.cdnBlocked.length) out.push({ id: 'cdn-blocks-bots', severity: 'high', title: 'Your CDN or firewall seems to block AI crawlers', detail: `Requests identifying as ${i.cdnBlocked.join(', ')} got a different response than a normal browser. robots.txt says one thing, your firewall does another. (Heuristic: real bots are verified by IP, so double-check your bot settings.)` })

  const homeOk = !!home && home.status > 0 && home.status < 400
  if (home && !homeOk) out.push({ id: 'home-unreachable', severity: 'critical', title: `Homepage returned ${home.status || 'no response'} to a normal browser request`, detail: 'Either the site is down or bot protection blocks automated visitors. AI crawlers will likely hit the same wall. Content checks were skipped because the page couldn’t be read.' })
  if (home && homeOk) {
    if (home.noindex) out.push({ id: 'home-noindex', severity: 'critical', title: 'Homepage is set to noindex', detail: 'Search engines (and AI Overviews / AI Mode, which use the Google index) will drop it.' })
    if (home.nosnippet) out.push({ id: 'home-nosnippet', severity: 'high', title: 'Homepage uses nosnippet', detail: 'Google won’t quote it in results or AI Overviews.' })
    else if (home.maxSnippet !== undefined && home.maxSnippet >= 0 && home.maxSnippet < 60) out.push({ id: 'home-maxsnippet', severity: 'medium', title: `max-snippet is only ${home.maxSnippet} characters`, detail: 'AI answers need room to quote you.' })
    if (home.bingNoarchive) out.push({ id: 'bing-noarchive', severity: 'high', title: 'noarchive keeps you out of Copilot answers', detail: 'Bing treats NOARCHIVE as “don’t use in Copilot”. Remove it if you want to be cited.' })
    else if (home.bingNocache) out.push({ id: 'bing-nocache', severity: 'medium', title: 'nocache limits what Copilot can use', detail: 'Copilot will only use your URL, title and snippet.' })
    if (!home.description) out.push({ id: 'no-description', severity: 'medium', title: 'Homepage has no meta description', detail: 'It’s often the sentence AI engines use to describe what you do.' })
    if (home.words < 150) out.push({ id: 'thin-home', severity: 'medium', title: `Homepage has very little readable text (${home.words} words)`, detail: 'If the content is rendered by JavaScript or hidden in images, crawlers may not see what you do. Make the core “what, who for, why” readable in HTML.' })
  }

  const types = new Set(i.pages.flatMap(p => p.schemaTypes))
  if (homeOk && !types.has('Organization') && !types.has('Corporation') && !types.has('LocalBusiness')) out.push({ id: 'no-org-schema', severity: 'medium', title: 'No Organization structured data', detail: 'Tells engines your official name, logo, URL and profiles, so mentions of you elsewhere connect to one entity. It keeps facts unambiguous; on its own it doesn’t raise AI citations.' })
  if (homeOk && !['Product', 'SoftwareApplication', 'Service', 'WebApplication'].some(x => types.has(x))) out.push({ id: 'no-product-schema', severity: 'low', title: 'No Product / SoftwareApplication structured data', detail: 'States what you sell, its category and price in a machine-readable way. Keep it matched to the visible page.' })
  if (!i.sitemap) out.push({ id: 'no-sitemap', severity: 'low', title: 'No sitemap found', detail: 'List it in robots.txt so crawlers find every page.' })
  const broken = i.pages.slice(1).filter(p => p.status >= 400 || p.status === 0)
  if (broken.length) out.push({ id: 'broken-pages', severity: 'medium', title: `${broken.length} page${broken.length > 1 ? 's' : ''} from your sitemap failed to load`, detail: 'Remove dead URLs from the sitemap or fix them.', urls: broken.map(p => p.url) })
  if (!i.llmsTxt) out.push({ id: 'no-llms-txt', severity: 'info', title: 'No llms.txt', detail: 'Optional. No major AI search engine has said it uses llms.txt, but agents browsing your site may read it. Cheap to add.' })

  if (i.ai) {
    const pct = Math.round(i.ai.mentionRate * 100)
    if (i.ai.mentionRate < 0.25) out.push({ id: 'low-ai-visibility', severity: 'high', title: `AI recommended ${i.brand} in only ${pct}% of answers`, detail: i.ai.topCompetitors.length ? `It named ${i.ai.topCompetitors.slice(0, 3).map(c => c.name).join(', ')} instead.` : 'Answers rarely named any brand you could be compared to.' })
    for (const [engine, v] of Object.entries(i.ai.byEngine)) if (v.total && !v.mentioned) out.push({ id: `absent-${engine}`, severity: 'medium', title: `${engine} never mentioned ${i.brand}`, detail: `0 of ${v.total} answers.` })
  }
  const rank = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
  return out.sort((a, b) => rank[a.severity] - rank[b.severity])
}

export function score(i: { bots: BotAccess[]; cdnBlocked: string[]; pages: PageInfo[]; sitemap: boolean; ai: AiVisibility | null }) {
  const home = i.pages[0]
  let access = 40
  for (const b of i.bots) if (!b.allowed) access -= b.kind === 'search' ? (['Googlebot', 'Bingbot'].includes(b.token) ? 20 : 8) : b.kind === 'user' ? 3 : 0
  access -= i.cdnBlocked.length ? 15 : 0
  if (home?.noindex || !home || home.status >= 400 || home.status === 0) access -= 40
  if (home?.nosnippet || home?.bingNoarchive) access -= 8
  access = Math.max(0, access)

  const types = new Set(i.pages.flatMap(p => p.schemaTypes))
  const content =
    (types.has('Organization') || types.has('Corporation') || types.has('LocalBusiness') ? 8 : 0) +
    (['Product', 'SoftwareApplication', 'Service', 'WebApplication'].some(x => types.has(x)) ? 6 : 0) +
    (home?.description ? 5 : 0) + ((home?.words ?? 0) >= 300 ? 6 : (home?.words ?? 0) >= 150 ? 3 : 0) +
    (i.sitemap ? 5 : 0)

  const visibility = i.ai ? Math.round(i.ai.mentionRate * 30) : null
  const total = visibility === null ? Math.round(((access + content) / 70) * 100) : access + content + visibility
  return { total, access, content, visibility }
}
