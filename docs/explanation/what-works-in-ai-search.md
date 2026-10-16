# What works in AI search, and what doesn't

A plain-language summary of the [evidence brief](../../research/evidence-2026-10.md) (October 2026). Every point links to its source. Where the evidence is weak, it says so.

## 1. Be readable first

If an engine can't fetch your page, nothing else matters.

- **Each AI company runs separate bots** for search, live fetches and training. Blocking `OAI-SearchBot` removes you from ChatGPT search answers; blocking `GPTBot` only stops training ([OpenAI](https://developers.openai.com/api/docs/bots)). `Google-Extended` doesn't control AI Overviews; only `Googlebot` does ([Google](https://developers.google.com/search/docs/appearance/ai-features#control)).
- **CDNs block bots silently.** A clean robots.txt can sit behind a firewall that returns 403s, and Google lists CDN blocking as a reason pages don't appear ([Google](https://developers.google.com/search/docs/appearance/ai-features)).
- **Most AI crawlers don't run JavaScript.** OpenAI's, Anthropic's, Perplexity's and Meta's bots read raw HTML ([Vercel](https://vercel.com/blog/the-rise-of-the-ai-crawler)). Server-render content, pricing and JSON-LD.
- **Google's AI features use normal Search eligibility:** indexed and snippet-eligible, with no extra requirements ([Google](https://developers.google.com/search/docs/appearance/ai-features)).

## 2. Be talked about elsewhere

- **Brand mentions on other sites correlate with AI visibility about 3× more than backlinks** (0.66 vs 0.22 across 75,000 brands), and YouTube mentions correlate most strongly (about 0.74) ([Ahrefs](https://ahrefs.com/blog/ai-overview-brand-correlation/), [Ahrefs](https://ahrefs.com/blog/ai-brand-visibility-correlations/)). These are correlations, but they line up with research showing AI search leans heavily on third-party sources ([Chen et al.](https://arxiv.org/abs/2509.08919)).
- **The practical move:** find the pages engines cite for your buyer questions (`report` lists them), and earn a place on them honestly. See the [outreach skill](../../skills/ai-citation-outreach/SKILL.md).

## 3. Publish pages that answer buyer questions

- **"Best X for Y" lists and comparisons are the most-cited page type** for top-of-funnel questions (about 44% on ChatGPT) ([Ahrefs](https://ahrefs.com/blog/best-lists-research/)). Write honest ones with clear criteria.
- **Evidence helps.** In a lab study, adding statistics, quotations and cited sources raised visibility by roughly 28–43%, while keyword stuffing lowered it ([GEO, KDD 2024](https://arxiv.org/html/2311.09735v3)). A NeurIPS 2025 benchmark found such tactics often don't hold across domains ([C-SEO Bench](https://arxiv.org/abs/2506.11097)), so treat them as good writing, not a guaranteed lever.
- **Keep it fresh for real.** AI assistants other than Google's AI Overviews skew toward newer pages ([Ahrefs](https://ahrefs.com/blog/do-ai-assistants-prefer-to-cite-fresh-content/)). Update what's outdated and keep dates truthful.

## Structured data

Schema markup keeps facts unambiguous (who you are, what you sell, what it costs), so it's worth doing. But Google says it "isn't required for generative AI search" ([Google](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide#mythbusting)), and a controlled study of 1,885 pages found no lift in AI Mode or ChatGPT citations after adding it ([Ahrefs](https://ahrefs.com/blog/schema-ai-citations/)). Google also removed FAQ rich results in June 2026.

## Myths

| Claim | Reality |
|---|---|
| llms.txt helps you get cited | Google doesn't use it; 97% of llms.txt files got zero requests in a month ([Ahrefs](https://ahrefs.com/blog/llmstxt-study/)). Useful for coding agents reading docs |
| Schema guarantees AI citations | No measured lift ([Ahrefs](https://ahrefs.com/blog/schema-ai-citations/)) |
| "Chunk" content or write a separate version for AI | Google calls it a myth ([Google](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide#mythbusting)) |
| Paragraphs must be 40–60 words | No primary evidence. Google: "there's no ideal page length" |
| Ranking #1 on Google means AI cites you | Only about 38% of AI Overview citations came from the top 10 in March 2026, down from about 76% ([Ahrefs](https://ahrefs.com/blog/ai-overview-citations-top-10/)) |
| Blocking GPTBot hides you from ChatGPT | False. `OAI-SearchBot` controls search |
| API results equal what users see | False ([Surfer](https://surferseo.com/blog/llm-scraped-ai-answers-vs-api-results/)) |

The full brief, with every source and date: [research/evidence-2026-10.md](../../research/evidence-2026-10.md).
