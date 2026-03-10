interface Props {
  visible: boolean
}

export function TypingDots({ visible }: Props): JSX.Element {
  return (
    <div className={`speech-bubble typing-dots ${visible ? 'speech-bubble--visible' : ''}`}>
      <span className="dot dot-1" />
      <span className="dot dot-2" />
      <span className="dot dot-3" />
    </div>
  )
}
