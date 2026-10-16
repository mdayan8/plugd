# Outreach email

A prompt for drafting a short, honest pitch to the author of a page that AI engines cite (a "best X" list, a review, a video). Pair it with the [ai-citation-outreach](../skills/ai-citation-outreach/SKILL.md) skill. A person reviews and sends every email; never send automatically.

Variables: `{brand}`, `{product_one_liner}`, `{page_url}`, `{page_summary}` (what the page covers and who's on it), `{why_relevant}` (who the product is genuinely best for), `{offer}` (free account, data, demo), `{sender}`.

```text
Write a short email from {sender} at {brand} to the author of {page_url}.

What their page covers: {page_summary}
What {brand} is: {product_one_liner}
Who it's genuinely best for: {why_relevant}
What we can offer them: {offer}

Rules:
- Under 120 words. Plain text. A specific subject line under 8 words.
- Open with something specific about their page, not flattery.
- Ask them to evaluate {brand} for their readers, not to "add a link" or list it.
- Say honestly who it's for and who it isn't for.
- Make the offer concrete and easy to say no to.
- No fake urgency, no claims you can't back up, no follow-up threats.

Return: subject line, then the email body.
```
