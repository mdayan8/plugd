import { citedDomain, mentions, wilson } from '@getplugd/engines'
import { ENGINES, type EngineId } from '@plugd/audit'
import type { TrackConfig, TrackRecord } from './track'

export interface RunRow {
  runId: string
  engine: EngineId
  n: number
  mention: ReturnType<typeof wilson>
  citation: ReturnType<typeof wilson>
  costUsd: number
  searchCalls: number
  errors: number
}

/** One row per run × engine. Failed checks are counted separately, never as "not mentioned". */
export function summarize(records: TrackRecord[]): RunRow[] {
  const groups = new Map<string, TrackRecord[]>()
  for (const r of records) { const k = `${r.runId}\u0000${r.engine}`; groups.set(k, [...(groups.get(k) ?? []), r]) }
  return [...groups.values()].map(rs => {
    const ok = rs.filter(r => !r.error)
    return {
      runId: rs[0]!.runId,
      engine: rs[0]!.engine,
      n: ok.length,
      mention: wilson(ok.filter(r => r.mentioned).length, ok.length),
      citation: wilson(ok.filter(r => r.cited).length, ok.length),
      costUsd: rs.reduce((s, r) => s + r.costUsd, 0),
      searchCalls: rs.reduce((s, r) => s + r.searchCalls, 0),
      errors: rs.length - ok.length,
    }
  }).sort((a, b) => a.runId.localeCompare(b.runId) || a.engine.localeCompare(b.engine))
}

/** "up" or "down" only when the 95% intervals don't overlap; anything else is noise at this sample size. */
export function change(prev: RunRow | undefined, cur: RunRow): 'up' | 'down' | 'same' | 'first' {
  if (!prev || !prev.n || !cur.n) return 'first'
  if (cur.mention.low > prev.mention.high) return 'up'
  if (cur.mention.high < prev.mention.low) return 'down'
  return 'same'
}

const tally = (xs: string[]) => [...xs.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map<string, number>())]
  .sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }))

/** Who is named instead of you, and which sites the engines lean on, in the latest run. */
export function latest(cfg: TrackConfig, records: TrackRecord[]) {
  const runId = records.map(r => r.runId).sort().at(-1)
  const rs = records.filter(r => r.runId === runId && !r.error)
  return {
    runId,
    competitors: tally(rs.flatMap(r => r.brands.filter(b => !mentions(b, cfg.aliases)))).slice(0, 8),
    sources: tally(rs.flatMap(r => [...new Set(r.citations.map(citedDomain).filter(d => d && d !== cfg.domain && !d.endsWith(`.${cfg.domain}`)))])).slice(0, 8),
    missed: [...new Set(rs.filter(r => !r.mentioned).map(r => r.question))],
  }
}

const pct = (x: number) => `${Math.round(x * 100)}%`
const interval = (w: ReturnType<typeof wilson>) => `${pct(w.low)}–${pct(w.high)}`
const day = (iso: string) => `${iso.slice(0, 10)} ${iso.slice(11, 16)}`
const ARROW = { up: '↑ up', down: '↓ down', same: '· no clear change', first: '' } as const

export function reportLines(cfg: TrackConfig, records: TrackRecord[]): string[] {
  const rows = summarize(records)
  if (!rows.length) return [`No history yet for ${cfg.domain}. Run: npx getplugd track ${cfg.domain}`]
  const out = [`${cfg.brand} (${cfg.domain}) · ${cfg.questions.length} questions · API answers with web search on`, '']
  for (const engine of [...new Set(rows.map(r => r.engine))]) {
    out.push(ENGINES[engine].label)
    const mine = rows.filter(r => r.engine === engine)
    mine.forEach((r, i) => {
      const c = change(mine[i - 1], r)
      out.push(`  ${day(r.runId)}  named ${pct(r.mention.rate).padStart(4)} (${interval(r.mention)})  cited ${pct(r.citation.rate).padStart(4)}  n=${r.n}${r.errors ? ` · ${r.errors} failed` : ''}  ${ARROW[c]}`.trimEnd())
    })
    out.push('')
  }
  const l = latest(cfg, records)
  if (l.competitors.length) out.push(`Named instead (latest run): ${l.competitors.map(x => `${x.name} (${x.count})`).join(', ')}`)
  if (l.sources.length) out.push(`Sources AI used: ${l.sources.map(x => `${x.name} (${x.count})`).join(', ')}`)
  if (l.missed.length) out.push(`Questions where you weren't named: ${l.missed.length}/${cfg.questions.length}`)
  const spent = rows.reduce((s, r) => s + r.costUsd, 0)
  out.push('', `Ranges are 95% intervals. Changes count only when ranges don't overlap. Spent so far: $${spent.toFixed(2)} at list prices.`)
  return out
}

export function reportMarkdown(cfg: TrackConfig, records: TrackRecord[]): string {
  const rows = summarize(records)
  const l = latest(cfg, records)
  const md = [
    `# AI visibility: ${cfg.brand} (${cfg.domain})`, '',
    `${cfg.questions.length} buyer questions, asked through each engine's API with web search on. Rates show the 95% interval; one run is a snapshot.`, '',
    '| Date | Engine | Named | Cited | n |', '|---|---|---|---|---|',
    ...rows.map(r => `| ${day(r.runId)} | ${ENGINES[r.engine].label} | ${pct(r.mention.rate)} (${interval(r.mention)}) | ${pct(r.citation.rate)} | ${r.n} |`),
    '',
  ]
  if (l.competitors.length) md.push('## Named instead', '', ...l.competitors.map(x => `- ${x.name} (${x.count})`), '')
  if (l.sources.length) md.push('## Sources AI used', '', ...l.sources.map(x => `- ${x.name} (${x.count})`), '')
  if (l.missed.length) md.push("## Questions where you weren't named", '', ...l.missed.map(q => `- ${q}`), '')
  return md.join('\n')
}
