import { ipcMain } from 'electron'
import { settingsStore } from './settingsStore'
import { listModels } from './ollamaClient'
import { pokeComment } from './commentaryEngine'
import { getPetWindow } from './petWindow'

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

  ipcMain.handle('pet:setWindowPosition', (_e, x: number, y: number) => {
    getPetWindow()?.setPosition(Math.round(x), Math.round(y))
  })
}
