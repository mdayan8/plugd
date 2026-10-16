# Audit checks and scoring

What `npx getplugd audit` checks, in the order it runs, and how the score is computed. Source: [`packages/audit/src`](../../packages/audit/src/).

## What it fetches

1. `/robots.txt`
2. The homepage, as a normal browser
3. Your sitemap (from robots.txt, then `/sitemap.xml`), plus up to 9 more pages from it (`--pages`)
4. The homepage again with each AI user agent, to detect CDN/firewall blocking
5. `/llms.txt`, which is recorded but never scored

Every fetch refuses private and local addresses unless you pass `--allow-local`.

## AI crawlers checked (21)

| Purpose | Bots |
|---|---|
| **search** (needed to be cited) | OAI-SearchBot, Claude-SearchBot, PerplexityBot, Googlebot, Bingbot, Applebot, meta-webindexer, Amzn-SearchBot, MistralAI-Index |
| **user** (live fetch when someone asks) | ChatGPT-User, Claude-User, Perplexity-User, DuckAssistBot, MistralAI-User |
| **training** (future models) | GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, meta-externalagent, Amazonbot, CCBot |

Each bot is resolved against your robots.txt groups the way crawlers do, with the most specific group winning.

## Findings

| ID | Severity | When |
|---|---|---|
| `home-unreachable` | critical | The homepage failed for a normal browser |
| `home-noindex` | critical | The homepage has `noindex` |
| `search-bots-blocked` | critical / high | robots.txt blocks search bots (critical when it's OAI-SearchBot, Claude-SearchBot, PerplexityBot, Googlebot or Bingbot) |
| `cdn-blocks-bots` | high | AI user agents get an error while a browser doesn't |
| `home-nosnippet` | high | The homepage uses `nosnippet` |
| `bing-noarchive` | high | `noarchive`, which Bing treats as "don't use in Copilot" |
| `low-ai-visibility` | high | With AI answers on: the brand is named in under 25% of answers |
| `user-bots-blocked` | medium | robots.txt blocks live-fetch bots |
| `home-maxsnippet` | medium | `max-snippet` under 60 characters |
| `bing-nocache` | medium | `nocache` limits Copilot to URL, title and snippet |
| `no-description` | medium | No meta description |
| `thin-home` | medium | Under 150 readable words in the homepage HTML |
| `no-org-schema` | medium | No Organization (or LocalBusiness) JSON-LD |
| `broken-pages` | medium | Sitemap pages that failed to load |
| `no-robots` | low | No robots.txt (everything is allowed, which is fine) |
| `no-product-schema` | low | No Product / SoftwareApplication / Service JSON-LD |
| `no-sitemap` | low | No sitemap found |
| `training-bots-blocked` | info | You opted out of training. That's a valid choice and doesn't affect search |
| `no-llms-txt` | info | No llms.txt. Optional; not a citation factor |

## Score

| Part | Max | How |
|---|---|---|
| **Crawler access** | 40 | Starts at 40. −20 each for blocked Googlebot or Bingbot, −8 per other blocked search bot, −3 per blocked user bot, −15 if the CDN blocks AI bots, −40 if the homepage is unreachable or `noindex`, −8 for `nosnippet` or `noarchive`. Never below 0 |
| **Content** | 30 | Organization schema 8, product schema 6, meta description 5, readable homepage text 6 (≥300 words, or 3 for ≥150), sitemap 5 |
| **AI visibility** | 30 | Mention rate × 30, only when AI answers were measured |

Without AI answers, the total is `(access + content) / 70 × 100`. With them, it's `access + content + visibility`.

The score measures **readiness**, not visibility. Structured data earns content points because it keeps facts unambiguous, but studies found it doesn't raise AI citations on its own ([evidence](../explanation/what-works-in-ai-search.md#structured-data)). What AI actually says is what `track` measures.
