import { isIP } from 'node:net'
import { PROBE_UAS } from './bots'

// Pages are read the way a visitor's browser sees them; bot user agents are only used for the CDN probe.
const BROWSER_UA = PROBE_UAS.browser!

export interface FetchOpts { ua?: string; timeoutMs?: number; maxBytes?: number; allowLocal?: boolean }
export interface Fetched { url: string; status: number; text: string; contentType: string; error?: string }

const PRIVATE = [/^127\./, /^10\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[01])\./, /^169\.254\./, /^0\./, /^::1$/, /^f[cd]/i, /^fe80/i]

// Refuses private/loopback hosts unless allowLocal (protects the hosted version from SSRF).
// ponytail: checks the literal hostname only, not DNS answers. Resolve + pin the IP before the hosted audit ships.
export function assertPublicUrl(raw: string, allowLocal = false): URL {
  const u = new URL(raw)
  if (!/^https?:$/.test(u.protocol)) throw new Error(`Only http(s) URLs can be audited: ${raw}`)
  const host = u.hostname.replace(/^\[|\]$/g, '')
  const local = host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || (isIP(host) > 0 && PRIVATE.some(r => r.test(host)))
  if (local && !allowLocal) throw new Error(`${host} is a private address. Pass --allow-local to audit a site on your machine.`)
  return u
}

export async function get(url: string, o: FetchOpts = {}): Promise<Fetched> {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), o.timeoutMs ?? 15000)
  try {
    assertPublicUrl(url, o.allowLocal)
    const res = await fetch(url, { headers: { 'User-Agent': o.ua ?? BROWSER_UA, 'Accept-Language': 'en-US,en;q=0.9', Accept: 'text/html,application/xhtml+xml,text/plain,*/*' }, redirect: 'follow', signal: ctl.signal })
    const reader = res.body?.getReader()
    const max = o.maxBytes ?? 3_000_000
    let size = 0
    const chunks: Uint8Array[] = []
    while (reader) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > max) { await reader.cancel(); break }
      chunks.push(value)
    }
    const text = new TextDecoder().decode(Buffer.concat(chunks))
    return { url: res.url || url, status: res.status, text, contentType: res.headers.get('content-type') ?? '' }
  } catch (e) {
    return { url, status: 0, text: '', contentType: '', error: (e as Error).name === 'AbortError' ? 'timed out' : (e as Error).message }
  } finally {
    clearTimeout(t)
  }
}
