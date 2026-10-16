---
name: ai-citation-outreach
description: Get a brand mentioned on the third-party sites AI engines already cite - "best X" lists, review platforms, YouTube, communities, Wikipedia (within policy), local listings. Use when AI recommends competitors instead of the user, when on-site fixes are done but visibility is still low, or when planning digital PR for AI search.
---

# AI citation outreach

Last verified: 2026-10-16. Sources: [research/evidence-2026-10.md §3, §6](../../research/evidence-2026-10.md).

## Why this comes first for most brands

AI search leans heavily on third-party sources over a brand's own site. ([Chen et al., 2025](https://arxiv.org/abs/2509.08919)) Across 75,000 brands, branded mentions on other sites correlated 0.66 with AI Overview visibility, against 0.22 for referring domains, and YouTube mentions correlated about 0.74. ([Ahrefs](https://ahrefs.com/blog/ai-overview-brand-correlation/), [Ahrefs](https://ahrefs.com/blog/ai-brand-visibility-correlations/)) These are correlations, but they point the same way: being talked about beats being linked to.

## 1. Build the target list from real answers

1. Run the buyer questions (`npx getplugd audit <domain>` with an OpenRouter key, or the real apps by hand).
2. Collect every URL the engines cite for questions where you're missing. The audit's "sources AI trusts" list is this.
3. Group them: listicles and review articles, review platforms (G2, Capterra, Trustpilot, Yelp…), YouTube videos, Reddit and forum threads, Wikipedia, news.
4. Prioritise sources cited by more than one engine, and by questions closest to buying. Most cited domains are cited by only one engine, so check each engine separately.

## 2. Work each source type honestly

- **"Best X" lists and reviews:** contact the author with something useful: a free account to test, real data, a clear explanation of who you're best for. Ask to be evaluated, not listed.
- **Review platforms:** complete the profile and describe the product the same way your site does. Ask real customers for reviews. Never buy or incentivise fake reviews.
- **YouTube:** pitch creators who already review the category, or publish your own demos and comparisons. Mentions in titles, descriptions and transcripts all count.
- **Reddit and communities:** answer real questions as yourself, disclose that you work on the product, and follow each community's rules. Never seed fake posts or sockpuppets. Google says inauthentic mentions don't help and spam systems apply, and Reddit's citation share swings wildly (ChatGPT went from about 60% to about 10% of responses in weeks in 2025). ([Semrush](https://www.semrush.com/blog/most-cited-domains-ai/))
- **Wikipedia:** don't edit your own company's article. Under the [conflict-of-interest policy](https://en.wikipedia.org/wiki/Wikipedia:Conflict_of_interest), suggest changes on the Talk page with independent sources. Keep Wikidata facts accurate.
- **Original research and PR:** publish data journalists and list authors can cite. This is the most durable way to earn mentions.
- **Local and commerce:** Google Business Profile, Bing Places and Merchant Center, kept accurate.

## 3. Draft the outreach

Use [prompts/outreach-email.md](../../prompts/outreach-email.md). Keep it short, specific to their page, and give them a reason that helps their readers. Never send on the user's behalf without their approval.

## 4. Measure

Re-run the same questions monthly. Look for the brand starting to appear in answers that cite the pages you worked on. Expect weeks to months, not days.
