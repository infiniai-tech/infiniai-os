import { useState } from 'react'
import { ChevronDown, ChevronUp, Code, FlaskConical, Clock, Lock, Sparkles } from 'lucide-react'
import { OrchestratorAvatar } from './OrchestratorAvatar'
import type { OrchestratorStatus, OrchestratorState } from '../lib/types'

interface OrchestratorStatusCardProps {
  status: OrchestratorStatus
}

function getStateText(state: OrchestratorState): string {
  switch (state) {
    case 'idle':
      return 'Resting upon Olympus...'
    case 'initializing':
      return 'Zeus awakens...'
    case 'scheduling':
      return 'Consulting the Fates...'
    case 'spawning':
      return 'Marshalling divine forces...'
    case 'monitoring':
      return 'Watching from the heavens...'
    case 'complete':
      return 'The quest is complete!'
    case 'draining':
      return 'Recalling the forces...'
    case 'paused':
      return 'The gods rest...'
    default:
      return 'Commanding the pantheon...'
  }
}

function getStateColor(state: OrchestratorState): string {
  switch (state) {
    case 'complete':
    case 'spawning':
    case 'scheduling':
    case 'monitoring':
      return '#7A8A00'
    case 'initializing':
      return '#F79A19'
    case 'draining':
      return '#A05A00'
    case 'paused':
    default:
      return '#6A6A20'
  }
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffSecs = Math.floor(diffMs / 1000)

  if (diffSecs < 5) return 'just now'
  if (diffSecs < 60) return `${diffSecs}s ago`
  const diffMins = Math.floor(diffSecs / 60)
  if (diffMins < 60) return `${diffMins}m ago`
  return `${Math.floor(diffMins / 60)}h ago`
}

const badgeStyle = (bg: string, color: string, border: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: '4px',
  fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px',
  background: bg, color, border: `1px solid ${border}`,
})

export function OrchestratorStatusCard({ status }: OrchestratorStatusCardProps) {
  const [showEvents, setShowEvents] = useState(false)

  return (
    <div style={{
      marginBottom: '16px', padding: '16px', borderRadius: '8px',
      background: '#FAFAF2', border: '1px solid #DDEC90',
      fontFamily: 'Arial, sans-serif',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <OrchestratorAvatar state={status.state} size="md" />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#7A8A00' }}>
              Zeus, Commander
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: getStateColor(status.state) }}>
              {getStateText(status.state)}
            </span>
          </div>

          <p style={{ fontSize: '13px', color: '#1A1A00', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {status.message}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
            <span style={badgeStyle('#F5F8D0', '#7A8A00', '#DDEC90')}>
              <Code size={12} />
              Coding: {status.codingAgents}
            </span>
            <span style={badgeStyle('#F5F8D0', '#7A8A00', '#DDEC90')}>
              <FlaskConical size={12} />
              Testing: {status.testingAgents}
            </span>
            <span style={badgeStyle('#F5F8D0', '#7A8A00', '#DDEC90')}>
              <Clock size={12} />
              Ready: {status.readyCount}
            </span>
            {status.blockedCount > 0 && (
              <span style={badgeStyle('#FFF0DC', '#A05A00', '#F0C880')}>
                <Lock size={12} />
                Blocked: {status.blockedCount}
              </span>
            )}
          </div>
        </div>

        {status.recentEvents.length > 0 && (
          <button
            onClick={() => setShowEvents(!showEvents)}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '12px', fontWeight: 700, color: '#7A8A00',
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '4px 8px', borderRadius: '4px', flexShrink: 0,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F5F8D0' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <Sparkles size={12} />
            Activity
            {showEvents ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {showEvents && status.recentEvents.length > 0 && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #DDEC90' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {status.recentEvents.map((event, idx) => (
              <div
                key={`${event.timestamp}-${idx}`}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px' }}
              >
                <span style={{ color: '#7A8A00', flexShrink: 0, fontFamily: 'monospace' }}>
                  {formatRelativeTime(event.timestamp)}
                </span>
                <span style={{ color: '#1A1A00' }}>
                  {event.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
