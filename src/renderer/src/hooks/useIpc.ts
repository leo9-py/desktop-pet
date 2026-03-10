import { useEffect } from 'react'
import { usePetStore } from '../store/petStore'
import type { AnimationState, OllamaStatus } from '../../../shared/types'

const MESSAGE_DISPLAY_MS = 10_000

export function useIpc(): void {
  const { setMessage, setIsTyping, setAnimState, setOllamaAvailable, setMuted } = usePetStore()

  useEffect(() => {
    let dismissTimer: ReturnType<typeof setTimeout> | null = null

    const unsubComment = window.petApi.onComment((msg) => {
      setMessage(msg as string)
      setIsTyping(false)
      if (dismissTimer) clearTimeout(dismissTimer)
      dismissTimer = setTimeout(() => setMessage(null), MESSAGE_DISPLAY_MS)
    })

    const unsubTypingStart = window.petApi.onTypingStart(() => {
      setIsTyping(true)
      setMessage(null)
    })

    const unsubTypingEnd = window.petApi.onTypingEnd(() => {
      setIsTyping(false)
    })

    const unsubAnim = window.petApi.onSetAnimation((state) => {
      setAnimState(state as AnimationState)
    })

    const unsubStatus = window.petApi.onOllamaStatus((status) => {
      setOllamaAvailable((status as OllamaStatus).available)
    })

    // Also listen for mute changes pushed from tray
    const unsubMute = window.petApi.onComment((_msg) => {
      // This channel is overloaded; setMuted comes via 'pet:setMuted' pushed from tray
    })
    void unsubMute // suppress unused warning

    // Load initial settings
    window.petApi.getSettings().then((s) => {
      setMuted(s.muted)
      setOllamaAvailable(false) // will update via ollamaStatus event
    })

    return () => {
      unsubComment()
      unsubTypingStart()
      unsubTypingEnd()
      unsubAnim()
      unsubStatus()
      if (dismissTimer) clearTimeout(dismissTimer)
    }
  }, [setMessage, setIsTyping, setAnimState, setOllamaAvailable, setMuted])
}
