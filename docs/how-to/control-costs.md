# Control what you spend

Every paid command uses your own key, so the provider bills you directly. Plugd gives you four controls.

## 1. Read the estimate before you confirm

`track` (and `audit` with AI answers) prints a **worst-case** estimate and asks `[Y/n]` before spending:

```
Ask Gemini 10 questions? Up to about $0.32 on your key.
```

The Gemini figure assumes about two billed searches per question at list price. On a billed Google project the first 5,000 searches a month are free, so the real cost is usually much lower.

## 2. Cap every run with `--max-cost`

```bash
npx getplugd track --max-cost 0.50
```

Before each check, Plugd reserves that engine's worst-case cost. It only starts the check if the total would stay under the cap, then settles to the actual cost when the answer arrives. Skipped checks are reported at the end. The GitHub Action defaults to `max-cost: '1.00'`, and the MCP tool to `$0.50` (maximum `$5`).

## 3. Ask fewer things

- Fewer engines: `--engines gemini`
- Fewer questions: edit `.plugd/plugd.json` ([how](change-questions.md))
- Less often: weekly is plenty; answers change slowly, and noise is large.

## 4. Set a budget at the provider

- Google Cloud: **Billing → Budgets & alerts**
- OpenRouter: only add the credit you're happy to spend

## What a run actually cost

Each run ends with `This run: $0.031 at list prices · 18 web searches`, and every answer in `.plugd/history.jsonl` records its `costUsd` and `searchCalls`. `npx getplugd report` shows the total so far.
