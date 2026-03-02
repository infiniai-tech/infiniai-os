import { type AgentMascot, type AgentState } from '../lib/types'
import {
  AVATAR_COLORS,
  UNKNOWN_COLORS,
  MASCOT_SVGS,
  UnknownMascotSVG,
} from './mascotData'

export const LEGACY_NAME_MAP: Record<string, AgentMascot> = {
  Spark: 'Zeus',
  Fizz: 'Athena',
  Octo: 'Apollo',
  Hoot: 'Hermes',
  Buzz: 'Artemis',
  Pixel: 'Hephaestus',
  Byte: 'Ares',
  Nova: 'Poseidon',
  Chip: 'Demeter',
  Bolt: 'Dionysus',
  Dash: 'Hera',
  Zap: 'Persephone',
  Gizmo: 'Hades',
  Turbo: 'Aphrodite',
  Blip: 'Hecate',
  Neon: 'Nike',
  Widget: 'Iris',
  Zippy: 'Helios',
  Quirk: 'Selene',
  Flux: 'Eos',
}

export function resolveAgentName(name: string): string {
  return LEGACY_NAME_MAP[name] || name
}

interface AgentAvatarProps {
  name: AgentMascot | 'Unknown'
  state: AgentState
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showName?: boolean
}

const SIZES = {
  xs: { svg: 18, font: 'text-[10px]' },
  sm: { svg: 32, font: 'text-xs' },
  md: { svg: 48, font: 'text-sm' },
  lg: { svg: 64, font: 'text-base' },
}

// Animation classes based on state
function getStateAnimation(state: AgentState): string {
  switch (state) {
    case 'idle':
      return 'animate-bounce-gentle'
    case 'thinking':
      return 'animate-thinking'
    case 'working':
      return 'animate-working'
    case 'testing':
      return 'animate-testing'
    case 'success':
      return 'animate-celebrate'
    case 'error':
    case 'struggling':
      return 'animate-shake-gentle'
    default:
      return ''
  }
}

// Glow effect based on state
function getStateGlow(state: AgentState): string {
  switch (state) {
    case 'working':
      return 'shadow-[0_0_12px_rgba(0,180,216,0.5)]'
    case 'thinking':
      return 'shadow-[0_0_8px_rgba(255,214,10,0.4)]'
    case 'success':
      return 'shadow-[0_0_16px_rgba(112,224,0,0.6)]'
    case 'error':
    case 'struggling':
      return 'shadow-[0_0_12px_rgba(255,84,0,0.5)]'
    default:
      return ''
  }
}

// Get human-readable state description for accessibility
function getStateDescription(state: AgentState): string {
  switch (state) {
    case 'idle':
      return 'waiting'
    case 'thinking':
      return 'analyzing'
    case 'working':
      return 'coding'
    case 'testing':
      return 'running tests'
    case 'success':
      return 'completed successfully'
    case 'error':
      return 'encountered an error'
    case 'struggling':
      return 'having difficulty'
    default:
      return state
  }
}

export function AgentAvatar({ name, state, size = 'md', showName = false }: AgentAvatarProps) {
  const resolved = (name !== 'Unknown' && LEGACY_NAME_MAP[name]) || name
  const resolvedName = resolved as AgentMascot
  const isUnknown = resolved === 'Unknown' || !(resolvedName in AVATAR_COLORS)
  const colors = isUnknown ? UNKNOWN_COLORS : AVATAR_COLORS[resolvedName]
  const { svg: svgSize, font } = SIZES[size]
  const SvgComponent = isUnknown ? UnknownMascotSVG : (MASCOT_SVGS[resolvedName] || UnknownMascotSVG)
  const displayName = isUnknown ? name : resolvedName
  const stateDesc = getStateDescription(state)
  const ariaLabel = `Agent ${displayName} is ${stateDesc}`

  return (
    <div
      className="flex flex-col items-center gap-1"
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      <div
        className={`
          rounded-full p-1 transition-all duration-300
          ${getStateAnimation(state)}
          ${getStateGlow(state)}
        `}
        style={{ backgroundColor: colors.accent }}
        title={ariaLabel}
        role="img"
        aria-hidden="true"
      >
        <SvgComponent colors={colors} size={svgSize} />
      </div>
      {showName && (
        <span className={`${font} font-bold text-foreground`} style={{ color: colors.primary }}>
          {displayName}
        </span>
      )}
    </div>
  )
}
