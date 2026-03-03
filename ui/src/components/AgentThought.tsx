import { useMemo, useState, useEffect } from 'react'
import { Brain, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AgentStatus } from '../lib/types'

interface AgentThoughtProps {
  logs: Array<{ line: string; timestamp: string }>
  agentStatus: AgentStatus
}

const IDLE_TIMEOUT = 30000 // 30 seconds

/**
 * Determines if a log line is an agent "thought" (narrative text)
 * vs. tool mechanics that should be hidden
 */
function isAgentThought(line: string): boolean {
  const trimmed = line.trim()

  // Skip tool mechanics
  if (/^\[Tool:/.test(trimmed)) return false
  if (/^\s*Input:\s*\{/.test(trimmed)) return false
  if (/^\[(Done|Error)\]/.test(trimmed)) return false
  if (/^\[Error\]/.test(trimmed)) return false
  if (/^Output:/.test(trimmed)) return false

  // Skip JSON and very short lines
  if (/^[[{]/.test(trimmed)) return false
  if (trimmed.length < 10) return false

  // Skip lines that are just paths or technical output
  if (/^[A-Za-z]:\\/.test(trimmed)) return false
  if (/^\/[a-z]/.test(trimmed)) return false

  // Keep narrative text (looks like a sentence, relaxed filter)
  return trimmed.length > 10
}

/**
 * Extracts the latest agent thought from logs
 */
function getLatestThought(logs: Array<{ line: string; timestamp: string }>): string | null {
  // Search from most recent
  for (let i = logs.length - 1; i >= 0; i--) {
    if (isAgentThought(logs[i].line)) {
      return logs[i].line.trim()
    }
  }
  return null
}

export function AgentThought({ logs, agentStatus }: AgentThoughtProps) {
  const thought = useMemo(() => getLatestThought(logs), [logs])
  const [displayedThought, setDisplayedThought] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Get last log timestamp for idle detection
  const lastLogTimestamp = logs.length > 0
    ? new Date(logs[logs.length - 1].timestamp).getTime()
    : 0

  // Determine if component should be visible
  const shouldShow = useMemo(() => {
    if (!thought) return false
    if (agentStatus === 'running' || agentStatus === 'pausing') return true
    if (agentStatus === 'paused') {
      return Date.now() - lastLogTimestamp < IDLE_TIMEOUT
    }
    return false
  }, [thought, agentStatus, lastLogTimestamp])

  // Update displayed thought when a new thought arrives
  useEffect(() => {
    if (thought && thought !== displayedThought) {
      setDisplayedThought(thought)
    }
  }, [thought, displayedThought])

  // Handle visibility transitions
  useEffect(() => {
    if (shouldShow) {
      setIsVisible(true)
    } else {
      // Delay hiding to allow exit animation
      const timeout = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timeout)
    }
  }, [shouldShow])

  if (!isVisible || !displayedThought) return null

  const isRunning = agentStatus === 'running'

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{ overflow: 'hidden' }}
        >
          <motion.div
            initial={{ y: -4 }}
            animate={{ y: 0 }}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: isRunning
                ? 'linear-gradient(135deg, #F5F8D0, #FAFAF2)'
                : '#FFFFFF',
              border: isRunning ? '1px solid #BBCB64' : '1px solid #DDEC90',
              borderRadius: '12px',
              fontFamily: "'Inter', sans-serif",
              boxShadow: '0 1px 3px rgba(26,26,0,0.06), 0 1px 2px rgba(26,26,0,0.04)',
              overflow: 'hidden',
            }}
          >
            {/* Brain Icon with subtle glow */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Brain
                size={22}
                style={{ color: '#7A8A00' }}
                strokeWidth={2.5}
              />
              {isRunning && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ position: 'absolute', top: '-3px', right: '-3px' }}
                >
                  <Sparkles size={10} style={{ color: '#F79A19' }} />
                </motion.div>
              )}
            </div>

            {/* Thought text with animated transitions */}
            <AnimatePresence mode="wait">
              <motion.p
                key={displayedThought}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={{
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  color: '#1A1A00',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}
              >
                {displayedThought?.replace(/:$/, '')}
              </motion.p>
            </AnimatePresence>

            {/* Subtle running indicator bar at the bottom */}
            {isRunning && (
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, #BBCB64, transparent)',
                }}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
