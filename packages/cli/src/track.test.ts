import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { wilson, type Engine } from '@getplugd/engines'
import { change, latest, reportLines, reportMarkdown, summarize } from './report'
import { loadHistory, PER_QUESTION, saveConfig, track, type TrackConfig } from './track'

const cfg: TrackConfig = { site: 'https://acme.com', domain: 'acme.com', brand: 'Acme', aliases: ['acme', 'acme.com'], questions: ['best analytics tool', 'cookieless analytics', 'alternatives to big analytics'], createdAt: '2026-10-01T00:00:00.000Z' }

// Answers "Acme" for questions containing `hit`, otherwise names a competitor.
function fakeEngine(hit: string | RegExp, opts: { fail?: boolean; cost?: number } = {}): Engine {
  return {
    id: 'gemini', label: 'Gemini', model: 'gemini-test', surface: 'api',
    async ask(q) {
      if (opts.fail) throw new Error('quota exceeded')
      const yes = typeof hit === 'string' ? q.includes(hit) : hit.test(q)
      return {
        text: yes ? 'Try Acme or Tallyhq.' : 'Tallyhq is the usual pick.',
        citations: yes ? [{ url: 'https://acme.com/pricing' }, { url: 'https://g2.com/x' }] : [{ url: 'https://g2.com/x' }],
        model: 'gemini-test', searchCalls: 2, costUsd: opts.cost ?? 0.01,
      }
    },
    async complete(prompt) { return { text: prompt.includes('Acme') ? '{"brands":["Acme","Tallyhq"]}' : '{"brands":["Tallyhq"]}', costUsd: 0.001 } },
  }
}

const tmp = () => mkdtempSync(join(tmpdir(), 'plugd-'))

describe('track', () => {
  it('asks every question, scores mention and citation, and appends history', async () => {
    const dir = tmp()
    saveConfig(dir, cfg)
    const res = await track({ dir, config: cfg, engines: [fakeEngine('analytics tool')], now: () => new Date('2026-10-05T00:00:00Z') })
    expect(res.records).toHaveLength(3)
    expect(res.skipped).toBe(0)
    const hit = res.records.find(r => r.question === 'best analytics tool')!
    expect(hit).toMatchObject({ mentioned: true, cited: true, brands: ['Acme', 'Tallyhq'], searchCalls: 2, costUsd: 0.011, surface: 'api' })
    expect(res.records.filter(r => r.mentioned)).toHaveLength(1)
    expect(readFileSync(join(dir, 'history.jsonl'), 'utf8').trim().split('\n')).toHaveLength(3)
    expect(res.spentUsd).toBeCloseTo(0.033)
  })

  it('stops starting checks at --max-cost, counting what was actually spent', async () => {
    const dir = tmp()
    // Each check really costs $0.031; after two ($0.062) the worst case for a third ($0.032) would pass $0.07.
    expect(PER_QUESTION.gemini).toBe(0.032)
    const res = await track({ dir, config: cfg, engines: [fakeEngine('x', { cost: 0.03 })], maxCost: 0.07, concurrency: 1 })
    expect(res.records).toHaveLength(2)
    expect(res.skipped).toBe(1)
    expect(loadHistory(dir)).toHaveLength(2)
  })

  it('records failures without counting them as "not mentioned"', async () => {
    const dir = tmp()
    await track({ dir, config: cfg, engines: [fakeEngine('x', { fail: true })] })
    const [row] = summarize(loadHistory(dir))
    expect(row).toMatchObject({ n: 0, errors: 3 })
  })
})

describe('report', () => {
  it('summarises each run, flags only real changes, and lists who wins instead', async () => {
    const dir = tmp()
    const ten = { ...cfg, questions: Array.from({ length: 10 }, (_, i) => `question ${i}`) }
    await track({ dir, config: ten, engines: [fakeEngine(/^$/)], now: () => new Date('2026-10-05T00:00:00Z') })
    await track({ dir, config: ten, engines: [fakeEngine(/./)], now: () => new Date('2026-10-12T00:00:00Z') })
    const rows = summarize(loadHistory(dir))
    expect(rows.map(r => [r.runId.slice(0, 10), r.n, r.mention.rate])).toEqual([['2026-10-05', 10, 0], ['2026-10-12', 10, 1]])
    // 0/10 → 10/10: the 95% intervals don't overlap, so it counts as a real change.
    expect(change(rows[0], rows[1]!)).toBe('up')
    const l = latest(cfg, loadHistory(dir))
    expect(l.competitors[0]).toEqual({ name: 'Tallyhq', count: 10 })
    expect(l.sources).toEqual([{ name: 'g2.com', count: 10 }])
    expect(l.missed).toEqual([])
    const text = reportLines(ten, loadHistory(dir)).join('\n')
    expect(text).toContain('named 100%')
    expect(text).toContain('↑ up')
    expect(reportMarkdown(ten, loadHistory(dir))).toContain('| 2026-10-12 00:00 | Gemini | 100%')
  })

  it("won't call 0/3 → 3/3 a change: too few answers to tell", () => {
    const row = (k: number) => ({ runId: 'r', engine: 'gemini' as const, n: 3, mention: wilson(k, 3), citation: wilson(0, 3), costUsd: 0, searchCalls: 0, errors: 0 })
    expect(change(row(0), row(3))).toBe('same')
  })

  it('calls small swings noise', () => {
    const row = (k: number, n: number) => ({ runId: 'r', engine: 'gemini' as const, n, mention: wilson(k, n), citation: wilson(0, n), costUsd: 0, searchCalls: 0, errors: 0 })
    expect(change(row(2, 10), row(3, 10))).toBe('same')
    expect(change(undefined, row(3, 10))).toBe('first')
  })
})

describe('wilson', () => {
  it('matches the standard 95% interval', () => {
    const w = wilson(7, 20)
    expect(w.rate).toBe(0.35)
    expect(w.low).toBeCloseTo(0.181, 3)
    expect(w.high).toBeCloseTo(0.567, 3)
    expect(wilson(0, 0)).toEqual({ rate: 0, low: 0, high: 0 })
  })
})
