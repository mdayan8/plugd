# CLI reference

```bash
npx getplugd <command> [site] [options]
```

Or install it globally and use the short name: `npm i -g getplugd`, then `plugd <command>`. Needs Node.js 20+.

| Command | Does | Needs a key |
|---|---|---|
| [`audit <site>`](#audit) | Crawler access, content checks, score and fix plan summary | No (optional, for AI answers) |
| [`plan <site>`](#plan) | The full fix plan as Markdown, with ready-to-paste code | No |
| [`track [site]`](#track) | Ask your saved buyer questions; append the answers to history | Yes |
| [`report`](#report) | The trend from history | No |
| [`mcp`](#mcp) | Run as a stdio MCP server | Only for AI tools |

Global flags: `-h, --help` and `-v, --version`.

## audit

```bash
npx getplugd audit yoursite.com [options]
```

| Option | Default | What it does |
|---|---|---|
| `--json` | | Print the full report as JSON |
| `--md <file>` | | Also write the report as Markdown |
| `--no-ai` | | Skip asking the AI engines even if a key is set |
| `--questions <n>` | 10 | Buyer questions per engine (1–30) |
| `--question "<text>"` | | Use your own question; repeatable. Skips question writing |
| `--engines a,b` | all four | Engines to ask: `chatgpt`, `claude`, `gemini`, `perplexity` |
| `--brand "<name>"` | from the site | Brand name as customers say it |
| `--pages <n>` | 10 | Maximum pages to scan |
| `--allow-local` | | Allow `localhost` and private addresses |
| `-y, --yes` | | Don't ask before spending |

AI answers in `audit` run through OpenRouter only and need `OPENROUTER_API_KEY`. What's checked and how it's scored: [Audit checks and scoring](audit-checks.md).

## plan

```bash
npx getplugd plan yoursite.com > plugd-plan.md
```

Takes the same site options as `audit` (`--brand`, `--pages`, `--allow-local`). It never asks the AI engines, so it's free, and it prints only the Markdown fix plan, which is easy to pipe into a file or an agent.

## track

```bash
npx getplugd track [site] [options]
```

The first run in a folder needs `site`. It reads the homepage, writes the buyer questions and saves them. Later runs reuse them, and `site` can be left out.

| Option | Default | What it does |
|---|---|---|
| `--dir <folder>` | `.plugd` | Where questions and history are kept |
| `--max-cost <usd>` | none | Stop starting new checks once this much is spent ([how it works](../how-to/control-costs.md)) |
| `--engines a,b` | see below | `gemini`, `chatgpt`, `claude`, `perplexity` |
| `--questions <n>` | 10 | First run only: how many questions to write (1–30) |
| `--question "<text>"` | | First run only: your own questions (repeatable) |
| `--brand "<name>"` | from the site | First run only: brand name to look for |
| `--allow-local` | | Allow `localhost` and private addresses |
| `-y, --yes` | | Don't ask before spending. Required when not running in a terminal (CI) |

**Default engines:** `gemini` when `GEMINI_API_KEY` is set, otherwise all four through `OPENROUTER_API_KEY`. To add more engines with both keys set, use `--engines gemini,chatgpt,claude,perplexity`. Gemini then goes direct to Google and the others through OpenRouter.

**Output:** the full report so far, then a line like `This run: $0.031 at list prices · 18 web searches`.

**Exit codes:** `0` on success (including partial runs and "no" at the prompt), and `1` when there's no key, the input is bad, the site can't be read, every check failed, or it's not running in a terminal and `--yes` wasn't passed.

## report

```bash
npx getplugd report [options]
```

| Option | What it does |
|---|---|
| `--dir <folder>` | History folder (default `.plugd`) |
| `--md <file>` | Also write the report as Markdown |
| `--json` | Print the config and every history record as JSON |
| `--alert <file>` | Write `<file>` only if an engine's latest run clearly dropped. Used by CI to decide whether to open an issue |

For each engine and run, it shows the mention rate with a 95% range, the citation rate, `n`, failures, and ↑/↓ when the ranges don't overlap. Then, for the latest run: who's named instead, the sources used, and how many questions didn't name you.

## mcp

```bash
npx getplugd mcp [--allow-local]
```

Runs an MCP server over stdio. Tools: [MCP tools reference](mcp-tools.md). Setup per agent: [Use Plugd with your coding agent](../how-to/use-with-coding-agents.md).
