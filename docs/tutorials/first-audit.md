# Your first AI visibility audit

In this tutorial you'll check whether AI search engines can read a website, understand the result, and get ready-to-paste fixes. It takes about 5 minutes and is free: no account, no API key.

**You need:** Node.js 20 or newer (`node --version` to check) and a website you own or care about.

## 1. Run the audit

```bash
npx getplugd audit yoursite.com
```

`npx` downloads and runs Plugd without installing anything. Replace `yoursite.com` with your domain. You'll see progress lines while it reads your robots.txt, homepage, sitemap and a few more pages, and probes whether your CDN lets AI bots in.

## 2. Read the score

The first lines look like this:

```
  Example Domain example.com
  57/100  crawler access 40/40 · content 0/30 · AI visibility not measured
```

- **Crawler access (out of 40):** can AI search bots and live-fetch bots reach your site? This matters most. If an engine can't read you, nothing else helps.
- **Content (out of 30):** does the homepage say clearly, in plain HTML, what you are? This covers the meta description, readable text, structured data and sitemap.
- **AI visibility (out of 30):** what the engines actually answer. It needs an API key, so it's "not measured" for now. You'll add it in the [next tutorial](track-your-visibility.md).

Without AI answers, the score is scaled to 100 from the first two parts. How each point is earned: [Audit checks and scoring](../reference/audit-checks.md).

## 3. Read the crawler table

```
  AI crawlers
  search   ✓ OAI-SearchBot  ✓ Claude-SearchBot  ✓ PerplexityBot  ✓ Googlebot  ✓ Bingbot …
  user     ✓ ChatGPT-User  ✓ Claude-User  ✓ Perplexity-User …
  training ✓ GPTBot  ✓ ClaudeBot  ✓ Google-Extended …
```

Each AI company runs separate bots for separate jobs:

- **search** bots decide whether you can be cited at all. A ✗ here is the most urgent thing to fix.
- **user** bots fetch your page when someone asks an assistant about it.
- **training** bots collect data for future models. Blocking them is your choice and doesn't affect search.

A line like `✗ CDN/firewall blocks: GPTBot, ClaudeBot` means your robots.txt is fine but your CDN (often Cloudflare) turns the bots away. See [Fix AI crawler access](../how-to/fix-ai-crawler-access.md).

## 4. Read the findings and fix plan

Findings are sorted by severity: red ● is urgent, yellow ● matters, grey ○ is minor, and · is just information. The fix plan below them lists what to do, highest impact first, with a rough effort for each.

## 5. Get the fixes as code

```bash
npx getplugd plan yoursite.com > plugd-plan.md
```

Open `plugd-plan.md`. Each fix has *why it matters*, *steps*, and, where it applies, a ready-to-paste artifact: a corrected `robots.txt` that keeps all your other rules, JSON-LD for your `<head>`, or a meta description.

Pick the first fix and apply it. Then run the audit again and watch the score move:

```bash
npx getplugd audit yoursite.com
```

## What you did

You checked AI crawler access, including your CDN, reviewed content readiness, and got a ranked, code-ready fix plan.

## Next

- [Track how often AI recommends you](track-your-visibility.md): see what the engines actually say, run after run.
- [Use Plugd with your coding agent](../how-to/use-with-coding-agents.md): let Claude Code, Codex, Cursor or OpenCode apply the plan in your repo.
