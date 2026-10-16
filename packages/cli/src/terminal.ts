import { styleText } from 'node:util'
import type { AuditReport } from '@plugd/audit'

const c = (fmt: Parameters<typeof styleText>[0], s: string) => (process.stdout.isTTY && !process.env.NO_COLOR ? styleText(fmt, s) : s)
const SEV = { critical: ['red', '●'], high: ['red', '●'], medium: ['yellow', '●'], low: ['gray', '○'], info: ['gray', '·'] } as const

export function printReport(r: AuditReport, showPlan: boolean): void {
  const s = r.score
  const out: string[] = ['']
  const color = s.total >= 75 ? 'green' : s.total >= 50 ? 'yellow' : 'red'
  out.push(`  ${c('bold', r.site.brand)} ${c('gray', r.site.domain)}`)
  out.push(`  ${c(['bold', color], `${s.total}/100`)}  ${c('gray', `crawler access ${s.access}/40 · content ${s.content}/30 · ${s.visibility === null ? 'AI visibility not measured' : `AI visibility ${s.visibility}/30`}`)}`, '')

  out.push(c('bold', '  AI crawlers'))
  for (const kind of ['search', 'user', 'training'] as const) {
    const bs = r.bots.filter(b => b.kind === kind)
    const line = bs.map(b => `${b.allowed ? c('green', '✓') : c('red', '✗')} ${b.token}`).join('  ')
    out.push(`  ${c('gray', kind.padEnd(9))}${line}`)
  }
  if (r.cdnBlocked.length) out.push(`  ${c('red', '✗')} CDN/firewall blocks: ${r.cdnBlocked.join(', ')}`)
  out.push('')

  if (r.ai) {
    const pct = Math.round(r.ai.mentionRate * 100)
    out.push(c('bold', `  What AI says  `) + c('gray', `named in ${pct}% of answers · cited in ${Math.round(r.ai.citationRate * 100)}% · $${r.ai.costUsd.toFixed(2)}`))
    for (const [e, v] of Object.entries(r.ai.byEngine)) {
      const bar = '█'.repeat(v.mentioned) + c('gray', '░'.repeat(v.total - v.mentioned))
      out.push(`  ${e.padEnd(11)}${bar} ${v.mentioned}/${v.total}`)
    }
    if (r.ai.topCompetitors.length) out.push(`  ${c('gray', 'Named instead:')} ${r.ai.topCompetitors.slice(0, 5).map(x => `${x.name} (${x.count})`).join(', ')}`)
    if (r.ai.topSources.length) out.push(`  ${c('gray', 'Sources cited:')} ${r.ai.topSources.slice(0, 5).map(x => `${x.domain} (${x.count})`).join(', ')}`)
    out.push('')
  }

  out.push(c('bold', '  Findings'))
  for (const f of r.findings) {
    const [col, dot] = SEV[f.severity]
    out.push(`  ${c(col, dot)} ${f.title}`)
  }
  out.push('')

  if (r.fixes.length) {
    out.push(c('bold', `  Fix plan`) + c('gray', `  (${r.fixes.length} fix${r.fixes.length === 1 ? '' : 'es'}, highest impact first)`))
    r.fixes.slice(0, showPlan ? r.fixes.length : 5).forEach((f, i) => out.push(`  ${c('cyan', String(i + 1).padStart(2))}. ${f.title} ${c('gray', `· ${f.impact} impact · ${f.effort}`)}`))
    out.push('', c('gray', `  Full plan with ready-to-paste code:  npx getplugd plan ${target(r)}`), c('gray', `  Let your agent apply it:            npx getplugd mcp   (see README)`))
  }
  if (!r.ai) out.push('', c('gray', '  Measure what ChatGPT, Claude, Gemini and Perplexity say about you:'), c('gray', `  OPENROUTER_API_KEY=sk-or-... npx getplugd audit ${target(r)}`))
  console.log(out.join('\n') + '\n')
}

// Local sites need the full URL + flag to be re-audited.
const target = (r: AuditReport) => (r.site.url.startsWith('https://') ? r.site.domain : `${r.site.url} --allow-local`)
