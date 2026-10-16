# getplugd

**Get your brand recommended by AI.** One command checks whether ChatGPT, Claude, Gemini and Perplexity can read your site, what they actually say when buyers ask about your category, and gives you a fix plan your coding agent can apply.

```bash
npx getplugd audit yourapp.com
```

Or install it globally and use the short command: `npm i -g getplugd`, then `plugd audit yourapp.com`.

## What it checks

- **AI crawler access:** robots.txt rules for every major AI bot, split by purpose:
  - **search** (needed to be cited): OAI-SearchBot, Claude-SearchBot, PerplexityBot, Googlebot, Bingbot…
  - **live fetch:** ChatGPT-User, Claude-User…
  - **training:** GPTBot, ClaudeBot, Google-Extended…
- **CDN/firewall blocking:** does your WAF block AI bots even though robots.txt allows them?
- **Readability:** noindex/nosnippet/noarchive, meta description, readable homepage text, sitemap.
- **Structured data:** Organization and Product/SoftwareApplication schema (kept for clarity; it isn’t a citation lever on its own).
- **What AI says about you** (optional, with your own OpenRouter key):
  1. Generates realistic buyer questions for your category.
  2. Asks each engine with live web search.
  3. Reports how often you're named, your position, whether your site is cited, who's recommended instead, and which sources AI trusts.

## The fix plan

```bash
npx getplugd plan yourapp.com > plugd-plan.md
```

The plan is Markdown, ranked by impact and effort, with ready-to-paste artifacts:
- a corrected `robots.txt` that unblocks AI search bots, while keeping your private paths, training opt-outs and every other rule
- JSON-LD structured data
- meta tags
- outlines for pages answering the questions where you're missing
- outreach targets for the sources AI already cites

## Measure what AI says (bring your own key)

```bash
export OPENROUTER_API_KEY=sk-or-...      # https://openrouter.ai/keys
npx getplugd audit yourapp.com              # asks first; ~$0.40–0.60 for 10 questions × 4 engines
```

| Engine | Default model (web search on) |
|---|---|
| ChatGPT | `openai/gpt-5.4-mini` |
| Claude | `anthropic/claude-haiku-5.5` |
| Gemini | `google/gemini-3.5-flash-lite` |
| Perplexity | `perplexity/sonar` |

Options:
- `--questions 20` sets how many questions to ask.
- `--question "best crm for agencies"` (repeatable) uses your own questions instead.
- `--engines chatgpt,perplexity` picks which engines to ask.
- `--brand "Acme"` sets the brand name to look for.
- `--json` prints the full report as JSON; `--md report.md` also writes it as Markdown.
- `--no-ai` skips the AI checks.

API answers can differ from what people see in the ChatGPT app, and answers vary run to run. Treat one audit as a snapshot. [Plugd Cloud](https://plugd.getplugd.workers.dev) tracks the real interfaces over time.

## Track it over time, free, with your own key

One audit is a snapshot. `track` asks the same buyer questions every time you run it and keeps the answers, so you can see whether you're showing up more often.

```bash
export GEMINI_API_KEY=...                 # https://aistudio.google.com/apikey
npx getplugd track yourapp.com            # first run writes 10 buyer questions and saves them
npx getplugd report                       # how often each engine names and cites you, run by run
npx getplugd report --md report.md
```

- **Where it's kept:** `.plugd/plugd.json` (your site and questions) and `.plugd/history.jsonl` (one line per answer). Commit the folder to keep the trend. The questions stay fixed so runs compare; edit `plugd.json` to change them.
- **Which engines:** Gemini with Google Search if `GEMINI_API_KEY` is set. Otherwise ChatGPT, Claude, Gemini and Perplexity through `OPENROUTER_API_KEY`. Pick with `--engines gemini,chatgpt`.
- **What it costs:** it shows a worst-case estimate and asks first. `--max-cost 0.50` stops starting checks once $0.50 is spent.
  - Gemini: Google Search grounding needs billing turned on in Google Cloud, and the first 5,000 searches a month are free. After that it's $14 per 1,000 searches, plus a fraction of a cent of tokens per answer.
  - OpenRouter: about $0.01 per answer.
  - Bills are between you and the provider. Your keys go straight to them; Plugd never sees them.
- **Reading the numbers:** every rate comes with a 95% range, and a run is only marked ↑ or ↓ when the ranges don't overlap. With 10 questions, a swing from 2 to 3 mentions is noise. Positions inside answers aren't reported, because they reshuffle almost every run.

### Run it every week in GitHub Actions

Copy [`examples/ai-visibility.yml`](https://github.com/mdayan8/plugd/blob/main/examples/ai-visibility.yml) into `.github/workflows/` and add `GEMINI_API_KEY` as a repository secret:

```yaml
on:
  schedule: [{ cron: '0 6 * * 1' }]   # Mondays
permissions: { contents: write, issues: write }
jobs:
  track:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: mdayan8/plugd@v1
        with:
          site: yourapp.com
          gemini-api-key: ${{ secrets.GEMINI_API_KEY }}
          max-cost: '1.00'
```

Each run commits the history and a `REPORT.md` to `.plugd/`, shows the report in the job summary, and opens an issue when an engine names you clearly less often than the run before. Inputs: `site`, `gemini-api-key`, `openrouter-api-key`, `engines`, `max-cost`, `questions`, `dir`, `commit`, `open-issue`.

Or run it from cron, or let [Plugd Cloud](https://plugd.getplugd.workers.dev) run it for you with no keys and a benchmark of your market.

## Use it from your coding agent (MCP)

`npx getplugd mcp` runs a local MCP server with four tools:

| Tool | What it does |
|---|---|
| `audit_site` | Runs the audit (with AI checks if `OPENROUTER_API_KEY` is set) and returns the report |
| `get_fix_plan` | Returns the ranked fix plan with artifacts, ready to apply in your repo |
| `track_questions` | Asks the engines your saved buyer questions and adds the answers to `.plugd/` history (spends your key's credits, capped by `max_cost`, default $0.50) |
| `get_history` | Returns the trend from `.plugd/`, with who's named instead, the sources used and any drop alert (free) |

**Claude Code**
```bash
claude mcp add plugd -e OPENROUTER_API_KEY=sk-or-... -- npx -y getplugd mcp
```

**Codex**: `~/.codex/config.toml`
```toml
[mcp_servers.plugd]
command = "npx"
args = ["-y", "getplugd", "mcp"]
env = { OPENROUTER_API_KEY = "sk-or-..." }
```

**Cursor**: `.cursor/mcp.json`
```json
{ "mcpServers": { "plugd": { "command": "npx", "args": ["-y", "getplugd", "mcp"], "env": { "OPENROUTER_API_KEY": "sk-or-..." } } } }
```

**OpenCode**: `opencode.json`
```json
{ "mcp": { "plugd": { "type": "local", "command": ["npx", "-y", "getplugd", "mcp"], "environment": { "OPENROUTER_API_KEY": "sk-or-..." } } } }
```

Then ask: *"Audit our site for AI visibility and apply the fix plan in this repo."*

## License

AGPL-3.0. Using the CLI, Action and MCP server for your own sites has no obligations; running a modified version as a service for others means sharing your changes. Versions up to 0.1.0 were MIT. Details: [LICENSING.md](https://github.com/mdayan8/plugd/blob/main/LICENSING.md).
