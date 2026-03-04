import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity } from 'lucide-react'
import { resolveAgentName } from './AgentAvatar'

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

export function ActivityFeed({ activities, maxItems = 20, showHeader = true }: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems)

  if (displayedActivities.length === 0) {
    return null
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {showHeader && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '10px',
          paddingBottom: '8px',
          borderBottom: '1px solid #F5F8D0',
        }}>
          <Activity size={14} style={{ color: '#7A8A00' }} />
          <span style={{
            fontFamily: "'Geist', 'Inter', sans-serif",
            fontSize: '11px',
            fontWeight: 700,
            color: '#7A8A00',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
          }}>
            Live Activity
          </span>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#7A8A00',
            background: '#F5F8D0',
            borderRadius: '9999px',
            padding: '1px 8px',
            border: '1px solid #DDEC90',
          }}>
            {displayedActivities.length}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <AnimatePresence initial={false}>
          {displayedActivities.map((activity, idx) => {
            return (
              <motion.div
                key={`${idx}-${activity.featureId}-${activity.timestamp}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderLeft: '3px solid #BBCB64',
                  borderRadius: '0 6px 6px 0',
                  background: 'transparent',
                  transition: 'background 0.12s',
                  cursor: 'default',
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.background = '#F5F8D0' }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.background = 'transparent' }}
              >
                {/* Small colored dot */}
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                  background: '#BBCB64',
                }} />

                {/* Agent name */}
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A00', whiteSpace: 'nowrap' }}>
                  {resolveAgentName(activity.agentName)}
                </span>

                {/* Feature ID */}
                <span style={{
                  fontSize: '11px', fontWeight: 600, color: '#7A8A00',
                  fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap',
                }}>
                  #{activity.featureId}
                </span>

                {/* Thought (fills remaining space) */}
                <span
                  style={{
                    flex: 1, minWidth: 0, fontSize: '11px', color: '#6A6A20',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                  title={activity.thought}
                >
                  {activity.thought}
                </span>

                {/* Timestamp */}
                <span style={{
                  fontSize: '10px', color: '#6A6A20', whiteSpace: 'nowrap', flexShrink: 0,
                  fontFamily: "'JetBrains Mono', monospace",
                  background: '#FAFAF2',
                  borderRadius: '9999px',
                  padding: '1px 6px',
                }}>
                  {formatTimestamp(activity.timestamp)}
                </span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
