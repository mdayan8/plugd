# Run Plugd weekly in GitHub Actions

The Action runs `plugd track` on a schedule in your own repo with your own key. It commits the history to `.plugd/`, shows the report in the job summary, and opens an issue when an engine clearly names you less often than the run before.

## 1. Add your key as a secret

In your repo: **Settings → Secrets and variables → Actions → New repository secret**.

- Name: `GEMINI_API_KEY` (or `OPENROUTER_API_KEY`)
- Value: your key ([how to get one](get-api-keys.md))

## 2. Add the workflow

Create `.github/workflows/ai-visibility.yml`:

```yaml
name: AI visibility

on:
  schedule:
    - cron: '0 6 * * 1'   # Mondays 06:00 UTC
  workflow_dispatch:      # adds a "Run workflow" button

permissions:
  contents: write   # commit .plugd/ history
  issues: write     # open an issue when AI names you less often

jobs:
  track:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: mdayan8/plugd@v1
        with:
          site: yoursite.com
          gemini-api-key: ${{ secrets.GEMINI_API_KEY }}
          max-cost: '1.00'
```

This file is also in the repo: [examples/ai-visibility.yml](../../examples/ai-visibility.yml).

## 3. Run it once by hand

**Actions → AI visibility → Run workflow.** The first run writes your questions to `.plugd/plugd.json` and commits them. Open the run to see the report in the summary.

## What each run does

1. Asks every engine your saved questions, stopping at `max-cost`.
2. Writes `.plugd/REPORT.md` and adds it to the job summary.
3. Commits `.plugd/` (questions, history and report) as `plugd[bot]`.
4. If an engine's latest run is clearly worse than the one before (the 95% ranges don't overlap), opens an issue with the numbers, who's named instead and the sources used.

## Common changes

- **Use ChatGPT, Claude and Perplexity too:** add `openrouter-api-key: ${{ secrets.OPENROUTER_API_KEY }}` and `engines: gemini,chatgpt,claude,perplexity`.
- **Don't commit, just report:** `commit: 'false'`. You lose the trend between runs unless you store `.plugd/` another way.
- **No issues:** `open-issue: 'false'`. Use the `dropped` output to notify some other way.
- **Protected main branch:** the push fails if the branch requires pull requests. Either allow the Actions bot to push, or set `commit: 'false'`.

Every input and output: [GitHub Action reference](../reference/github-action.md).
