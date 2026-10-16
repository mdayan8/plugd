---
name: ai-crawler-access
description: Make sure AI search and answer engines can actually fetch and read a site - robots.txt rules per bot purpose (search vs user-fetch vs training), CDN/WAF blocking (Cloudflare and others), and JavaScript rendering. Use when editing robots.txt, when AI engines can't see or cite a site, when deciding which AI bots to block, or when a site is client-rendered.
---

# AI crawler access

Last verified: 2026-10-16. Sources: [research/evidence-2026-10.md §1, §4](../../research/evidence-2026-10.md).

## Know what each bot does

Every AI company runs separate bots for search, user-triggered fetches and training. Block training if you want; never block search if you want to be cited.

| Purpose | Bots | Block it and… |
|---|---|---|
| **Search index** (needed to be cited) | `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`, `Googlebot`, `Bingbot`, `Applebot`, `Meta-WebIndexer` | you disappear from that engine's answers |
| **User fetch** (someone asked the AI to open your page) | `ChatGPT-User`, `Claude-User`, `Perplexity-User`, `MistralAI-User`, `Meta-ExternalFetcher` | the AI can't read the page when asked. Most of these may ignore robots.txt; `Claude-User` obeys it |
| **Training** | `GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`, `Meta-ExternalAgent`, `CCBot` | future models don't train on you. Search is unaffected |

Sources: [OpenAI](https://developers.openai.com/api/docs/bots), [Anthropic](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler), [Perplexity](https://docs.perplexity.ai/docs/resources/perplexity-crawlers), [Apple](https://support.apple.com/en-us/119829), [Meta](https://developers.facebook.com/docs/sharing/webmasters/web-crawlers/).

Two traps:
- **`Google-Extended` does not control AI Overviews or AI Mode.** Only `Googlebot` does. Blocking `Google-Extended` only affects Gemini apps and Vertex grounding/training. ([Google](https://developers.google.com/search/docs/appearance/ai-features#control))
- **Blocking `GPTBot` does not remove you from ChatGPT search.** Blocking `OAI-SearchBot` does. ([OpenAI](https://developers.openai.com/api/docs/bots))

## Edit robots.txt safely

- Change only the groups that block a search or user-fetch bot. Keep every other rule: private paths, training opt-outs, sitemaps, crawl-delay.
- `npx getplugd plan <domain>` (or the MCP `get_fix_plan` tool) outputs a corrected robots.txt that does exactly this. Diff it against the current file before applying.
- If the user wants to opt out of training while staying citable:

```txt
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: CCBot
Disallow: /

User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml
```

OpenAI says robots.txt changes take about 24 hours to apply.

## Check the CDN/WAF, not just robots.txt

A clean robots.txt means nothing if the firewall returns 403s or challenges to AI bots. Google explicitly lists CDN blocking as a reason pages can't appear. ([Google](https://developers.google.com/search/docs/appearance/ai-features))

- **Probe it from outside:** fetch the homepage and a key page with each AI user agent and check status code and body. `npx getplugd audit` does this ("Checking whether your CDN lets AI bots in"). A 403, 429, 503 or a challenge page means blocked.
- **Cloudflare:** the managed robots.txt prepends `Disallow` for training bots (`GPTBot`, `ClaudeBot`, `Google-Extended`, …) and adds a `Content-signal` line. That's fine for search, but check the AI Crawl Control / bot settings too: crawlers are grouped as Search, Agent and Training, and when one crawler falls under several rules the strictest wins. Verify current behaviour in [Cloudflare's docs](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/) before changing rules. (A secondary source reports that a Training block can also stop Googlebot or Bingbot on newer zones; treat as unverified.)
- **Allow rules should match user agent *and* the vendor's published IP ranges** (`openai.com/searchbot.json`, `perplexity.com/perplexitybot.json`), because user agents are trivially spoofed.

## Make content readable without JavaScript

OpenAI's, Anthropic's, Perplexity's and Meta's crawlers fetch HTML but don't execute JavaScript (Googlebot and Applebot do). Measured in Dec 2024 by [Vercel/MERJ](https://vercel.com/blog/the-rise-of-the-ai-crawler); assume it still holds until re-measured.

- Check: `curl -sA "OAI-SearchBot" https://example.com/pricing | grep -i "<the price or key sentence>"`. If it's not in the raw HTML, AI search engines can't see it.
- Fix: server-render or pre-render (SSR/SSG/ISR) the main content, pricing, navigation, metadata and JSON-LD. Don't inject JSON-LD with client-side JS.

## Also

- Keep `noindex`, `nosnippet`, `data-nosnippet` and `max-snippet` off pages you want quoted; they limit AI features too.
- Keep sitemap `lastmod` accurate (only change it when the content changes) and, for Bing/Copilot, submit changes through IndexNow. ([Bing](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a))
- Make sure pages respond quickly; AI fetchers use short timeouts.
