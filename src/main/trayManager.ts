import { Tray, Menu, app, nativeImage } from 'electron'
import { join } from 'path'
import { settingsStore } from './settingsStore'
import { listModels } from './ollamaClient'
import type { BrowserWindow } from 'electron'

let tray: Tray | null = null

function getIconPath(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'icon.png')
  }
  return join(app.getAppPath(), 'resources', 'icon.png')
}

async function buildMenu(win: BrowserWindow): Promise<Menu> {
  const muted = settingsStore.get('muted')
  const currentModel = settingsStore.get('model')
  const models = await listModels()

  const modelItems = models.length > 0
    ? models.map((m) => ({
        label: m,
        type: 'radio' as const,
        checked: m === currentModel,
        click: () => {
          settingsStore.set('model', m)
          buildMenu(win).then((menu) => tray?.setContextMenu(menu))
        }
      }))
    : [{ label: 'No models found', enabled: false, type: 'normal' as const }]

  return Menu.buildFromTemplate([
    {
      label: muted ? 'Unmute Pip' : 'Mute Pip',
      click: () => {
        const newMuted = !settingsStore.get('muted')
        settingsStore.set('muted', newMuted)
        win.webContents.send('pet:setMuted', newMuted)
        buildMenu(win).then((menu) => tray?.setContextMenu(menu))
      }
    },
    { type: 'separator' },
    {
      label: 'Ollama Model',
      submenu: modelItems
    },
    { type: 'separator' },
    {
      label: 'Show Pet',
      click: () => {
        if (!win.isVisible()) win.show()
        win.focus()
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit()
    }
  ])
}

export async function createTray(win: BrowserWindow): Promise<Tray> {
  const iconPath = getIconPath()
  let img: Electron.NativeImage
  try {
    img = nativeImage.createFromPath(iconPath)
  } catch {
    img = nativeImage.createEmpty()
  }

  tray = new Tray(img)
  tray.setToolTip('Pip — your desktop pet')

  const menu = await buildMenu(win)
  tray.setContextMenu(menu)

  // Left-click shows/hides pet window
  tray.on('click', () => {
    if (win.isVisible()) {
      win.hide()
    } else {
      win.show()
      win.focus()
    }
  })

  return tray
}

export function setTrayTooltip(text: string): void {
  tray?.setToolTip(text)
}

export function destroyTray(): void {
  tray?.destroy()
  tray = null
}
