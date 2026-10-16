---
name: ai-visibility-tracking
description: Measure a brand's visibility in AI answers over time without fooling yourself - prompt sets, mention rate, citation rate, share of voice, repeated runs with confidence intervals, API vs app differences, and first-party data from Search Console and Bing. Use when setting up AI visibility tracking, reporting share of voice, comparing before/after a fix, or judging a tracking tool's numbers.
---

# AI visibility tracking

Last verified: 2026-10-16. Sources: [research/evidence-2026-10.md §7](../../research/evidence-2026-10.md).

## Start with first-party data

- **Google Search Console → Generative AI report:** impressions and pages in AI Overviews and AI Mode (all sites since 2026-08-31). ([Google](https://support.google.com/webmasters/answer/16984139))
- **Bing Webmaster Tools → AI Performance:** citations, cited pages, grounding queries and citation share for Copilot. ([Bing](https://blogs.bing.com/search/2026/6/New-AI-Visibility-Insights-in-Bing-Webmaster-Tools-Intents-Topics-Citation-Share-Compare/))
- **Server logs** filtered to verified AI user agents (check IPs against vendor lists), and **analytics referrals** from AI domains.

These are real numbers. Everything below is sampling.

## Build the prompt set

- Write questions from real buyer intents across the funnel: "best X for Y", "X vs Y", "alternatives to X", "how do I…", pricing.
- Don't name the brand in the question. That measures recall, not recommendation.
- Group wording variants under one intent. Different phrasings of the same intent converge on similar brands, so intent coverage matters more than exact wording. ([SparkToro](https://sparktoro.com/blog/new-research-ais-are-highly-inconsistent-when-recommending-brands-or-products-marketers-should-take-care-when-tracking-ai-visibility/))
- Fix the competitor set up front, so share of voice means the same thing every week.

## Measure the right things

| Metric | Definition |
|---|---|
| Mention rate | share of runs where the answer names the brand |
| Citation rate | share of runs where a cited source is on the brand's domain |
| Share of voice | brand mentions ÷ mentions of brand + fixed competitor set |
| Cited sources | which third-party URLs the engines rely on (your outreach list) |

**Don't track position inside an answer.** The same list of brands comes back less than once in 100 runs, and the same order less than once in 1,000. ([SparkToro](https://sparktoro.com/blog/new-research-ais-are-highly-inconsistent-when-recommending-brands-or-products-marketers-should-take-care-when-tracking-ai-visibility/))

## Handle variance

- Run each question several times per engine. Report every rate with **n** and a **95% confidence interval**. With n runs and observed rate p, a quick interval is the Wilson interval; for small n, say so instead of quoting a precise percentage.
- Compare periods only when the intervals don't overlap, or with a proper test. "Up from 20% to 30%" on 10 runs each is noise.
- A model update can reshuffle sources overnight. Note the date of known model changes next to any jump.

## Label every measurement

Record for each run: **surface** (API or app), **model**, **web search on or off**, **locale**, **logged in or out**, and **date**.

- API answers differ a lot from what people see in the app. In one study of 13,779 answers, the ChatGPT API named 13.8 brands per answer against 7.9 in the app, and cited sources overlapped only about 5–6%. ([Surfer](https://surferseo.com/blog/llm-scraped-ai-answers-vs-api-results/))
- An API call without web search reflects training data only, not what search-enabled users get.
- Location and personalization change answers.

So: API runs are fine for cheap, frequent trend lines. Say they're API runs, and check the real apps periodically before drawing big conclusions.

## Tools

`npx getplugd audit <domain>` runs one sampled snapshot over the API with web search on and records model and cost per answer. For scheduled tracking over time, use Plugd Cloud or your own scheduler storing the same fields.
