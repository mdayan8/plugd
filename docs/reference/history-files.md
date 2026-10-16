# History files (`.plugd/`)

`track` keeps everything in one folder (default `.plugd`, set with `--dir`). The files are plain text, so commit them to keep your trend in git.

| File | Written by | Contents |
|---|---|---|
| `plugd.json` | the first `track` run | The site and its fixed questions |
| `history.jsonl` | every `track` run | One JSON object per answer, appended as it arrives |
| `REPORT.md` | `report --md`, and the GitHub Action | The latest Markdown report |

## plugd.json

```json
{
  "site": "https://acme.com",
  "domain": "acme.com",
  "brand": "Acme",
  "aliases": ["acme", "acme.com"],
  "questions": ["best analytics tool for startups", "alternatives to big analytics"],
  "createdAt": "2026-10-16T09:12:00.000Z"
}
```

| Field | Meaning |
|---|---|
| `domain` | A citation counts when a source URL is on this domain or a subdomain of it |
| `aliases` | Lowercase names that count as a mention, matched as whole words in the answer |
| `questions` | Asked on every run. Edit to change ([how](../how-to/change-questions.md)) |

## history.jsonl

One line per answer:

```json
{"v":1,"runId":"2026-10-16T09:12:00.000Z","at":"2026-10-16T09:12:04.120Z","domain":"acme.com","engine":"gemini","surface":"api","model":"gemini-3.5-flash-lite","question":"best analytics tool for startups","text":"…","citations":[{"url":"https://www.g2.com/…","title":"g2.com"}],"brands":["Tallyhq","Acme"],"mentioned":true,"cited":false,"searchCalls":2,"costUsd":0.0301}
```

| Field | Type | Meaning |
|---|---|---|
| `v` | `1` | Format version |
| `runId` | ISO time | When the run started. All answers from one run share it |
| `at` | ISO time | When this answer was saved |
| `engine` | `gemini` / `chatgpt` / `claude` / `perplexity` | |
| `surface` | `"api"` | Where the answer came from |
| `model` | string | The exact model that answered |
| `question` | string | |
| `text` | string | The full answer |
| `citations` | `{ url, title? }[]` | The sources the engine cited |
| `brands` | string[] | Brands named, in order, extracted by the same engine |
| `mentioned` | boolean | The answer names one of the `aliases` (deterministic match, not a model's opinion) |
| `cited` | boolean | A citation is on `domain` |
| `searchCalls` | number | Billed web searches for this answer |
| `costUsd` | number | Answer plus brand extraction, at list prices |
| `error` | string, optional | Present when the check failed. Failed checks are left out of rates, never counted as "not mentioned" |

The format only gets new optional fields. A breaking change would bump `v`.
