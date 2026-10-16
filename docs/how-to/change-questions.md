# Change your tracked questions

Plugd writes your buyer questions on the first `track` run and keeps them fixed, so runs can be compared. To change them, edit the file.

## Edit the list

Open `.plugd/plugd.json` and change the `questions` array:

```json
{
  "questions": [
    "best invoicing app for freelancers",
    "alternatives to FreshBooks for small agencies",
    "how do I send recurring invoices automatically"
  ]
}
```

Tips for good questions:

- **Don't name your brand.** That measures recall, not recommendation.
- **Mix the types buyers use:** "best X for Y", "alternatives to <competitor>", "X vs Y", "how do I <job>", and pricing questions.
- **Keep them short,** under about 15 words, the way people type into chat.

## Start fresh with your own questions

Pass them on the first run for a new folder:

```bash
npx getplugd track yoursite.com --dir .plugd-v2 \
  --question "best invoicing app for freelancers" \
  --question "alternatives to FreshBooks"
```

Or let Plugd write a different number: `--questions 20` (up to 30).

## What happens to the trend

`report` compares runs per engine. When you change the questions, rates before and after measure different things. Changing one or two is usually fine; for a big change, start a new `--dir` so the old trend stays meaningful.
