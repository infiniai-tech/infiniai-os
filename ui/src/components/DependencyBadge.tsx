import { AlertTriangle, GitBranch, Check } from 'lucide-react'
import type { Feature } from '../lib/types'

interface DependencyBadgeProps {
  feature: Feature
  allFeatures?: Feature[]
  compact?: boolean
}

/**
 * Badge component showing dependency status for a feature.
 * Shows:
 * - Blocked status with count of blocking dependencies
 * - Dependency count for features with satisfied dependencies
 * - Nothing if feature has no dependencies
 */
export function DependencyBadge({ feature, allFeatures = [], compact = false }: DependencyBadgeProps) {
  const dependencies = feature.dependencies || []

  if (dependencies.length === 0) {
    return null
  }

  // Use API-computed blocked status if available, otherwise compute locally
  const isBlocked = feature.blocked ??
    (feature.blocking_dependencies && feature.blocking_dependencies.length > 0) ??
    false

  const blockingCount = feature.blocking_dependencies?.length ?? 0

  // Compute satisfied count from allFeatures if available
  let satisfiedCount = dependencies.length - blockingCount
  if (allFeatures.length > 0 && !feature.blocking_dependencies) {
    const passingIds = new Set(allFeatures.filter(f => f.passes).map(f => f.id))
    satisfiedCount = dependencies.filter(d => passingIds.has(d)).length
  }

  if (compact) {
    return (
      <span
        title={isBlocked
          ? `Blocked by ${blockingCount} ${blockingCount === 1 ? 'dependency' : 'dependencies'}`
          : `${satisfiedCount}/${dependencies.length} dependencies satisfied`
        }
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '11px',
          fontFamily: 'monospace',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '9999px',
          border: isBlocked ? '1px solid #F0C880' : '1px solid #DDEC90',
          background: isBlocked ? '#FFF0DC' : '#F5F8D0',
          color: isBlocked ? '#A05A00' : '#7A8A00',
        }}
      >
        {isBlocked ? (
          <>
            <AlertTriangle size={12} />
            <span>{blockingCount}</span>
          </>
        ) : (
          <>
            <GitBranch size={12} />
            <span>{satisfiedCount}/{dependencies.length}</span>
          </>
        )}
      </span>
    )
  }

  // Full view with more details
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {isBlocked ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#A05A00' }}>
          <AlertTriangle size={14} />
          <span style={{ fontWeight: 600 }}>
            Blocked by {blockingCount} {blockingCount === 1 ? 'dependency' : 'dependencies'}
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#6A6A20' }}>
          <Check size={14} style={{ color: '#7A8A00' }} />
          <span>
            All {dependencies.length} {dependencies.length === 1 ? 'dependency' : 'dependencies'} satisfied
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * Small inline indicator for dependency status
 */
export function DependencyIndicator({ feature }: { feature: Feature }) {
  const dependencies = feature.dependencies || []
  const isBlocked = feature.blocked || (feature.blocking_dependencies && feature.blocking_dependencies.length > 0)

  if (dependencies.length === 0) {
    return null
  }

  if (isBlocked) {
    return (
      <span
        title={`Blocked by ${feature.blocking_dependencies?.length || 0} dependencies`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '20px',
          height: '20px',
          borderRadius: '9999px',
          background: '#FFF0DC',
          color: '#A05A00',
          border: '1px solid #F0C880',
        }}
      >
        <AlertTriangle size={12} />
      </span>
    )
  }

  return (
    <span
      title={`${dependencies.length} dependencies (all satisfied)`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '20px',
        height: '20px',
        borderRadius: '9999px',
        background: '#F5F8D0',
        color: '#7A8A00',
        border: '1px solid #DDEC90',
      }}
    >
      <GitBranch size={12} />
    </span>
  )
}
