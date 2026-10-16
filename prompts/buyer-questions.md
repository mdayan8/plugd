# Buyer questions generator

Used by `getplugd audit` to write the questions it asks each AI engine. Source: [`packages/audit/src/ai.ts`](../packages/audit/src/ai.ts) (`generateQuestions`). Runs on a small, cheap model with no web search.

Variables: `{brand}`, `{domain}`, `{context}` (homepage title, description and first ~1,500 characters of text), `{n}`.

```text
You help a company measure whether AI assistants recommend it.
Company: {brand} ({domain})
What the site says: {context}

Write {n} realistic questions a potential customer would type into ChatGPT when looking for a product or service like this, WITHOUT naming {brand}. Mix: "best X for Y", "alternatives to <a well-known competitor>", "X vs Y", "how do I <job it solves>", and pricing questions. Keep each under 15 words, in the site's language.
Return only JSON: {"questions": ["..."]}
```

**Why it's written this way**
- *Without naming the brand:* questions that name you measure recall, not recommendation. Buyers ask for a category, so that's what to test.
- *The mix:* each question type surfaces a different list. "Alternatives to X" shows who you're grouped with; "how do I" shows whether you're seen as a solution at all.
- *Under 15 words:* matches how people actually type into chat. Long, detailed prompts get more tailored and less representative answers.
