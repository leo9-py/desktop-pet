import { BrowserWindow } from 'electron'
import { settingsStore } from './settingsStore'
import { checkHealth, generate } from './ollamaClient'
import { buildContext, contextToPrompt } from './contextBuilder'
import { getIdleSeconds } from './idleDetector'
import type { TriggerType } from '../shared/types'

const WINDOW_CHANGE_DEBOUNCE_MS = 2_000
const COMMENT_COOLDOWN_MS = 45_000
const BUSY_TIMER_INTERVAL_MS = 300_000
const IDLE_TIMER_INTERVAL_MS = 90_000
const POLL_INTERVAL_MS = 30_000
const ERROR_BACKOFF_MS = 120_000
const MAX_ERRORS = 3
const HEALTH_CHECK_INTERVAL_MS = 60_000

let isGenerating = false
let lastCommentTime = 0
let consecutiveErrors = 0
let lastErrorTime = 0
let ollamaAvailable = false
let pollTimer: ReturnType<typeof setInterval> | null = null
let healthTimer: ReturnType<typeof setInterval> | null = null
let windowChangeDebounceTimer: ReturnType<typeof setTimeout> | null = null
let getWindow: () => BrowserWindow | null

function send(channel: string, ...args: unknown[]): void {
  const win = getWindow()
  if (win && !win.isDestroyed()) {
    win.webContents.send(channel, ...args)
  }
}

function canComment(): boolean {
  if (settingsStore.get('muted')) return false
  if (isGenerating) return false
  if (!ollamaAvailable) return false
  if (Date.now() - lastCommentTime < COMMENT_COOLDOWN_MS) return false
  if (consecutiveErrors >= MAX_ERRORS && Date.now() - lastErrorTime < ERROR_BACKOFF_MS) return false
  return true
}

async function triggerComment(trigger: TriggerType): Promise<void> {
  if (!canComment()) return

  isGenerating = true
  const model = settingsStore.get('model')
  send('pet:typingStart')
  send('pet:setAnimation', 'talking')

  try {
    const ctx = buildContext(trigger)
    const prompt = contextToPrompt(ctx)
    console.log('[Pip] Triggering comment:', trigger, '\n', prompt)

    const response = await generate(model, prompt)

    send('pet:comment', response)
    lastCommentTime = Date.now()
    consecutiveErrors = 0

    // Return to idle after showing comment
    setTimeout(() => send('pet:setAnimation', 'idle'), 10_000)
  } catch (err) {
    console.error('[Pip] Generate error:', err)
    consecutiveErrors++
    lastErrorTime = Date.now()
    send('pet:typingEnd')
    send('pet:setAnimation', 'idle')

    // If model not found, mark ollama unavailable
    if (err instanceof Error && err.message.includes('404')) {
      ollamaAvailable = false
      send('pet:ollamaStatus', { available: false, model })
    }
  } finally {
    isGenerating = false
  }
}

async function runHealthCheck(): Promise<void> {
  const wasAvailable = ollamaAvailable
  ollamaAvailable = await checkHealth()
  const model = settingsStore.get('model')

  if (ollamaAvailable !== wasAvailable) {
    console.log('[Pip] Ollama status changed:', ollamaAvailable)
    send('pet:ollamaStatus', { available: ollamaAvailable, model })
  }

  if (ollamaAvailable && consecutiveErrors >= MAX_ERRORS) {
    consecutiveErrors = 0
  }
}

export function pokeComment(): void {
  if (isGenerating || !ollamaAvailable || settingsStore.get('muted')) return
  triggerComment('user_click')
}

export function onWindowChanged(): void {
  if (windowChangeDebounceTimer) clearTimeout(windowChangeDebounceTimer)
  windowChangeDebounceTimer = setTimeout(() => {
    triggerComment('window_change')
  }, WINDOW_CHANGE_DEBOUNCE_MS)
}

export function startEngine(windowGetter: () => BrowserWindow | null): void {
  getWindow = windowGetter

  // Initial health check
  runHealthCheck()

  // Periodic health check
  healthTimer = setInterval(runHealthCheck, HEALTH_CHECK_INTERVAL_MS)

  // Periodic commentary poll
  pollTimer = setInterval(() => {
    const idleSeconds = getIdleSeconds()
    const isIdle = idleSeconds >= 60
    const timeSinceLast = Date.now() - lastCommentTime
    const threshold = isIdle ? IDLE_TIMER_INTERVAL_MS : BUSY_TIMER_INTERVAL_MS

    if (timeSinceLast >= threshold) {
      triggerComment(isIdle ? 'timer_idle' : 'timer_busy')
    }
  }, POLL_INTERVAL_MS)
}

export function stopEngine(): void {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
  if (healthTimer) { clearInterval(healthTimer); healthTimer = null }
  if (windowChangeDebounceTimer) { clearTimeout(windowChangeDebounceTimer); windowChangeDebounceTimer = null }
}
