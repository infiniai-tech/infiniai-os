import { motion, type TargetAndTransition } from 'framer-motion'
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
  xs: { svg: 18, font: 'text-[10px]', radius: '6px' },
  sm: { svg: 32, font: 'text-xs', radius: '8px' },
  md: { svg: 48, font: 'text-sm', radius: '10px' },
  lg: { svg: 64, font: 'text-base', radius: '12px' },
}

/**
 * Returns framer-motion animation variants based on agent state.
 * Replaces CSS-only animation classes with richer motion effects.
 */
function getStateMotion(state: AgentState): {
  animate: TargetAndTransition
  transition: object
} {
  switch (state) {
    case 'idle':
      return {
        animate: { y: [0, -2, 0] },
        transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
      }
    case 'thinking':
      return {
        animate: { rotate: [-1, 1, -1], scale: [1, 1.02, 1] },
        transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
      }
    case 'working':
      return {
        animate: { y: [0, -3, 0], scale: [1, 1.03, 1] },
        transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
      }
    case 'testing':
      return {
        animate: { rotate: [0, 2, -2, 0] },
        transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
      }
    case 'success':
      return {
        animate: { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] },
        transition: { duration: 0.6, ease: 'easeOut' },
      }
    case 'error':
    case 'struggling':
      return {
        animate: { x: [-2, 2, -2, 2, 0] },
        transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' },
      }
    default:
      return {
        animate: {},
        transition: {},
      }
  }
}

/**
 * Returns a box-shadow glow string based on agent state.
 * Uses the design system palette for consistent visual language.
 */
function getStateGlow(state: AgentState): string {
  switch (state) {
    case 'working':
      return '0 0 12px rgba(122,138,0,0.35)'
    case 'thinking':
      return '0 0 8px rgba(247,154,25,0.3)'
    case 'success':
      return '0 0 16px rgba(187,203,100,0.5)'
    case 'error':
    case 'struggling':
      return '0 0 12px rgba(207,15,15,0.3)'
    case 'testing':
      return '0 0 10px rgba(122,138,0,0.25)'
    default:
      return 'none'
  }
}

// State indicator dot color
function getStateDotColor(state: AgentState): string | null {
  switch (state) {
    case 'working':
    case 'testing':
      return '#7A8A00'
    case 'thinking':
      return '#F79A19'
    case 'success':
      return '#BBCB64'
    case 'error':
    case 'struggling':
      return '#CF0F0F'
    default:
      return null
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

export const AGENT_EMOJIS: Record<string, string> = {
  Zeus: '\u26A1',
  Athena: '\uD83E\uDDE0',
  Apollo: '\u2600\uFE0F',
  Hermes: '\uD83D\uDC65',
  Artemis: '\uD83C\uDFAF',
  Hephaestus: '\uD83D\uDD28',
  Ares: '\uD83D\uDEE1\uFE0F',
  Poseidon: '\uD83C\uDF0A',
  Demeter: '\uD83C\uDF3E',
  Dionysus: '\uD83C\uDF77',
  Hera: '\uD83D\uDC51',
  Persephone: '\uD83C\uDF38',
  Hades: '\uD83D\uDD25',
  Aphrodite: '\uD83D\uDC9D',
  Hecate: '\uD83C\uDF19',
  Nike: '\uD83C\uDFC6',
  Iris: '\uD83C\uDF08',
  Helios: '\u2B50',
  Selene: '\uD83C\uDF1C',
  Eos: '\uD83C\uDF05',
}

export const AGENT_AVATAR_IMAGES: Record<string, string> = {
  Zeus: '/avatars/zeus.png',
  Athena: '/avatars/athena.png',
  Apollo: '/avatars/apollo.png',
  Hermes: '/avatars/hermes.png',
  Artemis: '/avatars/artemis.png',
  Hephaestus: '/avatars/hephaestus.png',
  Ares: '/avatars/ares.png',
  Poseidon: '/avatars/poseidon.png',
  Hades: '/avatars/hades.png',
}

export function getAgentAvatarSrc(name: string): string | null {
  const resolved = LEGACY_NAME_MAP[name] || name
  return AGENT_AVATAR_IMAGES[resolved] || null
}

function getAgentEmoji(name: string): string {
  const resolved = LEGACY_NAME_MAP[name] || name
  return AGENT_EMOJIS[resolved] || '\uD83E\uDD16'
}

const EMOJI_SIZES = {
  xs: { box: 22, fontSize: '12px' },
  sm: { box: 34, fontSize: '16px' },
  md: { box: 44, fontSize: '22px' },
  lg: { box: 56, fontSize: '28px' },
}

interface AgentEmojiAvatarProps {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  active?: boolean
}

export function AgentEmojiAvatar({ name, size = 'sm', active = true }: AgentEmojiAvatarProps) {
  const avatarSrc = getAgentAvatarSrc(name)
  const emoji = getAgentEmoji(name)
  const { box, fontSize } = EMOJI_SIZES[size]

  return (
    <div
      style={{
        width: `${box}px`,
        height: `${box}px`,
        borderRadius: '50%',
        border: active ? '2px solid #BBCB64' : '2px solid #DDEC90',
        background: active ? '#FFFFF0' : '#FAFAF2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize,
        flexShrink: 0,
        overflow: 'hidden',
        animation: active ? 'emoji-breathe 1.2s ease-in-out infinite' : 'none',
      }}
    >
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        emoji
      )}
    </div>
  )
}

export function AgentAvatar({ name, state, size = 'md', showName = false }: AgentAvatarProps) {
  const resolved = (name !== 'Unknown' && LEGACY_NAME_MAP[name]) || name
  const resolvedName = resolved as AgentMascot
  const isUnknown = resolved === 'Unknown' || !(resolvedName in AVATAR_COLORS)
  const colors = isUnknown ? UNKNOWN_COLORS : AVATAR_COLORS[resolvedName]
  const { svg: svgSize, font, radius } = SIZES[size]
  const SvgComponent = isUnknown ? UnknownMascotSVG : (MASCOT_SVGS[resolvedName] || UnknownMascotSVG)
  const displayName = isUnknown ? name : resolvedName
  const stateDesc = getStateDescription(state)
  const ariaLabel = `Agent ${displayName} is ${stateDesc}`
  const dotColor = getStateDotColor(state)
  const isActive = ['thinking', 'working', 'testing'].includes(state)
  const stateMotion = getStateMotion(state)
  const glowShadow = getStateGlow(state)

  return (
    <div
      className="flex flex-col items-center gap-1"
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <motion.div
          animate={stateMotion.animate}
          transition={stateMotion.transition}
          style={{
            width: `${svgSize + 8}px`,
            height: `${svgSize + 8}px`,
            backgroundColor: '#FAFAF2',
            border: '2px solid #DDEC90',
            borderRadius: '50%',
            boxShadow: `${glowShadow !== 'none' ? glowShadow + ', ' : ''}0 2px 8px rgba(26,26,0,0.12)`,
            transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
          title={ariaLabel}
          role="img"
          aria-hidden="true"
        >
          {getAgentAvatarSrc(resolved) ? (
            <img
              src={getAgentAvatarSrc(resolved)!}
              alt={displayName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <SvgComponent colors={colors} size={svgSize} />
          )}
        </motion.div>

        {/* State indicator dot with framer-motion pulse */}
        {dotColor && (
          <div
            style={{
              position: 'absolute',
              bottom: '-1px',
              right: '-1px',
              width: size === 'xs' ? '6px' : '8px',
              height: size === 'xs' ? '6px' : '8px',
            }}
          >
            <span
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '9999px',
                background: dotColor,
                border: '1.5px solid #FFFFFF',
              }}
            />
            {isActive && (
              <motion.span
                animate={{
                  scale: [1, 2.2, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '9999px',
                  background: dotColor,
                }}
              />
            )}
          </div>
        )}
      </div>
      {showName && (
        <span
          className={`${font} font-bold text-foreground`}
          style={{
            color: colors.primary,
            fontFamily: "'Geist', 'Inter', sans-serif",
          }}
        >
          {displayName}
        </span>
      )}
    </div>
  )
}
