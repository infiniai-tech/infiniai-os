import { Crown, ChevronDown, Users, Activity } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AgentCard, AgentLogModal } from './AgentCard'
import { ActivityFeed } from './ActivityFeed'
import { OrchestratorStatusCard } from './OrchestratorStatusCard'
import type { ActiveAgent, AgentLogEntry, OrchestratorStatus } from '../lib/types'

const ACTIVITY_COLLAPSED_KEY = 'olympus-activity-collapsed'

interface AgentMissionControlProps {
  agents: ActiveAgent[]
  orchestratorStatus: OrchestratorStatus | null
  recentActivity: Array<{
    agentName: string
    thought: string
    timestamp: string
    featureId: number
  }>
  isExpanded?: boolean
  getAgentLogs?: (agentIndex: number) => AgentLogEntry[]
}

export function AgentMissionControl({
  agents,
  orchestratorStatus,
  recentActivity,
  isExpanded: defaultExpanded = true,
  getAgentLogs,
}: AgentMissionControlProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [activityCollapsed, setActivityCollapsed] = useState(() => {
    try {
      return localStorage.getItem(ACTIVITY_COLLAPSED_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [selectedAgentForLogs, setSelectedAgentForLogs] = useState<ActiveAgent | null>(null)

  const toggleActivityCollapsed = () => {
    const newValue = !activityCollapsed
    setActivityCollapsed(newValue)
    try {
      localStorage.setItem(ACTIVITY_COLLAPSED_KEY, String(newValue))
    } catch {
      // localStorage not available
    }
  }

  if (!orchestratorStatus && agents.length === 0) {
    return null
  }

  const statusText = agents.length > 0
    ? `${agents.length} active`
    : orchestratorStatus?.state === 'initializing'
      ? 'Initializing'
      : orchestratorStatus?.state === 'draining'
        ? 'Draining'
        : orchestratorStatus?.state === 'paused'
          ? 'Paused'
          : orchestratorStatus?.state === 'complete'
            ? 'Complete'
            : 'Orchestrating'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        background: '#FFFFFF',
        border: '1px solid #DDEC90',
        borderRadius: '12px',
        marginBottom: '24px',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
        boxShadow: '0 1px 3px rgba(26,26,0,0.06), 0 1px 2px rgba(26,26,0,0.04)',
      }}
    >
      {/* Header bar with gradient background */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ backgroundColor: '#F0F4E0' }}
        transition={{ duration: 0.15 }}
        style={{
          background: 'linear-gradient(to bottom, #FAFAF2, #FFFFFF)',
          border: 'none',
          borderBottom: isExpanded ? '1px solid #DDEC90' : '1px solid transparent',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          cursor: 'pointer',
          fontFamily: "'Geist', 'Inter', sans-serif",
        }}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 0 : -10 }}
          transition={{ duration: 0.2 }}
        >
          <Crown size={18} style={{ color: '#7A8A00', flexShrink: 0 }} />
        </motion.div>
        <span style={{
          fontWeight: 700,
          color: '#1A1A00',
          fontSize: '14px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          fontFamily: "'Geist', 'Inter', sans-serif",
        }}>
          Command Center
        </span>

        {/* Stat pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
          {orchestratorStatus && (
            <>
              <StatPill label="Coding" value={orchestratorStatus.codingAgents} />
              <StatPill label="Testing" value={orchestratorStatus.testingAgents} />
              <StatPill label="Ready" value={orchestratorStatus.readyCount} />
            </>
          )}
          <motion.span
            layout
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '9999px',
              background: agents.length > 0 ? '#7A8A00' : '#F5F8D0',
              color: agents.length > 0 ? '#FFFFFF' : '#7A8A00',
              border: '1px solid #DDEC90',
            }}
          >
            {agents.length > 0 && (
              <motion.span
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#BBCB64',
                }}
              />
            )}
            {statusText}
          </motion.span>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ flexShrink: 0 }}
        >
          <ChevronDown size={18} style={{ color: '#7A8A00' }} />
        </motion.div>
      </motion.button>

      {/* Expandable content with AnimatePresence */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            {/* Orchestrator inline banner */}
            {orchestratorStatus && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                style={{ padding: '12px 16px', borderBottom: '1px solid #DDEC90', background: '#FFFFFF' }}
              >
                <OrchestratorStatusCard status={orchestratorStatus} />
              </motion.div>
            )}

            {/* Two-column split: Agents left, Activity right */}
            <div style={{ display: 'flex', minHeight: 0 }}>
              {/* Left: Agents list */}
              <div style={{
                flex: agents.length > 0 && recentActivity.length > 0 ? '1 1 50%' : '1 1 100%',
                padding: '14px 16px',
                borderRight: recentActivity.length > 0 ? '1px solid #DDEC90' : 'none',
                overflowY: 'auto',
                maxHeight: '400px',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  marginBottom: '10px',
                }}>
                  <Users size={14} style={{ color: '#7A8A00' }} />
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#7A8A00',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontFamily: "'Geist', 'Inter', sans-serif",
                  }}>
                    Agents
                  </span>
                  <span style={{ fontSize: '11px', color: '#6A6A20' }}>({agents.length})</span>
                </div>

                {agents.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#6A6A20', fontStyle: 'italic', margin: 0 }}>
                    No agents active
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <AnimatePresence mode="popLayout">
                      {agents.map((agent) => (
                        <motion.div
                          key={`agent-${agent.agentIndex}`}
                          layout
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 12, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                        >
                          <AgentCard
                            agent={agent}
                            onShowLogs={(agentIndex) => {
                              const agentToShow = agents.find(a => a.agentIndex === agentIndex)
                              if (agentToShow) {
                                setSelectedAgentForLogs(agentToShow)
                              }
                            }}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Right: Activity ticker */}
              {recentActivity.length > 0 && (
                <div style={{
                  flex: '1 1 50%',
                  padding: '14px 16px',
                  overflowY: 'auto',
                  maxHeight: '400px',
                }}>
                  <button
                    onClick={toggleActivityCollapsed}
                    style={{
                      background: 'transparent', border: 'none',
                      display: 'flex', alignItems: 'center', gap: '6px',
                      marginBottom: '10px', padding: '0', cursor: 'pointer',
                      fontFamily: "'Geist', 'Inter', sans-serif",
                    }}
                  >
                    <Activity size={14} style={{ color: '#7A8A00' }} />
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#7A8A00',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}>
                      Live Activity
                    </span>
                    <span style={{ fontSize: '11px', color: '#6A6A20' }}>
                      ({recentActivity.length})
                    </span>
                    <motion.div
                      animate={{ rotate: activityCollapsed ? 0 : 180 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={14} style={{ color: '#7A8A00' }} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {!activityCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        style={{ overflow: 'hidden' }}
                      >
                        <ActivityFeed activities={recentActivity} maxItems={20} showHeader={false} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log Modal */}
      {selectedAgentForLogs && getAgentLogs && (
        <AgentLogModal
          agent={selectedAgentForLogs}
          logs={getAgentLogs(selectedAgentForLogs.agentIndex)}
          onClose={() => setSelectedAgentForLogs(null)}
        />
      )}
    </motion.div>
  )
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <motion.span
      layout
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '11px',
        fontWeight: 600,
        padding: '3px 10px',
        borderRadius: '9999px',
        background: '#F5F8D0',
        color: '#7A8A00',
        border: '1px solid #DDEC90',
        fontFamily: "'Geist', 'Inter', sans-serif",
      }}
    >
      {label}: {value}
    </motion.span>
  )
}
