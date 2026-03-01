import { Crown, ChevronDown, ChevronUp, Activity } from 'lucide-react'
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
    ? `${agents.length} ${agents.length === 1 ? 'agent' : 'agents'} active`
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
        borderRadius: '8px',
        marginBottom: '24px',
        overflow: 'hidden',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          background: '#7A8A00',
          color: '#FFFFFF',
          border: 'none',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          cursor: 'pointer',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Crown size={20} style={{ color: '#FFFFFF' }} />
          <span style={{ fontWeight: 600, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '14px' }}>
            Zeus Command Center
          </span>
          <span
            style={{
              background: '#F5F8D0',
              color: '#7A8A00',
              border: '1px solid #DDEC90',
              borderRadius: '20px',
              padding: '3px 10px',
              fontSize: '11px',
              fontWeight: 700,
              marginLeft: '8px',
            }}
          >
            {statusText}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp size={20} style={{ color: '#FFFFFF' }} />
        ) : (
          <ChevronDown size={20} style={{ color: '#FFFFFF' }} />
        )}
      </button>

      {/* Content */}
      <div
        style={{
          transition: 'all 300ms ease-out',
          maxHeight: isExpanded ? '600px' : '0px',
          opacity: isExpanded ? 1 : 0,
          overflow: isExpanded ? 'auto' : 'hidden',
        }}
      >
        <div style={{ padding: '16px', background: '#FFFFFF' }}>
          {/* Orchestrator Status Card */}
          {orchestratorStatus && (
            <OrchestratorStatusCard status={orchestratorStatus} />
          )}

          {/* Agent Cards Row */}
          {agents.length > 0 && (
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
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

          {/* Collapsible Activity Feed */}
          {recentActivity.length > 0 && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #DDEC90' }}>
              <button
                onClick={toggleActivityCollapsed}
                style={{
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                  padding: '4px',
                  cursor: 'pointer',
                  fontFamily: 'Arial, sans-serif',
                }}
              >
                <Activity size={14} style={{ color: '#7A8A00' }} />
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#7A8A00', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Recent Activity
                </span>
                <span style={{ fontSize: '11px', color: '#6A6A20' }}>
                  ({recentActivity.length})
                </span>
                {activityCollapsed ? (
                  <ChevronDown size={14} style={{ color: '#7A8A00' }} />
                ) : (
                  <ChevronUp size={14} style={{ color: '#7A8A00' }} />
                )}
              </button>
              <div
                style={{
                  transition: 'all 200ms ease-out',
                  overflow: 'hidden',
                  maxHeight: activityCollapsed ? '0px' : '300px',
                  opacity: activityCollapsed ? 0 : 1,
                }}
              >
                <ActivityFeed activities={recentActivity} maxItems={5} showHeader={false} />
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
