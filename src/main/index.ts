import { app } from 'electron'
import { join } from 'path'
import { createPetWindow, getPetWindow } from './petWindow'
import { createTray, setTrayTooltip, destroyTray } from './trayManager'
import { startWindowTracker, stopWindowTracker } from './windowTracker'
import { startEngine, stopEngine, onWindowChanged } from './commentaryEngine'
import { recordApp } from './contextBuilder'
import { registerIpcHandlers } from './ipcHandlers'
import type { WindowInfo } from '../shared/types'

// Prevent multiple instances
if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// @ts-ignore – extend app type for quit flag
app.isQuitting = false

app.whenReady().then(async () => {
  app.setAppUserModelId('com.desktop-pet.pip')
  registerIpcHandlers()

  const preload = join(__dirname, '../preload/index.js')
  const win = createPetWindow(preload)

  // Wait for window to be ready
  win.on('ready-to-show', () => {
    win.show()
  })

  // Keep alive when window is closed (live in tray)
  app.on('window-all-closed', () => {
    // Do nothing — app lives in tray
  })

  await createTray(win)

  // Wire up Ollama status to tray tooltip
  win.webContents.on('ipc-message', (_e, channel, ...args) => {
    if (channel === 'pet:ollamaStatus') {
      const status = args[0] as { available: boolean; model: string }
      setTrayTooltip(
        status.available
          ? `Pip — using ${status.model}`
          : 'Pip — Ollama not available'
      )
    }
  })

  // Start active window tracker
  startWindowTracker((info: WindowInfo) => {
    recordApp(info.title || info.appName || info.processName)
    onWindowChanged()
  })

  // Start commentary engine
  startEngine(getPetWindow)

  app.on('before-quit', () => {
    // @ts-ignore
    app.isQuitting = true
    stopEngine()
    stopWindowTracker()
    destroyTray()
  })

  app.on('second-instance', () => {
    const w = getPetWindow()
    if (w) {
      if (!w.isVisible()) w.show()
      w.focus()
    }
  })
})
