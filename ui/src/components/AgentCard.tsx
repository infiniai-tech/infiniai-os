import { MessageCircle, ScrollText, X, Copy, Check, Code, FlaskConical } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AgentAvatar } from './AgentAvatar'
import type { ActiveAgent, AgentLogEntry, AgentType } from '../lib/types'

interface AgentCardProps {
  agent: ActiveAgent
  onShowLogs?: (agentIndex: number) => void
}

function getStateText(state: ActiveAgent['state']): string {
  switch (state) {
    case 'idle':
      return 'Standing by...'
    case 'thinking':
      return 'Pondering...'
    case 'working':
      return 'Coding away...'
    case 'testing':
      return 'Checking work...'
    case 'success':
      return 'Nailed it!'
    case 'error':
      return 'Trying plan B...'
    case 'struggling':
      return 'Being persistent...'
    default:
      return 'Busy...'
  }
}

function getStateColor(state: ActiveAgent['state']): string {
  switch (state) {
    case 'success':
      return '#7A8A00'
    case 'error':
      return '#CF0F0F'
    case 'struggling':
      return '#A05A00'
    case 'working':
    case 'testing':
      return '#7A8A00'
    case 'thinking':
      return '#F79A19'
    default:
      return '#6A6A20'
  }
}

function getAgentTypeBadge(agentType: AgentType): { label: string; bg: string; color: string; icon: typeof Code } {
  if (agentType === 'testing') {
    return { label: 'TEST', bg: '#F5F8D0', color: '#7A8A00', icon: FlaskConical }
  }
  return { label: 'CODE', bg: '#F5F8D0', color: '#7A8A00', icon: Code }
}

export function AgentCard({ agent, onShowLogs }: AgentCardProps) {
  const isActive = ['thinking', 'working', 'testing'].includes(agent.state)
  const hasLogs = agent.logs && agent.logs.length > 0
  const typeBadge = getAgentTypeBadge(agent.agentType || 'coding')
  const TypeIcon = typeBadge.icon

  return (
    <div style={{
      minWidth: '180px', maxWidth: '220px', padding: '12px', borderRadius: '8px',
      background: '#FFFFFF', border: '1px solid #DDEC90',
      fontFamily: 'Arial, sans-serif',
      animation: isActive ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : undefined,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '3px',
            fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
            background: typeBadge.bg, color: typeBadge.color, border: '1px solid #DDEC90',
          }}>
            <TypeIcon size={10} />
            {typeBadge.label}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AgentAvatar name={agent.agentName} state={agent.state} size="sm" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A00', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {agent.agentName}
            </div>
            <div style={{ fontSize: '11px', color: getStateColor(agent.state) }}>
              {getStateText(agent.state)}
            </div>
          </div>
          {hasLogs && onShowLogs && (
            <button
              onClick={() => onShowLogs(agent.agentIndex)}
              title={`View logs (${agent.logs?.length || 0} entries)`}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: '#6A6A20' }}
            >
              <ScrollText size={14} />
            </button>
          )}
        </div>

        <div>
          {agent.featureIds && agent.featureIds.length > 1 ? (
            <>
              <div style={{ fontSize: '11px', color: '#6A6A20', marginBottom: '2px' }}>
                Batch: {agent.featureIds.map(id => `#${id}`).join(', ')}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A00', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Active: Feature #{agent.featureId}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '11px', color: '#6A6A20', marginBottom: '2px' }}>
                Feature #{agent.featureId}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A00', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={agent.featureName}>
                {agent.featureName}
              </div>
            </>
          )}
        </div>

        {agent.thought && (
          <div style={{ paddingTop: '8px', borderTop: '1px solid #DDEC90' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
              <MessageCircle size={14} style={{ color: '#7A8A00', flexShrink: 0, marginTop: '2px' }} />
              <p style={{
                fontSize: '11px', color: '#6A6A20', fontStyle: 'italic', margin: 0,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }} title={agent.thought}>
                {agent.thought}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface AgentLogModalProps {
  agent: ActiveAgent
  logs: AgentLogEntry[]
  onClose: () => void
}

export function AgentLogModal({ agent, logs, onClose }: AgentLogModalProps) {
  const [copied, setCopied] = useState(false)
  const typeBadge = getAgentTypeBadge(agent.agentType || 'coding')
  const TypeIcon = typeBadge.icon

  const handleCopy = async () => {
    const logText = logs
      .map(log => `[${log.timestamp}] ${log.line}`)
      .join('\n')
    await navigator.clipboard.writeText(logText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getLogColor = (type: AgentLogEntry['type']): string => {
    switch (type) {
      case 'error':
        return '#CF0F0F'
      case 'state_change':
        return '#7A8A00'
      default:
        return '#1A1A00'
    }
  }

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.5)', zIndex: 9999 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        width: '100%', maxWidth: '56rem', maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        background: '#FFFFFF', border: '1px solid #DDEC90', borderRadius: '8px',
        fontFamily: 'Arial, sans-serif', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #DDEC90' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AgentAvatar name={agent.agentName} state={agent.state} size="sm" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A00', margin: 0 }}>
                  {agent.agentName} Logs
                </h2>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '3px',
                  fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                  background: typeBadge.bg, color: typeBadge.color, border: '1px solid #DDEC90',
                }}>
                  <TypeIcon size={10} />
                  {typeBadge.label}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#6A6A20', margin: 0 }}>
                {agent.featureIds && agent.featureIds.length > 1
                  ? `Batch: ${agent.featureIds.map(id => `#${id}`).join(', ')}`
                  : `Feature #${agent.featureId}: ${agent.featureName}`}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={handleCopy} style={{
              display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px',
              background: 'transparent', color: '#7A8A00', border: '1px solid #DDEC90',
              borderRadius: '6px', padding: '4px 10px', cursor: 'pointer',
            }}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={onClose} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#6A6A20', padding: '4px',
            }}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px', background: '#FAFAF2' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {logs.length === 0 ? (
              <p style={{ color: '#6A6A20', fontStyle: 'italic' }}>No logs available</p>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} style={{ color: getLogColor(log.type), whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  <span style={{ color: '#6A6A20' }}>
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>{' '}
                  {log.line}
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ padding: '12px', borderTop: '1px solid #DDEC90', fontSize: '12px', color: '#6A6A20' }}>
          {logs.length} log entries
        </div>
      </div>
    </div>,
    document.body
  )
}
