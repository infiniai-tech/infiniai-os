import { useMemo, useState, useEffect } from 'react'
import { Wifi, WifiOff, Brain, Sparkles } from 'lucide-react'
import type { AgentStatus } from '../lib/types'

interface ProgressDashboardProps {
  passing: number
  total: number
  percentage: number
  isConnected: boolean
  logs?: Array<{ line: string; timestamp: string }>
  agentStatus?: AgentStatus
}

const IDLE_TIMEOUT = 30000

function isAgentThought(line: string): boolean {
  const trimmed = line.trim()
  if (/^\[Tool:/.test(trimmed)) return false
  if (/^\s*Input:\s*\{/.test(trimmed)) return false
  if (/^\[(Done|Error)\]/.test(trimmed)) return false
  if (/^Output:/.test(trimmed)) return false
  if (/^[[{]/.test(trimmed)) return false
  if (trimmed.length < 10) return false
  if (/^[A-Za-z]:\\/.test(trimmed)) return false
  if (/^\/[a-z]/.test(trimmed)) return false
  return true
}

function getLatestThought(logs: Array<{ line: string; timestamp: string }>): string | null {
  for (let i = logs.length - 1; i >= 0; i--) {
    if (isAgentThought(logs[i].line)) {
      return logs[i].line.trim()
    }
  }
  return null
}

export function ProgressDashboard({
  passing,
  total,
  percentage,
  isConnected,
  logs = [],
  agentStatus,
}: ProgressDashboardProps) {
  const thought = useMemo(() => getLatestThought(logs), [logs])
  const [displayedThought, setDisplayedThought] = useState<string | null>(null)
  const [textVisible, setTextVisible] = useState(true)

  const lastLogTimestamp = logs.length > 0
    ? new Date(logs[logs.length - 1].timestamp).getTime()
    : 0

  const showThought = useMemo(() => {
    if (!thought) return false
    if (agentStatus === 'running' || agentStatus === 'pausing') return true
    if (agentStatus === 'paused') {
      return Date.now() - lastLogTimestamp < IDLE_TIMEOUT
    }
    return false
  }, [thought, agentStatus, lastLogTimestamp])

  useEffect(() => {
    if (thought !== displayedThought && thought) {
      setTextVisible(false)
      const timeout = setTimeout(() => {
        setDisplayedThought(thought)
        setTextVisible(true)
      }, 150)
      return () => clearTimeout(timeout)
    }
  }, [thought, displayedThought])

  const isRunning = agentStatus === 'running'

  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #DDEC90', borderRadius: '8px',
      padding: '16px 20px', fontFamily: 'Arial, sans-serif',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '16px', fontWeight: 700, letterSpacing: '2px',
            textTransform: 'uppercase', color: '#1A1A00',
          }}>
            Odyssey Progress
          </span>
          <span style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '3px 8px', borderRadius: '20px',
            background: isConnected ? '#F5F8D0' : '#FFE5E5',
            color: isConnected ? '#7A8A00' : '#CF0F0F',
            border: `1px solid ${isConnected ? '#DDEC90' : '#CF0F0F'}`,
          }}>
            {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: 700, color: '#7A8A00' }}>
            {passing}
          </span>
          <span style={{ fontSize: '14px', color: '#6A6A20' }}>/</span>
          <span style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: 700, color: '#1A1A00' }}>
            {total}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          flex: 1, height: '10px', background: '#F5F8D0',
          borderRadius: '10px', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: '10px',
            background: 'linear-gradient(90deg, #BBCB64, #7A8A00)',
            width: `${percentage}%`,
            transition: 'width 0.5s ease-out',
          }} />
        </div>
        <span style={{
          fontSize: '14px', fontWeight: 700, color: '#6A6A20',
          fontVariantNumeric: 'tabular-nums', width: '48px', textAlign: 'right',
        }}>
          {percentage.toFixed(1)}%
        </span>
      </div>

      {/* Agent Thought */}
      {showThought && displayedThought && (
        <div style={{
          marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px',
          transition: 'opacity 0.3s ease',
        }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Brain size={16} style={{ color: '#7A8A00' }} strokeWidth={2.5} />
            {isRunning && (
              <Sparkles size={8} className="animate-pulse" style={{
                position: 'absolute', top: '-4px', right: '-4px', color: '#F79A19',
              }} />
            )}
          </div>
          <p style={{
            fontFamily: 'monospace', fontSize: '13px', color: '#6A6A20',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0,
            opacity: textVisible ? 1 : 0,
            transform: textVisible ? 'translateY(0)' : 'translateY(-4px)',
            transition: 'all 0.15s ease-out',
          }}>
            {displayedThought?.replace(/:$/, '')}
          </p>
        </div>
      )}
    </div>
  )
}
