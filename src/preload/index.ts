import { contextBridge, ipcRenderer } from 'electron'
import type { IpcApi, Settings, AnimationState, OllamaStatus } from '../shared/types'

function onChannel(channel: string, cb: (...args: unknown[]) => void): () => void {
  const handler = (_event: Electron.IpcRendererEvent, ...args: unknown[]): void => cb(...args)
  ipcRenderer.on(channel, handler)
  return () => ipcRenderer.removeListener(channel, handler)
}

const api: IpcApi = {
  getSettings: () => ipcRenderer.invoke('pet:getSettings') as Promise<Settings>,
  setMuted: (muted) => ipcRenderer.invoke('pet:setMuted', muted),
  setModel: (model) => ipcRenderer.invoke('pet:setModel', model),
  getModels: () => ipcRenderer.invoke('pet:getModels') as Promise<string[]>,
  poke: () => ipcRenderer.invoke('pet:poke') as Promise<void>,

  onComment: (cb) => onChannel('pet:comment', cb as (...args: unknown[]) => void),
  onTypingStart: (cb) => onChannel('pet:typingStart', cb as (...args: unknown[]) => void),
  onTypingEnd: (cb) => onChannel('pet:typingEnd', cb as (...args: unknown[]) => void),
  onSetAnimation: (cb) =>
    onChannel('pet:setAnimation', cb as (...args: unknown[]) => void) as () => void,
  onOllamaStatus: (cb) =>
    onChannel('pet:ollamaStatus', cb as (...args: unknown[]) => void) as () => void,
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('petApi', api)
  } catch (e) {
    console.error(e)
  }
} else {
  // @ts-ignore
  window.petApi = api
}
