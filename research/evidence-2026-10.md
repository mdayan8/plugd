# AI search evidence brief (October 2026)

Researched 2026-10-16. Every bullet has its source. Dates are publish or "last updated" dates where the page shows one. Tags used below:

- **[OFFICIAL]**: the vendor's own documentation.
- **[PEER-REVIEWED]** or **[PREPRINT]**: academic work.
- **[INDUSTRY]**: vendor or agency study. These are correlational, and the vendor often sells the tracking tool.
- **[CONTESTED]** or **[MYTH]**: see the evidence given with the bullet.

---

## 0. The ten things that matter most (TL;DR)

1. **Google says AI features run on normal Search.** No extra technical requirements. No special schema. llms.txt is ignored. Avoid "chunking" and inauthentic mentions. Source: [Google, Optimizing for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), updated 2026-07-10.
2. **Separate bots by purpose.** Each AI company uses different user agents for search indexing, user-triggered fetches and training, and each can be allowed or blocked on its own. Blocking `OAI-SearchBot` removes you from ChatGPT search answers. Blocking `GPTBot` does not. Source: [OpenAI crawlers](https://developers.openai.com/api/docs/bots).
3. **Check the CDN or WAF, not only robots.txt.** Cloudflare's managed robots.txt and its AI-bot blocking can silently opt a site out. From 2026-09-15, a Cloudflare "training" block can also hit multi-purpose crawlers such as Googlebot. Sources: [Cloudflare managed robots.txt](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/); [SEO-Kreativ summary](https://www.seo-kreativ.de/en/blog/cloudflare-ki-crawler-googlebot/), 2026-07-04, updated 2026-09-06.
4. **Server-render your content.** The main non-Google AI crawlers do not execute JavaScript. Source: [Vercel/MERJ](https://vercel.com/blog/the-rise-of-the-ai-crawler), Dec 2024.
5. **Brand mentions off your own site correlate far more with AI visibility than backlinks do.** YouTube mentions correlate about 0.74. Branded web mentions correlate 0.66 vs 0.22 for referring domains. Sources: [Ahrefs 75K brands](https://ahrefs.com/blog/ai-brand-visibility-correlations/), Dec 2025; [Ahrefs AIO](https://ahrefs.com/blog/ai-overview-brand-correlation/), 2025.
6. **Ranking in Google is now a weaker predictor of AI Overview citations.** Only about 38% of AI Overview citations come from the top 10, down from about 76% in July 2025. Source: [Ahrefs](https://ahrefs.com/blog/ai-overview-citations-top-10/), 2026-03-02.
7. **GEO paper tactics.** Quotations, statistics, cited sources and fluency each lifted visibility by roughly 27–43% in the lab. Keyword stuffing hurt. A NeurIPS 2025 benchmark found most such methods do not hold up across domains. Sources: [Aggarwal et al., KDD 2024](https://arxiv.org/html/2311.09735v3); [C-SEO Bench](https://arxiv.org/abs/2506.11097).
8. **Schema did not move AI citations, and llms.txt is almost never read.** 97% of llms.txt files got zero requests in a month. Sources: [Ahrefs schema DiD study](https://ahrefs.com/blog/schema-ai-citations/), 2026-05-11; [Ahrefs llms.txt study](https://ahrefs.com/blog/llmstxt-study/), Jun 2026.
9. **First-party measurement now exists.** Google Search Console has Generative AI performance reports for all sites since 2026-08-31. Bing Webmaster Tools has AI Performance, with citations, grounding queries and citation share. Sources: [Google](https://support.google.com/webmasters/answer/16984139); [Bing](https://blogs.bing.com/search/2026/6/New-AI-Visibility-Insights-in-Bing-Webmaster-Tools-Intents-Topics-Citation-Share-Compare/).
10. **Measure many runs through the UI, not the API.** The same list of brands comes back less than 1 time in 100 runs. API and UI answers differ a lot. Sources: [SparkToro](https://sparktoro.com/blog/new-research-ais-are-highly-inconsistent-when-recommending-brands-or-products-marketers-should-take-care-when-tracking-ai-visibility/), Jan 2026; [Surfer, 13,779 answers](https://surferseo.com/blog/llm-scraped-ai-answers-vs-api-results/), 2026.

---

## 1. Official vendor guidance

### Google: AI Overviews and AI Mode

- **[OFFICIAL] Eligibility.** A page must be indexed and eligible to show with a snippet. "There are no additional technical requirements." Source: [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features), updated 2025-12-10.
- **[OFFICIAL] How it works.** The features use RAG/grounding on Google's core ranking systems, plus "query fan-out": concurrent related sub-queries. AI Overviews and AI Mode can use different models, so the links they show differ. Sources: [AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), 2026-07-10; [AI features](https://developers.google.com/search/docs/appearance/ai-features).
- **[OFFICIAL] Content.** Google asks for "non-commodity" content: first-hand experience and a unique point of view. Its contrasting example is "7 Tips for First-Time Homebuyers" (commodity) vs a first-hand inspection story (non-commodity). Creating pages for every fan-out query variant to manipulate results violates the **scaled content abuse** policy. Source: [AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).
- **[OFFICIAL] What Google says you can ignore.**
  - llms.txt, "special" markup and Markdown files: Google Search does not use them.
  - "Chunking" content.
  - Rewriting content for AI.
  - Seeking inauthentic mentions.
  - Overfocusing on structured data: "Structured data isn't required for generative AI search, and there's no special schema.org markup you need to add."
  - Source: [AI optimization guide § Mythbusting](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide#mythbusting).
- **[OFFICIAL] Technical checklist.**
  - Allow crawling in robots.txt *and in your CDN or hosting*.
  - Use internal links.
  - Keep important content available as text.
  - Make structured data match the visible text.
  - Keep Merchant Center and Business Profile up to date.
  - Follow JavaScript SEO practices.
  - Reduce duplicate content.
  - Sources: [AI features](https://developers.google.com/search/docs/appearance/ai-features); [AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).
- **[OFFICIAL] New opt-out control.** Search Console has a "Search generative AI control": include (the default) or exclude your site from AI Overviews, AI Mode and Discover generative features. It was rolled out to all sites by 2026-08-31. Any audit should check that the site is not set to *exclude*. Source: [Search Console Help 16908024](https://support.google.com/webmasters/answer/16908024).
- **[OFFICIAL] Preview controls.** `nosnippet`, `data-nosnippet`, `max-snippet` and `noindex` limit how content appears in AI features. `Google-Extended` controls training and grounding in Google's *other* systems (Gemini apps, Vertex). It does **not** control Search AI features. Sources: [AI features § control](https://developers.google.com/search/docs/appearance/ai-features#control); [Google Search Central blog](https://developers.google.com/search/blog/2025/05/succeeding-in-ai-search), 2025-05-21.
- **[OFFICIAL] Measurement.** The Generative AI performance report shows impressions, pages, countries, devices and dates for AI Overviews and AI Mode. It launched 2026-06-03 for a subset of sites and was rolled out to all sites by 2026-08-31. Sources: [Google blog](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports); [Help](https://support.google.com/webmasters/answer/16984139).
- **[OFFICIAL] FAQ rich results.** Google removed the FAQ rich result documentation in June 2026. The feature's visibility had been limited to government and health sites since 2023. Source: [Search docs updates](https://developers.google.com/search/updates#removing-faq-rich-result).

### OpenAI: ChatGPT search

- **[OFFICIAL] OpenAI's user agents** (source for this list: [OpenAI crawlers](https://developers.openai.com/api/docs/bots)):
  - `OAI-SearchBot`: surfaces sites in ChatGPT search. "Sites that are opted out of OAI-SearchBot will not be shown in ChatGPT search answers," though they can still appear as navigational links. Changes take about 24 hours to apply. IP ranges: `openai.com/searchbot.json`.
  - `GPTBot`: collects training data only. Blocking it does not affect search.
  - `ChatGPT-User`: user-initiated fetches. "robots.txt rules may not apply." It is not used to decide search inclusion.
  - `OAI-AdsBot`: visits ad landing pages only.
- **[OFFICIAL] Bing.** Bing says it powers "AI tools like ChatGPT." Being indexed in Bing is therefore a sensible baseline, but OpenAI documents no ranking factors. Sources: [Bing Webmaster blog](https://blogs.bing.com/webmaster/2025/6/Start-Using-Bing-Webmaster-Tools-to-Improve-Your-Site-Visibility/), 2025-06-17. On IndexNow helping ChatGPT: [eSEOspace](https://eseospace.com/blog/bing-webmaster-tools-indexnow-ai-search/), "not confirmed."
- **[INDUSTRY] Referral tagging.** ChatGPT appends `utm_source=chatgpt.com` to referral links. This is widely reported, but the OpenAI help page that used to say so now redirects. Re-verify before putting it in a skill. Source: [Okara, citing OpenAI publisher FAQ](https://okara.ai/blog/how-to-get-recommended-by-chatgpt), 2026-10-01.

### Anthropic: Claude

- **[OFFICIAL] Anthropic's three bots.** All three honor robots.txt, including the user-fetch bot, and support `Crawl-delay`. Anthropic says it does not bypass CAPTCHAs. Sources: [Anthropic support 8896518](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler); [SER](https://www.seroundtable.com/anthropic-updates-its-crawler-docs-40978.html).
  - `ClaudeBot`: training.
  - `Claude-SearchBot`: search indexing. Blocking it "may reduce your site's visibility."
  - `Claude-User`: user-initiated fetches.
- Note the contrast: OpenAI's and Perplexity's user-fetch bots may ignore robots.txt, while Anthropic's says it obeys. Source: [SEJ](https://www.searchenginejournal.com/anthropics-claude-bots-make-robots-txt-decisions-more-granular/568253/), 2026.

### Perplexity

- **[OFFICIAL] Perplexity's two bots** (source: [Perplexity crawlers](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)):
  - `PerplexityBot`: search indexing, not training. IP ranges: `perplexity.com/perplexitybot.json`.
  - `Perplexity-User`: user fetches. It "generally ignores robots.txt."
- The docs include Cloudflare and AWS WAF allow-rule recipes that match on user agent *and* IP. Changes take up to 24 hours. Same source.

### Microsoft: Bing and Copilot

- **[OFFICIAL] Same index.** The Bing Webmaster Guidelines now cover Bing search, Copilot and grounding API results together. Their message: SEO fundamentals decide eligibility for grounding and citations. Specific asks:
  - Accurate `lastmod` values.
  - ETags.
  - IndexNow submissions streamed as pages change, rather than in batches.
  - Canonical URLs, because duplicates "reduce Bing's confidence in selecting a URL for grounding."
  - Images and video should not be the only source of key information.
  - Source: [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a).
- **[OFFICIAL] AI Performance report** (Feb 2026, public preview). It shows total citations, cited pages, *grounding queries* (Copilot's internal reformulated queries) and page-level citation counts. June 2026 added Intents, Topics, **Citation Share** and Compare. A citation is not a click. Sources: [Bing blog Feb 2026](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/); [Bing blog Jun 2026](https://blogs.bing.com/search/2026/6/New-AI-Visibility-Insights-in-Bing-Webmaster-Tools-Intents-Topics-Citation-Share-Compare/); [Help](https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c).
- **[OFFICIAL] Microsoft's content advice:**
  - Descriptive headings, concise sections, tables and FAQ-style content.
  - Support claims with evidence.
  - Keep content fresh.
  - Register in Bing Places.
  - Sources: [Bing AI Performance help](https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c); [Microsoft Ads blog Oct 2025](https://about.ads.microsoft.com/en/blog/post/october-2025/optimizing-your-content-for-inclusion-in-ai-search-answers).
- **[INDUSTRY] Schema at Bing.** Bing's Fabrice Canel said at SMX Munich (Mar 2025) that schema helps Bing's LLMs understand content. Source: [Search Engine Land](https://searchengineland.com/microsoft-bing-copilot-use-schema-for-its-llms-453455).
- **IndexNow participants.** Bing, Yandex, Naver and Seznam. Google does not participate. Source: [eSEOspace](https://eseospace.com/blog/bing-webmaster-tools-indexnow-ai-search/), citing the IndexNow participant list.

### Apple, Meta, Mistral

- **[OFFICIAL] Apple.** `Applebot` crawls and renders JS. `Applebot-Extended` is a **control token only**: disallowing it opts content out of Apple's foundation-model training, and nothing fetches as that user agent. Source: [Apple Support 119829](https://support.apple.com/en-us/119829).
- **[OFFICIAL] Meta's crawlers** (source: [Meta web crawlers](https://developers.facebook.com/docs/sharing/webmasters/web-crawlers/)):
  - `Meta-WebIndexer`: Meta AI search and citations. Honors robots.txt.
  - `Meta-ExternalAgent`: training and product indexing. Honors robots.txt.
  - `Meta-ExternalFetcher`: user fetches. May bypass robots.txt.
  - `FacebookExternalHit`: link previews.
  - `Meta-ExternalAds`: ads.
- **[OFFICIAL] Mistral.** `MistralAI-User` handles user fetches only, with no automated crawling or training. It has published IP ranges. Source: [Mistral docs](https://docs.mistral.ai/robots).

---

## 2. Research on what gets content cited

- **[PEER-REVIEWED] GEO (Aggarwal et al., KDD 2024)** tested rewrites of source text on GEO-bench. Relative gains in position-adjusted word count vs baseline:

  | Tactic | Gain |
  |---|---|
  | Quotation Addition | +42.6% |
  | Statistics Addition | +32.8% |
  | Fluency Optimization | +28.7% |
  | Cite Sources | +27.7% |
  | Technical Terms | +18.5% |
  | Easy-to-Understand | +13.8% |
  | Authoritative tone | +12.3% |
  | Unique Words | +6.2% |
  | Keyword Stuffing | **−8.7%** |

  - Best combination: Fluency + Statistics.
  - Cite Sources raised visibility of the **rank-5** source by 115.1%, while the top-ranked source fell 30.3%.
  - On real Perplexity.ai, Quotation Addition went from 24.0 to 28.8 and Keyword Stuffing from 24.0 to 21.9.
  - Effects vary by domain.
  - Sources: [arXiv 2311.09735 v3](https://arxiv.org/html/2311.09735v3), revised 2024-06-28; [abstract](https://arxiv.org/abs/2311.09735).
- **[PEER-REVIEWED] C-SEO Bench (NeurIPS 2025)** tested these methods across tasks, domains and multiple competing actors. Most "are not only largely ineffective but also frequently have a negative impact." Traditional SEO, meaning getting retrieved and ranked into the context, was "significantly more effective." No method helped on QA tasks. Sources: [arXiv 2506.11097](https://arxiv.org/abs/2506.11097); [NeurIPS poster](https://neurips.cc/virtual/2025/poster/121465).
- **[PREPRINT] Chen et al., 2025.** AI search shows "a systematic and overwhelming bias towards Earned media (third-party, authoritative sources) over Brand-owned and Social content," compared with Google's more balanced mix. Source: [arXiv 2509.08919](https://arxiv.org/abs/2509.08919).
- **How to read this.** Treat GEO's tactics as *good writing hygiene* that holds up in a lab, not as a guarantee. Being retrieved, through rankings and third-party coverage, dominates. Sources: C-SEO Bench and Chen et al., above.

---

## 3. Industry studies on AI citations (2025–2026)

### Which domains get cited

- **[INDUSTRY] Semrush** (230K prompts, more than 100M citations, Jul–Oct 2025):
  - Reddit and LinkedIn are in the top 5 on ChatGPT, AI Mode and Perplexity.
  - ChatGPT cited Reddit in about 60% of responses in early August 2025. That fell to about 10% by mid-September.
  - AI Mode favours Google-owned properties and cites Wikipedia in only about 2% of responses.
  - Source: [Semrush](https://www.semrush.com/blog/most-cited-domains-ai/), 2025-11-10.
- **[INDUSTRY] Ahrefs, share of citations by domain:**

  | Platform | Wikipedia | YouTube |
  |---|---|---|
  | ChatGPT | 16.3% | not in top list |
  | Perplexity | 12.5% | 16.1% |
  | AI Overviews | 8.4% | 9.5% |

  Source: [Ahrefs AI SEO stats](https://ahrefs.com/blog/ai-seo-statistics/), 2025, citing its top-10-domains study.
- **[INDUSTRY] Profound.** Perplexity's top-10 source share is Reddit 46.7%, YouTube 13.9%, Gartner 7.0%, then Yelp, LinkedIn, Forbes, NerdWallet, TripAdvisor, G2 and PCMag. Leading source by platform: ChatGPT is led by Wikipedia; AI Overviews and Perplexity are led by Reddit. Source: [Profound](https://www.tryprofound.com/blog/ai-platform-citation-patterns).
- **[INDUSTRY] Domain mix in commercial answers.** In about 16.4K commercial answers (Mar–Jun 2026):
  - 69.6% of cited domains were cited by only one of five engines. Only 2.7% were cited by all five.
  - Vendor, product and long-tail pages took 90.6% of citations. Reddit took 1.8% and Wikipedia 0.6%.
  - So the "Reddit and Wikipedia dominate" story depends heavily on query type.
  - Source: SurfacedBy, summarized by [info.link](https://info.link/research/chatgpt-api-vs-ui-do-they-return-the-same-citations). It is a single vendor study.

### Page types

- **[INDUSTRY] "Best X" lists.** They were 43.8% of page types cited by ChatGPT for top-of-funnel queries, including lists where the publisher ranked itself first. Prominence across platforms: AI Overviews 48.9%, ChatGPT 43.8%, Perplexity 41.9%, AI Mode 39.2%. When ChatGPT recommends a brand, it also cites other pages on that brand's site:
  - Software: landing pages 37.2%.
  - Products: product pages 87.2%.
  - Sources: [Ahrefs best-lists study, 26,283 URLs](https://ahrefs.com/blog/best-lists-research/), Dec 2025; [Ahrefs how to rank in AIO](https://ahrefs.com/blog/how-to-rank-in-ai-overviews/), 2026.
- **[CONTESTED] Listicles do not hold up on every surface.** A Peec AI study (555 prompts × 47 runs) found listicles were 25% of citations on one ChatGPT surface but 4% on the other, depending on API vs UI. Self-promotional lists may lose effectiveness as models change. Source: [info.link summary of Peec AI](https://info.link/research/chatgpt-api-vs-ui-do-they-return-the-same-citations), Aug 2026. It is a single vendor study.

### Correlation with Google rankings

- **[INDUSTRY] AI Overview citations from the top 10.**
  - March 2026: 37.9% of citations came from the top 10, 31.2% from positions 11–100 and 31.0% from pages outside the top 100 (863K SERPs, 4M AIO URLs).
  - July 2025: about 76%.
  - 18% of non-ranking citations come from YouTube.
  - Sources: [Ahrefs](https://ahrefs.com/blog/ai-overview-citations-top-10/), 2026-03-02; [Ahrefs 76% study](https://ahrefs.com/blog/search-rankings-ai-citations/).
- **[INDUSTRY] ChatGPT and Google results.** For short-tail prompts, 20.7% of ChatGPT citations are in Google's top 100 and 10% are in the top 10. Overall, 12% of AI citations are in Google's top 10. Source: [Ahrefs AI SEO stats](https://ahrefs.com/blog/ai-seo-statistics/).
- **[INDUSTRY] Seer.** LLM mentions correlate with the number of Google keywords a site ranks for (0.65). They correlate weakly with DR (0.25) and backlinks (0.10). Source: Seer data cited in [Ahrefs](https://ahrefs.com/blog/ai-overview-brand-correlation/).

### Brand mentions vs links

- **[INDUSTRY] Ahrefs, 75K brands, AI Overviews.** Spearman correlations: branded web mentions 0.664, branded anchors 0.527, branded search volume 0.392, referring domains 0.218. Brands in the top quartile of web mentions had a median of 169 AI Overview mentions, vs 14 in the next quartile. 26% of brands had zero mentions. Sources: [Ahrefs](https://ahrefs.com/blog/ai-overview-brand-correlation/); figures as summarized by [CiteFlow](https://www.citeflow.io/blog/brand-mentions-vs-backlinks).
- **[INDUSTRY] Ahrefs follow-up, Dec 2025.** YouTube mentions are the strongest correlate (about 0.71–0.74) across ChatGPT, AI Mode and AI Overviews. ChatGPT correlates least with classic authority signals (DR, backlinks) and most with ad metrics (about 0.27–0.29). This is correlation only. Source: [Ahrefs](https://ahrefs.com/blog/ai-brand-visibility-correlations/).

### Freshness

- **[INDUSTRY] Ahrefs, 17M citations.** URLs cited by AI assistants average 1,064 days old, vs 1,432 days in organic SERPs: 25.7% "fresher." ChatGPT has the strongest preference, citing URLs 458 days newer than organic results. Google AI Overviews show no freshness preference (+16 days, i.e. slightly older). Source: [Ahrefs](https://ahrefs.com/blog/do-ai-assistants-prefer-to-cite-fresh-content/), Jul 2025.

### Traffic context

- **[INDUSTRY] Ahrefs, 2026.**
  - An AI Overview lowers CTR for top-ranking pages by 58%, up from 34.5% eight months earlier.
  - Google sends about 190x more traffic than ChatGPT.
  - ChatGPT has about 12% of Google's search volume.
  - Source: [Ahrefs Q1 2026 benchmark press release](https://www.businesswire.com/news/home/20260526119691/en/Across-75000-Brands-YouTube-Mentions-Are-the-Strongest-Signal-of-AI-Visibility-New-Ahrefs-Report-Reveals), 2026-05-26.
- **[OFFICIAL] Scale.** AI Mode passed 1 billion monthly users. Source: [Google I/O 2026](https://blog.google/products-and-platforms/products/search/search-io-2026/), 2026-05-19.

Not collected in this pass: SE Ranking and BrightEdge figures (for example AI Overview trigger rates). Add them if a skill needs them.

---

## 4. Technical

### robots.txt by bot purpose

| Purpose | Allow to be cited | Block to opt out of training |
|---|---|---|
| Search index | `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`, `Meta-WebIndexer`, `Googlebot`, `Bingbot`, `Applebot` | — |
| User-triggered fetch | `ChatGPT-User`, `Claude-User`, `Perplexity-User`, `MistralAI-User`, `Meta-ExternalFetcher` | (often ignore robots.txt; Claude-User obeys it) |
| Training | — | `GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`, `Meta-ExternalAgent`, `CCBot` |

Sources: the vendor docs in §1, and the [ai.robots.txt community list](https://github.com/ai-robots-txt/ai.robots.txt/blob/main/table-of-bot-metrics.md).

- **Pitfalls.**
  - `Googlebot` is the *only* control for Google Search AI features. Blocking `Google-Extended` does not remove you from AI Overviews. Source: [Google AI features](https://developers.google.com/search/docs/appearance/ai-features#control).
  - A user agent can be spoofed. Verify bots against each vendor's published IP JSON. Sources: [OpenAI](https://developers.openai.com/api/docs/bots); [Perplexity](https://docs.perplexity.ai/docs/resources/perplexity-crawlers).

### CDN and WAF

- **[OFFICIAL] Cloudflare managed robots.txt.** It prepends `Disallow` for `GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`, `meta-externalagent`, `CCBot`, `Bytespider` and `Amazonbot`. It also adds a `Content-signal: search=yes, ai-train=no` line. Content Signals define `search`, `ai-input` (RAG and grounding) and `ai-train`. Source: [Cloudflare docs](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/).
- **[OFFICIAL/INDUSTRY] Cloudflare's new crawler categories.**
  - Cloudflare now groups AI crawlers as Search, Agent and Training.
  - For domains onboarding from 2026-09-15, Training and Agent are blocked by default on pages with ads.
  - When a multi-purpose crawler is subject to several rules, the most restrictive one applies. A Training block can therefore stop Googlebot, Applebot and Bingbot.
  - Source: [SEO-Kreativ](https://www.seo-kreativ.de/en/blog/cloudflare-ki-crawler-googlebot/), 2026-07-04, citing [Cloudflare blog](https://blog.cloudflare.com/content-independence-day-ai-options/). **Verify against Cloudflare's own docs before shipping a rule.**
- **[OFFICIAL] Pay per crawl.** Each crawler can be set to allow, charge (HTTP 402 with a `crawler-charged` header) or block. Source: [Cloudflare](https://blog.cloudflare.com/introducing-pay-per-crawl/).
- **Implication for an audit.** Fetch key URLs with each AI user agent *from outside the site*, and check the status code and body. A clean robots.txt can still be paired with WAF 403s or challenges. Google also lists CDN blocking explicitly. Source: [Google AI features](https://developers.google.com/search/docs/appearance/ai-features).

### JavaScript rendering

- **[INDUSTRY] Vercel/MERJ, Dec 2024.** None of the major AI crawlers execute JavaScript: OpenAI's three bots, ClaudeBot, PerplexityBot, Meta-ExternalAgent and Bytespider. ChatGPT's and Claude's crawlers *fetch* JS files (11.5% and 23.8% of requests) but do not run them. Googlebot and Applebot do render JS. Sources: [Vercel](https://vercel.com/blog/the-rise-of-the-ai-crawler); [Lantern summary](https://www.asklantern.com/blogs/ai-crawlers-do-not-render-javascript).
- This is a 2024 measurement, and Claude-SearchBot was not tested. **Assume no JS** until it is re-measured. Use SSR, SSG or ISR for content, metadata and navigation. Source: same.
- **[INDUSTRY] JSON-LD.** Schema injected with JavaScript is probably invisible to non-rendering bots. Source: [Ahrefs schema study, limitations](https://ahrefs.com/blog/schema-ai-citations/).

### Structured data

- **[OFFICIAL] Google.** Schema is "not required" for AI features, and "no special schema.org markup" exists for them. Keep using it for rich-result eligibility, and keep it matched to visible text. Source: [AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).
- **[INDUSTRY] Ahrefs difference-in-differences study.** 1,885 pages that added JSON-LD (Aug 2025–Mar 2026) were compared with 4,000 matched controls:
  - AI Mode: no effect.
  - ChatGPT: no effect.
  - AI Overviews: −4.6%, small and unexplained.
  - Only pages already heavily cited were tested. The 53% of cited pages that have schema reflects correlation, not cause.
  - Source: [Ahrefs](https://ahrefs.com/blog/schema-ai-citations/), 2026-05-11.
- **[CONTESTED] Bing.** Bing says schema helps its LLMs understand pages ([SEL](https://searchengineland.com/microsoft-bing-copilot-use-schema-for-its-llms-453455)). Google's Mueller: "yes, no, and it depends" ([SER via SEO-Kreativ](https://www.seo-kreativ.de/en/blog/faq-rich-results-discontinued/)).
- **Pragmatic set** (for entity clarity and rich results, *not* as citation levers):
  - `Organization` with `sameAs`.
  - `Article` with author and `dateModified`.
  - `Product`/`Offer`, `LocalBusiness`, `BreadcrumbList`.
  - Merchant Center feeds for e-commerce.
  - Source: Google's guide above.

### Sitemaps and lastmod

- **[OFFICIAL] Bing.** Asks for accurate `lastmod`, ETags and streamed IndexNow submissions. Source: [Bing guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a).
- **[OFFICIAL] Google.** Uses `lastmod` only if it is consistently and verifiably accurate. Do not bump it without a real change. Source: [Google sitemaps docs](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

### llms.txt: [MYTH as a citation lever]

- **[OFFICIAL] Google.** Search "doesn't use" llms.txt, and maintaining one neither helps nor harms. Source: [AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).
- **[INDUSTRY] Usage data.**
  - Of about 38K domains with a valid llms.txt (out of 137,210), 97% got **zero** requests in May 2026. AI bots never requested llms.txt from sites that did not have one. Source: [Ahrefs](https://ahrefs.com/blog/llmstxt-study/), Jun 2026.
  - A roughly 900-domain log study found no verified frontier-lab crawler requesting the file. Source: [Digital Applied](https://www.digitalapplied.com/blog/llms-txt-in-practice-adoption-evidence-2026).
  - Mueller: "AFAIK none of the AI services have said they're using LLMs.TXT." Source: [Baselinelabs](https://baselinelabs.ai/blog/llms-txt-google-search).
- **Where it does matter.** IDE and coding agents and MCP doc tools do fetch it, and Mintlify-hosted docs ship it by default. Lighthouse added an llms.txt audit in its "agentic browsing" category on 2026-05-05; it only flags fetch errors. Sources: [Limy](https://limy.ai/blog/llms-txt-in-2026-the-full-guide); [PPC Land](https://ppc.land/google-adds-llms-txt-to-lighthouse-as-agentic-web-standards-heat-up/).
- **Skill guidance.** Make llms.txt optional and low-priority, and position it for developer docs and agents. Never score it as a citation factor.

### Page speed

- **[OFFICIAL]** Google and Bing recommend good page experience and low latency. Source: [AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).
- No study found here shows an AI-citation effect specific to speed. Treat speed as baseline SEO and UX hygiene, and make sure pages respond quickly so fetches with short timeouts succeed. This is a reasonable inference, not evidence.

---

## 5. Content patterns

- **Answer-first sections, descriptive headings, tables, FAQ-style blocks.** Recommended by Microsoft [OFFICIAL] ([Bing AI Performance help](https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c)). Google asks for clear sections and headings *for readers* ([Google guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)).
- **[MYTH] Fixed passage lengths.** "40–60-word" or "134–167-word" passage rules have no primary source. Google explicitly says "there's no ideal page length" and no need to chunk. Source: [Google](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide#mythbusting).
- **Original data, quotations, statistics, cited sources.** Supported in the lab by [GEO](https://arxiv.org/html/2311.09735v3) and by Google's "non-commodity" guidance. Bing says to "Support claims with evidence" ([Bing help](https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c)). Original data also earns third-party mentions, which correlate with visibility ([Ahrefs](https://ahrefs.com/blog/ai-brand-visibility-correlations/)).
- **Comparison and "best X for Y" pages.** These are the most-cited page type for commercial and top-of-funnel prompts ([Ahrefs](https://ahrefs.com/blog/best-lists-research/)). Write honest comparisons with stated criteria. Self-ranking lists are **[CONTESTED]**: they work today on some surfaces but are fragile across surfaces and model updates ([info.link/Peec](https://info.link/research/chatgpt-api-vs-ui-do-they-return-the-same-citations)). They can also drift into scaled-content abuse if spun up per fan-out query ([Google](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)).
- **Product, pricing and docs pages that are crawlable text.** When ChatGPT recommends a brand, it then cites that brand's landing, product and doc pages ([Ahrefs](https://ahrefs.com/blog/best-lists-research/)). Pricing stuck in client-side JS is invisible to non-rendering bots ([Vercel](https://vercel.com/blog/the-rise-of-the-ai-crawler)).
- **Author and E-E-A-T signals.** Google asks for expert or experienced, people-first content ([helpful content guide](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)). No study found here isolates author bylines as a cause of citation.
- **Updating dates.** AI assistants other than AI Overviews skew toward fresher URLs ([Ahrefs 17M](https://ahrefs.com/blog/do-ai-assistants-prefer-to-cite-fresh-content/)). Make real updates and keep `dateModified` and `lastmod` accurate ([Bing](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)). Fake date bumps are risky and unsupported.
- **Images and video as supporting content.** Google ([guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)) and Bing ([guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)) both say to use them alongside text, not instead of it. YouTube is the top cited domain in Google AI surfaces ([Ahrefs](https://ahrefs.com/blog/ai-brand-visibility-correlations/)).

---

## 6. Off-site

- **Earned media first.** AI search is biased toward third-party authoritative sources ([Chen et al.](https://arxiv.org/abs/2509.08919)). Branded mentions correlate about 3x more strongly than referring domains ([Ahrefs](https://ahrefs.com/blog/ai-overview-brand-correlation/)). The practical playbook:
  - Find the "best X" lists and reviews AI already cites for your target prompts.
  - Earn inclusion on them through outreach, demos or data.
  - Source: [Ahrefs](https://ahrefs.com/blog/how-to-rank-in-ai-overviews/).
- **YouTube.** It is the strongest correlate of AI visibility ([Ahrefs](https://ahrefs.com/blog/ai-brand-visibility-correlations/)) and is cited heavily by AI Overviews and AI Mode. Brand mentions in titles, transcripts and descriptions all count in Ahrefs' metric.
- **Reddit and community.** Reddit is heavily cited, but its share is volatile; ChatGPT went from about 60% to about 10% within weeks ([Semrush](https://www.semrush.com/blog/most-cited-domains-ai/)). Google warns that inauthentic mentions don't help and spam systems apply ([Google](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide#mythbusting)). Participate authentically; do not seed fake posts.
- **Review platforms.** G2, Gartner, Yelp, TripAdvisor, NerdWallet and PCMag appear among Perplexity's top sources ([Profound](https://www.tryprofound.com/blog/ai-platform-citation-patterns)). Keep profiles complete and positioned the same way as your own site. The "consensus" rationale is practitioner opinion.
- **Wikipedia and Wikidata.** Wikipedia is ChatGPT's top cited domain (16.3%, [Ahrefs](https://ahrefs.com/blog/ai-seo-statistics/)), but its weight varies by surface (about 2% in AI Mode, [Semrush](https://www.semrush.com/blog/most-cited-domains-ai/)). Edit only within [Wikipedia's conflict-of-interest policy](https://en.wikipedia.org/wiki/Wikipedia:Conflict_of_interest): suggest changes on the Talk page. Skills must not encourage COI editing.
- **Local and commerce.** Google Business Profile, Merchant Center ([Google](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)) and Bing Places ([Bing](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/)).

---

## 7. Measurement

- **First-party data, to use first.**
  - Google Search Console Generative AI report: impressions and pages ([Google](https://support.google.com/webmasters/answer/16984139)).
  - Bing AI Performance: citations, grounding queries and citation share ([Bing](https://blogs.bing.com/search/2026/6/New-AI-Visibility-Insights-in-Bing-Webmaster-Tools-Intents-Topics-Citation-Share-Compare/)).
  - Referrals in analytics, for example `utm_source=chatgpt.com`; this tag is unverified, see §1.
  - Your own server logs filtered by verified AI user agents.
- **Prompt sets.** Build them from real intents across funnel stages, then group wording variants under one core intent. SparkToro found that 142 differently worded human prompts still converged on a consistent set of brands, so intent matters more than exact wording. Source: [SparkToro](https://sparktoro.com/blog/new-research-ais-are-highly-inconsistent-when-recommending-brands-or-products-marketers-should-take-care-when-tracking-ai-visibility/), Jan 2026.
- **Metrics:**
  - Mention rate: the share of runs that mention the brand.
  - Citation rate: the share of runs that cite your domain.
  - Share of voice against a fixed competitor set.
  - Citation share per prompt, the same idea as Bing's metric.
  - Do **not** track rank position inside an answer. The order repeats less than once in 1,000 runs ([SparkToro](https://sparktoro.com/blog/new-research-ais-are-highly-inconsistent-when-recommending-brands-or-products-marketers-should-take-care-when-tracking-ai-visibility/)).
- **Variance.**
  - The same list of brands comes back less than 1 time in 100 runs ([SparkToro](https://sparktoro.com/blog/new-research-ais-are-highly-inconsistent-when-recommending-brands-or-products-marketers-should-take-care-when-tracking-ai-visibility/)).
  - Report rates with *n* and a confidence interval.
  - One estimate puts stable citation share at roughly 40–50 queries on Gemini and 150 or more on ChatGPT search. Source: IQRush, via [info.link](https://info.link/research/chatgpt-api-vs-ui-do-they-return-the-same-citations). It is a single vendor study.
- **API vs UI.**
  - Surfer (13,779 answers): the ChatGPT API named 13.8 brands per answer vs 7.9 in the UI, and cited 3.1 sources vs 12.1 in the UI. Page-level source overlap between API and UI was only 4.8–6.2% on ChatGPT and 19.7% on Perplexity. Source: [Surfer](https://surferseo.com/blog/llm-scraped-ai-answers-vs-api-results/), 2026.
  - Peec AI: average brand visibility differed by 41% between UI and API. Source: [info.link](https://info.link/research/chatgpt-api-vs-ui-do-they-return-the-same-citations).
  - An API call without web search reflects training data only ([Paprik](https://paprik.ai/blog/accurate-api-based-ai-visibility-tracking-chatgpt-ui)).
  - **Rule: label every measurement with its surface, model, whether search was on, locale and date.**
- **Other pitfalls.**
  - Personalization and memory.
  - Location: ChatGPT search uses location ([OpenAI help](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)).
  - Logged-in vs logged-out sessions.
  - Model changes that reshuffle sources overnight, as with the September 2025 Reddit drop ([Semrush](https://www.semrush.com/blog/most-cited-domains-ai/)).
  - Mention is not citation, and citation is not a click ([Bing](https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c)).

---

## 8. Existing open-source skills and repos

Stars as of 2026-10-16, from the GitHub API. Descriptions are paraphrased, not copied.

| Repo | Stars | What it covers |
|---|---|---|
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) (`skills/ai-seo`) | 54,930 | Broad marketing skill pack. The AI-SEO skill covers structure, authority and presence; bot purposes; prompt testing over 3–5 runs |
| [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) (AEO agent and skill) | 28,245 | Mega-pack. The AEO skill has E-E-A-T and LLM-citation-pattern reference docs |
| [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) | 19,010 | 26 sub-skills and 19 subagents: technical SEO, schema, GEO, agent-readiness, optional data extensions (DataForSEO etc.) |
| [onvoyage-ai/gtm-engineer-skills](https://github.com/onvoyage-ai/gtm-engineer-skills) | 1,321 | AEO/GEO "scores": 16 checks, 6 dimensions, fixes per framework, plus content and Reddit research skills |
| [Auriti-Labs/geo-optimizer-skill](https://github.com/Auriti-Labs/geo-optimizer-skill) | 1,091 | CLI, Python and MCP audit with points per signal; `geo citations --runs 5` queries real engines with confidence intervals |
| [leopard627/fire-your-seo-agency](https://github.com/leopard627/fire-your-seo-agency) | 731 | SEO, AEO and GEO plus Naver |
| [SNLabat/SEO-GEO-AEO-Skill](https://github.com/SNLabat/SEO-GEO-AEO-Skill) | 244 | Single audit SKILL.md built around FAQ and HowTo schema and question headings |
| [aleclindz/seo-skill-bench](https://github.com/aleclindz/seo-skill-bench) | 51 | **A benchmark** for SEO skills: fixture sites with planted defects and deterministic scoring. Useful for testing ours |
| [RankSpotAI/awesome-seo-agent-skills](https://github.com/RankSpotAI/awesome-seo-agent-skills) | 52 | Curated list |

### What they get wrong or miss

1. **Statistics misquoted from the GEO paper.** One popular skill lists "Cite sources +40%, statistics +37%, quotations +30%." The paper's GEO-bench table actually has Quotation +42.6%, Statistics +32.8%, Cite Sources +27.7%. None of these skills mention the C-SEO Bench result that such methods often fail or backfire. Sources: [coreyhaines ai-seo SKILL.md](https://raw.githubusercontent.com/coreyhaines31/marketingskills/main/skills/ai-seo/SKILL.md) vs [arXiv](https://arxiv.org/html/2311.09735v3) and [C-SEO Bench](https://arxiv.org/abs/2506.11097).
2. **Schema overclaimed.** Claims such as "Content with proper schema shows 30–40% higher AI visibility" have no source. They contradict the Ahrefs difference-in-differences null and Google's statement. Sources: [same SKILL.md](https://raw.githubusercontent.com/coreyhaines31/marketingskills/main/skills/ai-seo/SKILL.md); [Ahrefs](https://ahrefs.com/blog/schema-ai-citations/).
3. **llms.txt still recommended or scored.** Several repos list llms.txt in their topics or scores, or say engines "parse llms.txt." The best of them (claude-seo, Auriti) now caveat it, but still give it points. Sources: [Auriti README](https://github.com/Auriti-Labs/geo-optimizer-skill) (6 points); [Ahrefs](https://ahrefs.com/blog/llmstxt-study/).
4. **Passage-length heuristics stated as fact** (40–60 or 130–170 words), with no primary evidence. Google says there is no ideal length. Sources: [claude-seo README](https://github.com/AgriciDaniel/claude-seo); [Google](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide#mythbusting).
5. **Out-of-date platform facts.** For example, a skill saying Google has "no AI-specific Search Console reporting." That has been false since 2026-06-03. Sources: [SKILL.md](https://raw.githubusercontent.com/coreyhaines31/marketingskills/main/skills/ai-seo/SKILL.md); [Google](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports).
6. **No checks of CDN, WAF or the Google opt-out.** None of the reviewed skills test live fetches as each AI user agent, Cloudflare's managed robots.txt and AI categories, or Search Console's "Search generative AI control."
7. **Readiness scores presented as visibility.** Point scores such as "/14 schema" give a misleading sense of progress. Only Auriti measures real answers with repeated runs. None separates API from UI surfaces or records the measurement settings ([Surfer](https://surferseo.com/blog/llm-scraped-ai-answers-vs-api-results/)).
8. **FAQ and HowTo schema as AEO levers.** Some skills treat these as levers ([SNLabat](https://github.com/SNLabat/SEO-GEO-AEO-Skill)), but Google removed FAQ rich-result docs in June 2026 ([Google](https://developers.google.com/search/updates#removing-faq-rich-result)).
9. **Facts without dates.** Few skills date their facts, even though citation mixes change within weeks ([Semrush](https://www.semrush.com/blog/most-cited-domains-ai/)).

### How Plugd can do better

- Put a source and a "last verified" date on every rule.
- Use the same evidence tags as this brief.
- Include a live crawler-access probe for each user agent and CDN.
- Check the Search Console AI opt-out.
- Treat llms.txt and schema as hygiene, not levers.
- Measure through the UI with repeated runs, report *n* and a confidence interval, and record surface and settings metadata.
- Put the off-site and earned-media work first, ahead of on-page rewrites.
- Test the skills against `seo-skill-bench`.

---

## 9. Myth and contested claim register

| Claim | Status | Evidence |
|---|---|---|
| llms.txt helps you get cited | **Myth (for search)** | [Google](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide); [Ahrefs: 97% of files get zero fetches](https://ahrefs.com/blog/llmstxt-study/) |
| Schema guarantees or boosts AI citations | **Myth / unproven** | [Ahrefs DiD null](https://ahrefs.com/blog/schema-ai-citations/); [Google "not required"](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide). Bing says it helps understanding ([SEL](https://searchengineland.com/microsoft-bing-copilot-use-schema-for-its-llms-453455)) |
| Write or "chunk" specially for LLMs | **Myth (Google)** | [Google mythbusting](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide#mythbusting); [C-SEO Bench](https://arxiv.org/abs/2506.11097) |
| GEO tactics give +40% | **Lab-only, contested** | [GEO](https://arxiv.org/html/2311.09735v3) vs [C-SEO Bench](https://arxiv.org/abs/2506.11097) |
| Rank #1 in Google means cited in AI Overviews | **Weakening** | Top-10 share fell from 76% to 38% ([Ahrefs](https://ahrefs.com/blog/ai-overview-citations-top-10/)) |
| Backlinks drive AI visibility | **Weak correlation** | 0.218 vs 0.664 for mentions ([Ahrefs](https://ahrefs.com/blog/ai-overview-brand-correlation/)) |
| Blocking GPTBot hides you from ChatGPT search | **False** | [OpenAI](https://developers.openai.com/api/docs/bots) |
| Blocking Google-Extended removes you from AI Overviews | **False** | [Google](https://developers.google.com/search/docs/appearance/ai-features#control) |
| IndexNow improves ChatGPT visibility | **Unconfirmed** | [eSEOspace](https://eseospace.com/blog/bing-webmaster-tools-indexnow-ai-search/) |
| Self-promotional "best" lists work | **Works now on some surfaces, fragile** | [Ahrefs](https://ahrefs.com/blog/best-lists-research/); [Peec AI via info.link](https://info.link/research/chatgpt-api-vs-ui-do-they-return-the-same-citations) |
| API results equal what users see | **False** | [Surfer](https://surferseo.com/blog/llm-scraped-ai-answers-vs-api-results/) |
