export type AnimationState = 'idle' | 'talking' | 'sleeping' | 'reacting'
export type UserState = 'busy' | 'idle'
export type TriggerType = 'window_change' | 'timer_idle' | 'timer_busy' | 'user_click'

export interface WindowInfo {
  title: string
  appName: string
  processName: string
  pid: number
}

export interface PetContext {
  windowInfo: WindowInfo | null
  userState: UserState
  idleSeconds: number
  timeLabel: string // 'morning' | 'afternoon' | 'evening' | 'night'
  dayOfWeek: string
  timeString: string
  trigger: TriggerType
  recentApps: string[]
}

export interface Settings {
  muted: boolean
  model: string
  windowX: number
  windowY: number
}

export interface OllamaStatus {
  available: boolean
  model: string
}

export interface IpcApi {
  getSettings: () => Promise<Settings>
  setMuted: (muted: boolean) => Promise<void>
  setModel: (model: string) => Promise<void>
  getModels: () => Promise<string[]>
  poke: () => Promise<void>
  dragStart: () => Promise<void>
  dragMove: () => Promise<void>
  onComment: (cb: (message: string) => void) => () => void
  onTypingStart: (cb: () => void) => () => void
  onTypingEnd: (cb: () => void) => () => void
  onSetAnimation: (cb: (state: AnimationState) => void) => () => void
  onOllamaStatus: (cb: (status: OllamaStatus) => void) => () => void
}
