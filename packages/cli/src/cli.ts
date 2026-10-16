#!/usr/bin/env node
import { writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline/promises'
import { parseArgs, styleText } from 'node:util'
import { gemini, generateQuestions, openRouter, type Engine } from '@getplugd/engines'
import { aliasesFor, audit, ENGINES, estimateAiCost, readSite, type EngineId } from '@plugd/audit'
import { planMarkdown, reportMarkdown } from './markdown'
import { runMcp } from './mcp'
import { reportLines, reportMarkdown as trackMarkdown } from './report'
import { printReport } from './terminal'
import { estimateTrack, loadConfig, loadHistory, saveConfig, track } from './track'

const HELP = `plugd: get your brand recommended by AI

Usage
  npx getplugd audit <site>        Audit AI crawler access, structure, and (with a key) what AI says about you
  npx getplugd plan <site>         Print the full fix plan with ready-to-paste code (Markdown)
  npx getplugd track <site>        Ask the AI engines your buyer questions and save the answers to .plugd/
  npx getplugd report              Show how often AI names and cites you, run by run
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
  -y, --yes                     Don't ask before spending on your API key

Tracking (track / report)
  --dir <folder>                Where history is kept (default .plugd). Commit it to keep a trend.
  --max-cost <usd>              Stop starting new checks once this much is spent
  --engines gemini,chatgpt,...  Default: gemini if GEMINI_API_KEY is set, else all four via OpenRouter
  --questions / --question      Only used on the first run; questions are then frozen in .plugd/plugd.json

Keys are your own and go straight to the provider; Plugd never sees them.
  export GEMINI_API_KEY=...          Gemini with Google Search (https://aistudio.google.com/apikey).
                                     Search needs billing on; the first 5,000 searches a month are free.
  export OPENROUTER_API_KEY=sk-or-...  ChatGPT, Claude, Gemini, Perplexity (https://openrouter.ai/keys)
`

const err = (m: string): never => { console.error(styleText('red', `✗ ${m}`)); process.exit(1) }

async function main() {
  const { values: v, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      json: { type: 'boolean' }, md: { type: 'string' }, 'no-ai': { type: 'boolean' }, questions: { type: 'string' },
      question: { type: 'string', multiple: true }, engines: { type: 'string' }, brand: { type: 'string' }, pages: { type: 'string' },
      dir: { type: 'string' }, 'max-cost': { type: 'string' },
      'allow-local': { type: 'boolean' }, yes: { type: 'boolean', short: 'y' }, help: { type: 'boolean', short: 'h' }, version: { type: 'boolean', short: 'v' },
    },
  })
  const [cmd, target] = positionals
  if (v.version) return console.log('0.3.0')
  if (v.help || !cmd) return console.log(HELP)
  if (cmd === 'mcp') return runMcp({ allowLocal: Boolean(v['allow-local']) })
  if (cmd === 'track') return runTrack(target, v)
  if (cmd === 'report') return runReport(v)
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

type Flags = Record<string, string | boolean | string[] | undefined>

function buildEngines(list: string | undefined): Engine[] {
  const gk = process.env.GEMINI_API_KEY, ok = process.env.OPENROUTER_API_KEY
  if (!gk && !ok) err('Tracking needs an API key: export GEMINI_API_KEY=... or OPENROUTER_API_KEY=sk-or-... (see --help)')
  const ids = (list?.split(',').map(x => x.trim()).filter(Boolean) ?? (gk ? ['gemini'] : Object.keys(ENGINES))) as EngineId[]
  return ids.map(id => {
    if (!(id in ENGINES)) err(`Unknown engine "${id}". Use: ${Object.keys(ENGINES).join(', ')}`)
    if (id === 'gemini' && gk) return gemini({ apiKey: gk, model: process.env.GEMINI_MODEL })
    if (!ok) err(`${ENGINES[id].label} needs OPENROUTER_API_KEY (GEMINI_API_KEY only covers Gemini).`)
    return openRouter({ apiKey: ok!, engine: id })
  })
}

async function confirm(q: string): Promise<boolean> {
  if (!process.stdin.isTTY) return false
  const rl = createInterface({ input: process.stdin, output: process.stderr })
  const a = await rl.question(q)
  rl.close()
  return !/^n/i.test(a.trim())
}

async function runTrack(target: string | undefined, v: Flags) {
  const dir = String(v.dir ?? '.plugd')
  const maxCost = v['max-cost'] === undefined ? undefined : Number(v['max-cost'])
  if (maxCost !== undefined && !(maxCost > 0)) err('--max-cost must be a positive number of US dollars, e.g. --max-cost 0.50')
  const engines = buildEngines(v.engines as string | undefined)
  const log = (m: string) => process.stderr.write(styleText('gray', `  ◇ ${m}\n`))

  let cfg = loadConfig(dir)
  if (cfg && target && !new URL(/^https?:/.test(target) ? target : `https://${target}`).hostname.endsWith(cfg.domain)) {
    err(`${dir} already tracks ${cfg.domain}. Use --dir to track another site.`)
  }
  if (!cfg) {
    if (!target) err('Which site? e.g. npx getplugd track yourapp.com')
    log(`Reading ${target}`)
    const { site, context } = await readSite(target!, { allowLocal: Boolean(v['allow-local']), brand: v.brand as string | undefined }).catch(e => err((e as Error).message))
    let questions = (v.question as string[] | undefined) ?? []
    if (!questions.length) {
      const n = Math.min(30, Math.max(1, Number(v.questions ?? 10) || 10))
      log(`Writing ${n} buyer questions with ${engines[0]!.label}`)
      questions = (await generateQuestions(engines[0]!, site, context, n).catch(e => err((e as Error).message))).questions
      if (!questions.length) err('Could not write buyer questions for this site. Pass your own with --question.')
    }
    cfg = { site: site.url, domain: site.domain, brand: site.brand, aliases: aliasesFor(site), questions, createdAt: new Date().toISOString() }
    saveConfig(dir, cfg)
    log(`Saved ${questions.length} questions to ${dir}/plugd.json. They stay fixed so runs compare; edit the file to change them.`)
  } else if (v.question || v.questions) {
    log(`Using the ${cfg.questions.length} questions in ${dir}/plugd.json (--question/--questions only apply on the first run).`)
  }

  const est = estimateTrack(engines.map(e => e.id), cfg.questions.length)
  const cap = maxCost !== undefined ? ` (stops at $${maxCost.toFixed(2)})` : ''
  const free = engines.some(e => e.id === 'gemini') ? " Gemini's first 5,000 searches a month are free on a billed Google project, so it's usually much less." : ''
  const msg = `Ask ${engines.map(e => e.label).join(', ')} ${cfg.questions.length} questions? Up to about $${est.toFixed(2)} on your key${cap}.${free}`
  if (!v.yes && !(await confirm(`${msg} [Y/n] `))) {
    if (!process.stdin.isTTY) err(`${msg} Re-run with --yes to confirm.`)
    return
  }

  let last = -1
  const res = await track({
    dir, config: cfg, engines, maxCost,
    onProgress: (d, t) => { const p = Math.floor((d / t) * 10); if (p !== last) { last = p; log(`Answers ${d}/${t}`) } },
  })
  const failed = res.records.filter(r => r.error)
  if (failed.length === res.records.length && res.records.length) err(`Every check failed: ${failed[0]!.error}`)
  console.log('\n' + reportLines(cfg, loadHistory(dir)).map(l => `  ${l}`).join('\n') + '\n')
  if (res.skipped) console.log(styleText('yellow', `  Stopped at your --max-cost: ${res.skipped} checks skipped.\n`))
  if (failed.length) console.log(styleText('yellow', `  ${failed.length} checks failed (first error: ${failed[0]!.error}).\n`))
  console.log(styleText('gray', `  This run: $${res.spentUsd.toFixed(3)} at list prices · ${res.records.reduce((s, r) => s + r.searchCalls, 0)} web searches · history in ${dir}/history.jsonl\n`))
}

function runReport(v: Flags) {
  const dir = String(v.dir ?? '.plugd')
  const cfg = loadConfig(dir)
  if (!cfg) err(`Nothing tracked in ${dir} yet. Run: npx getplugd track yourapp.com`)
  const records = loadHistory(dir)
  if (v.md) writeFileSync(String(v.md), trackMarkdown(cfg!, records))
  if (v.json) return console.log(JSON.stringify({ config: cfg, history: records }, null, 2))
  console.log('\n' + reportLines(cfg!, records).map(l => `  ${l}`).join('\n') + '\n')
  if (v.md) console.log(styleText('gray', `  Report written to ${v.md}\n`))
}

main()
