import { useCallback } from 'react'
import './styles/global.css'
import './styles/sprite.css'
import './styles/bubble.css'
import { usePetStore } from './store/petStore'
import { useIpc } from './hooks/useIpc'
import { PetSprite } from './components/PetSprite'
import { SpeechBubble } from './components/SpeechBubble'
import { TypingDots } from './components/TypingDots'

export default function App(): React.JSX.Element {
  useIpc()

  const { message, isTyping, animState } = usePetStore()

  const showBubble = !!message && !isTyping
  const showTyping = isTyping

  const handleMouseDown = useCallback((_e: React.MouseEvent) => {
    let isDragging = false
    window.petApi.dragStart()

    const onMove = (): void => {
      isDragging = true
      window.petApi.dragMove()
    }

    const onUp = (): void => {
      if (!isDragging) window.petApi.poke()
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
