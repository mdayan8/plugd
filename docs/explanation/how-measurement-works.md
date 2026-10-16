# How Plugd measures AI visibility

AI answers are not a ranking you can read off a page. They change from run to run, from engine to engine, and between the API and the app. This page explains the choices Plugd makes so its numbers stay honest.

## Mention and citation are different things

- **Mentioned:** the answer names your brand. Plugd decides this with a whole-word match on your brand name and domain, not by asking a model, so it can't be talked into a "yes".
- **Cited:** one of the sources the engine linked is on your domain.

You can be mentioned without being cited (the engine knows you from elsewhere), or cited without being recommended (it used your page as a source for something else). Both matter, so Plugd reports both.

## Why every number comes with a range

The same question asked twice often gets a different list. SparkToro found the same set of brands came back less than once in 100 runs ([source](https://sparktoro.com/blog/new-research-ais-are-highly-inconsistent-when-recommending-brands-or-products-marketers-should-take-care-when-tracking-ai-visibility/)). So a rate from 10 answers is an estimate, and Plugd shows how uncertain it is.

The range is a **Wilson 95% interval**. With 3 mentions in 10 answers, it's 11%–60%: the true rate could plausibly be anywhere in there. With 30 in 100, it narrows to about 22%–40%. More questions or more runs give tighter ranges.

## Why ↑ and ↓ are rare

`report` marks a run ↑ or ↓ only when its range doesn't overlap the previous run's. A move from 2 to 3 mentions out of 10 isn't a change you can trust, so it's shown as "no clear change". The GitHub Action's issues follow the same rule, so they only fire on real drops.

## Why there's no "position"

Plenty of tools report "you're #3 in ChatGPT". Plugd doesn't, because the order of brands in an answer repeats less than once in 1,000 runs ([SparkToro](https://sparktoro.com/blog/new-research-ais-are-highly-inconsistent-when-recommending-brands-or-products-marketers-should-take-care-when-tracking-ai-visibility/)). A position would look precise and mean nothing. The brands are still stored in order in `history.jsonl` if you want to look.

## Fixed questions make runs comparable

Your questions are written once and saved in `plugd.json`. If they changed every run, a higher rate could just mean easier questions. Different wordings of the same buyer intent tend to surface similar brands, so a stable, well-mixed set of 10–30 intents is enough.

## API answers are not the app

Plugd asks each engine through its API with web search on. People using the ChatGPT or Gemini app can see different answers: one study of 13,779 answers found the ChatGPT API named about 13.8 brands per answer against 7.9 in the app, and the cited pages overlapped only about 5–6% ([Surfer](https://surferseo.com/blog/llm-scraped-ai-answers-vs-api-results/)). App answers also vary with location, memory and whether the user is logged in.

So every stored answer says `surface: "api"`, and the report says "API answers with web search on". Treat the API as a **consistent, repeatable trend line**, and check the real apps by hand now and then before big decisions.

## Use first-party data too

Google Search Console now has a Generative AI report (impressions in AI Overviews and AI Mode), and Bing Webmaster Tools has AI Performance (citations in Copilot). These are real numbers, not samples. Use them alongside Plugd's trend. Sources: [Google](https://support.google.com/webmasters/answer/16984139), [Bing](https://blogs.bing.com/search/2026/6/New-AI-Visibility-Insights-in-Bing-Webmaster-Tools-Intents-Topics-Citation-Share-Compare/).
