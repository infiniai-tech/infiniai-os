import { useEffect, useCallback } from 'react'
import { CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSetupStatus, useHealthCheck } from '../hooks/useProjects'

interface SetupWizardProps {
  onComplete: () => void
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const { data: setupStatus, isLoading: setupLoading, error: setupError } = useSetupStatus()
  const { data: health, error: healthError } = useHealthCheck()

  const isApiHealthy = health?.status === 'healthy' && !healthError
  const isReady = isApiHealthy && setupStatus?.claude_cli && setupStatus?.credentials

  const checkAndComplete = useCallback(() => {
    if (isReady) onComplete()
  }, [isReady, onComplete])

  useEffect(() => {
    checkAndComplete()
  }, [checkAndComplete])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAFAF2',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Inter', sans-serif",
    }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          width: '100%', maxWidth: '480px',
          background: '#FFFFFF',
          border: '1px solid #DDEC90',
          borderRadius: '14px',
          padding: '36px 32px',
          boxShadow: '0 4px 24px rgba(26,26,0,0.08)',
        }}
      >
        {/* Gradient accent */}
        <div style={{
          height: '4px',
          background: 'linear-gradient(to right, #BBCB64, #FFE52A)',
          borderRadius: '9999px',
          marginBottom: '28px',
        }} />

        <h1 style={{
          fontWeight: 700, fontSize: '28px', color: '#1A1A00',
          textAlign: 'center', marginBottom: '6px',
          fontFamily: "'Geist', 'Inter', sans-serif",
        }}>
          Setup Wizard
        </h1>
        <p style={{ textAlign: 'center', color: '#6A6A20', fontSize: '14px', marginBottom: '28px' }}>
          Let&apos;s make sure everything is ready to go
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <SetupItem
            label="Backend Server"
            description="FastAPI server is running"
            status={healthError ? 'error' : isApiHealthy ? 'success' : 'loading'}
          />
          <SetupItem
            label="Claude CLI"
            description="Claude Code CLI is installed"
            status={setupLoading ? 'loading' : setupError ? 'error' : setupStatus?.claude_cli ? 'success' : 'error'}
            helpLink="https://docs.anthropic.com/claude/claude-code"
            helpText="Install Claude Code"
          />
          <SetupItem
            label="Anthropic Credentials"
            description="API credentials are configured"
            status={setupLoading ? 'loading' : setupError ? 'error' : setupStatus?.credentials ? 'success' : 'error'}
            helpLink="https://console.anthropic.com/account/keys"
            helpText="Get API Key"
          />
          <SetupItem
            label="Node.js"
            description="Node.js is installed (for UI dev)"
            status={setupLoading ? 'loading' : setupError ? 'error' : setupStatus?.node ? 'success' : 'warning'}
            helpLink="https://nodejs.org"
            helpText="Install Node.js"
            optional
          />
        </div>

        {/* Continue button */}
        {isReady && (
          <button
            onClick={onComplete}
            style={{
              width: '100%', marginTop: '28px',
              padding: '12px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #BBCB64, #7A8A00)',
              color: '#FFFFFF', fontWeight: 700, fontSize: '15px',
              cursor: 'pointer', fontFamily: "'Geist', 'Inter', sans-serif",
              transition: 'opacity 0.15s',
            }}
          >
            Continue to Dashboard
          </button>
        )}

        {/* Error */}
        {(healthError || setupError) && (
          <div style={{
            marginTop: '20px',
            padding: '12px 16px',
            background: '#FFF0DC', border: '1px solid #F0C880',
            borderLeft: '4px solid #F79A19', borderRadius: '8px',
            fontSize: '13px', color: '#A05A00',
          }}>
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>Setup Error</div>
            {healthError
              ? 'Cannot connect to the backend server. Make sure to run start_ui.py first.'
              : 'Failed to check setup status.'}
          </div>
        )}
      </motion.div>
    </div>
  )
}

interface SetupItemProps {
  label: string
  description: string
  status: 'success' | 'error' | 'warning' | 'loading'
  helpLink?: string
  helpText?: string
  optional?: boolean
}

function SetupItem({ label, description, status, helpLink, helpText, optional }: SetupItemProps) {
  const statusColor = status === 'success' ? '#7A8A00' : status === 'error' ? '#CF0F0F' : status === 'warning' ? '#A05A00' : '#9A9A60'

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '14px',
      padding: '14px 16px',
      background: status === 'success' ? '#F5F8D0' : '#FAFAF2',
      border: `1px solid ${status === 'success' ? '#BBCB64' : '#DDEC90'}`,
      borderRadius: '10px',
    }}>
      <div style={{ flexShrink: 0, marginTop: '1px' }}>
        {status === 'success' ? (
          <CheckCircle2 size={22} style={{ color: '#7A8A00' }} />
        ) : status === 'error' ? (
          <XCircle size={22} style={{ color: '#CF0F0F' }} />
        ) : status === 'warning' ? (
          <XCircle size={22} style={{ color: '#A05A00' }} />
        ) : (
          <Loader2 size={22} style={{ color: '#7A8A00', animation: 'spin 1s linear infinite' }} />
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <span style={{ fontWeight: 700, fontSize: '14px', color: '#1A1A00', fontFamily: "'Geist', 'Inter', sans-serif" }}>{label}</span>
          {optional && (
            <span style={{ fontSize: '11px', color: '#9A9A60' }}>(optional)</span>
          )}
        </div>
        <p style={{ fontSize: '13px', color: '#6A6A20', margin: 0 }}>{description}</p>
        {(status === 'error' || status === 'warning') && helpLink && (
          <a
            href={helpLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              marginTop: '6px',
              fontSize: '12px', fontWeight: 600, color: statusColor,
              textDecoration: 'underline',
            }}
          >
            {helpText} <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  )
}
