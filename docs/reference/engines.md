# Engines and models

Every engine is asked through its API with live web search turned on, and every stored answer is labelled `surface: "api"`. API answers can differ from what people see in each app: see [How Plugd measures AI visibility](../explanation/how-measurement-works.md#api-answers-are-not-the-app).

| Engine | ID | With `GEMINI_API_KEY` | With `OPENROUTER_API_KEY` |
|---|---|---|---|
| <a id="chatgpt"></a>ChatGPT | `chatgpt` | — | `openai/gpt-5.4-mini` + web search |
| <a id="claude"></a>Claude | `claude` | — | `anthropic/claude-haiku-5.5` + web search |
| <a id="gemini"></a>Gemini | `gemini` | `gemini-3.5-flash-lite` + Google Search grounding, direct | `google/gemini-3.5-flash-lite` + web search |
| <a id="perplexity"></a>Perplexity | `perplexity` | — | `perplexity/sonar` + web search |

## Gemini (direct)

- **API:** the Gemini Interactions API with the `google_search` tool ([docs](https://ai.google.dev/gemini-api/docs/google-search)).
- **Citations:** the answer's `url_citation` annotations, with duplicates removed.
- **Search count:** the non-empty queries in `google_search_call` steps. Each one is billed, and the first 5,000 a month are free on a billed project.
- **Cost:** tokens at list price ($0.30 per million in and $2.50 per million out for Flash-Lite, with thinking counted as output), plus $0.014 per search. That's the price after the free allowance, so on a fresh month the real cost is lower.
- **Change the model:** `GEMINI_MODEL=gemini-3.8-flash`.

## OpenRouter

- **API:** chat completions with OpenRouter's `web` plugin (5 results).
- **Citations:** `url_citation` annotations.
- **Cost:** the `usage.cost` OpenRouter reports, which includes the search fee.

## Helper calls

Writing the questions (on the first `track` run) and extracting brand names from each answer use the **same engine and key**, without web search, so one key is enough. `audit` uses `anthropic/claude-haiku-5.5` on OpenRouter for these.

## Library

The providers are published as `@getplugd/engines` (source in [`packages/engines`](../../packages/engines/)):

```ts
import { gemini, extractBrands, mentions, cites } from '@getplugd/engines'

const engine = gemini({ apiKey: process.env.GEMINI_API_KEY! })
const answer = await engine.ask('best invoicing app for freelancers')
// { text, citations: [{ url, title }], model, searchCalls, costUsd }
const { brands } = await extractBrands(engine, answer.text)
```
