import Store from 'electron-store'
import type { Settings } from '../shared/types'

const defaults: Settings = {
  muted: false,
  model: 'qwen2.5:1.5b',
  windowX: 100,
  windowY: 100
}

const store = new Store<Settings>({ defaults })

export const settingsStore = {
  get<K extends keyof Settings>(key: K): Settings[K] {
    return store.get(key)
  },
  set<K extends keyof Settings>(key: K, value: Settings[K]): void {
    store.set(key, value)
  },
  getAll(): Settings {
    return store.store
  }
}
