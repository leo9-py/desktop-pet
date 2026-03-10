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

      <PetSprite state={animState} onClick={() => window.petApi.poke()} />
    </div>
  )
}
