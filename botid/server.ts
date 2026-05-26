import { headers } from 'next/headers'

interface BotCheckResult {
  isBot: boolean
}

export async function checkBotId(): Promise<BotCheckResult> {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''

  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /headless/i,
  ]

  const isBot = botPatterns.some((pattern) => pattern.test(userAgent))
  return { isBot }
}
