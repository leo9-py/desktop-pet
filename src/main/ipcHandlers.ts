import { ipcMain, screen } from 'electron'
import { settingsStore } from './settingsStore'
import { listModels } from './ollamaClient'
import { pokeComment } from './commentaryEngine'
import { getPetWindow } from './petWindow'

let dragOffsetX = 0
let dragOffsetY = 0

export function registerIpcHandlers(): void {
  ipcMain.handle('pet:getSettings', () => settingsStore.getAll())

  ipcMain.handle('pet:setMuted', (_e, muted: boolean) => {
    settingsStore.set('muted', muted)
  })

  ipcMain.handle('pet:setModel', (_e, model: string) => {
    settingsStore.set('model', model)
  })

  ipcMain.handle('pet:getModels', async () => {
    return listModels()
  })

  ipcMain.handle('pet:poke', () => {
    pokeComment()
  })

  ipcMain.handle('pet:dragStart', () => {
    const win = getPetWindow()
    if (!win) return
    const [wx, wy] = win.getPosition()
    const { x: cx, y: cy } = screen.getCursorScreenPoint()
    dragOffsetX = cx - wx
    dragOffsetY = cy - wy
  })

  ipcMain.handle('pet:dragMove', () => {
    const win = getPetWindow()
    if (!win) return
    const { x: cx, y: cy } = screen.getCursorScreenPoint()
    win.setPosition(cx - dragOffsetX, cy - dragOffsetY)
  })
}
