import { FeatureCard } from './FeatureCard'
import { Plus, Sparkles, Wand2 } from 'lucide-react'
import type { Feature, ActiveAgent } from '../lib/types'

interface KanbanColumnProps {
  title: string
  count: number
  features: Feature[]
  allFeatures?: Feature[]
  activeAgents?: ActiveAgent[]
  color: 'pending' | 'progress' | 'review' | 'human_input' | 'done'
  onFeatureClick: (feature: Feature) => void
  onAddFeature?: () => void
  onExpandProject?: () => void
  showExpandButton?: boolean
  onCreateSpec?: () => void
  showCreateSpec?: boolean
  specReviewContent?: React.ReactNode
}

const COLUMN_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: '#FAFAF2', color: '#6A6A20', label: 'Backlog' },
  progress: { bg: '#F5F8D0', color: '#7A8A00', label: 'In Progress' },
  review: { bg: '#FFF0DC', color: '#A05A00', label: 'Review' },
  human_input: { bg: '#FFF0DC', color: '#A05A00', label: '\u26A1 Human-in-Loop' },
  done: { bg: '#F5F8D0', color: '#7A8A00', label: 'Done' },
}

export function KanbanColumn({
  title,
  count,
  features,
  allFeatures = [],
  activeAgents = [],
  color,
  onFeatureClick,
  onAddFeature,
  onExpandProject,
  showExpandButton,
  onCreateSpec,
  showCreateSpec,
  specReviewContent,
}: KanbanColumnProps) {
  // Create a map of feature ID to active agent for quick lookup
  const agentByFeatureId = new Map<number, ActiveAgent>()
  for (const agent of activeAgents) {
    const ids = agent.featureIds || [agent.featureId]
    for (const fid of ids) {
      agentByFeatureId.set(fid, agent)
    }
  }

  const colConfig = COLUMN_COLORS[color] || COLUMN_COLORS.pending
  // Use the config label unless an override title is given that differs from defaults
  const displayTitle = title || colConfig.label

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Column header */}
      <div
        style={{
          borderRadius: '6px 6px 0 0',
          border: '1px solid #DDEC90',
          borderBottom: 'none',
          padding: '8px 10px',
          background: colConfig.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: colConfig.color,
            }}
          >
            {displayTitle}
          </span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: colConfig.color }}>{count}</span>
        </div>

        {/* Action buttons in pending column */}
        {color === 'pending' && (onAddFeature || (onExpandProject && showExpandButton)) && (
          <div style={{ display: 'flex', gap: '4px' }}>
            {onAddFeature && (
              <button
                onClick={onAddFeature}
                title="Add new feature (N)"
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '4px',
                  border: '1px solid #DDEC90',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7A8A00',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F5F8D0' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#FFFFFF' }}
              >
                <Plus size={14} />
              </button>
            )}
            {onExpandProject && showExpandButton && (
              <button
                onClick={onExpandProject}
                title="Expand project (E)"
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '4px',
                  border: '1px solid #DDEC90',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7A8A00',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F5F8D0' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#FFFFFF' }}
              >
                <Sparkles size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Column body */}
      <div
        style={{
          background: '#FAFAF2',
          border: '1px solid #DDEC90',
          borderRadius: '0 0 6px 6px',
          minHeight: '180px',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          overflowY: 'auto',
          maxHeight: '600px',
        }}
      >
        {/* Spec review content (rendered at top of HITL column) */}
        {specReviewContent}

        {features.length === 0 && !specReviewContent ? (
          <div style={{ textAlign: 'center', padding: '32px 8px', color: '#6A6A20', fontSize: '11px' }}>
            {showCreateSpec && onCreateSpec ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <p>No spec created yet</p>
                <button
                  onClick={onCreateSpec}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '4px',
                    background: '#BBCB64',
                    color: '#1A1A00',
                    fontSize: '11px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Wand2 size={14} />
                  Create Spec
                </button>
              </div>
            ) : (
              'No features'
            )}
          </div>
        ) : (
          features.map((feature, index) => (
            <div
              key={feature.id}
              className="animate-slide-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <FeatureCard
                feature={feature}
                onClick={() => onFeatureClick(feature)}
                isInProgress={color === 'progress'}
                allFeatures={allFeatures}
                activeAgent={agentByFeatureId.get(feature.id)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
