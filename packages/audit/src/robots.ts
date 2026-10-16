import robotsParser from 'robots-parser'
import { AI_BOTS } from './bots'
import type { BotAccess } from './types'

export function botAccess(robotsUrl: string, content: string | undefined, path = '/'): BotAccess[] {
  const robots = robotsParser(robotsUrl, content ?? '')
  const target = new URL(path, robotsUrl).toString()
  return AI_BOTS.map(b => ({ ...b, allowed: robots.isAllowed(target, b.token) !== false }))
}

export function sitemapsFrom(robotsUrl: string, content: string | undefined): string[] {
  return robotsParser(robotsUrl, content ?? '').getSitemaps()
}
