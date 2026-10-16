# Brand extractor

Used by `getplugd audit` to pull the recommended brands, in order, out of each AI answer, so it can report your position and who's recommended instead. Source: [`packages/audit/src/ai.ts`](../packages/audit/src/ai.ts) (`brandsIn`).

Variables: `{answer}` (the engine's answer, first 6,000 characters).

```text
List the brands, products or companies this answer recommends or names as options, in the order they appear. Return only JSON: {"brands": ["..."]}

ANSWER:
{answer}
```

Whether *you* were mentioned isn't left to the model: the audit checks that with a whole-word match on your brand name and aliases, and "cited" means one of the answer's source URLs is on your domain. The model only orders the list.
