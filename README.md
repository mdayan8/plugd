# Plugd

**Get your site found, cited and recommended by AI.** Open-source tools to check how ChatGPT, Claude, Gemini and Perplexity see your site, fix what's in the way, and let your coding agent do the work.

- **CLI:** `npx getplugd audit yourapp.com` checks AI crawler access, readability and structured data, then asks the AI engines real buyer questions (with your own OpenRouter key).
- **Tracking:** `npx getplugd track yourapp.com` asks the same buyer questions each run and keeps the answers in `.plugd/`; `npx getplugd report` shows the trend with honest error ranges. Free with your own Gemini or OpenRouter key.
- **GitHub Action:** `uses: mdayan8/plugd@v1` runs the tracking weekly in your repo with your key, commits the history, and opens an issue when AI names you less often. See [examples/ai-visibility.yml](examples/ai-visibility.yml).
- **MCP server:** `npx getplugd mcp` gives Claude Code, Codex, Cursor and OpenCode four tools: `audit_site`, `get_fix_plan`, `track_questions` and `get_history`.
- **Skills:** AEO, GEO and SEO playbooks your agent can follow, built from vendor docs and published research, with sources.
- **Prompts:** the system prompts behind the audit, readable and reusable.

```bash
npx getplugd audit yourapp.com
```

## Use it in Claude Code

Install the plugin. You get the skills, plus the MCP server wired up:

```
/plugin marketplace add mdayan8/plugd
/plugin install plugd@plugd
```

Then ask: *"Audit our site for AI visibility and fix what you can in this repo."*

Codex, Cursor and OpenCode: copy the folders in [`skills/`](skills) into your agent's skills directory, and see [packages/cli/README.md](packages/cli/README.md#use-it-from-your-coding-agent-mcp) for MCP setup.

## Skills

| Skill | Use it when |
|---|---|
| [ai-visibility-audit](skills/ai-visibility-audit/SKILL.md) | You want the full picture: run the audit, read the results, decide what to fix first |
| [ai-crawler-access](skills/ai-crawler-access/SKILL.md) | AI bots can't read the site: robots.txt, CDN/WAF blocking, JavaScript rendering |
| [structured-data](skills/structured-data/SKILL.md) | Adding or fixing JSON-LD (Organization, Product, Article…) |
| [answer-engine-content](skills/answer-engine-content/SKILL.md) | Writing or rewriting pages so AI engines quote and cite them |
| [ai-citation-outreach](skills/ai-citation-outreach/SKILL.md) | Getting mentioned on the sites AI already trusts |
| [ai-visibility-tracking](skills/ai-visibility-tracking/SKILL.md) | Measuring share of voice across engines without fooling yourself |

Every claim in a skill links to its source. Where the evidence is weak or contested (llms.txt, for example), the skill says so.

## Prompts

| Prompt | What it's for |
|---|---|
| [ai-visibility-agent](prompts/ai-visibility-agent.md) | System prompt for a coding agent that audits a site and fixes it in the repo |
| [page-writer](prompts/page-writer.md) | Drafting a comparison, "best X for Y" or pricing page that AI engines can quote |
| [outreach-email](prompts/outreach-email.md) | Pitching the authors of pages AI already cites |
| [buyer-questions](prompts/buyer-questions.md) | How the audit writes realistic buyer questions |
| [brand-extractor](prompts/brand-extractor.md) | How the audit reads which brands an answer recommends |

## Research

[research/evidence-2026-10.md](research/evidence-2026-10.md) is the evidence behind every skill: official docs from Google, OpenAI, Anthropic, Perplexity and Microsoft, peer-reviewed studies, and industry data, each with its source and date, plus a register of popular AEO/GEO myths. Corrections with sources are welcome as pull requests.

## Repo layout

```
packages/engines/ engine providers: Gemini (Google Search) and ChatGPT/Claude/Perplexity via OpenRouter, plus brand extraction
packages/audit/   audit engine (TypeScript library)
packages/cli/     `getplugd` CLI + stdio MCP server, published to npm
action.yml        GitHub Action (weekly tracking in your repo); example workflow in examples/
skills/           Agent Skills (SKILL.md) for Claude Code, Codex, Cursor
prompts/          system prompts used by the audit and the skills
research/         sourced evidence brief the skills are built on
.claude-plugin/   Claude Code plugin + marketplace manifest
```

## Develop

Needs Node 20+ and pnpm 10.

```bash
pnpm install
pnpm build
pnpm test
node packages/cli/dist/cli.js audit example.com --no-ai
```

## Hosted version

[Plugd Cloud](https://plugd.getplugd.workers.dev) runs the checks on a schedule, tracks the answers over time and shows the lift from each fix.

## License

MIT. See [LICENSE](LICENSE).
