/** Wilson 95% interval for k successes out of n. Honest with small samples, unlike k/n ± a normal approximation. */
export function wilson(k: number, n: number): { rate: number; low: number; high: number } {
  if (n === 0) return { rate: 0, low: 0, high: 0 }
  const z = 1.96, p = k / n, d = 1 + (z * z) / n
  const mid = (p + (z * z) / (2 * n)) / d
  const half = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d
  return { rate: p, low: Math.max(0, mid - half), high: Math.min(1, mid + half) }
}

/** Run fn over items with at most `limit` in flight, keeping input order. */
export async function pool<T, R>(items: T[], limit: number, fn: (t: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length)
  let next = 0
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) { const i = next++; out[i] = await fn(items[i]!, i) }
  }))
  return out
}
