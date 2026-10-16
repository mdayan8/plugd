import type { AuditReport, Fix } from '@plugd/audit'

const pct = (x: number) => `${Math.round(x * 100)}%`

export function fixMarkdown(f: Fix, n?: number): string {
  return [
    `### ${n ? `${n}. ` : ''}${f.title}`,
    `**Impact:** ${f.impact} · **Effort:** ${f.effort}`, '',
    f.why, '',
    ...f.steps.map((s, i) => `${i + 1}. ${s}`),
    ...(f.artifact ? ['', f.artifact.path ? `\`${f.artifact.path}\`` : '', '```' + f.artifact.language, f.artifact.content.trimEnd(), '```'] : []),
  ].filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n')
}

export function planMarkdown(r: AuditReport): string {
  if (!r.fixes.length) return `## Fix plan for ${r.site.domain}\n\nNothing to fix. Re-run with an OpenRouter key to check what AI engines actually say.`
  return [`## Fix plan for ${r.site.domain}`, '', 'Ordered by impact, then effort. Apply the code changes in this repo; outreach items need a human.', '', ...r.fixes.map((f, i) => fixMarkdown(f, i + 1) + '\n')].join('\n')
}

export function reportMarkdown(r: AuditReport): string {
  const s = r.score
  const lines = [
    `# AI visibility audit: ${r.site.brand} (${r.site.domain})`, '',
    `**Score ${s.total}/100** · AI crawler access ${s.access}/40 · Content & structure ${s.content}/30 · ${s.visibility === null ? 'AI visibility not measured' : `AI visibility ${s.visibility}/30`}`, '',
    `_Scanned ${r.pages.length} page${r.pages.length > 1 ? 's' : ''} on ${r.scannedAt.slice(0, 10)}._`, '',
    '## AI crawlers', '',
    '| Bot | Company | Purpose | Allowed |', '|---|---|---|---|',
    ...r.bots.map(b => `| ${b.token} | ${b.company} | ${b.kind} | ${b.allowed ? 'yes' : '**no**'} |`), '',
  ]
  if (r.ai) {
    lines.push('## What AI says about you', '',
      `Named in **${pct(r.ai.mentionRate)}** of ${r.ai.answers.filter(a => !a.error).length} answers · your site cited in **${pct(r.ai.citationRate)}** · cost $${r.ai.costUsd.toFixed(2)}`, '',
      '| Engine | Mentioned | Cited |', '|---|---|---|',
      ...Object.entries(r.ai.byEngine).map(([e, v]) => `| ${e} | ${v.mentioned}/${v.total} | ${v.cited}/${v.total} |`), '')
    if (r.ai.topCompetitors.length) lines.push(`**Recommended instead:** ${r.ai.topCompetitors.map(c => `${c.name} (${c.count})`).join(', ')}`, '')
    if (r.ai.topSources.length) lines.push(`**Sources AI cited:** ${r.ai.topSources.map(c => `${c.domain} (${c.count})`).join(', ')}`, '')
    lines.push('| Question | ' + Object.keys(r.ai.byEngine).join(' | ') + ' |', '|---|' + Object.keys(r.ai.byEngine).map(() => '---|').join(''))
    for (const q of r.ai.questions) {
      const cells = Object.keys(r.ai.byEngine).map(label => {
        const a = r.ai!.answers.find(x => x.question === q && labelOf(x.engine) === label)
        return !a || a.error ? '–' : a.mentioned ? `yes${a.position ? ` (#${a.position})` : ''}${a.cited ? ', cited' : ''}` : 'no'
      })
      lines.push(`| ${q} | ${cells.join(' | ')} |`)
    }
    lines.push('')
  }
  lines.push('## Findings', '', ...r.findings.map(f => `- **${f.severity}**: ${f.title}. ${f.detail}${f.urls ? ` (${f.urls.slice(0, 5).join(', ')})` : ''}`), '', planMarkdown(r))
  return lines.join('\n')
}

const LABELS: Record<string, string> = { chatgpt: 'ChatGPT', claude: 'Claude', gemini: 'Gemini', perplexity: 'Perplexity' }
const labelOf = (e: string) => LABELS[e] ?? e
