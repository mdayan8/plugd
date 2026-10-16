---
name: structured-data
description: Add or fix schema.org JSON-LD (Organization, WebSite, SoftwareApplication/Product, Offer, Article, BreadcrumbList, LocalBusiness) so search and AI engines get unambiguous facts about a brand. Use when adding structured data, fixing rich-result errors, or when someone claims schema will boost AI citations.
---

# Structured data

Last verified: 2026-10-16. Sources: [research/evidence-2026-10.md §4](../../research/evidence-2026-10.md).

## Set expectations first

Structured data makes facts unambiguous (who you are, what you sell, what it costs, when a page changed) and keeps you eligible for rich results. **It isn't an AI citation lever**, and you shouldn't sell it as one:

- Google: structured data "isn't required for generative AI search, and there's no special schema.org markup you need to add." ([Google](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide#mythbusting))
- Ahrefs compared 1,885 pages that added JSON-LD with 4,000 matched controls: no effect in AI Mode or ChatGPT, −4.6% in AI Overviews. ([Ahrefs, May 2026](https://ahrefs.com/blog/schema-ai-citations/))
- Bing says schema helps its LLMs understand pages. ([Search Engine Land](https://searchengineland.com/microsoft-bing-copilot-use-schema-for-its-llms-453455)) Reasonable, but no measured citation lift.
- **FAQ schema:** Google removed FAQ rich-result docs in June 2026. Don't add FAQPage markup expecting anything from Google.

## What to add

Keep it small and true. Every value must match visible text on the page.

| Page | Types |
|---|---|
| Homepage | `Organization` (name, url, logo, `sameAs` → official social, GitHub, Wikipedia/Wikidata, Crunchbase), `WebSite` |
| Product / pricing | `SoftwareApplication` or `Product`, with `Offer` (price, priceCurrency) matching the visible price |
| Blog / docs | `Article` with `author` (a real person), `datePublished`, `dateModified` |
| Deep pages | `BreadcrumbList` |
| Local businesses | `LocalBusiness` with address, hours, phone. Keep Google Business Profile and Bing Places in sync |
| E-commerce | `Product` + `Offer`, and a Merchant Center feed |

Example for a software product:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://example.com/#org", "name": "Example", "url": "https://example.com",
      "logo": "https://example.com/logo.png",
      "sameAs": ["https://github.com/example", "https://www.linkedin.com/company/example"] },
    { "@type": "SoftwareApplication", "name": "Example", "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web", "publisher": { "@id": "https://example.com/#org" },
      "offers": { "@type": "Offer", "price": "29", "priceCurrency": "USD" } }
  ]
}
</script>
```

## Rules

- **Server-render it.** JSON-LD injected by client-side JavaScript is invisible to AI crawlers that don't run JS.
- **One entity, one `@id`**, reused across pages.
- **Update `dateModified` only when the content really changes.** Fake freshness is unsupported and risky.
- **Never mark up content that isn't on the page** (fake reviews, ratings you don't show, prices that differ). That violates Google's structured data policies.
- Validate with Google's Rich Results Test and the schema.org validator.
