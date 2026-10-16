import { describe, expect, it } from 'vitest'
import { cites, extractBrands, gemini, mentions, openRouter } from './index'

const fakeFetch = (body: unknown, status = 200) => {
  const calls: { url: string; body: any; headers: Record<string, string> }[] = []
  const impl = (async (url: string, init: RequestInit) => {
    calls.push({ url, body: JSON.parse(String(init.body)), headers: init.headers as Record<string, string> })
    return new Response(JSON.stringify(body), { status })
  }) as unknown as typeof fetch
  return { impl, calls }
}

// Shape from https://ai.google.dev/gemini-api/docs/google-search (Interactions API).
const geminiReply = {
  steps: [
    { type: 'thought', summary: [{ type: 'text', text: '…' }] },
    { type: 'google_search_call', arguments: { queries: ['best crm for small agencies', ''] } },
    { type: 'google_search_call', arguments: { queries: ['hubspot vs pipedrive agencies'] } },
    { type: 'google_search_result', call_id: 's1', result: [{ search_suggestions: '<div/>' }] },
    { type: 'model_output', content: [{
      type: 'text',
      text: 'HubSpot is the usual pick; Pipedrive is cheaper.',
      annotations: [
        { type: 'url_citation', url: 'https://www.g2.com/categories/crm', title: 'g2.com', start_index: 0, end_index: 20 },
        { type: 'url_citation', url: 'https://www.g2.com/categories/crm', title: 'g2.com', start_index: 21, end_index: 40 },
        { type: 'url_citation', url: 'https://pipedrive.com/pricing', title: 'pipedrive.com', start_index: 21, end_index: 40 },
      ],
    }] },
  ],
  usage: { total_input_tokens: 1000, total_output_tokens: 200, total_thought_tokens: 100 },
}

describe('gemini', () => {
  it('asks with Google Search on and returns text, unique citations, billed searches and cost', async () => {
    const f = fakeFetch(geminiReply)
    const a = await gemini({ apiKey: 'k', fetchImpl: f.impl }).ask('best crm for small agencies')
    expect(f.calls[0]!.url).toBe('https://generativelanguage.googleapis.com/v1beta/interactions')
    expect(f.calls[0]!.headers['x-goog-api-key']).toBe('k')
    expect(f.calls[0]!.body).toMatchObject({ model: 'gemini-3.5-flash-lite', tools: [{ type: 'google_search' }] })
    expect(a.text).toBe('HubSpot is the usual pick; Pipedrive is cheaper.')
    expect(a.citations.map(c => c.url)).toEqual(['https://www.g2.com/categories/crm', 'https://pipedrive.com/pricing'])
    expect(a.searchCalls).toBe(2) // the empty query isn't billed
    // 1000 × $0.30/M + (200 + 100) × $2.50/M + 2 × $0.014
    expect(a.costUsd).toBeCloseTo(0.0003 + 0.00075 + 0.028, 6)
  })

  it('complete() sends no search tool', async () => {
    const f = fakeFetch({ steps: [{ type: 'model_output', content: [{ type: 'text', text: '{"brands":[]}' }] }] })
    const r = await gemini({ apiKey: 'k', fetchImpl: f.impl }).complete('hi')
    expect(f.calls[0]!.body.tools).toBeUndefined()
    expect(r.text).toBe('{"brands":[]}')
  })

  it('surfaces the API error message', async () => {
    const f = fakeFetch({ error: { message: 'API key not valid' } }, 400)
    await expect(gemini({ apiKey: 'bad', fetchImpl: f.impl }).ask('q')).rejects.toThrow('API key not valid')
  })
})

describe('openRouter', () => {
  it('turns on web search and reads url_citation annotations and cost', async () => {
    const f = fakeFetch({ choices: [{ message: { content: 'Try Acme.', annotations: [{ type: 'url_citation', url_citation: { url: 'https://acme.com', title: 'Acme' } }] } }], usage: { cost: 0.012 } })
    const a = await openRouter({ apiKey: 'k', engine: 'perplexity', fetchImpl: f.impl }).ask('q')
    expect(f.calls[0]!.body).toMatchObject({ model: 'perplexity/sonar', plugins: [{ id: 'web' }] })
    expect(a).toMatchObject({ text: 'Try Acme.', citations: [{ url: 'https://acme.com', title: 'Acme' }], costUsd: 0.012, model: 'perplexity/sonar' })
  })
})

describe('brands', () => {
  it('matches whole words only', () => {
    expect(mentions('We like Acme for this.', ['acme'])).toBe(true)
    expect(mentions('Acmeville is a town.', ['acme'])).toBe(false)
  })

  it('counts a citation on the domain or a subdomain, including Gemini redirect links', () => {
    expect(cites([{ url: 'https://docs.acme.com/x' }], 'acme.com')).toBe(true)
    expect(cites([{ url: 'https://notacme.com/x' }], 'acme.com')).toBe(false)
    expect(cites([{ url: 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/abc', title: 'acme.com' }], 'acme.com')).toBe(true)
  })

  it('extracts brands in order with the same engine', async () => {
    const engine = { complete: async () => ({ text: 'Sure: {"brands": [" HubSpot ", "Pipedrive", ""]}', costUsd: 0.001 }) }
    expect(await extractBrands(engine, 'answer')).toEqual({ brands: ['HubSpot', 'Pipedrive'], costUsd: 0.001 })
    expect(await extractBrands(engine, '  ')).toEqual({ brands: [], costUsd: 0 })
  })
})
