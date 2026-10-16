# GitHub Action reference

```yaml
- uses: mdayan8/plugd@v1
  with:
    site: yoursite.com
    gemini-api-key: ${{ secrets.GEMINI_API_KEY }}
```

A composite action defined in [`action.yml`](../../action.yml). It needs `actions/checkout` to run first. Step-by-step setup: [Run Plugd weekly in GitHub Actions](../how-to/run-weekly-in-github-actions.md).

## Inputs

| Input | Default | Description |
|---|---|---|
| `site` | **required** | Site to track, e.g. `yoursite.com` |
| `gemini-api-key` | `''` | Gemini key. Search grounding needs billing on; the first 5,000 searches a month are free |
| `openrouter-api-key` | `''` | OpenRouter key, for ChatGPT, Claude and Perplexity (and Gemini if no Gemini key is given) |
| `engines` | `''` | Comma-separated engines. Empty means `gemini` with a Gemini key, otherwise all four |
| `max-cost` | `'1.00'` | Stop starting new checks once this many US dollars are spent in a run |
| `questions` | `'10'` | Questions written on the first run. After that the saved ones are reused |
| `dir` | `.plugd` | Folder in your repo for questions, history and `REPORT.md` |
| `commit` | `'true'` | Commit `dir` back to the repo |
| `open-issue` | `'true'` | Open an issue when an engine clearly names you less often than last run |
| `version` | `0.3.0` | getplugd version from npm |

## Outputs

| Output | Description |
|---|---|
| `dropped` | `"true"` when at least one engine's latest run is clearly worse (non-overlapping 95% ranges), else `"false"` |

## Permissions

```yaml
permissions:
  contents: write   # needed when commit is 'true'
  issues: write     # needed when open-issue is 'true'
```

## Steps it runs

1. `actions/setup-node` (Node 22).
2. `npx getplugd@<version> track <site> --yes --dir <dir> --max-cost <max-cost> --questions <questions> [--engines …]`
3. `npx getplugd@<version> report --dir <dir> --md <dir>/REPORT.md --alert $RUNNER_TEMP/plugd-alert.md`, then appends `REPORT.md` to the job summary.
4. If `commit`: `git add <dir>`, then commits as `plugd[bot]` and pushes, when anything changed.
5. If `open-issue` and `dropped`: `gh issue create` with the alert as the body.

Inputs reach the shell only through environment variables, never interpolated into scripts, so a crafted input can't inject commands.
