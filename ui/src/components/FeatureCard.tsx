import { motion } from 'framer-motion'
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

/** Whether the status dot should pulse (active/in-progress states) */
function shouldPulse(feature: Feature, isInProgress?: boolean): boolean {
  return !!(feature.needs_human_input || isInProgress || feature.in_progress) && !feature.passes
}

export function FeatureCard({ feature, onClick, isInProgress, activeAgent }: FeatureCardProps) {
  const isHITL = feature.needs_human_input
  const isDone = feature.passes

  return (
    <motion.div
      onClick={onClick}
      whileHover={{
        y: -2,
        boxShadow: '0 6px 20px rgba(26,26,0,0.09), 0 2px 6px rgba(26,26,0,0.05)',
        borderColor: isHITL ? '#F79A19' : '#BBCB64',
      }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      style={{
        background: '#FFFFFF',
        border: isHITL ? '1.5px solid #F79A19' : '1px solid #DDEC90',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        opacity: isDone ? 0.65 : 1,
        fontFamily: "'Geist', 'Inter', sans-serif",
      }}
    >
      {/* HITL banner - full width at top of card */}
      {isHITL && (
        <div
          style={{
            background: 'linear-gradient(to right, #F79A19, #F5A832)',
            color: '#FFFFFF',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            textAlign: 'center',
            padding: '4px 0',
            borderRadius: '0',
          }}
        >
          &#9889; AWAITING INPUT
        </div>
      )}

      {/* Card body */}
      <div style={{ padding: '12px' }}>
        {/* Feature name */}
        <div
          style={{
            fontFamily: "'Geist', 'Inter', sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            color: '#1A1A00',
            lineHeight: 1.4,
            marginBottom: '6px',
          }}
        >
          {feature.name}
        </div>

        {/* Agent + status row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6A6A20' }}>
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: getStatusDotColor(feature, isInProgress),
              flexShrink: 0,
              ...(shouldPulse(feature, isInProgress) ? { animation: 'status-pulse 2s ease-in-out infinite' } : {}),
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
              background: 'linear-gradient(135deg, #FFF0DC, #FFF8EC)',
              border: '1px solid #F0C880',
              borderRadius: '8px',
              fontSize: '12px',
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px' }}>
          {/* Token estimate tag */}
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              padding: '3px 9px',
              borderRadius: '9999px',
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
                fontWeight: 600,
                padding: '3px 9px',
                borderRadius: '9999px',
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
                fontWeight: 600,
                padding: '3px 9px',
                borderRadius: '9999px',
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
                fontWeight: 600,
                padding: '3px 9px',
                borderRadius: '9999px',
                background: isHITL ? '#FFF0DC' : '#F5F8D0',
                color: isHITL ? '#A05A00' : '#7A8A00',
                border: `1px solid ${isHITL ? '#F0C880' : '#DDEC90'}`,
              }}
            >
              {feature.category}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
