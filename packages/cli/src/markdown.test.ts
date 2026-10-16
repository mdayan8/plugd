import { describe, expect, it } from 'vitest'
import { analyzePage, botAccess, recommendedRobots, type AuditReport } from '@plugd/audit'
import { planMarkdown, reportMarkdown } from './markdown'

const robots = 'User-agent: OAI-SearchBot\nDisallow: /'
const bots = botAccess('https://acme.com/robots.txt', robots)
const base: AuditReport = {
  version: 1,
  site: { url: 'https://acme.com', domain: 'acme.com', brand: 'Acme' },
  scannedAt: '2026-10-16T00:00:00.000Z',
  score: { total: 55, access: 32, content: 8, visibility: null },
  bots,
  robotsTxt: { found: true, content: robots },
  llmsTxt: false,
  cdnBlocked: [],
  pages: [analyzePage('https://acme.com/', 200, '<title>Acme</title>')],
  findings: [{ id: 'search-bots-blocked', severity: 'critical', title: 'robots.txt blocks 1 AI search crawler', detail: 'OAI-SearchBot can’t read your site.' }],
  ai: null,
  fixes: [{ id: 'robots', kind: 'robots', impact: 'high', effort: 'minutes', title: 'Allow AI search crawlers in robots.txt', why: 'Blocked.', steps: ['Replace robots.txt.'], artifact: { path: 'robots.txt', language: 'text', content: recommendedRobots(robots, bots, 'https://acme.com') } }],
}

describe('markdown for agents', () => {
  it('renders a crawl-only report with crawler table, findings and fenced artifacts', () => {
    const md = reportMarkdown(base)
    expect(md).toContain('**Score 55/100**')
    expect(md).toContain('AI visibility not measured')
    expect(md).toContain('| OAI-SearchBot | OpenAI | search | **no** |')
    expect(md).toContain('```text\n# AI search + answer engines')
    expect(md).not.toContain('What AI says')
  })
  it('renders AI results per question and engine', () => {
    const md = reportMarkdown({
      ...base,
      score: { ...base.score, visibility: 9 },
      ai: {
        questions: ['best analytics?'],
        answers: [
          { engine: 'chatgpt', model: 'm', question: 'best analytics?', text: 'Acme', citations: [], mentioned: true, cited: true, position: 1, brands: ['Acme'], costUsd: 0.01 },
          { engine: 'claude', model: 'm', question: 'best analytics?', text: '', citations: [], mentioned: false, cited: false, brands: [], costUsd: 0, error: 'boom' },
        ],
        mentionRate: 1, citationRate: 1, byEngine: { ChatGPT: { mentioned: 1, cited: 1, total: 1 } },
        topCompetitors: [{ name: 'Tallyhq', count: 3 }], topSources: [{ domain: 'reddit.com', count: 2 }], costUsd: 0.012,
      },
    })
    expect(md).toContain('Named in **100%** of 1 answers')
    expect(md).toContain('| best analytics? | yes (#1), cited |')
    expect(md).toContain('**Recommended instead:** Tallyhq (3)')
  })
  it('says so when there is nothing to fix', () => {
    expect(planMarkdown({ ...base, fixes: [] })).toContain('Nothing to fix')
  })
})
