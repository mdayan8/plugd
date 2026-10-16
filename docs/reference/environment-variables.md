# Environment variables

| Variable | Used by | Meaning |
|---|---|---|
| `GEMINI_API_KEY` | `track`, MCP tracking tools, the Action | Gemini key ([get one](../how-to/get-api-keys.md#gemini-google-ai-studio)). Makes `gemini` the default engine |
| `GEMINI_MODEL` | Gemini engine | Override the model, e.g. `gemini-3.8-flash`. Default `gemini-3.5-flash-lite` |
| `OPENROUTER_API_KEY` | `track`, `audit` AI answers, MCP, the Action | OpenRouter key for ChatGPT, Claude and Perplexity (and Gemini without a Gemini key) |
| `NO_COLOR` | all commands | Set to anything to turn off colours in terminal output |

Keys are only sent to `generativelanguage.googleapis.com` (Gemini) and `openrouter.ai` (OpenRouter).
