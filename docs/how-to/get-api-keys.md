# Get your API keys

`audit` and `plan` need no key. `track`, and `audit` with AI answers, need one of these. Keys stay on your machine (or in a GitHub secret) and are sent only to the provider.

| You want | Key | Engines |
|---|---|---|
| The cheapest option, with Google Search | `GEMINI_API_KEY` | Gemini |
| ChatGPT, Claude and Perplexity too | `OPENROUTER_API_KEY` | ChatGPT, Claude, Gemini, Perplexity |

You can set both and pick engines with `--engines gemini,chatgpt,claude,perplexity`. Gemini then goes direct to Google, and everything else through OpenRouter. With a Gemini key set, the default is Gemini only.

## Gemini (Google AI Studio)

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey) and create a key.
2. **Turn on billing** for the key's Google Cloud project (Google Cloud console → Billing). Grounding with Google Search isn't available on the free tier.
3. Set a **budget alert** (Billing → Budgets & alerts), for example $5 a month.
4. Use it:

```bash
export GEMINI_API_KEY=your-key
```

What it costs: the first 5,000 search queries a month are free, then $14 per 1,000. The model may run more than one search per question. Tokens for Gemini 3.5 Flash-Lite are $0.30 per million in and $2.50 per million out, a fraction of a cent per answer. Source: [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing). Use a different model with `GEMINI_MODEL`, for example `export GEMINI_MODEL=gemini-3.8-flash`.

## OpenRouter

1. Go to [openrouter.ai/keys](https://openrouter.ai/keys), create a key and add credit.
2. Use it:

```bash
export OPENROUTER_API_KEY=sk-or-...
```

What it costs: about $0.01 per answer with web search on, depending on the model. Default models per engine: [Engines and models](../reference/engines.md).

## Keep keys out of git

- Put `export` lines in your shell profile or a local `.env` file that's in `.gitignore`, never in committed files.
- In GitHub Actions, store keys as repository secrets: [Run Plugd weekly in GitHub Actions](run-weekly-in-github-actions.md).
