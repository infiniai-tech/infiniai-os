import type { OrchestratorState } from '../lib/types'

interface OrchestratorAvatarProps {
  state: OrchestratorState
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: { svg: 32 },
  md: { svg: 48 },
  lg: { svg: 64 },
}

const ZEUS_COLORS = {
  primary: '#FBBF24',
  secondary: '#F59E0B',
  accent: '#FEF3C7',
  dark: '#92400E',
}

function ZeusOrchestratorSVG({ size, state }: { size: number; state: OrchestratorState }) {
  const isActive = state === 'spawning' || state === 'monitoring' || state === 'scheduling'

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Background circle */}
      <circle cx="32" cy="32" r="30" fill={ZEUS_COLORS.primary} />
      <circle cx="32" cy="32" r="26" fill={ZEUS_COLORS.secondary} />

      {/* Crown */}
      <polygon points="18,24 22,12 28,20 32,8 36,20 42,12 46,24" fill="white" />
      <rect x="18" y="24" width="28" height="4" rx="1" fill="white" opacity="0.9" />
      <circle cx="26" cy="26" r="1.5" fill={ZEUS_COLORS.primary} />
      <circle cx="32" cy="26" r="1.5" fill={ZEUS_COLORS.primary} />
      <circle cx="38" cy="26" r="1.5" fill={ZEUS_COLORS.primary} />

      {/* Lightning bolt (central) */}
      <polygon points="30,30 26,40 31,38 27,52 40,36 34,38 37,30" fill="white" />

      {/* Electric arcs when active */}
      {isActive && (
        <>
          <line x1="14" y1="36" x2="20" y2="34" stroke="white" strokeWidth="1.5" opacity="0.6" className="animate-pulse" />
          <line x1="44" y1="34" x2="50" y2="36" stroke="white" strokeWidth="1.5" opacity="0.6" className="animate-pulse" />
          <circle cx="16" cy="44" r="2" fill="white" opacity="0.4" className="animate-pulse" />
          <circle cx="48" cy="44" r="2" fill="white" opacity="0.4" className="animate-pulse" />
        </>
      )}
    </svg>
  )
}

function getStateAnimation(state: OrchestratorState): string {
  switch (state) {
    case 'idle':
      return 'animate-bounce-gentle'
    case 'initializing':
    case 'scheduling':
    case 'draining':
      return 'animate-thinking'
    case 'spawning':
      return 'animate-working'
    case 'monitoring':
      return 'animate-bounce-gentle'
    case 'complete':
      return 'animate-celebrate'
    default:
      return ''
  }
}

function getStateGlow(state: OrchestratorState): string {
  switch (state) {
    case 'initializing':
      return 'shadow-[0_0_12px_rgba(251,191,36,0.4)]'
    case 'scheduling':
      return 'shadow-[0_0_10px_rgba(245,158,11,0.5)]'
    case 'spawning':
      return 'shadow-[0_0_16px_rgba(251,191,36,0.6)]'
    case 'monitoring':
      return 'shadow-[0_0_8px_rgba(245,158,11,0.4)]'
    case 'draining':
      return 'shadow-[0_0_10px_rgba(251,191,36,0.5)]'
    case 'complete':
      return 'shadow-[0_0_20px_rgba(112,224,0,0.6)]'
    default:
      return ''
  }
}

export function OrchestratorAvatar({ state, size = 'md' }: OrchestratorAvatarProps) {
  const { svg: svgSize } = SIZES[size]

  return (
    <div
      className="flex flex-col items-center gap-1"
      role="status"
      aria-label={`Zeus is orchestrating`}
      aria-live="polite"
    >
      <div
        className={`
          rounded-full p-1 transition-all duration-300
          ${getStateAnimation(state)}
          ${getStateGlow(state)}
        `}
        style={{ backgroundColor: ZEUS_COLORS.accent }}
        role="img"
        aria-hidden="true"
      >
        <ZeusOrchestratorSVG size={svgSize} state={state} />
      </div>
    </div>
  )
}
