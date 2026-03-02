import { useState } from 'react'
import { AgentAvatar, resolveAgentName } from './AgentAvatar'
import type { Feature, ActiveAgent } from '../lib/types'

interface FeatureCardProps {
  feature: Feature
  onClick: () => void
  isInProgress?: boolean
  allFeatures?: Feature[]
  activeAgent?: ActiveAgent
}

function getStatusDotColor(feature: Feature, isInProgress?: boolean): string {
  if (feature.passes) return '#BBCB64'
  if (feature.needs_human_input) return '#FFE52A'
  if (isInProgress || feature.in_progress) return '#F79A19'
  return '#DDEC90'
}

function getStatusLabel(feature: Feature, isInProgress?: boolean): string {
  if (feature.passes) return 'Done'
  if (feature.needs_human_input) return 'Awaiting Input'
  if (isInProgress || feature.in_progress) return 'In Progress'
  return 'Pending'
}

export function FeatureCard({ feature, onClick, isInProgress, activeAgent }: FeatureCardProps) {
  const [hovered, setHovered] = useState(false)
  const isHITL = feature.needs_human_input
  const isDone = feature.passes

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFFFF',
        border: isHITL ? '1.5px solid #F79A19' : '1px solid #DDEC90',
        borderRadius: '8px',
        padding: '10px',
        cursor: 'pointer',
        position: 'relative',
        opacity: isDone ? 0.7 : 1,
        borderColor: hovered && !isHITL ? '#BBCB64' : undefined,
        boxShadow: hovered ? '0 2px 8px rgba(187,203,100,0.15)' : 'none',
        transform: hovered ? 'translateY(-1px)' : 'none',
        transition: 'all 0.15s ease',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* HITL banner */}
      {isHITL && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            background: '#F79A19',
            color: '#FFFFFF',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          textAlign: 'center',
          padding: '3px 0',
          borderRadius: '4px 4px 0 0',
          }}
        >
          &#9889; AWAITING INPUT
        </div>
      )}

      {/* Feature name */}
      <div
        style={{
          fontSize: '14px',
          fontWeight: 700,
          color: '#1A1A00',
          lineHeight: 1.35,
          marginBottom: '6px',
          marginTop: isHITL ? '14px' : 0,
        }}
      >
        {feature.name}
      </div>

      {/* Agent + status row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#6A6A20' }}>
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: getStatusDotColor(feature, isInProgress),
            flexShrink: 0,
          }}
        />
        <span>{getStatusLabel(feature, isInProgress)}</span>
        {activeAgent && (
          <>
            <span style={{ color: '#DDEC90' }}>|</span>
            <AgentAvatar name={activeAgent.agentName} state={activeAgent.state} size="xs" />
            <span style={{ fontWeight: 600 }}>{resolveAgentName(activeAgent.agentName)}</span>
          </>
        )}
      </div>

      {/* HITL question preview */}
      {isHITL && feature.human_input_request?.prompt && (
        <div
          style={{
            marginTop: '6px',
            padding: '6px 8px',
            background: '#FFF0DC',
            border: '1px solid #F0C880',
            borderRadius: '4px',
            fontSize: '11px',
            color: '#A05A00',
            lineHeight: 1.4,
          }}
        >
          {feature.human_input_request.prompt.length > 120
            ? feature.human_input_request.prompt.slice(0, 120) + '...'
            : feature.human_input_request.prompt}
        </div>
      )}

      {/* Tags row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '7px' }}>
        {/* Token estimate tag */}
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.3px',
            padding: '2px 7px',
            borderRadius: '10px',
            background: '#F5F8D0',
            color: '#7A8A00',
            border: '1px solid #DDEC90',
          }}
        >
          ~{feature.priority}k tokens
        </span>

        {/* Auto/HITL tag */}
        {isHITL ? (
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.3px',
              padding: '2px 7px',
              borderRadius: '10px',
              background: '#FFF0DC',
              color: '#A05A00',
              border: '1px solid #F0C880',
            }}
          >
            HITL
          </span>
        ) : (
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.3px',
              padding: '2px 7px',
              borderRadius: '10px',
              background: '#F5F8D0',
              color: '#7A8A00',
              border: '1px solid #DDEC90',
            }}
          >
            Auto
          </span>
        )}

        {/* Category tag */}
        {feature.category && (
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.3px',
              padding: '2px 7px',
              borderRadius: '10px',
              background: '#F5F8D0',
              color: '#7A8A00',
              border: '1px solid #DDEC90',
            }}
          >
            {feature.category}
          </span>
        )}
      </div>
    </div>
  )
}
