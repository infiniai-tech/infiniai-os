import { MessageCircle, ScrollText, X, Copy, Check, Code, FlaskConical } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AgentEmojiAvatar, resolveAgentName } from './AgentAvatar'
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

function getStateDotColor(state: ActiveAgent['state']): string {
  switch (state) {
    case 'success':
      return '#BBCB64'
    case 'error':
      return '#CF0F0F'
    case 'struggling':
      return '#F79A19'
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
  const dotColor = getStateDotColor(agent.state)

  const featureLabel = agent.featureIds && agent.featureIds.length > 1
    ? `Batch: ${agent.featureIds.map(id => `#${id}`).join(', ')}`
    : `#${agent.featureId} ${agent.featureName || ''}`

  return (
    <motion.div
      whileHover={{
        y: -2,
        boxShadow: '0 6px 20px rgba(26,26,0,0.09)',
      }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 14px',
        borderRadius: '8px',
        background: isActive
          ? 'linear-gradient(135deg, #F5F8D0, #FAFAF2)'
          : '#FFFFFF',
        border: isActive ? '1px solid #BBCB64' : '1px solid #DDEC90',
        fontFamily: "'Inter', sans-serif",
        boxShadow: '0 1px 3px rgba(26,26,0,0.06), 0 1px 2px rgba(26,26,0,0.04)',
      }}
    >
      {/* Status dot with pulse animation for active agents */}
      <div style={{ position: 'relative', flexShrink: 0, width: '8px', height: '8px' }}>
        <span style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: dotColor,
        }} />
        {isActive && (
          <motion.span
            animate={{
              scale: [1, 2, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: dotColor,
            }}
          />
        )}
      </div>

      {/* Avatar */}
      <AgentEmojiAvatar name={agent.agentName} size="sm" />

      {/* Name */}
      <span style={{
        fontSize: '13px',
        fontWeight: 700,
        color: '#1A1A00',
        whiteSpace: 'nowrap',
        fontFamily: "'Geist', 'Inter', sans-serif",
      }}>
        {resolveAgentName(agent.agentName)}
      </span>

      {/* Type badge */}
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        flexShrink: 0,
        fontSize: '10px',
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: '9999px',
        background: typeBadge.bg,
        color: typeBadge.color,
        border: '1px solid #DDEC90',
      }}>
        <TypeIcon size={10} />
        {typeBadge.label}
      </span>

      {/* Feature info */}
      <span
        style={{
          flex: 1, minWidth: 0,
          fontSize: '12px', color: '#6A6A20', fontWeight: 500,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}
        title={featureLabel}
      >
        {featureLabel}
      </span>

      {/* State text */}
      <motion.span
        key={agent.state}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: getStateColor(agent.state),
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {getStateText(agent.state)}
      </motion.span>

      {/* Thought bubble (truncated) */}
      <AnimatePresence mode="wait">
        {agent.thought && (
          <motion.span
            key={agent.thought}
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.15 }}
            style={{
              fontSize: '11px', fontStyle: 'italic', color: '#6A6A20',
              maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis',
              whiteSpace: 'nowrap', flexShrink: 1,
            }}
            title={agent.thought}
          >
            <MessageCircle size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />
            {agent.thought}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Log button */}
      {hasLogs && onShowLogs && (
        <motion.button
          whileHover={{ scale: 1.15, color: '#7A8A00' }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.1 }}
          onClick={() => onShowLogs(agent.agentIndex)}
          title={`View logs (${agent.logs?.length || 0} entries)`}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '4px', color: '#6A6A20', flexShrink: 0,
            borderRadius: '8px',
          }}
        >
          <ScrollText size={14} />
        </motion.button>
      )}
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(26,26,0,0.4)',
        zIndex: 9999,
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: '56rem',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#FFFFFF',
          border: '1px solid #DDEC90',
          borderRadius: '12px',
          fontFamily: "'Inter', sans-serif",
          overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(26,26,0,0.15), 0 12px 24px rgba(26,26,0,0.1)',
        }}
      >
        {/* Modal header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          borderBottom: '1px solid #DDEC90',
          background: 'linear-gradient(to bottom, #FAFAF2, #FFFFFF)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AgentEmojiAvatar name={agent.agentName} size="sm" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#1A1A00',
                  margin: 0,
                  fontFamily: "'Geist', 'Inter', sans-serif",
                }}>
                  {resolveAgentName(agent.agentName)} Logs
                </h2>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '3px',
                  fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px',
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
            <motion.button
              whileHover={{ backgroundColor: '#F5F8D0' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px',
                background: 'transparent', color: '#7A8A00', border: '1px solid #DDEC90',
                borderRadius: '8px', padding: '4px 10px', cursor: 'pointer',
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </motion.button>
            <motion.button
              whileHover={{ color: '#1A1A00', scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: '#6A6A20', padding: '4px', borderRadius: '8px',
              }}
            >
              <X size={20} />
            </motion.button>
          </div>
        </div>

        {/* Log content */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px', background: '#FAFAF2' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {logs.length === 0 ? (
              <p style={{ color: '#6A6A20', fontStyle: 'italic' }}>No logs available</p>
            ) : (
              logs.map((log, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.1, delay: Math.min(idx * 0.01, 0.5) }}
                  style={{ color: getLogColor(log.type), whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
                >
                  <span style={{ color: '#6A6A20' }}>
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>{' '}
                  {log.line}
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid #DDEC90',
          fontSize: '12px',
          color: '#6A6A20',
          fontFamily: "'Geist', 'Inter', sans-serif",
        }}>
          {logs.length} log entries
        </div>
      </motion.div>
    </motion.div>,
    document.body
  )
}
