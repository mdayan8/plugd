# Track how often AI recommends you

In this tutorial you'll ask Gemini (with live Google Search) the questions your buyers ask, see whether it names and cites you, run it a second time, and read the trend. It takes about 15 minutes, most of it getting a key.

**You need:** Node.js 20+, and a Google account with billing turned on in Google Cloud. Search grounding requires billing; the first 5,000 searches a month are free. Prefer ChatGPT, Claude or Perplexity? Use an OpenRouter key instead: [Get your API keys](../how-to/get-api-keys.md).

## 1. Get a Gemini key

1. Open [Google AI Studio → API keys](https://aistudio.google.com/apikey) and create a key.
2. Make sure its Google Cloud project has billing turned on, and set a budget alert (for example $5).
3. Put the key in your terminal session. Don't paste it into chats or commit it:

```bash
export GEMINI_API_KEY=your-key-here
```

## 2. Run your first tracking run

From the folder where you want the history saved (your site's repo is ideal):

```bash
npx getplugd track yoursite.com
```

On this first run, Plugd:

1. Reads your homepage to learn your brand and what you do.
2. Writes 10 realistic buyer questions that **don't name you**, for example "best invoicing app for freelancers" or "alternatives to <a competitor>".
3. Saves them to `.plugd/plugd.json`. They stay fixed, so later runs are comparable.
4. Shows the worst-case cost and asks you to confirm.

Type `y`. Each answer is saved to `.plugd/history.jsonl` as soon as it arrives.

## 3. Read the result

Your output will look like this (example data):

```
  Acme (acme.com) · 10 questions · API answers with web search on

  Gemini
    2026-10-16 09:12  named  30% (11%–60%)  cited  10%  n=10

  Named instead (latest run): Tallyhq (8), Metricor (5)
  Sources AI used: g2.com (6), reddit.com (4)
  Questions where you weren't named: 7/10
```

- **named 30%:** Gemini mentioned you in 3 of 10 answers.
- **(11%–60%):** the 95% range. With only 10 answers, the true rate could plausibly be anywhere in it. That's why one run is a snapshot, not a verdict.
- **cited 10%:** in 1 answer, one of the sources Gemini linked was on your domain.
- **Named instead:** the competitors winning these questions.
- **Sources AI used:** the third-party sites the engine leans on. Getting mentioned there is usually your biggest lever.

## 4. Run it again

Wait a week (or a day, to try it), make a change, and run again. No site argument is needed:

```bash
npx getplugd track
npx getplugd report
```

`report` shows one line per run. A run is marked **↑ up** or **↓ down** only when its range doesn't overlap the previous one. Smaller moves are shown as "no clear change", because at this sample size they're noise.

## 5. Save a shareable report

```bash
npx getplugd report --md report.md
```

You get a Markdown table of every run, plus who's named instead, the sources and the questions where you're missing.

## What you did

You set up a key, tracked a fixed set of buyer questions with live search, and read mention rate, citation rate, competitors and sources with honest error ranges.

## Next

- [Run it weekly in GitHub Actions](../how-to/run-weekly-in-github-actions.md), so it happens without you.
- [Control what you spend](../how-to/control-costs.md) with `--max-cost`.
- [How Plugd measures AI visibility](../explanation/how-measurement-works.md), if you want the reasoning behind the numbers.
