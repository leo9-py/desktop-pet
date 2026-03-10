import type { IpcApi } from '../shared/types'

declare global {
  interface Window {
    petApi: IpcApi
  }
}
