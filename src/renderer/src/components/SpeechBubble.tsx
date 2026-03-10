interface Props {
  message: string
  visible: boolean
}

export function SpeechBubble({ message, visible }: Props): JSX.Element {
  return (
    <div className={`speech-bubble ${visible ? 'speech-bubble--visible' : ''}`}>
      <p className="speech-bubble__text">{message}</p>
    </div>
  )
}
