import { Crown, ChevronDown, ChevronUp, Users, Activity } from 'lucide-react'
import { useState } from 'react'
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
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #DDEC90',
        borderRadius: '10px',
        marginBottom: '24px',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Integrated status bar header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          background: '#FAFAF2',
          border: 'none',
          borderBottom: isExpanded ? '1px solid #DDEC90' : 'none',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 16px',
          cursor: 'pointer',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <Crown size={18} style={{ color: '#7A8A00', flexShrink: 0 }} />
        <span style={{ fontWeight: 700, color: '#1A1A00', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
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
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px',
            background: agents.length > 0 ? '#7A8A00' : '#F5F8D0',
            color: agents.length > 0 ? '#FFFFFF' : '#7A8A00',
            border: '1px solid #DDEC90',
          }}>
            {statusText}
          </span>
        </div>

        {isExpanded
          ? <ChevronUp size={18} style={{ color: '#7A8A00', flexShrink: 0 }} />
          : <ChevronDown size={18} style={{ color: '#7A8A00', flexShrink: 0 }} />
        }
      </button>

      {/* Expandable content */}
      <div
        style={{
          transition: 'all 300ms ease-out',
          maxHeight: isExpanded ? '700px' : '0px',
          opacity: isExpanded ? 1 : 0,
          overflow: isExpanded ? 'auto' : 'hidden',
        }}
      >
        {/* Orchestrator inline banner */}
        {orchestratorStatus && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #DDEC90', background: '#FFFFFF' }}>
            <OrchestratorStatusCard status={orchestratorStatus} />
          </div>
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
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#7A8A00', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Agents
              </span>
              <span style={{ fontSize: '11px', color: '#9A9A60' }}>({agents.length})</span>
            </div>

            {agents.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#9A9A60', fontStyle: 'italic', margin: 0 }}>
                No agents active
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {agents.map((agent) => (
                  <AgentCard
                    key={`agent-${agent.agentIndex}`}
                    agent={agent}
                    onShowLogs={(agentIndex) => {
                      const agentToShow = agents.find(a => a.agentIndex === agentIndex)
                      if (agentToShow) {
                        setSelectedAgentForLogs(agentToShow)
                      }
                    }}
                  />
                ))}
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
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <Activity size={14} style={{ color: '#7A8A00' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#7A8A00', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Live Activity
                </span>
                <span style={{ fontSize: '11px', color: '#9A9A60' }}>
                  ({recentActivity.length})
                </span>
                {activityCollapsed
                  ? <ChevronDown size={14} style={{ color: '#7A8A00' }} />
                  : <ChevronUp size={14} style={{ color: '#7A8A00' }} />
                }
              </button>

              <div
                style={{
                  transition: 'all 200ms ease-out',
                  overflow: 'hidden',
                  maxHeight: activityCollapsed ? '0px' : '360px',
                  opacity: activityCollapsed ? 0 : 1,
                }}
              >
                <ActivityFeed activities={recentActivity} maxItems={20} showHeader={false} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Log Modal */}
      {selectedAgentForLogs && getAgentLogs && (
        <AgentLogModal
          agent={selectedAgentForLogs}
          logs={getAgentLogs(selectedAgentForLogs.agentIndex)}
          onClose={() => setSelectedAgentForLogs(null)}
        />
      )}
    </div>
  )
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px',
      background: '#F5F8D0', color: '#7A8A00', border: '1px solid #DDEC90',
    }}>
      {label}: {value}
    </span>
  )
}
