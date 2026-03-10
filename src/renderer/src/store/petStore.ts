import { create } from 'zustand'
import type { AnimationState } from '../../../shared/types'

interface PetStore {
  message: string | null
  isTyping: boolean
  isMuted: boolean
  animState: AnimationState
  ollamaAvailable: boolean

  setMessage: (msg: string | null) => void
  setIsTyping: (v: boolean) => void
  setMuted: (v: boolean) => void
  setAnimState: (s: AnimationState) => void
  setOllamaAvailable: (v: boolean) => void
}

export const usePetStore = create<PetStore>((set) => ({
  message: null,
  isTyping: false,
  isMuted: false,
  animState: 'idle',
  ollamaAvailable: false,

  setMessage: (msg) => set({ message: msg }),
  setIsTyping: (v) => set({ isTyping: v }),
  setMuted: (v) => set({ isMuted: v }),
  setAnimState: (s) => set({ animState: s }),
  setOllamaAvailable: (v) => set({ ollamaAvailable: v })
}))
