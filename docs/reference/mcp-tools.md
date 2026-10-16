# MCP tools reference

Started with `npx getplugd mcp` (stdio). Keys come from the server's environment: `GEMINI_API_KEY` and `OPENROUTER_API_KEY`.

| Tool | Spends credits | Read-only |
|---|---|---|
| [`audit_site`](#audit_site) | Only with `OPENROUTER_API_KEY` and `check_ai` not `false` | Yes |
| [`get_fix_plan`](#get_fix_plan) | No | Yes |
| [`track_questions`](#track_questions) | Yes, capped | No: appends to history |
| [`get_history`](#get_history) | No | Yes |

## audit_site

Audits a site: AI crawler access, CDN blocking, content and structured data, and, with an OpenRouter key, what the engines answer. Returns a Markdown report with a score, findings and the fix plan summary.

| Parameter | Type | Description |
|---|---|---|
| `url` | string, required | e.g. `"acme.com"` |
| `brand` | string | Brand name, if different from the site title |
| `check_ai` | boolean | Ask the AI engines. Default `true` when `OPENROUTER_API_KEY` is set |
| `questions` | integer 1–20 | Buyer questions per engine (default 10) |

## get_fix_plan

Returns the ranked fix plan with ready-to-apply artifacts: robots.txt, JSON-LD, meta tags, page outlines and outreach targets. It reuses the latest `audit_site` result for that site, or runs a quick crawl-only audit.

| Parameter | Type | Description |
|---|---|---|
| `url` | string, required | e.g. `"acme.com"` |

## track_questions

Asks the engines the site's saved buyer questions with live web search, scores each answer for mention and citation, and appends to the local history. The first call in a folder needs `url`, and writes the questions or uses `questions`. **Spends the user's credits.** The tool description tells the agent to confirm with the user first.

| Parameter | Type | Description |
|---|---|---|
| `url` | string | Site to track. Needed on the first call for a folder |
| `engines` | array of `gemini` / `chatgpt` / `claude` / `perplexity` | Default: `gemini` with a Gemini key, otherwise all four |
| `max_cost` | number, > 0 and ≤ 5 | US dollars to stop at (default `0.50`) |
| `questions` | array of strings, ≤ 30 | Your own questions; only used on the first call |
| `dir` | string | History folder (default `.plugd`, relative to the server's working directory) |

Returns the trend so far, plus this run's answer count, cost, any skipped checks and any errors. If a key is missing, the tool returns an error that names the variable to set.

## get_history

Returns the history as Markdown: one row per run and engine, who's named instead, the sources used, the questions where you're missing, and an **Alert** section if the latest run clearly dropped. It makes no API calls.

| Parameter | Type | Description |
|---|---|---|
| `dir` | string | History folder (default `.plugd`) |
