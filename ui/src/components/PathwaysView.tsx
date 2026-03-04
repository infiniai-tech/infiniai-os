import React, { useState } from 'react'
import { AGENT_AVATAR_IMAGES } from './AgentAvatar'

interface OrchNode {
  emoji: string
  name: string
  sub: string
  running?: boolean
  lead?: boolean
}

interface OrchFlow {
  title: string
  badge: string
  description: string
  badgeStyle: { bg: string; color: string; border: string }
  accentColor: string
  nodes: OrchNode[]
}

const ORCH_FLOWS: OrchFlow[] = [
  {
    title: 'Standard Workflow',
    badge: 'Auto-configured',
    description: 'Default pipeline for folder-based project input. Agents auto-detect stack and wire up the full build chain.',
    badgeStyle: { bg: '#F5F8D0', color: '#7A8A00', border: '#DDEC90' },
    accentColor: '#BBCB64',
    nodes: [
      { emoji: '\u26A1', name: 'Zeus', sub: 'Ingest & Route', lead: true },
      { emoji: '\uD83E\uDDE0', name: 'Athena', sub: 'Architect', running: true },
      { emoji: '\u2600\uFE0F', name: 'Apollo', sub: 'Code Gen', running: true },
      { emoji: '\uD83D\uDD28', name: 'Hephaestus', sub: 'Build & QA', running: true },
      { emoji: '\uD83D\uDEE1\uFE0F', name: 'Ares', sub: 'Security' },
      { emoji: '\uD83C\uDFAF', name: 'Artemis', sub: 'Validate' },
    ],
  },
  {
    title: 'Figma Input',
    badge: 'Design-first',
    description: 'Parses Figma frames into components. Poseidon extracts design tokens before code generation begins.',
    badgeStyle: { bg: '#EDE4F7', color: '#6B21A8', border: '#D4B8F0' },
    accentColor: '#A78BFA',
    nodes: [
      { emoji: '\u26A1', name: 'Zeus', sub: 'Ingest', lead: true },
      { emoji: '\uD83C\uDF0A', name: 'Poseidon', sub: 'Parse Design', running: true },
      { emoji: '\uD83E\uDDE0', name: 'Athena', sub: 'Architect', running: true },
      { emoji: '\u2600\uFE0F', name: 'Apollo', sub: 'Code Gen', running: true },
      { emoji: '\uD83D\uDD28', name: 'Hephaestus', sub: 'Build & QA' },
    ],
  },
  {
    title: 'Greenfield Project',
    badge: 'From scratch',
    description: 'Full-stack scaffolding for new projects. Includes CI/CD setup, E2E testing, and security audit.',
    badgeStyle: { bg: '#D1FAE5', color: '#047857', border: '#6EE7B7' },
    accentColor: '#34D399',
    nodes: [
      { emoji: '\u26A1', name: 'Zeus', sub: 'Plan & Scaffold', lead: true },
      { emoji: '\uD83E\uDDE0', name: 'Athena', sub: 'Architecture', running: true },
      { emoji: '\u2600\uFE0F', name: 'Apollo', sub: 'Code Gen', running: true },
      { emoji: '\uD83D\uDC65', name: 'Hermes', sub: 'Integrate', running: true },
      { emoji: '\uD83D\uDD28', name: 'Hephaestus', sub: 'CI/CD' },
      { emoji: '\uD83C\uDFAF', name: 'Artemis', sub: 'E2E Tests' },
      { emoji: '\uD83D\uDEE1\uFE0F', name: 'Ares', sub: 'Audit' },
    ],
  },
  {
    title: 'Spec Driven',
    badge: 'Guided',
    description: 'Structured input form creates a spec that drives feature planning, implementation, and verification.',
    badgeStyle: { bg: '#DBEAFE', color: '#1D4ED8', border: '#93C5FD' },
    accentColor: '#60A5FA',
    nodes: [
      { emoji: '\u26A1', name: 'Zeus', sub: 'Parse Spec', lead: true },
      { emoji: '\uD83E\uDDE0', name: 'Athena', sub: 'Plan Features', running: true },
      { emoji: '\u2600\uFE0F', name: 'Apollo', sub: 'Implement', running: true },
      { emoji: '\uD83C\uDFAF', name: 'Artemis', sub: 'Verify', running: true },
      { emoji: '\uD83D\uDEE1\uFE0F', name: 'Ares', sub: 'Compliance' },
    ],
  },
  {
    title: 'API-First',
    badge: 'Backend',
    description: 'Schema-driven API development. Endpoints, integration layer, load testing, and auth all in one pass.',
    badgeStyle: { bg: '#FFF0DC', color: '#A05A00', border: '#F0C880' },
    accentColor: '#F59E0B',
    nodes: [
      { emoji: '\u26A1', name: 'Zeus', sub: 'Route', lead: true },
      { emoji: '\uD83E\uDDE0', name: 'Athena', sub: 'Schema Design', running: true },
      { emoji: '\u2600\uFE0F', name: 'Apollo', sub: 'Endpoints', running: true },
      { emoji: '\uD83D\uDC65', name: 'Hermes', sub: 'Integration', running: true },
      { emoji: '\uD83D\uDD25', name: 'Hades', sub: 'Load Test' },
      { emoji: '\uD83D\uDEE1\uFE0F', name: 'Ares', sub: 'Auth & Security' },
    ],
  },
  {
    title: 'Hotfix Path',
    badge: 'Fast-track',
    description: 'Minimal pipeline for urgent bug fixes. Triage, fix, regression test, and deploy in the shortest path.',
    badgeStyle: { bg: '#FEE2E2', color: '#B91C1C', border: '#FCA5A5' },
    accentColor: '#F87171',
    nodes: [
      { emoji: '\u26A1', name: 'Zeus', sub: 'Triage', lead: true },
      { emoji: '\u2600\uFE0F', name: 'Apollo', sub: 'Fix', running: true },
      { emoji: '\uD83C\uDFAF', name: 'Artemis', sub: 'Regression', running: true },
      { emoji: '\uD83D\uDD28', name: 'Hephaestus', sub: 'Deploy' },
    ],
  },
]

const totalAgents = new Set(ORCH_FLOWS.flatMap(f => f.nodes.map(n => n.name))).size
const totalFlows = ORCH_FLOWS.length

function FlowCard({ flow, hovered, onHover, onLeave }: {
  flow: OrchFlow
  hovered: boolean
  onHover: () => void
  onLeave: () => void
}) {
  const activeCount = flow.nodes.filter(n => n.running || n.lead).length

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #DDEC90',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        boxShadow: hovered
          ? '0 8px 24px rgba(26,26,0,0.08), 0 2px 8px rgba(26,26,0,0.04)'
          : '0 1px 3px rgba(26,26,0,0.04)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        cursor: 'default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Accent bar */}
      <div style={{
        height: '3px',
        background: `linear-gradient(90deg, ${flow.accentColor}, ${flow.accentColor}80)`,
      }} />

      {/* Header */}
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h3 style={{
            fontFamily: "'Geist', 'Inter', sans-serif",
            fontSize: '16px',
            fontWeight: 700,
            color: '#1A1A00',
            margin: 0,
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
          }}>
            {flow.title}
          </h3>
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '9999px',
            background: flow.badgeStyle.bg,
            color: flow.badgeStyle.color,
            border: `1px solid ${flow.badgeStyle.border}`,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            marginLeft: '12px',
          }}>
            {flow.badge}
          </span>
        </div>
        <p style={{
          fontSize: '12px',
          color: '#6A6A20',
          margin: 0,
          lineHeight: 1.5,
          minHeight: '36px',
        }}>
          {flow.description}
        </p>
      </div>

      {/* Pipeline visualization */}
      <div style={{ padding: '20px 24px 16px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
          {flow.nodes.map((node, idx) => (
            <React.Fragment key={`${flow.title}-${node.name}`}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 0,
                flex: '0 0 auto',
                width: '72px',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: node.lead
                    ? 'linear-gradient(135deg, #FFF8EE, #FFF0DC)'
                    : node.running
                      ? 'linear-gradient(135deg, #FAFFF0, #F5F8D0)'
                      : '#F9FAFB',
                  border: `2px solid ${node.lead ? '#F79A19' : node.running ? '#BBCB64' : '#E5E7EB'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: (node.running || node.lead)
                    ? `0 0 0 3px ${node.lead ? 'rgba(247,154,25,0.12)' : 'rgba(187,203,100,0.12)'}, 0 2px 4px rgba(0,0,0,0.04)`
                    : '0 1px 2px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease',
                }}>
                  {AGENT_AVATAR_IMAGES[node.name] ? (
                    <img
                      src={AGENT_AVATAR_IMAGES[node.name]}
                      alt={node.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    node.emoji
                  )}
                  {(node.running || node.lead) && (
                    <span style={{
                      position: 'absolute',
                      top: '-3px',
                      right: '-3px',
                      width: '11px',
                      height: '11px',
                      borderRadius: '50%',
                      background: node.lead ? '#F79A19' : '#BBCB64',
                      border: '2.5px solid #FFFFFF',
                      boxShadow: `0 0 6px ${node.lead ? 'rgba(247,154,25,0.5)' : 'rgba(187,203,100,0.5)'}`,
                    }} />
                  )}
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#1A1A00',
                  textAlign: 'center',
                  marginTop: '8px',
                  lineHeight: 1.2,
                }}>
                  {node.name}
                </span>
                <span style={{
                  fontSize: '9px',
                  color: '#9A9A60',
                  textAlign: 'center',
                  marginTop: '2px',
                  lineHeight: 1.2,
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}>
                  {node.sub}
                </span>
              </div>

              {idx < flow.nodes.length - 1 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '22px',
                  minWidth: '16px',
                  flex: '1 0 16px',
                  maxWidth: '40px',
                }}>
                  <div style={{
                    flex: 1,
                    height: '2px',
                    background: (node.running || node.lead)
                      ? `linear-gradient(90deg, ${flow.accentColor}99, ${flow.accentColor}44)`
                      : '#E5E7EB',
                    borderRadius: '1px',
                  }} />
                  <svg width="6" height="8" viewBox="0 0 6 8" style={{ flexShrink: 0, marginLeft: '-1px' }}>
                    <path
                      d="M0 0 L6 4 L0 8 Z"
                      fill={(node.running || node.lead) ? `${flow.accentColor}99` : '#E5E7EB'}
                    />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Footer stats */}
      <div style={{
        padding: '10px 24px',
        borderTop: '1px solid #F5F8D0',
        background: '#FEFFF8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '11px', color: '#6A6A20', fontWeight: 600 }}>
            {flow.nodes.length} agents
          </span>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: flow.accentColor,
          }}>
            {activeCount} active
          </span>
        </div>
        <div style={{
          display: 'flex',
          gap: '3px',
        }}>
          {flow.nodes.map((n) => (
            <div key={n.name} style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: (n.running || n.lead) ? flow.accentColor : '#E5E7EB',
              transition: 'background 0.2s',
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function PathwaysView() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Page header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}>
          <div>
            <div style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              color: '#7A8A00',
              marginBottom: '6px',
            }}>
              Agent Routing
            </div>
            <h1 style={{
              fontFamily: "'Geist', 'Inter', sans-serif",
              fontSize: '28px',
              fontWeight: 700,
              color: '#1A1A00',
              margin: 0,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}>
              Orchestration <span style={{ color: '#7A8A00' }}>Pathways</span>
            </h1>
            <p style={{ fontSize: '13px', color: '#6A6A20', marginTop: '6px', margin: '6px 0 0' }}>
              Each project type triggers a specialized agent pipeline
            </p>
          </div>
        </div>

        {/* Summary stat pills */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { label: 'Workflows', value: totalFlows, color: '#7A8A00' },
            { label: 'Unique Agents', value: totalAgents, color: '#7A8A00' },
            { label: 'Avg Pipeline Depth', value: Math.round(ORCH_FLOWS.reduce((s, f) => s + f.nodes.length, 0) / ORCH_FLOWS.length), color: '#7A8A00' },
          ].map(stat => (
            <div key={stat.label} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: '#FFFFFF',
              border: '1px solid #DDEC90',
              borderRadius: '10px',
            }}>
              <span style={{
                fontFamily: "'Geist', 'Inter', sans-serif",
                fontSize: '18px',
                fontWeight: 800,
                color: stat.color,
                lineHeight: 1,
              }}>
                {stat.value}
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#6A6A20',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Flow cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
      }}>
        {ORCH_FLOWS.map((flow, idx) => (
          <FlowCard
            key={flow.title}
            flow={flow}
            hovered={hoveredIdx === idx}
            onHover={() => setHoveredIdx(idx)}
            onLeave={() => setHoveredIdx(null)}
          />
        ))}
      </div>
    </div>
  )
}
