#!/usr/bin/env node
import { writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline/promises'
import { parseArgs, styleText } from 'node:util'
import { audit, ENGINES, estimateAiCost, type EngineId } from '@plugd/audit'
import { planMarkdown, reportMarkdown } from './markdown'
import { runMcp } from './mcp'
import { printReport } from './terminal'

const HELP = `plugd: get your brand recommended by AI

Usage
  npx getplugd audit <site>        Audit AI crawler access, structure, and (with a key) what AI says about you
  npx getplugd plan <site>         Print the full fix plan with ready-to-paste code (Markdown)
  npx getplugd mcp                 Run as an MCP server (stdio) for Claude Code, Codex, Cursor, OpenCode

Options
  --json                        Print the full report as JSON
  --md <file>                   Also write the report as Markdown
  --no-ai                       Skip asking the AI engines
  --questions <n>               Buyer questions per engine (default 10, max 30)
  --question "<text>"           Use your own question (repeatable); skips question generation
  --engines chatgpt,claude,...  Engines to ask (default: chatgpt,claude,gemini,perplexity)
  --brand "<name>"              Brand name as customers say it
  --pages <n>                   Max pages to scan (default 10)
  --allow-local                 Allow localhost / private addresses
  -y, --yes                     Don't ask before spending OpenRouter credits

AI checks use your own key: export OPENROUTER_API_KEY=sk-or-...  (https://openrouter.ai/keys)
`

const err = (m: string): never => { console.error(styleText('red', `✗ ${m}`)); process.exit(1) }

async function main() {
  const { values: v, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      json: { type: 'boolean' }, md: { type: 'string' }, 'no-ai': { type: 'boolean' }, questions: { type: 'string' },
      question: { type: 'string', multiple: true }, engines: { type: 'string' }, brand: { type: 'string' }, pages: { type: 'string' },
      'allow-local': { type: 'boolean' }, yes: { type: 'boolean', short: 'y' }, help: { type: 'boolean', short: 'h' }, version: { type: 'boolean', short: 'v' },
    },
  })
  const [cmd, target] = positionals
  if (v.version) return console.log('0.2.0')
  if (v.help || !cmd) return console.log(HELP)
  if (cmd === 'mcp') return runMcp({ allowLocal: Boolean(v['allow-local']) })
  if (cmd !== 'audit' && cmd !== 'plan') err(`Unknown command "${cmd}". Run npx getplugd --help`)
  if (!target) err(`Which site? e.g. npx getplugd ${cmd} yourapp.com`)

  const key = process.env.OPENROUTER_API_KEY
  const engines = (v.engines?.split(',').map(s => s.trim()) ?? Object.keys(ENGINES)) as EngineId[]
  const bad = engines.find(e => !(e in ENGINES))
  if (bad) err(`Unknown engine "${bad}". Use: ${Object.keys(ENGINES).join(', ')}`)
  const questions = Math.min(30, Math.max(1, Number(v.questions ?? 10) || 10))
  const custom = v.question ?? []
  let useAi = Boolean(key) && !v['no-ai'] && cmd === 'audit'

  if (useAi && !v.yes) {
    const est = estimateAiCost(custom.length || questions, engines)
    if (!process.stdin.isTTY) err(`This will spend about $${est.toFixed(2)} of your OpenRouter credits. Re-run with --yes to confirm, or --no-ai to skip.`)
    const rl = createInterface({ input: process.stdin, output: process.stderr })
    const a = await rl.question(`Ask ${engines.length} AI engines ${custom.length || questions} questions each? Costs about $${est.toFixed(2)} on your OpenRouter key. [Y/n] `)
    rl.close()
    useAi = !/^n/i.test(a.trim())
  }

  const quiet = Boolean(v.json) || cmd === 'plan'
  const log = (m: string) => { if (!quiet) process.stderr.write(styleText('gray', `  ◇ ${m}\n`)) }
  let last = -1
  const report = await audit(target!, {
    allowLocal: Boolean(v['allow-local']),
    brand: v.brand,
    maxPages: Number(v.pages ?? 10) || 10,
    onStep: log,
    onAiProgress: (d, t) => { const p = Math.floor((d / t) * 10); if (!quiet && p !== last) { last = p; process.stderr.write(styleText('gray', `  ◇ AI answers ${d}/${t}\n`)) } },
    ai: useAi ? { apiKey: key!, questions, engines, customQuestions: custom } : null,
  }).catch(e => err((e as Error).message))

  if (v.md) writeFileSync(v.md, reportMarkdown(report))
  if (v.json) return console.log(JSON.stringify(report, null, 2))
  if (cmd === 'plan') return console.log(planMarkdown(report))
  printReport(report, false)
  if (v.md) console.log(styleText('gray', `  Report written to ${v.md}\n`))
}

main()
