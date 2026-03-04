import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DEFAULT_PROMPTS, QUICK_INSERT_ITEMS } from './agentPrompts'
import { AGENT_AVATAR_IMAGES } from './AgentAvatar'

type RoleBadge = 'LEAD' | 'INT' | 'SPC'
type AgentStatus = 'working' | 'idle'

interface AgentData {
  name: string
  role: RoleBadge
  status: AgentStatus
  subtitle: string
  emoji: string
  tasks: number
  capabilities: string[]
  model: string
  tokensUsed: string
  uptime: string
  successRate: string
  avgResponseTime: string
  assignedProjects: string[]
  recentActivity: { action: string; time: string; project?: string }[]
  systemPrompt?: string
}

const AGENTS: AgentData[] = [
  { name: 'Zeus', role: 'LEAD', status: 'working', subtitle: 'Chief Orchestrator', emoji: '\u26A1', tasks: 4, capabilities: ['Project routing', 'Agent orchestration', 'Decision making', 'HITL escalation'], model: 'Claude Opus 4.6', tokensUsed: '20.2M', uptime: '99.8%', successRate: '97%', avgResponseTime: '1.2s', assignedProjects: ['Alpha Rewrite', 'Portal Modernization', 'Design Rebuild'], recentActivity: [{ action: 'Routed task to Athena', time: '2m ago', project: 'Alpha Rewrite' }, { action: 'Escalated HITL review', time: '8m ago', project: 'Portal Modernization' }, { action: 'Approved deployment', time: '14m ago', project: 'Design Rebuild' }, { action: 'Created sprint plan', time: '32m ago' }] },
  { name: 'Athena', role: 'INT', status: 'working', subtitle: 'Strategy & Architecture', emoji: '\uD83E\uDDE0', tasks: 3, capabilities: ['Code generation', 'Refactoring', 'TypeScript', 'API design'], model: 'Claude Sonnet 4.5', tokensUsed: '31.9M', uptime: '99.5%', successRate: '94%', avgResponseTime: '3.8s', assignedProjects: ['Alpha Rewrite', 'CRM Integration'], recentActivity: [{ action: 'Committed auth module', time: '1m ago', project: 'Alpha Rewrite' }, { action: 'Refactored API layer', time: '12m ago', project: 'Alpha Rewrite' }, { action: 'Fixed type errors', time: '25m ago', project: 'CRM Integration' }] },
  { name: 'Apollo', role: 'SPC', status: 'working', subtitle: 'Code Generation', emoji: '\u2600\uFE0F', tasks: 2, capabilities: ['User research', 'Data analysis', 'Persona mapping'], model: 'Claude Haiku 4.5', tokensUsed: '5.1M', uptime: '99.9%', successRate: '98%', avgResponseTime: '0.8s', assignedProjects: ['Portal Modernization'], recentActivity: [{ action: 'Generated persona report', time: '5m ago', project: 'Portal Modernization' }, { action: 'Analyzed user feedback', time: '18m ago' }] },
  { name: 'Hermes', role: 'SPC', status: 'working', subtitle: 'Integration & Delivery', emoji: '\uD83D\uDC65', tasks: 1, capabilities: ['Churn analysis', 'Re-engagement', 'Health scoring'], model: 'Claude Haiku 4.5', tokensUsed: '3.2M', uptime: '99.7%', successRate: '96%', avgResponseTime: '1.0s', assignedProjects: ['CRM Integration'], recentActivity: [{ action: 'Updated health scores', time: '3m ago', project: 'CRM Integration' }, { action: 'Flagged at-risk accounts', time: '22m ago' }] },
  { name: 'Artemis', role: 'SPC', status: 'working', subtitle: 'Testing & QA', emoji: '\uD83C\uDFAF', tasks: 2, capabilities: ['Lead discovery', 'Signal detection', 'Qualification'], model: 'Claude Haiku 4.5', tokensUsed: '4.8M', uptime: '99.6%', successRate: '91%', avgResponseTime: '1.5s', assignedProjects: ['Alpha Rewrite', 'Legacy API Migration'], recentActivity: [{ action: 'Validated endpoint schema', time: '6m ago', project: 'Legacy API Migration' }, { action: 'Ran integration tests', time: '19m ago', project: 'Alpha Rewrite' }] },
  { name: 'Hephaestus', role: 'LEAD', status: 'working', subtitle: 'Infrastructure & Build', emoji: '\uD83D\uDD28', tasks: 3, capabilities: ['Task delegation', 'QA oversight', 'Progress reporting'], model: 'Claude Opus 4.6', tokensUsed: '15.9M', uptime: '99.9%', successRate: '99%', avgResponseTime: '1.1s', assignedProjects: ['Alpha Rewrite', 'Design Rebuild', 'Mobile Proto'], recentActivity: [{ action: 'Delegated build tasks', time: '1m ago', project: 'Alpha Rewrite' }, { action: 'QA review passed', time: '9m ago', project: 'Design Rebuild' }, { action: 'Generated progress report', time: '30m ago' }] },
  { name: 'Ares', role: 'SPC', status: 'working', subtitle: 'Security & Compliance', emoji: '\uD83D\uDEE1\uFE0F', tasks: 2, capabilities: ['Copywriting', 'Documentation', 'Schema writing'], model: 'Claude Sonnet 4.5', tokensUsed: '10.1M', uptime: '99.4%', successRate: '95%', avgResponseTime: '2.4s', assignedProjects: ['Alpha Rewrite', 'Dashboard Overhaul'], recentActivity: [{ action: 'Updated API docs', time: '4m ago', project: 'Alpha Rewrite' }, { action: 'Wrote changelog', time: '15m ago', project: 'Dashboard Overhaul' }] },
  { name: 'Poseidon', role: 'SPC', status: 'working', subtitle: 'Data & Analytics', emoji: '\uD83C\uDF0A', tasks: 1, capabilities: ['Figma parsing', 'Component mapping', 'Design tokens'], model: 'Claude Sonnet 4.5', tokensUsed: '7.3M', uptime: '99.3%', successRate: '93%', avgResponseTime: '4.2s', assignedProjects: ['Design Rebuild'], recentActivity: [{ action: 'Parsed Figma frames', time: '7m ago', project: 'Design Rebuild' }, { action: 'Extracted design tokens', time: '20m ago', project: 'Design Rebuild' }] },
  { name: 'Hades', role: 'SPC', status: 'idle', subtitle: 'Monitoring & Alerts', emoji: '\uD83D\uDD25', tasks: 0, capabilities: ['Vuln scanning', 'Auth review', 'OWASP checks'], model: 'Claude Opus 4.6', tokensUsed: '1.4M', uptime: '99.9%', successRate: '100%', avgResponseTime: '2.0s', assignedProjects: [], recentActivity: [{ action: 'Completed OWASP scan', time: '1h ago', project: 'Alpha Rewrite' }, { action: 'Reviewed auth flow', time: '3h ago', project: 'Portal Modernization' }] },
]

const ROLE_STYLES: Record<RoleBadge, { bg: string; color: string; border: string }> = {
  LEAD: { bg: '#FFF0DC', color: '#A05A00', border: '#F0C880' },
  INT: { bg: '#F5F8D0', color: '#7A8A00', border: '#DDEC90' },
  SPC: { bg: '#F5F8D0', color: '#7A8A00', border: '#DDEC90' },
}

const ROLE_LABELS: Record<RoleBadge, string> = {
  LEAD: 'Lead Agent',
  INT: 'Integration Agent',
  SPC: 'Specialist Agent',
}

function AgentDrawer({ agent, onClose }: { agent: AgentData; onClose: () => void }) {
  const [visible, setVisible] = useState(false)
  const [view, setView] = useState<'detail' | 'configure'>('detail')
  const [promptText, setPromptText] = useState(() => agent.systemPrompt || DEFAULT_PROMPTS[agent.name] || '')
  const [saved, setSaved] = useState(false)
  const roleStyle = ROLE_STYLES[agent.role]
  const isIdle = agent.status === 'idle'

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 250)
  }

  const handleSave = useCallback(() => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [])

  const sectionTitle: React.CSSProperties = {
    fontFamily: "'Geist', 'Inter', sans-serif",
    fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
    color: '#7A8A00', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid #F5F8D0',
  }

  const metricBox: React.CSSProperties = {
    background: '#FAFAF2', border: '1px solid #DDEC90', borderRadius: '8px', padding: '10px 12px',
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 998,
          opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease',
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: view === 'configure' ? '560px' : '420px', zIndex: 999,
          background: '#FFFFFF', borderLeft: '1px solid #DDEC90',
          boxShadow: '-8px 0 30px rgba(0,0,0,0.08)',
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s ease, width 0.25s ease',
          display: 'flex', flexDirection: 'column',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #DDEC90',
          background: 'linear-gradient(to bottom, #FAFAF2, #FFFFFF)',
          display: 'flex', alignItems: 'flex-start', gap: '14px', flexShrink: 0,
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            border: '2px solid #DDEC90', background: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', flexShrink: 0,
            overflow: 'hidden',
          }}>
            {AGENT_AVATAR_IMAGES[agent.name] ? (
              <img src={AGENT_AVATAR_IMAGES[agent.name]} alt={agent.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : agent.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                fontFamily: "'Geist', 'Inter', sans-serif",
                fontSize: '20px', fontWeight: 700, color: '#1A1A00',
              }}>{agent.name}</span>
              <span style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
                borderRadius: '9999px', padding: '2px 8px',
                background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}`,
              }}>
                {agent.role}
              </span>
            </div>
            <div style={{ fontSize: '14px', color: '#6A6A20', marginBottom: '6px' }}>{agent.subtitle}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isIdle ? '#E0E0E0' : '#BBCB64' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: isIdle ? '#6A6A20' : '#7A8A00' }}>
                {isIdle ? 'Idle' : 'Working'}
              </span>
              <span style={{ fontSize: '12px', color: '#6A6A20' }}>&middot; {agent.tasks} active task{agent.tasks !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #DDEC90',
              background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '16px', color: '#6A6A20', flexShrink: 0,
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F5F8D0' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            &times;
          </button>
        </div>

        {/* Tab bar */}
        <div style={{
          display: 'flex', borderBottom: '1px solid #DDEC90', background: '#FFFFFF', flexShrink: 0,
        }}>
          {[
            { id: 'detail' as const, label: 'Overview' },
            { id: 'configure' as const, label: 'System Prompt' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              style={{
                flex: 1, padding: '10px 16px', fontSize: '12px', fontWeight: 700,
                letterSpacing: '0.5px', textTransform: 'uppercase',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: view === tab.id ? '#7A8A00' : '#6A6A20',
                borderBottom: view === tab.id ? '2px solid #7A8A00' : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Detail view */}
        {view === 'detail' && (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              <div style={sectionTitle}>Performance Metrics</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                {[
                  { label: 'Model', value: agent.model },
                  { label: 'Tokens Used (MTD)', value: agent.tokensUsed },
                  { label: 'Uptime', value: agent.uptime },
                  { label: 'Success Rate', value: agent.successRate },
                  { label: 'Avg Response', value: agent.avgResponseTime },
                  { label: 'Role Type', value: ROLE_LABELS[agent.role] },
                ].map(m => (
                  <div key={m.label} style={metricBox}>
                    <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#7A8A00', marginBottom: '4px' }}>
                      {m.label}
                    </div>
                    <div style={{
                      fontFamily: "'Geist', 'Inter', sans-serif",
                      fontSize: '15px', fontWeight: 700, color: '#1A1A00',
                    }}>{m.value}</div>
                  </div>
                ))}
              </div>

              <div style={sectionTitle}>Capabilities</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
                {agent.capabilities.map(cap => (
                  <span key={cap} style={{
                    fontSize: '12px', padding: '4px 10px', borderRadius: '9999px',
                    background: '#F5F8D0', color: '#1A1A00', border: '1px solid #DDEC90', fontWeight: 600,
                  }}>
                    {cap}
                  </span>
                ))}
              </div>

              <div style={sectionTitle}>Assigned Projects</div>
              {agent.assignedProjects.length === 0 ? (
                <div style={{ fontSize: '13px', color: '#6A6A20', marginBottom: '24px', fontStyle: 'italic' }}>
                  No active project assignments
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px' }}>
                  {agent.assignedProjects.map(p => (
                    <div key={p} style={{
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
                      background: '#FAFAF2', borderRadius: '8px', border: '1px solid #F5F8D0',
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#BBCB64', flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A00' }}>{p}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={sectionTitle}>Recent Activity</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {agent.recentActivity.map((act, idx) => (
                  <div key={idx} style={{
                    display: 'flex', gap: '12px', padding: '10px 0',
                    borderBottom: idx < agent.recentActivity.length - 1 ? '1px solid #F5F8D0' : 'none',
                  }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%', background: '#BBCB64',
                      marginTop: '5px', flexShrink: 0,
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A00' }}>{act.action}</div>
                      <div style={{ fontSize: '11px', color: '#6A6A20', marginTop: '2px' }}>
                        {act.time}{act.project && <> &middot; <span style={{ color: '#7A8A00' }}>{act.project}</span></>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              padding: '16px 24px', borderTop: '1px solid #DDEC90', background: '#FAFAF2',
              display: 'flex', gap: '10px', flexShrink: 0,
            }}>
              <button
                style={{
                  flex: 1, fontSize: '13px', fontWeight: 700, color: '#7A8A00',
                  border: '1px solid #DDEC90', background: 'transparent',
                  borderRadius: '8px', padding: '10px 16px', cursor: 'pointer', transition: 'background 0.12s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F5F8D0' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                View Logs
              </button>
              <button
                onClick={() => setView('configure')}
                style={{
                  flex: 1, fontSize: '13px', fontWeight: 700, color: '#1A1A00',
                  background: '#BBCB64', border: 'none',
                  borderRadius: '8px', padding: '10px 16px', cursor: 'pointer', transition: 'opacity 0.12s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
              >
                Configure
              </button>
            </div>
          </>
        )}

        {/* Configure view -- System Prompt Editor */}
        {view === 'configure' && (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Info banner */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                padding: '12px 14px', borderRadius: '8px',
                background: '#FAFAF2', border: '1px solid #DDEC90',
              }}>
                <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>&#9889;</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A00', marginBottom: '3px' }}>
                    Agent System Prompt
                  </div>
                  <div style={{ fontSize: '12px', color: '#6A6A20', lineHeight: 1.5 }}>
                    This prompt defines how <strong>{agent.name}</strong> behaves. It is prepended to every task sent to this agent.
                    Edit it to customize the agent's personality, constraints, and focus areas.
                  </div>
                </div>
              </div>

              {/* Prompt metadata */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{
                  flex: 1, padding: '8px 12px', borderRadius: '8px',
                  background: '#F5F8D0', border: '1px solid #DDEC90',
                }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#7A8A00', marginBottom: '2px' }}>
                    Model
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A00' }}>{agent.model}</div>
                </div>
                <div style={{
                  flex: 1, padding: '8px 12px', borderRadius: '8px',
                  background: '#F5F8D0', border: '1px solid #DDEC90',
                }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#7A8A00', marginBottom: '2px' }}>
                    Characters
                  </div>
                  <div style={{
                    fontFamily: "'Geist', 'Inter', sans-serif",
                    fontSize: '13px', fontWeight: 600, color: '#1A1A00',
                  }}>{promptText.length.toLocaleString()}</div>
                </div>
                <div style={{
                  flex: 1, padding: '8px 12px', borderRadius: '8px',
                  background: '#F5F8D0', border: '1px solid #DDEC90',
                }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#7A8A00', marginBottom: '2px' }}>
                    Lines
                  </div>
                  <div style={{
                    fontFamily: "'Geist', 'Inter', sans-serif",
                    fontSize: '13px', fontWeight: 600, color: '#1A1A00',
                  }}>{promptText.split('\n').length}</div>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                value={promptText}
                onChange={e => setPromptText(e.target.value)}
                spellCheck={false}
                style={{
                  flex: 1, minHeight: '300px',
                  fontFamily: "'JetBrains Mono', 'Consolas', monospace",
                  fontSize: '13px', lineHeight: 1.6, color: '#1A1A00',
                  background: '#FFFFFF', border: '1px solid #DDEC90',
                  borderRadius: '8px', padding: '16px',
                  resize: 'none', outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#7A8A00'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(187,203,100,0.12)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = '#DDEC90'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />

              {/* Quick-insert buttons */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#7A8A00', marginBottom: '8px' }}>
                  Quick Insert
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {QUICK_INSERT_ITEMS.map(item => (
                    <button
                      key={item.label}
                      onClick={() => setPromptText(prev => prev + item.text)}
                      style={{
                        fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '9999px',
                        background: 'transparent', color: '#7A8A00', border: '1px solid #DDEC90',
                        cursor: 'pointer', transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F5F8D0' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '16px 24px', borderTop: '1px solid #DDEC90', background: '#FAFAF2',
              display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0,
            }}>
              <button
                onClick={() => {
                  setPromptText(DEFAULT_PROMPTS[agent.name] || '')
                }}
                style={{
                  fontSize: '12px', fontWeight: 600, color: '#6A6A20',
                  border: '1px solid #DDEC90', background: 'transparent',
                  borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', transition: 'background 0.12s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F5F8D0' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                Reset to Default
              </button>
              <div style={{ flex: 1 }} />
              <button
                onClick={() => setView('detail')}
                style={{
                  fontSize: '13px', fontWeight: 700, color: '#7A8A00',
                  border: '1px solid #DDEC90', background: 'transparent',
                  borderRadius: '8px', padding: '10px 16px', cursor: 'pointer', transition: 'background 0.12s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F5F8D0' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  fontSize: '13px', fontWeight: 700,
                  color: saved ? '#FFFFFF' : '#1A1A00',
                  background: saved ? '#7A8A00' : '#BBCB64',
                  border: 'none',
                  borderRadius: '8px', padding: '10px 20px', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if (!saved) (e.currentTarget as HTMLElement).style.opacity = '0.9' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
              >
                {saved ? '\u2713 Saved' : 'Save Prompt'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export function AgentsView() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null)

  // Suppress lint warning for hoveredCard used in style computation
  void hoveredCard

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#7A8A00', marginBottom: '3px' }}>
            Multi-Agent System
          </div>
          <h1 style={{
            fontFamily: "'Geist', 'Inter', sans-serif",
            fontSize: '31px', fontWeight: 700, color: '#1A1A00', margin: 0, lineHeight: 1.2,
          }}>
            Agent <span style={{ color: '#7A8A00' }}>Roster</span>
          </h1>
          <p style={{ fontSize: '14px', color: '#6A6A20', marginTop: '3px' }}>
            16 agents deployed &middot; 14 active &middot; 2 idle &middot; Real-time orchestration
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            style={{
              fontSize: '13px', fontWeight: 700, color: '#7A8A00',
              border: '1px solid #DDEC90', background: 'transparent',
              borderRadius: '8px', padding: '8px 16px', cursor: 'pointer',
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F5F8D0' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            &darr; Agent Report
          </button>
          <button
            style={{
              fontSize: '13px', fontWeight: 700, color: '#1A1A00',
              background: '#BBCB64', border: 'none',
              borderRadius: '8px', padding: '8px 16px', cursor: 'pointer',
              transition: 'opacity 0.12s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
          >
            + Configure Agent
          </button>
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
        <AnimatePresence>
          {AGENTS.map((agent, idx) => {
            const roleStyle = ROLE_STYLES[agent.role]
            const isIdle = agent.status === 'idle'
            return (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                whileHover={{ y: -2, boxShadow: '0 4px 16px rgba(26,26,0,0.08)' }}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #DDEC90',
                  borderRadius: '12px',
                  padding: '16px',
                  opacity: isIdle ? 0.75 : 1,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(26,26,0,0.06), 0 1px 2px rgba(26,26,0,0.04)',
                }}
                onClick={() => setSelectedAgent(agent)}
                onMouseEnter={() => setHoveredCard(agent.name)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', marginBottom: '10px', border: '2px solid #DDEC90', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                  {AGENT_AVATAR_IMAGES[agent.name] ? (
                    <img src={AGENT_AVATAR_IMAGES[agent.name]} alt={agent.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : agent.emoji}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{
                    fontFamily: "'Geist', 'Inter', sans-serif",
                    fontSize: '19px', fontWeight: 700, color: '#1A1A00',
                  }}>{agent.name}</span>
                  <span style={{
                    fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
                    borderRadius: '9999px', padding: '2px 7px',
                    background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}`,
                  }}>
                    {agent.role}
                  </span>
                </div>
                <div style={{ fontSize: '14px', color: '#6A6A20', marginBottom: '10px' }}>{agent.subtitle}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: isIdle ? '#6A6A20' : '#7A8A00' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isIdle ? '#E0E0E0' : '#BBCB64', display: 'inline-block' }} />
                    {isIdle ? 'Idle' : 'Working'}
                  </div>
                  <span style={{ fontSize: '13px', color: '#6A6A20' }}>{agent.tasks} active task{agent.tasks !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ height: '1px', background: '#F5F8D0', margin: '10px 0' }} />
                <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#7A8A00', marginBottom: '6px' }}>
                  Capabilities
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {agent.capabilities.map((cap) => (
                    <span key={cap} style={{
                      fontSize: '10px', padding: '2px 7px', borderRadius: '9999px',
                      background: '#F5F8D0', color: '#1A1A00', border: '1px solid #DDEC90',
                    }}>
                      {cap}
                    </span>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Agent Detail Drawer */}
      {selectedAgent && (
        <AgentDrawer agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
      )}
    </div>
  )
}
