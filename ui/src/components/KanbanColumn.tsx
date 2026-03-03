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
  pending: { bg: '#F9FAF3', color: '#6A6A20', label: 'Backlog' },
  progress: { bg: '#F5F8D0', color: '#7A8A00', label: 'In Progress' },
  review: { bg: '#FFF8EC', color: '#A05A00', label: 'Review' },
  human_input: { bg: '#FFF4E6', color: '#A05A00', label: '\u26A1 Human-in-Loop' },
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
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Column header */}
      <div
        style={{
          borderRadius: '10px 10px 0 0',
          border: '1px solid #DDEC90',
          borderBottom: 'none',
          padding: '10px 12px',
          background: colConfig.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: colConfig.color,
            }}
          >
            {displayTitle}
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '9999px',
              background: 'rgba(0,0,0,0.06)',
              color: colConfig.color,
              marginLeft: '4px',
            }}
          >
            {count}
          </span>
        </div>

        {/* Action buttons in pending column */}
        {color === 'pending' && (onAddFeature || (onExpandProject && showExpandButton)) && (
          <div style={{ display: 'flex', gap: '4px' }}>
            {onAddFeature && (
              <button
                onClick={onAddFeature}
                title="Add new feature (N)"
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '8px',
                  border: '1px solid #DDEC90',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7A8A00',
                  transition: 'background 150ms',
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
                  width: '24px',
                  height: '24px',
                  borderRadius: '8px',
                  border: '1px solid #DDEC90',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7A8A00',
                  transition: 'background 150ms',
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
          background: '#F9FAF3',
          border: '1px solid #DDEC90',
          borderRadius: '0 0 10px 10px',
          minHeight: '200px',
          padding: '10px',
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
          <div style={{ textAlign: 'center', padding: '40px 16px', color: '#9A9A60', fontSize: '13px' }}>
            {showCreateSpec && onCreateSpec ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <p>No spec created yet</p>
                <button
                  onClick={onCreateSpec}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#BBCB64',
                    color: '#1A1A00',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(187,203,100,0.3)',
                    transition: 'opacity 150ms',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.9' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
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
