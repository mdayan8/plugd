# Fix AI crawler access

Use this when `npx getplugd audit` shows a ✗ next to a search or user bot, a "CDN/firewall blocks" line, or "very little readable text".

## A search or user bot is blocked in robots.txt

1. Get a corrected file:

   ```bash
   npx getplugd plan yoursite.com > plugd-plan.md
   ```

   The "Allow AI search crawlers in robots.txt" fix contains a full `robots.txt`. It only unblocks the search and user bots that were blocked, and keeps everything else: your private paths, training opt-outs, sitemaps and crawl-delay.

2. Diff it against your current file, then deploy it to `https://yoursite.com/robots.txt`.
3. Re-run the audit. OpenAI says robots.txt changes take about 24 hours to reach ChatGPT search.

**Want to stay out of AI training but stay citable?** Block only the training bots:

```txt
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: CCBot
Disallow: /

User-agent: *
Allow: /

Sitemap: https://yoursite.com/sitemap.xml
```

Two common mistakes:
- Blocking `GPTBot` does **not** remove you from ChatGPT search. `OAI-SearchBot` controls that.
- Blocking `Google-Extended` does **not** remove you from AI Overviews. Only `Googlebot` does.

## Your CDN or firewall blocks the bots

The audit fetched your homepage as a normal browser and as AI bots. The bots got an error (403, 429, 503) or a challenge page while the browser got through.

- **Cloudflare:** check **Security → Bots** (Bot Fight Mode) and **AI Crawl Control**. Allow the search bots you want to be cited by. If you use Cloudflare's managed robots.txt, it blocks training bots only, which is fine for search.
- **Other WAFs:** allow the bot user agents, ideally matched with the vendor's published IP ranges (for example `openai.com/searchbot.json` and `perplexity.com/perplexitybot.json`), because user agents are easy to fake.

Then re-run the audit.

## Your content is rendered by JavaScript

Most AI crawlers (OpenAI's, Anthropic's, Perplexity's and Meta's) read the raw HTML and don't run JavaScript. If the audit says your homepage has very little readable text, check what they see:

```bash
curl -sA "OAI-SearchBot" https://yoursite.com/pricing | grep -i "a sentence or price from the page"
```

If nothing comes back, server-render or pre-render (SSR, SSG or ISR) your main content, pricing, navigation, metadata and JSON-LD.

## Something blocks indexing

Remove `noindex` from pages you want found, and `nosnippet` or a small `max-snippet` from pages you want quoted. For Bing and Copilot, avoid `noarchive`: Bing treats it as "don't use in Copilot".

More background: the [ai-crawler-access skill](../../skills/ai-crawler-access/SKILL.md).
