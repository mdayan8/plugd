---
name: answer-engine-content
description: Plan, write or rewrite pages so AI answer engines (ChatGPT, Gemini/AI Overviews, Perplexity, Claude, Copilot) can find, quote and cite them - comparison and "best X for Y" pages, pricing and product pages, original data, answer-first structure. Use when creating content to win AI recommendations, rewriting a page that AI ignores, or turning buyer questions into pages.
---

# Answer-engine content

Last verified: 2026-10-16. Sources: [research/evidence-2026-10.md §2, §3, §5](../../research/evidence-2026-10.md).

## What actually moves citations

Being retrieved matters more than how a page is phrased. In a NeurIPS 2025 benchmark, most "write for LLMs" tactics were ineffective or harmful across domains, while classic SEO (getting ranked and retrieved) was "significantly more effective". ([C-SEO Bench](https://arxiv.org/abs/2506.11097)) So:

1. Make pages that answer the questions buyers actually ask.
2. Make them worth citing: specific, first-hand, with evidence.
3. Make sure they're crawlable text and indexed (see `ai-crawler-access`).

## Which pages to make

Start from the buyer questions where the brand is missing (`npx getplugd audit` lists them). For each, pick the page type AI tends to cite:

- **"Best X for Y" and comparison pages** are the most-cited page type for top-of-funnel prompts (about 44% of what ChatGPT cites for those). ([Ahrefs, 26K URLs](https://ahrefs.com/blog/best-lists-research/)) Write honest comparisons: state the criteria, include real competitors, say who each option is best for, including when it isn't you. Self-ranking lists work on some surfaces today but are fragile across surfaces and model updates.
- **"X vs Y" and "alternatives to X" pages** for named competitors.
- **Product, pricing and docs pages.** When ChatGPT recommends a brand, it then cites that brand's landing, product and docs pages. Pricing must be in the HTML, not loaded by JavaScript.
- **Original data**: a survey, benchmark, or analysis of your own usage data. It's citable on your site and it earns mentions elsewhere, which matter more (see `ai-citation-outreach`).
- **Video**: YouTube is among the most cited domains in Google's AI surfaces, and YouTube mentions correlate most strongly with AI visibility. Put key explanations in a video with a good title, description and transcript, alongside the text page. ([Ahrefs](https://ahrefs.com/blog/ai-brand-visibility-correlations/))

Don't spin up a page for every phrasing variant of a question. Google treats that as scaled content abuse. ([Google](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide))

## How to write them

- **Answer first.** Put the direct answer in the first sentences under a heading that matches the question, then the detail.
- **Descriptive headings, short sections, tables for comparisons.** Microsoft recommends this explicitly for Copilot; Google asks for clear structure for readers. ([Bing](https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c))
- **Be specific and first-hand.** Google asks for "non-commodity" content: real experience, a point of view, things a generic page can't say. ([Google](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide))
- **Back claims with evidence.** Statistics with sources, quotations from named people, links to primary sources. In the GEO lab study these raised visibility by roughly 28–43%, and keyword stuffing lowered it. ([GEO, KDD 2024](https://arxiv.org/html/2311.09735v3)) Treat that as good writing practice, not a guaranteed lift.
- **Name a real author** with relevant experience, and show when the page was last updated.
- **Update for real.** AI assistants other than Google AI Overviews skew toward fresher pages, ChatGPT most strongly. Revisit important pages, change what's outdated, and keep `dateModified` and sitemap `lastmod` truthful. ([Ahrefs, 17M citations](https://ahrefs.com/blog/do-ai-assistants-prefer-to-cite-fresh-content/))
- **Keep key facts in text,** not only in images or video.

## Don't

- Don't "chunk" content or write a separate version for AI. Google calls it a myth.
- Don't follow fixed passage-length rules (40–60 words and so on). There's no primary evidence, and Google says there's no ideal length.
- Don't stuff keywords or brand names.
- Don't invent statistics, quotes or reviews. Every number needs a real source.

## Prompt

To draft a page, use [prompts/page-writer.md](../../prompts/page-writer.md).
