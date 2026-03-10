import type { PetContext, TriggerType } from '../shared/types'
import { getCurrentWindow } from './windowTracker'
import { getIdleSeconds, getUserState } from './idleDetector'

const recentApps: string[] = []
const MAX_RECENT = 5

export function recordApp(appName: string): void {
  if (!appName) return
  if (recentApps[recentApps.length - 1] === appName) return
  recentApps.push(appName)
  if (recentApps.length > MAX_RECENT) recentApps.shift()
}

function getTimeLabel(hour: number): string {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function buildContext(trigger: TriggerType): PetContext {
  const now = new Date()
  const hour = now.getHours()
  const min = now.getMinutes().toString().padStart(2, '0')

  return {
    windowInfo: getCurrentWindow(),
    userState: getUserState(),
    idleSeconds: getIdleSeconds(),
    timeLabel: getTimeLabel(hour),
    dayOfWeek: DAYS[now.getDay()],
    timeString: `${hour}:${min}`,
    trigger,
    recentApps: [...recentApps]
  }
}

export function contextToPrompt(ctx: PetContext): string {
  const lines: string[] = []
  lines.push(`Time: ${ctx.timeLabel} (${ctx.dayOfWeek}, ${ctx.timeString})`)

  if (ctx.windowInfo) {
    const title = ctx.windowInfo.title.slice(0, 80)
    const app = ctx.windowInfo.appName || ctx.windowInfo.processName
    if (title) {
      lines.push(`Active window: "${title}"`)
    } else {
      lines.push(`User is in: ${app}`)
    }
  }

  lines.push(`User state: ${ctx.userState}`)
  if (ctx.userState === 'idle') {
    lines.push(`Idle for: ${ctx.idleSeconds} seconds`)
  }

  if (ctx.recentApps.length > 1) {
    lines.push(`Recent apps: ${ctx.recentApps.slice(-4).join(' → ')}`)
  }

  lines.push(`Trigger: ${ctx.trigger}`)
  if (ctx.trigger === 'user_click') {
    lines.push(`The user just clicked on you. Reflect on what they've been up to. 25 words max.`)
  } else {
    lines.push(`Make a brief, in-character observation. 25 words max.`)
  }

  return lines.join('\n')
}
