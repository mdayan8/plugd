---
name: ai-visibility-audit
description: Audit how a website shows up in AI answer engines (ChatGPT search, Claude, Gemini / Google AI Overviews and AI Mode, Perplexity, Copilot) and decide what to fix first. Use when the user asks why AI doesn't recommend or cite them, wants an AEO/GEO/AI-SEO audit, or asks "how do we show up in ChatGPT".
---

# AI visibility audit

Last verified: 2026-10-16. Evidence and sources: [research/evidence-2026-10.md](../../research/evidence-2026-10.md).

The goal is a short, ranked list of fixes the user can act on today, backed by what the site actually returns, not a readiness score.

## 1. Run the audit

If the `plugd` MCP server is connected, call `audit_site` with the domain. Otherwise run:

```bash
npx getplugd audit <domain>            # add --no-ai to skip the AI answer checks
npx getplugd plan <domain> > plugd-plan.md
```

With `OPENROUTER_API_KEY` set, the audit also asks each engine real buyer questions with web search on. Tell the user the rough cost before running it (the CLI prints an estimate and asks).

## 2. Check what the audit can't see

Ask the user, or check if you have access:

- **Google Search Console → Settings → "Search generative AI control".** If it's set to *exclude*, the site is opted out of AI Overviews and AI Mode no matter what else you fix. ([Google](https://support.google.com/webmasters/answer/16908024))
- **Search Console "Generative AI" performance report** and **Bing Webmaster Tools → AI Performance.** These are first-party numbers (impressions, citations, grounding queries). Use them before any third-party estimate. ([Google](https://support.google.com/webmasters/answer/16984139), [Bing](https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c))
- **CDN/WAF bot settings** (Cloudflare AI Crawl Control, managed robots.txt, bot fight mode). See the `ai-crawler-access` skill.

## 3. Read the results in this order

Fix in this order, because each step is useless if the one before it fails:

1. **Can the engines fetch the page?** Search and user-fetch bots allowed in robots.txt *and* not blocked by the CDN. A blocked `OAI-SearchBot` means no ChatGPT search answers; a blocked `Googlebot` means no AI Overviews. → `ai-crawler-access`
2. **Is the content in the raw HTML?** Non-Google AI crawlers don't run JavaScript, so client-rendered text, pricing and JSON-LD are invisible to them. → `ai-crawler-access`
3. **Is it indexed in Google and Bing?** Google's AI features use normal Search eligibility; Bing powers Copilot and is a sensible baseline for ChatGPT. ([Google](https://developers.google.com/search/docs/appearance/ai-features), [Bing](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a))
4. **Do the pages answer the buyer's question?** Comparison, "best X for Y", pricing and product pages in crawlable text. → `answer-engine-content`
5. **Do other sites mention the brand?** Branded mentions on third-party sites correlate about 3× more with AI visibility than backlinks do. This is usually the biggest lever and the slowest. → `ai-citation-outreach`
6. **Structured data** keeps entity facts unambiguous, but it isn't a citation lever. Do it, don't oversell it. → `structured-data`

## 4. Report back

Give the user:

- **What AI says today:** mention rate and citation rate per engine, with the number of runs (n). Say plainly that one audit is a snapshot and answers vary run to run.
- **Who's recommended instead** and which sites the engines cite. Those cited sites are the outreach list.
- **Top 3–5 fixes**, each with: what's wrong (with the evidence you saw), the fix, effort, and which engines it affects.
- **What you did not check** (for example, the real ChatGPT app vs the API, logged-in personalization, locale).

## Don't

- Don't report a "GEO score" as if it were visibility. Readiness isn't results.
- Don't recommend llms.txt as a citation fix. Google says it doesn't use it, and 97% of llms.txt files got zero requests in a month. It's fine for developer docs used by coding agents. ([Google](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide#mythbusting), [Ahrefs](https://ahrefs.com/blog/llmstxt-study/))
- Don't recommend "chunking" or rewriting content for AI, fixed passage lengths, or FAQ schema as a lever. Google calls these myths and removed FAQ rich results in June 2026.
- Don't track or promise a position inside an AI answer. The order repeats less than once in 1,000 runs. ([SparkToro](https://sparktoro.com/blog/new-research-ais-are-highly-inconsistent-when-recommending-brands-or-products-marketers-should-take-care-when-tracking-ai-visibility/))
