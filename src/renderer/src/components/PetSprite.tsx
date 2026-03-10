import type { AnimationState } from '../../../shared/types'

interface Props {
  state: AnimationState
  onMouseDown?: (e: React.MouseEvent) => void
}

// Pure CSS/SVG pixel cat — no external asset required.
// Replace with a sprite sheet later by swapping this component.
export function PetSprite({ state, onMouseDown }: Props): React.JSX.Element {
  return (
    <div className={`pet-sprite pet-sprite--${state}`} aria-label="Pip the desktop pet" onMouseDown={onMouseDown} style={{ cursor: 'grab' }}>
      <svg
        viewBox="0 0 64 80"
        xmlns="http://www.w3.org/2000/svg"
        className="pet-svg"
        shapeRendering="crispEdges"
      >
        {/* Left ear */}
        <polygon points="8,28 18,6 28,28" fill="#b388ff" />
        <polygon points="12,28 18,12 24,28" fill="#e040fb" />

        {/* Right ear */}
        <polygon points="36,28 46,6 56,28" fill="#b388ff" />
        <polygon points="40,28 46,12 52,28" fill="#e040fb" />

        {/* Body/head */}
        <rect x="6" y="26" width="52" height="46" rx="18" fill="#ce93d8" />

        {/* Cheek blush */}
        <ellipse cx="16" cy="56" rx="7" ry="4" fill="#f48fb1" opacity="0.5" />
        <ellipse cx="48" cy="56" rx="7" ry="4" fill="#f48fb1" opacity="0.5" />

        {/* Eyes */}
        {state === 'sleeping' ? (
          <>
            {/* Sleeping — closed eyes */}
            <path d="M20 44 Q24 40 28 44" stroke="#4a148c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M36 44 Q40 40 44 44" stroke="#4a148c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        ) : state === 'talking' ? (
          <>
            {/* Talking — wide open eyes */}
            <ellipse cx="24" cy="44" rx="7" ry="8" fill="#4a148c" />
            <ellipse cx="40" cy="44" rx="7" ry="8" fill="#4a148c" />
            <circle cx="26" cy="42" r="2" fill="white" />
            <circle cx="42" cy="42" r="2" fill="white" />
          </>
        ) : state === 'reacting' ? (
          <>
            {/* Reacting — stars / surprised eyes */}
            <ellipse cx="24" cy="44" rx="8" ry="8" fill="#4a148c" />
            <ellipse cx="40" cy="44" rx="8" ry="8" fill="#4a148c" />
            <text x="20" y="48" fontSize="10" fill="white">✦</text>
            <text x="36" y="48" fontSize="10" fill="white">✦</text>
          </>
        ) : (
          <>
            {/* Idle — normal eyes */}
            <ellipse cx="24" cy="44" rx="6" ry="7" fill="#4a148c" />
            <ellipse cx="40" cy="44" rx="6" ry="7" fill="#4a148c" />
            <circle cx="26" cy="42" r="1.5" fill="white" />
            <circle cx="42" cy="42" r="1.5" fill="white" />
          </>
        )}

        {/* Nose */}
        <polygon points="29,56 35,56 32,60" fill="#880e4f" />

        {/* Mouth */}
        {state === 'talking' ? (
          <ellipse cx="32" cy="63" rx="5" ry="4" fill="#4a148c" />
        ) : (
          <path d="M28 61 Q32 66 36 61" stroke="#880e4f" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}

        {/* Sleeping zzz particles */}
        {state === 'sleeping' && (
          <>
            <text x="50" y="30" fontSize="8" fill="#b39ddb" className="zzz zzz-1">z</text>
            <text x="54" y="22" fontSize="10" fill="#9575cd" className="zzz zzz-2">z</text>
            <text x="58" y="13" fontSize="12" fill="#7e57c2" className="zzz zzz-3">Z</text>
          </>
        )}
      </svg>
    </div>
  )
}
