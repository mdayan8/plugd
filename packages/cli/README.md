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

## Use it from your coding agent (MCP)

`npx getplugd mcp` runs a local MCP server with two tools:

| Tool | What it does |
|---|---|
| `audit_site` | Runs the audit (with AI checks if `OPENROUTER_API_KEY` is set) and returns the report |
| `get_fix_plan` | Returns the ranked fix plan with artifacts, ready to apply in your repo |

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

MIT
