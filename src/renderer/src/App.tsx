import { useRef, useCallback } from 'react'
import './styles/global.css'
import './styles/sprite.css'
import './styles/bubble.css'
import { usePetStore } from './store/petStore'
import { useIpc } from './hooks/useIpc'
import { PetSprite } from './components/PetSprite'
import { SpeechBubble } from './components/SpeechBubble'
import { TypingDots } from './components/TypingDots'

const DRAG_THRESHOLD = 5

export default function App(): React.JSX.Element {
  useIpc()

  const { message, isTyping, animState } = usePetStore()

  const showBubble = !!message && !isTyping
  const showTyping = isTyping

  const dragRef = useRef<{
    startMX: number
    startMY: number
    startWX: number
    startWY: number
    dragged: boolean
  } | null>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragRef.current = {
      startMX: e.screenX,
      startMY: e.screenY,
      startWX: window.screenX,
      startWY: window.screenY,
      dragged: false
    }

    const onMove = (me: MouseEvent): void => {
      if (!dragRef.current) return
      const dx = me.screenX - dragRef.current.startMX
      const dy = me.screenY - dragRef.current.startMY
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
        dragRef.current.dragged = true
        const dpr = window.devicePixelRatio
        window.petApi.setWindowPosition(
          Math.round((dragRef.current.startWX + dx) * dpr),
          Math.round((dragRef.current.startWY + dy) * dpr)
        )
      }
    }

    const onUp = (): void => {
      if (dragRef.current && !dragRef.current.dragged) {
        window.petApi.poke()
      }
      dragRef.current = null
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '100vh',
        padding: '0 10px 12px',
        gap: '8px'
      }}
    >
      {showTyping ? (
        <TypingDots visible={showTyping} />
      ) : (
        <SpeechBubble message={message ?? ''} visible={showBubble} />
      )}

      <PetSprite state={animState} onMouseDown={handleMouseDown} />
    </div>
  )
}
