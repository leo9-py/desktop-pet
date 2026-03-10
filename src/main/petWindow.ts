import { BrowserWindow, screen, app } from 'electron'
import { join } from 'path'
import { settingsStore } from './settingsStore'

let petWindow: BrowserWindow | null = null

function clampToDisplays(x: number, y: number, w: number, h: number): { x: number; y: number } {
  const displays = screen.getAllDisplays()
  for (const display of displays) {
    const { bounds } = display
    if (
      x >= bounds.x - w / 2 &&
      x <= bounds.x + bounds.width &&
      y >= bounds.y - h / 2 &&
      y <= bounds.y + bounds.height
    ) {
      return {
        x: Math.max(bounds.x, Math.min(x, bounds.x + bounds.width - w)),
        y: Math.max(bounds.y, Math.min(y, bounds.y + bounds.height - h))
      }
    }
  }
  // Fallback: primary display
  const primary = screen.getPrimaryDisplay()
  return {
    x: primary.bounds.x + 100,
    y: primary.bounds.y + 100
  }
}

export function createPetWindow(preloadPath: string): BrowserWindow {
  const W = 180
  const H = 260

  const savedX = settingsStore.get('windowX')
  const savedY = settingsStore.get('windowY')
  const { x, y } = clampToDisplays(savedX, savedY, W, H)

  petWindow = new BrowserWindow({
    width: W,
    height: H,
    x,
    y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    focusable: true,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  petWindow.setAlwaysOnTop(true, 'pop-up-menu')

  // Save position on move
  petWindow.on('moved', () => {
    if (!petWindow) return
    const [wx, wy] = petWindow.getPosition()
    settingsStore.set('windowX', wx)
    settingsStore.set('windowY', wy)
  })

  petWindow.on('closed', () => {
    petWindow = null
  })

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    petWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    petWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return petWindow
}

export function getPetWindow(): BrowserWindow | null {
  return petWindow
}
