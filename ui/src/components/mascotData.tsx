/**
 * SVG avatar definitions and color palettes for Greek god agent avatars.
 *
 * Each god has a unique SVG icon and color palette so avatars stay
 * visually distinct when multiple agents run in parallel.
 */

import type { AgentMascot } from '../lib/types'

// ---------------------------------------------------------------------------
// Color types and palettes
// ---------------------------------------------------------------------------

export interface MascotColorPalette {
  primary: string
  secondary: string
  accent: string
}

export interface MascotSVGProps {
  colors: MascotColorPalette
  size: number
}

export const UNKNOWN_COLORS: MascotColorPalette = {
  primary: '#6B7280',
  secondary: '#9CA3AF',
  accent: '#F3F4F6',
}

export const AVATAR_COLORS: Record<AgentMascot, MascotColorPalette> = {
  Zeus:       { primary: '#FBBF24', secondary: '#F59E0B', accent: '#FEF3C7' },
  Athena:     { primary: '#6366F1', secondary: '#818CF8', accent: '#E0E7FF' },
  Apollo:     { primary: '#F97316', secondary: '#FB923C', accent: '#FFEDD5' },
  Hermes:     { primary: '#14B8A6', secondary: '#2DD4BF', accent: '#CCFBF1' },
  Artemis:    { primary: '#22C55E', secondary: '#4ADE80', accent: '#DCFCE7' },
  Hephaestus: { primary: '#EF4444', secondary: '#F87171', accent: '#FEE2E2' },
  Ares:       { primary: '#DC2626', secondary: '#B91C1C', accent: '#FECACA' },
  Poseidon:   { primary: '#3B82F6', secondary: '#60A5FA', accent: '#DBEAFE' },
  Demeter:    { primary: '#84CC16', secondary: '#A3E635', accent: '#ECFCCB' },
  Dionysus:   { primary: '#A855F7', secondary: '#C084FC', accent: '#F3E8FF' },
  Hera:       { primary: '#EC4899', secondary: '#F472B6', accent: '#FCE7F3' },
  Persephone: { primary: '#D946EF', secondary: '#E879F9', accent: '#FAE8FF' },
  Hades:      { primary: '#475569', secondary: '#64748B', accent: '#E2E8F0' },
  Aphrodite:  { primary: '#F43F5E', secondary: '#FB7185', accent: '#FFE4E6' },
  Hecate:     { primary: '#7C3AED', secondary: '#8B5CF6', accent: '#EDE9FE' },
  Nike:       { primary: '#EAB308', secondary: '#FACC15', accent: '#FEF9C3' },
  Iris:       { primary: '#06B6D4', secondary: '#22D3EE', accent: '#CFFAFE' },
  Helios:     { primary: '#F59E0B', secondary: '#FBBF24', accent: '#FEF3C7' },
  Selene:     { primary: '#8B5CF6', secondary: '#A78BFA', accent: '#EDE9FE' },
  Eos:        { primary: '#FB923C', secondary: '#FDBA74', accent: '#FED7AA' },
}

// ---------------------------------------------------------------------------
// SVG components — unique icon per god
// ---------------------------------------------------------------------------

function ZeusSVG({ colors, size }: MascotSVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="28" fill={colors.accent} />
      <circle cx="32" cy="32" r="24" fill={colors.primary} />
      {/* Lightning bolt */}
      <polygon points="30,12 24,30 32,28 26,52 42,26 34,28 38,12" fill="white" />
      <polygon points="31,16 27,29 33,27 28,46 38,28 33,29 36,16" fill={colors.secondary} />
    </svg>
  )
}

function AthenaSVG({ colors, size }: MascotSVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="28" fill={colors.accent} />
      <circle cx="32" cy="32" r="24" fill={colors.primary} />
      {/* Owl eye / wisdom symbol */}
      <circle cx="32" cy="28" r="12" fill="white" />
      <circle cx="32" cy="28" r="8" fill={colors.secondary} />
      <circle cx="32" cy="28" r="4" fill="white" />
      {/* Helmet crest */}
      <path d="M20,18 Q32,4 44,18" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Olive branch */}
      <path d="M22,42 Q32,38 42,42" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="26" cy="41" r="2" fill={colors.accent} />
      <circle cx="32" cy="39" r="2" fill={colors.accent} />
      <circle cx="38" cy="41" r="2" fill={colors.accent} />
    </svg>
  )
}

function ApolloSVG({ colors, size }: MascotSVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="28" fill={colors.accent} />
      <circle cx="32" cy="32" r="24" fill={colors.primary} />
      {/* Sun rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line
          key={angle}
          x1="32" y1="32"
          x2={32 + 20 * Math.cos((angle * Math.PI) / 180)}
          y2={32 + 20 * Math.sin((angle * Math.PI) / 180)}
          stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6"
        />
      ))}
      {/* Inner sun */}
      <circle cx="32" cy="32" r="12" fill={colors.secondary} />
      <circle cx="32" cy="32" r="8" fill="white" opacity="0.9" />
      {/* Lyre strings */}
      <line x1="28" y1="28" x2="28" y2="36" stroke={colors.primary} strokeWidth="1.5" />
      <line x1="32" y1="27" x2="32" y2="37" stroke={colors.primary} strokeWidth="1.5" />
      <line x1="36" y1="28" x2="36" y2="36" stroke={colors.primary} strokeWidth="1.5" />
    </svg>
  )
}

function HermesSVG({ colors, size }: MascotSVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="28" fill={colors.accent} />
      <circle cx="32" cy="32" r="24" fill={colors.primary} />
      {/* Winged helmet */}
      <circle cx="32" cy="30" r="10" fill={colors.secondary} />
      <circle cx="32" cy="30" r="7" fill="white" />
      {/* Wings */}
      <path d="M18,24 Q12,18 8,24 Q12,22 18,28" fill="white" />
      <path d="M46,24 Q52,18 56,24 Q52,22 46,28" fill="white" />
      {/* Caduceus staff */}
      <line x1="32" y1="38" x2="32" y2="54" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M28,42 Q32,46 36,42" stroke="white" strokeWidth="1.5" fill="none" />
      <path d="M28,46 Q32,50 36,46" stroke="white" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

function ArtemisSVG({ colors, size }: MascotSVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="28" fill={colors.accent} />
      <circle cx="32" cy="32" r="24" fill={colors.primary} />
      {/* Crescent moon */}
      <path d="M38,14 A16,16 0 0,1 38,50 A12,12 0 0,0 38,14" fill="white" />
      {/* Arrow */}
      <line x1="16" y1="46" x2="44" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <polygon points="44,22 38,22 44,28" fill="white" />
      {/* Stars */}
      <circle cx="22" cy="22" r="2" fill="white" opacity="0.8" />
      <circle cx="18" cy="32" r="1.5" fill="white" opacity="0.6" />
    </svg>
  )
}

function HephaestusSVG({ colors, size }: MascotSVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="28" fill={colors.accent} />
      <circle cx="32" cy="32" r="24" fill={colors.primary} />
      {/* Anvil */}
      <rect x="20" y="34" width="24" height="8" rx="1" fill="white" />
      <rect x="24" y="28" width="16" height="8" rx="1" fill={colors.secondary} />
      <rect x="22" y="42" width="6" height="8" rx="1" fill="white" opacity="0.7" />
      <rect x="36" y="42" width="6" height="8" rx="1" fill="white" opacity="0.7" />
      {/* Hammer */}
      <rect x="30" y="10" width="4" height="20" rx="1" fill="white" />
      <rect x="24" y="10" width="16" height="6" rx="2" fill={colors.secondary} />
      {/* Sparks */}
      <circle cx="18" cy="24" r="2" fill={colors.accent} className="animate-pulse" />
      <circle cx="46" cy="20" r="1.5" fill={colors.accent} className="animate-pulse" />
    </svg>
  )
}

function AresSVG({ colors, size }: MascotSVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="28" fill={colors.accent} />
      <circle cx="32" cy="32" r="24" fill={colors.primary} />
      {/* Shield */}
      <circle cx="32" cy="34" r="14" fill={colors.secondary} />
      <circle cx="32" cy="34" r="10" fill="white" opacity="0.9" />
      <circle cx="32" cy="34" r="6" fill={colors.primary} />
      <circle cx="32" cy="34" r="2" fill="white" />
      {/* Spear */}
      <line x1="14" y1="14" x2="50" y2="50" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <polygon points="50,50 44,48 48,44" fill="white" />
      {/* Helmet plume */}
      <path d="M22,16 Q26,10 32,14" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function PoseidonSVG({ colors, size }: MascotSVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="28" fill={colors.accent} />
      <circle cx="32" cy="32" r="24" fill={colors.primary} />
      {/* Trident */}
      <line x1="32" y1="12" x2="32" y2="52" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="22" y1="18" x2="22" y2="12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="42" y1="18" x2="42" y2="12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22,18 Q27,22 32,18 Q37,22 42,18" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Waves */}
      <path d="M12,44 Q18,40 24,44 Q30,48 36,44 Q42,40 48,44" stroke="white" strokeWidth="2" fill="none" opacity="0.6" />
      <path d="M14,50 Q20,46 26,50 Q32,54 38,50 Q44,46 50,50" stroke="white" strokeWidth="1.5" fill="none" opacity="0.4" />
    </svg>
  )
}

function DemeterSVG({ colors, size }: MascotSVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="28" fill={colors.accent} />
      <circle cx="32" cy="32" r="24" fill={colors.primary} />
      {/* Wheat stalk */}
      <line x1="32" y1="14" x2="32" y2="52" stroke="white" strokeWidth="2" strokeLinecap="round" />
      {/* Wheat grains - left */}
      <ellipse cx="26" cy="18" rx="4" ry="2.5" fill="white" transform="rotate(-30 26 18)" />
      <ellipse cx="26" cy="26" rx="4" ry="2.5" fill="white" transform="rotate(-30 26 26)" />
      <ellipse cx="26" cy="34" rx="4" ry="2.5" fill="white" transform="rotate(-30 26 34)" />
      {/* Wheat grains - right */}
      <ellipse cx="38" cy="22" rx="4" ry="2.5" fill="white" transform="rotate(30 38 22)" />
      <ellipse cx="38" cy="30" rx="4" ry="2.5" fill="white" transform="rotate(30 38 30)" />
      <ellipse cx="38" cy="38" rx="4" ry="2.5" fill="white" transform="rotate(30 38 38)" />
      {/* Earth */}
      <path d="M20,48 Q32,42 44,48" stroke="white" strokeWidth="2" fill="none" opacity="0.5" />
    </svg>
  )
}

function DionysusSVG({ colors, size }: MascotSVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="28" fill={colors.accent} />
      <circle cx="32" cy="32" r="24" fill={colors.primary} />
      {/* Goblet */}
      <path d="M24,22 L24,36 Q24,44 32,44 Q40,44 40,36 L40,22 Z" fill={colors.secondary} />
      <path d="M26,24 L26,34 Q26,40 32,40 Q38,40 38,34 L38,24 Z" fill="white" opacity="0.8" />
      {/* Stem */}
      <rect x="30" y="44" width="4" height="8" fill="white" />
      <rect x="26" y="52" width="12" height="3" rx="1" fill="white" />
      {/* Vine leaves */}
      <circle cx="20" cy="18" r="4" fill="white" opacity="0.6" />
      <circle cx="44" cy="18" r="4" fill="white" opacity="0.6" />
      <path d="M20,18 Q24,14 28,18" stroke="white" strokeWidth="1.5" fill="none" />
      <path d="M36,18 Q40,14 44,18" stroke="white" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

function HeraSVG({ colors, size }: MascotSVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="28" fill={colors.accent} />
      <circle cx="32" cy="32" r="24" fill={colors.primary} />
      {/* Crown */}
      <polygon points="18,28 22,16 28,24 32,12 36,24 42,16 46,28" fill="white" />
      <rect x="18" y="28" width="28" height="4" rx="1" fill={colors.secondary} />
      {/* Jewels */}
      <circle cx="26" cy="30" r="2" fill={colors.accent} />
      <circle cx="32" cy="30" r="2" fill={colors.accent} />
      <circle cx="38" cy="30" r="2" fill={colors.accent} />
      {/* Peacock feather eye */}
      <ellipse cx="32" cy="44" rx="8" ry="6" fill={colors.secondary} />
      <ellipse cx="32" cy="44" rx="5" ry="4" fill="white" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill={colors.primary} />
    </svg>
  )
}

function PersephoneSVG({ colors, size }: MascotSVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="28" fill={colors.accent} />
      <circle cx="32" cy="32" r="24" fill={colors.primary} />
      {/* Pomegranate */}
      <circle cx="32" cy="32" r="12" fill={colors.secondary} />
      <circle cx="32" cy="32" r="9" fill="white" opacity="0.8" />
      {/* Seeds */}
      <circle cx="29" cy="30" r="2" fill={colors.primary} />
      <circle cx="35" cy="30" r="2" fill={colors.primary} />
      <circle cx="32" cy="35" r="2" fill={colors.primary} />
      <circle cx="28" cy="35" r="1.5" fill={colors.primary} opacity="0.7" />
      <circle cx="36" cy="35" r="1.5" fill={colors.primary} opacity="0.7" />
      {/* Crown of flowers */}
      <circle cx="22" cy="18" r="3" fill="white" opacity="0.7" />
      <circle cx="32" cy="14" r="3" fill="white" opacity="0.7" />
      <circle cx="42" cy="18" r="3" fill="white" opacity="0.7" />
      <path d="M22,18 Q27,12 32,14 Q37,12 42,18" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5" />
    </svg>
  )
}

function HadesSVG({ colors, size }: MascotSVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="28" fill={colors.accent} />
      <circle cx="32" cy="32" r="24" fill={colors.primary} />
      {/* Helm of darkness */}
      <path d="M18,30 Q18,14 32,14 Q46,14 46,30" fill={colors.secondary} />
      <path d="M20,30 Q20,18 32,18 Q44,18 44,30" fill="white" opacity="0.3" />
      {/* Skull-like face */}
      <circle cx="26" cy="28" r="4" fill="white" />
      <circle cx="38" cy="28" r="4" fill="white" />
      <circle cx="26" cy="28" r="2" fill={colors.primary} />
      <circle cx="38" cy="28" r="2" fill={colors.primary} />
      {/* Bident */}
      <line x1="32" y1="36" x2="32" y2="56" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="26" y1="42" x2="26" y2="36" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="38" y1="42" x2="38" y2="36" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M26,42 Q29,44 32,42 Q35,44 38,42" stroke="white" strokeWidth="2" fill="none" />
    </svg>
  )
}

function AphroditeSVG({ colors, size }: MascotSVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="28" fill={colors.accent} />
      <circle cx="32" cy="32" r="24" fill={colors.primary} />
      {/* Heart */}
      <path d="M32,48 C20,38 14,28 22,20 C26,16 32,20 32,24 C32,20 38,16 42,20 C50,28 44,38 32,48Z" fill="white" />
      <path d="M32,44 C23,36 18,28 24,22 C27,19 32,22 32,26 C32,22 37,19 40,22 C46,28 41,36 32,44Z" fill={colors.secondary} opacity="0.6" />
      {/* Shell details */}
      <path d="M16,48 Q24,44 32,48 Q40,44 48,48" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5" />
    </svg>
  )
}

function HecateSVG({ colors, size }: MascotSVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="28" fill={colors.accent} />
      <circle cx="32" cy="32" r="24" fill={colors.primary} />
      {/* Triple moon */}
      <circle cx="32" cy="28" r="8" fill="white" />
      <path d="M18,28 A8,8 0 0,1 18,12" fill="white" opacity="0.7" />
      <path d="M46,12 A8,8 0 0,1 46,28" fill="white" opacity="0.7" />
      {/* Crossroads - three paths */}
      <line x1="32" y1="38" x2="32" y2="54" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="38" x2="18" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="38" x2="46" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round" />
      {/* Torch flames */}
      <circle cx="18" cy="48" r="3" fill={colors.accent} className="animate-pulse" />
      <circle cx="46" cy="48" r="3" fill={colors.accent} className="animate-pulse" />
    </svg>
  )
}

function NikeSVG({ colors, size }: MascotSVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="28" fill={colors.accent} />
      <circle cx="32" cy="32" r="24" fill={colors.primary} />
      {/* Victory wings */}
      <path d="M32,28 Q20,14 10,22 Q18,18 26,28" fill="white" />
      <path d="M32,28 Q44,14 54,22 Q46,18 38,28" fill="white" />
      <path d="M32,32 Q22,20 14,26 Q20,22 28,32" fill="white" opacity="0.6" />
      <path d="M32,32 Q42,20 50,26 Q44,22 36,32" fill="white" opacity="0.6" />
      {/* Laurel wreath */}
      <circle cx="32" cy="38" r="10" fill={colors.secondary} />
      <circle cx="32" cy="38" r="7" fill="white" opacity="0.8" />
      {/* Star */}
      <polygon points="32,33 33.5,36 37,36 34.5,38 35.5,42 32,40 28.5,42 29.5,38 27,36 30.5,36" fill={colors.primary} />
    </svg>
  )
}

function IrisSVG({ colors, size }: MascotSVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="28" fill={colors.accent} />
      <circle cx="32" cy="32" r="24" fill={colors.primary} />
      {/* Rainbow arc */}
      <path d="M12,44 Q32,8 52,44" stroke="white" strokeWidth="3" fill="none" opacity="0.9" />
      <path d="M16,44 Q32,14 48,44" stroke={colors.secondary} strokeWidth="2.5" fill="none" opacity="0.7" />
      <path d="M20,44 Q32,20 44,44" stroke="white" strokeWidth="2" fill="none" opacity="0.5" />
      {/* Wings */}
      <path d="M10,36 Q6,28 14,28 Q10,32 14,36" fill="white" opacity="0.7" />
      <path d="M54,36 Q58,28 50,28 Q54,32 50,36" fill="white" opacity="0.7" />
      {/* Pitcher */}
      <rect x="28" y="42" width="8" height="10" rx="2" fill="white" />
      <path d="M36,44 Q40,44 38,48" stroke="white" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

function HeliosSVG({ colors, size }: MascotSVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="28" fill={colors.accent} />
      <circle cx="32" cy="32" r="24" fill={colors.primary} />
      {/* Radiating beams */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
        <line
          key={angle}
          x1={32 + 10 * Math.cos((angle * Math.PI) / 180)}
          y1={32 + 10 * Math.sin((angle * Math.PI) / 180)}
          x2={32 + 22 * Math.cos((angle * Math.PI) / 180)}
          y2={32 + 22 * Math.sin((angle * Math.PI) / 180)}
          stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"
        />
      ))}
      {/* Sun face */}
      <circle cx="32" cy="32" r="10" fill="white" />
      <circle cx="32" cy="32" r="7" fill={colors.secondary} />
    </svg>
  )
}

function SeleneSVG({ colors, size }: MascotSVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="28" fill={colors.accent} />
      <circle cx="32" cy="32" r="24" fill={colors.primary} />
      {/* Moon */}
      <circle cx="32" cy="30" r="14" fill="white" />
      <circle cx="40" cy="26" r="12" fill={colors.primary} />
      {/* Stars */}
      <circle cx="46" cy="16" r="2" fill="white" opacity="0.8" />
      <circle cx="50" cy="28" r="1.5" fill="white" opacity="0.6" />
      <circle cx="44" cy="38" r="1" fill="white" opacity="0.5" />
      <circle cx="18" cy="44" r="1.5" fill="white" opacity="0.6" />
      <circle cx="24" cy="50" r="1" fill="white" opacity="0.4" />
      {/* Glow */}
      <circle cx="28" cy="30" r="16" fill="white" opacity="0.1" />
    </svg>
  )
}

function EosSVG({ colors, size }: MascotSVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="28" fill={colors.accent} />
      <circle cx="32" cy="32" r="24" fill={colors.primary} />
      {/* Horizon line */}
      <rect x="10" y="36" width="44" height="16" rx="2" fill={colors.secondary} opacity="0.5" />
      {/* Rising sun */}
      <circle cx="32" cy="36" r="10" fill="white" />
      <circle cx="32" cy="36" r="7" fill={colors.secondary} />
      {/* Dawn rays */}
      <line x1="32" y1="20" x2="32" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <line x1="20" y1="24" x2="16" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="44" y1="24" x2="48" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="14" y1="32" x2="10" y2="30" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <line x1="50" y1="32" x2="54" y2="30" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      {/* Dew drops */}
      <circle cx="20" cy="46" r="2" fill="white" opacity="0.5" />
      <circle cx="44" cy="48" r="1.5" fill="white" opacity="0.4" />
    </svg>
  )
}

function UnknownSVG({ colors, size }: MascotSVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="28" fill={colors.accent} />
      <circle cx="32" cy="32" r="24" fill={colors.primary} />
      <text x="32" y="44" textAnchor="middle" fontSize="32" fontWeight="bold" fill="white">?</text>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Mascot component lookup
// ---------------------------------------------------------------------------

export const MASCOT_SVGS: Record<AgentMascot, React.FC<MascotSVGProps>> = {
  Zeus: ZeusSVG,
  Athena: AthenaSVG,
  Apollo: ApolloSVG,
  Hermes: HermesSVG,
  Artemis: ArtemisSVG,
  Hephaestus: HephaestusSVG,
  Ares: AresSVG,
  Poseidon: PoseidonSVG,
  Demeter: DemeterSVG,
  Dionysus: DionysusSVG,
  Hera: HeraSVG,
  Persephone: PersephoneSVG,
  Hades: HadesSVG,
  Aphrodite: AphroditeSVG,
  Hecate: HecateSVG,
  Nike: NikeSVG,
  Iris: IrisSVG,
  Helios: HeliosSVG,
  Selene: SeleneSVG,
  Eos: EosSVG,
}

export const UnknownMascotSVG: React.FC<MascotSVGProps> = UnknownSVG
