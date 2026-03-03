import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Square, Loader2, ExternalLink, AlertTriangle, Settings2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { DevServerStatus } from '../lib/types'
import { startDevServer, stopDevServer } from '../lib/api'
import { DevServerConfigDialog } from './DevServerConfigDialog'

// Re-export DevServerStatus from lib/types for consumers that import from here
export type { DevServerStatus }

// ============================================================================
// React Query Hooks (Internal)
// ============================================================================

/**
 * Internal hook to start the dev server for a project.
 * Invalidates the dev-server-status query on success.
 */
function useStartDevServer(projectName: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => startDevServer(projectName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dev-server-status', projectName] })
    },
  })
}

/**
 * Internal hook to stop the dev server for a project.
 * Invalidates the dev-server-status query on success.
 */
function useStopDevServer(projectName: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => stopDevServer(projectName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dev-server-status', projectName] })
    },
  })
}

// ============================================================================
// Styles
// ============================================================================

const btnBase: React.CSSProperties = {
  borderRadius: '8px',
  padding: '6px 12px',
  minHeight: '32px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: "'Geist', 'Inter', sans-serif",
  fontSize: '13px',
  fontWeight: 700,
  lineHeight: 1,
  transition: 'all 0.15s',
  border: 'none',
}

const btnOutline: React.CSSProperties = {
  ...btnBase,
  background: 'transparent',
  color: '#7A8A00',
  border: '1px solid #DDEC90',
}

const btnDestructive: React.CSSProperties = {
  ...btnBase,
  background: '#FFF0DC',
  color: '#F79A19',
  border: '1px solid #F0C880',
}

const btnRunning: React.CSSProperties = {
  ...btnBase,
  background: 'linear-gradient(135deg, #BBCB64, #7A8A00)',
  color: '#FFFFFF',
  boxShadow: '0 2px 8px rgba(187,203,100,0.3)',
}

const btnGhost: React.CSSProperties = {
  ...btnBase,
  background: 'transparent',
  color: '#6A6A20',
  border: 'none',
}

// ============================================================================
// Component
// ============================================================================

interface DevServerControlProps {
  projectName: string
  status: DevServerStatus
  url: string | null
}

/**
 * DevServerControl provides start/stop controls for a project's development server.
 *
 * Features:
 * - Toggle button to start/stop the dev server
 * - Shows loading state during operations
 * - Displays clickable URL when server is running
 * - Uses design system accent when running
 * - Config dialog for setting custom dev commands
 */
export function DevServerControl({ projectName, status, url }: DevServerControlProps) {
  const startDevServerMutation = useStartDevServer(projectName)
  const stopDevServerMutation = useStopDevServer(projectName)
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [autoStartOnSave, setAutoStartOnSave] = useState(false)

  const isLoading = startDevServerMutation.isPending || stopDevServerMutation.isPending

  const handleStart = () => {
    // Clear any previous errors before starting
    stopDevServerMutation.reset()
    startDevServerMutation.mutate(undefined, {
      onError: (err) => {
        if (err.message?.includes('No dev command available')) {
          setAutoStartOnSave(true)
          setShowConfigDialog(true)
        }
      },
    })
  }
  const handleStop = () => {
    // Clear any previous errors before stopping
    startDevServerMutation.reset()
    stopDevServerMutation.mutate()
  }

  const handleOpenConfig = () => {
    setAutoStartOnSave(false)
    setShowConfigDialog(true)
  }

  const handleCloseConfig = () => {
    setShowConfigDialog(false)
    // Clear the start error if config dialog was opened reactively
    if (startDevServerMutation.error?.message?.includes('No dev command available')) {
      startDevServerMutation.reset()
    }
  }

  // Server is stopped when status is 'stopped' or 'crashed' (can restart)
  const isStopped = status === 'stopped' || status === 'crashed'
  // Server is in a running state
  const isRunning = status === 'running'
  // Server has crashed
  const isCrashed = status === 'crashed'

  // Hide inline error when config dialog is handling it
  const startError = startDevServerMutation.error
  const showInlineError = startError && !startError.message?.includes('No dev command available')

  const disabledOpacity = isLoading ? 0.5 : 1

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontFamily: "'Inter', sans-serif",
    }}>
      <AnimatePresence mode="wait">
        {isStopped ? (
          <motion.div
            key="stopped-controls"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <motion.button
              onClick={handleStart}
              disabled={isLoading}
              style={{
                ...(isCrashed ? btnDestructive : btnOutline),
                opacity: disabledOpacity,
              }}
              title={isCrashed ? "Dev Server Crashed - Click to Restart" : "Start Dev Server"}
              aria-label={isCrashed ? "Restart Dev Server (crashed)" : "Start Dev Server"}
              whileHover={{ scale: 1.02, background: isCrashed ? '#FFF0DC' : '#F5F8D0' }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : isCrashed ? (
                <AlertTriangle size={18} />
              ) : (
                <Globe size={18} />
              )}
            </motion.button>
            <motion.button
              onClick={handleOpenConfig}
              style={btnGhost}
              title="Configure Dev Server"
              aria-label="Configure Dev Server"
              whileHover={{ scale: 1.02, background: '#F5F8D0' }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <Settings2 size={16} />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="running-controls"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <motion.button
              onClick={handleStop}
              disabled={isLoading}
              style={{ ...btnRunning, opacity: disabledOpacity }}
              title="Stop Dev Server"
              aria-label="Stop Dev Server"
              whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(187,203,100,0.4)' }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Square size={18} />
              )}
            </motion.button>

            {/* Running status dot */}
            {isRunning && (
              <>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, #BBCB64, #FFE52A)',
                  boxShadow: '0 0 6px rgba(187,203,100,0.6)',
                  animation: 'statusPulse 2s ease-in-out infinite',
                  flexShrink: 0,
                }} />
                <style>{`
                  @keyframes statusPulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(0.85); }
                  }
                `}</style>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show URL as clickable link when server is running */}
      <AnimatePresence>
        {isRunning && url && (
          <motion.a
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Open ${url} in new tab`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '9999px',
              background: '#F5F8D0',
              border: '1px solid #DDEC90',
              color: '#7A8A00',
              fontSize: '12px',
              fontFamily: 'monospace',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#DDEC90'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#F5F8D0'
            }}
          >
            <span>{url}</span>
            <ExternalLink size={12} />
          </motion.a>
        )}
      </AnimatePresence>

      {/* Error display (hide "no dev command" error when config dialog handles it) */}
      <AnimatePresence>
        {(showInlineError || stopDevServerMutation.error) && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.15 }}
            style={{
              fontSize: '12px',
              fontFamily: 'monospace',
              color: '#F79A19',
              marginLeft: '4px',
              padding: '2px 8px',
              borderRadius: '8px',
              background: '#FFF0DC',
              border: '1px solid #F0C880',
            }}
          >
            {String((showInlineError ? startError : stopDevServerMutation.error)?.message || 'Operation failed')}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Dev Server Config Dialog */}
      <DevServerConfigDialog
        projectName={projectName}
        isOpen={showConfigDialog}
        onClose={handleCloseConfig}
        autoStartOnSave={autoStartOnSave}
      />
    </div>
  )
}
