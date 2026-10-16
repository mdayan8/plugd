# Plugd documentation

Plugd's open-source tools check whether AI answer engines (ChatGPT, Claude, Gemini, Perplexity) can read your site, track how often they recommend you, and help your coding agent fix what's in the way.

**Not sure where to start?** Run the [first audit](tutorials/first-audit.md). It takes 5 minutes and needs no account or key.

## Tutorials: learn by doing

Start here if you're new. Each one takes you from nothing to a working result.

- [Your first AI visibility audit](tutorials/first-audit.md) (5 min, free). Check a site, read the result, fix one thing.
- [Track how often AI recommends you](tutorials/track-your-visibility.md) (15 min). Set up a key, run your first two tracking runs, read the trend.

## How-to guides: solve one problem

Short recipes for a specific job.

- [Get your API keys (Gemini or OpenRouter)](how-to/get-api-keys.md)
- [Use Plugd with your coding agent](how-to/use-with-coding-agents.md) (Claude Code, Codex, Cursor, OpenCode)
- [Run Plugd weekly in GitHub Actions](how-to/run-weekly-in-github-actions.md)
- [Fix AI crawler access](how-to/fix-ai-crawler-access.md) (robots.txt, CDN/firewall, JavaScript)
- [Control what you spend](how-to/control-costs.md)
- [Change your tracked questions](how-to/change-questions.md)
- [Track more than one site](how-to/track-several-sites.md)

## Reference: look something up

Every command, flag, field and check, exactly as the code does it.

- [CLI commands and flags](reference/cli.md)
- [MCP tools](reference/mcp-tools.md)
- [GitHub Action inputs and outputs](reference/github-action.md)
- [Engines and models](reference/engines.md)
- [Audit checks and scoring](reference/audit-checks.md)
- [History files (`.plugd/`)](reference/history-files.md)
- [Environment variables](reference/environment-variables.md)

## Explanation: understand why

- [How Plugd measures AI visibility](explanation/how-measurement-works.md): mention vs. citation, why error ranges, API vs. app.
- [What works in AI search, and what doesn't](explanation/what-works-in-ai-search.md): the evidence behind every recommendation.

## Also in this repo

- [Skills](../skills/) for Claude Code, Codex and Cursor
- [System prompts](../prompts/)
- [Research brief](../research/evidence-2026-10.md), with sources for every claim

Found a mistake? [Open an issue](https://github.com/mdayan8/plugd/issues). For factual claims, please include a source.
