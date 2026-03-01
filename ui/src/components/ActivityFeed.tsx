import { Activity } from 'lucide-react'
import { AgentAvatar } from './AgentAvatar'
import type { AgentMascot } from '../lib/types'

interface ActivityItem {
  agentName: string
  thought: string
  timestamp: string
  featureId: number
}

interface ActivityFeedProps {
  activities: ActivityItem[]
  maxItems?: number
  showHeader?: boolean
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 5) return 'just now'
  if (diffSec < 60) return `${diffSec}s ago`
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function ActivityFeed({ activities, maxItems = 5, showHeader = true }: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems)

  if (displayedActivities.length === 0) {
    return null
  }

  return (
    <div>
      {showHeader && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Activity size={14} style={{ color: '#6A6A20' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#6A6A20', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Recent Activity
          </span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {displayedActivities.map((activity) => (
          <div
            key={`${activity.featureId}-${activity.timestamp}-${activity.thought.slice(0, 20)}`}
            style={{
              padding: '8px', borderRadius: '6px',
              background: '#FFFFFF', border: '1px solid #DDEC90',
              display: 'flex', alignItems: 'flex-start', gap: '8px',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            <AgentAvatar
              name={activity.agentName as AgentMascot}
              state="working"
              size="sm"
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: getMascotColor(activity.agentName as AgentMascot) }}>
                  {activity.agentName}
                </span>
                <span style={{ fontSize: '10px', color: '#6A6A20' }}>
                  #{activity.featureId}
                </span>
                <span style={{ fontSize: '10px', color: '#6A6A20', marginLeft: 'auto' }}>
                  {formatTimestamp(activity.timestamp)}
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#6A6A20', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={activity.thought}>
                {activity.thought}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function getMascotColor(name: AgentMascot): string {
  const colors: Record<AgentMascot, string> = {
    Spark: '#3B82F6',
    Fizz: '#F97316',
    Octo: '#8B5CF6',
    Hoot: '#22C55E',
    Buzz: '#EAB308',
    Pixel: '#EC4899',
    Byte: '#06B6D4',
    Nova: '#F43F5E',
    Chip: '#84CC16',
    Bolt: '#FBBF24',
    Dash: '#14B8A6',
    Zap: '#A855F7',
    Gizmo: '#64748B',
    Turbo: '#EF4444',
    Blip: '#10B981',
    Neon: '#D946EF',
    Widget: '#6366F1',
    Zippy: '#F59E0B',
    Quirk: '#0EA5E9',
    Flux: '#7C3AED',
  }
  return colors[name] || '#6B7280'
}
