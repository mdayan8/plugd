# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This is Plugd's public, open-source repo (github.com/mdayan8/plugd): the AI visibility audit engine, the `getplugd` CLI and MCP server, and sourced AEO/GEO/SEO skills and prompts. The hosted app (Plugd Cloud) lives in a separate private repo.

## Commands

pnpm 10, Node 20+.

```bash
pnpm install
pnpm build          # packages/cli/dist/cli.js
pnpm test
pnpm typecheck

pnpm --filter @plugd/audit exec vitest run src/audit.test.ts -t "robots"   # one test by name
node packages/cli/dist/cli.js audit example.com --no-ai                   # run the CLI from source
claude plugin validate .                                                  # check the Claude Code plugin manifest
```

The CLI's version is hard-coded in three places that must match: `packages/cli/package.json`, `packages/cli/src/cli.ts` (`--version`) and `packages/cli/src/mcp.ts` (`VERSION`). The user publishes to npm from their own account.

## Architecture

- **`packages/engines`** (`@getplugd/engines`): one provider per AI engine behind the `Engine` interface (`ask` with web search, `complete` without). `gemini.ts` uses the Gemini Interactions API with the `google_search` tool, and its `searchCalls` count is what Google bills against the 5,000 free searches a month. `openrouter.ts` covers ChatGPT, Claude and Perplexity with the user's OpenRouter key. `brands.ts` has the deterministic `mentions` and `cites` checks plus `extractBrands`. It uses only `fetch`, so it runs in the CLI, a GitHub Action and the private Worker. Model prices live in `gemini.ts`; update them when Google's pricing page changes.
- **`packages/audit`** is a library; `audit()` in `src/index.ts` runs the whole audit:
  - robots.txt rules per AI bot. `bots.ts` tags each bot as `search`, `user` or `training`, and the score only penalises blocked search and user bots.
  - A CDN/WAF probe that fetches with AI user agents.
  - Homepage, sitemap and sample-page reads (`page.ts`).
  - Optional AI answers through OpenRouter with web search on (`ai.ts`): generate buyer questions, ask each engine, extract the brands named, then compute mention rate, citation rate and competitors.
  - `findings.ts` turns all of that into findings and a score.
  - `plan.ts` turns findings into ranked fixes with ready-to-paste artifacts. `recommendedRobots` only unblocks blocked search and user bots and keeps every other rule.
  - Every outbound fetch goes through `fetcher.ts`, which carries the SSRF guard (`assertPublicUrl`) and a browser-like user agent.
- **`packages/cli`** is the npm package `getplugd` (binary `plugd`): `audit`, `plan`, `track`, `report` and `mcp`.
  - `track.ts`/`report.ts` keep local history in `.plugd/plugd.json` (site + frozen questions) and `.plugd/history.jsonl` (one `TrackRecord` per answer, appended as each lands). `--max-cost` reserves each engine's worst case (`PER_QUESTION`) before a check and settles to the actual cost after. `report` only marks ↑/↓ when Wilson 95% intervals don't overlap. `mcp` is a stdio MCP server with the tools `audit_site` and `get_fix_plan`. tsup bundles `@plugd/audit` into one file (`noExternal`), so `@plugd/audit` is only a devDependency.
- **`skills/*/SKILL.md`** are Agent Skills; **`prompts/`** holds system prompts. `buyer-questions.md` and `brand-extractor.md` mirror the prompts in `ai.ts`, so keep them in sync.
- **`research/evidence-2026-10.md`** is the sourced evidence brief that every skill and audit rule is built on.
- **`.claude-plugin/`** plus **`.mcp.json`** make the repo installable as a Claude Code plugin (`/plugin marketplace add mdayan8/plugd`).

## Rules

- **Evidence first.** Every factual claim in a skill or prompt needs a source link and should match `research/evidence-2026-10.md`. Bump the skill's "Last verified" date when you re-check a claim.
- **Don't add debunked advice.** Don't present llms.txt, schema/FAQ markup, "chunking" or fixed passage lengths as citation levers. Don't report a position inside AI answers. Report mention and citation rates with the number of runs.
- **Keep both copies in sync.** `packages/audit` and `packages/cli` are duplicated in the private app repo, so mirror changes there until it depends on this repo.
- **License.** Everything here is MIT.
