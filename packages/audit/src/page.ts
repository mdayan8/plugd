import { parse } from 'node-html-parser'
import type { PageInfo } from './types'

const meta = (root: ReturnType<typeof parse>, sel: string) => root.querySelector(sel)?.getAttribute('content')?.trim() || undefined

function schemaTypes(root: ReturnType<typeof parse>): string[] {
  const types = new Set<string>()
  const walk = (n: unknown): void => {
    if (Array.isArray(n)) return n.forEach(walk)
    if (!n || typeof n !== 'object') return
    const o = n as Record<string, unknown>
    const t = o['@type']
    if (typeof t === 'string') types.add(t)
    if (Array.isArray(t)) t.forEach(x => typeof x === 'string' && types.add(x))
    if (o['@graph']) walk(o['@graph'])
  }
  for (const s of root.querySelectorAll('script[type="application/ld+json"]')) {
    try { walk(JSON.parse(s.textContent)) } catch { /* invalid JSON-LD is reported via missing types */ }
  }
  return [...types]
}

export function analyzePage(url: string, status: number, html: string): PageInfo {
  const root = parse(html, { blockTextElements: { script: true, style: true, noscript: false } })
  const robots = [meta(root, 'meta[name="robots"]'), meta(root, 'meta[name="googlebot"]')].filter(Boolean).join(',').toLowerCase()
  const bing = (meta(root, 'meta[name="bingbot"]') ?? '').toLowerCase() + ',' + robots
  const snippet = /max-snippet:\s*(-?\d+)/.exec(robots)
  const body = root.querySelector('body')
  body?.querySelectorAll('script,style,nav,footer').forEach(n => n.remove())
  const text = (body?.textContent ?? '').replace(/\s+/g, ' ').trim()
  return {
    url,
    status,
    title: root.querySelector('title')?.textContent.trim() || undefined,
    description: meta(root, 'meta[name="description"]'),
    lang: root.querySelector('html')?.getAttribute('lang') ?? undefined,
    canonical: root.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? undefined,
    siteName: meta(root, 'meta[property="og:site_name"]'),
    h1: root.querySelector('h1')?.textContent.replace(/\s+/g, ' ').trim() || undefined,
    noindex: /noindex|\bnone\b/.test(robots),
    nosnippet: /nosnippet/.test(robots),
    maxSnippet: snippet ? Number(snippet[1]) : undefined,
    bingNoarchive: /noarchive/.test(bing),
    bingNocache: /nocache/.test(bing),
    schemaTypes: schemaTypes(root),
    words: text ? text.split(' ').length : 0,
    modified: meta(root, 'meta[property="article:modified_time"]') ?? meta(root, 'meta[name="last-modified"]'),
  }
}

// Pull same-origin page URLs out of a sitemap (or sitemap index, one level deep handled by caller).
export function sitemapUrls(xml: string): { pages: string[]; children: string[] } {
  const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map(m => m[1]!.replace(/&amp;/g, '&'))
  return /<sitemapindex/i.test(xml) ? { pages: [], children: locs } : { pages: locs, children: [] }
}
