import { powerMonitor } from 'electron'
import type { UserState } from '../shared/types'

const IDLE_THRESHOLD_SECONDS = 60

export function getIdleSeconds(): number {
  return powerMonitor.getSystemIdleTime()
}

export function getUserState(): UserState {
  return getIdleSeconds() >= IDLE_THRESHOLD_SECONDS ? 'idle' : 'busy'
}
