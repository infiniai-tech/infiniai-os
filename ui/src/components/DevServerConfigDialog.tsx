import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, RotateCcw, Terminal, X, AlertCircle } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useDevServerConfig, useUpdateDevServerConfig } from '@/hooks/useProjects'
import { startDevServer } from '@/lib/api'

interface DevServerConfigDialogProps {
  projectName: string
  isOpen: boolean
  onClose: () => void
  autoStartOnSave?: boolean
}

export function DevServerConfigDialog({
  projectName,
  isOpen,
  onClose,
  autoStartOnSave = false,
}: DevServerConfigDialogProps) {
  const { data: config } = useDevServerConfig(isOpen ? projectName : null)
  const updateConfig = useUpdateDevServerConfig(projectName)
  const queryClient = useQueryClient()

  const [command, setCommand] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen && config) {
      setCommand(config.custom_command ?? config.effective_command ?? '')
      setError(null)
    }
  }, [isOpen, config])

  // Escape key
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const hasCustomCommand = !!config?.custom_command

  const handleSaveAndStart = async () => {
    const trimmed = command.trim()
    if (!trimmed) { setError('Please enter a dev server command.'); return }
    setIsSaving(true)
    setError(null)
    try {
      await updateConfig.mutateAsync(trimmed)
      if (autoStartOnSave) {
        await startDevServer(projectName)
        queryClient.invalidateQueries({ queryKey: ['dev-server-status', projectName] })
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClear = async () => {
    setIsSaving(true)
    setError(null)
    try {
      await updateConfig.mutateAsync(null)
      setCommand(config?.detected_command ?? '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear configuration')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: 'rgba(26,26,0,0.45)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 51,
              width: '480px',
              maxWidth: 'calc(100vw - 2rem)',
              background: '#FFFFFF',
              border: '1px solid #DDEC90',
              borderRadius: '14px',
              boxShadow: '0 20px 60px rgba(26,26,0,0.15), 0 4px 16px rgba(26,26,0,0.08)',
              fontFamily: "'Inter', sans-serif",
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid #DDEC90',
              background: 'linear-gradient(to bottom, #FAFAF2, #FFFFFF)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: '#F5F8D0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Terminal size={18} style={{ color: '#7A8A00' }} />
                </div>
                <span style={{ fontWeight: 700, fontSize: '16px', color: '#1A1A00', fontFamily: "'Geist', 'Inter', sans-serif" }}>
                  Dev Server Configuration
                </span>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: '30px', height: '30px', borderRadius: '7px',
                  border: '1px solid #DDEC90', background: 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#6A6A20', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F5F8D0' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Detection info */}
              <div style={{
                padding: '10px 14px',
                background: '#FAFAF2',
                border: '1px solid #DDEC90',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#6A6A20',
              }}>
                {config?.detected_type ? (
                  <p style={{ margin: 0 }}>
                    Detected project type:{' '}
                    <strong style={{ color: '#1A1A00' }}>{config.detected_type}</strong>
                    {config.detected_command && (
                      <span style={{ color: '#9A9A60' }}> — {config.detected_command}</span>
                    )}
                  </p>
                ) : (
                  <p style={{ margin: 0 }}>No project type detected. Enter a custom command below.</p>
                )}
              </div>

              {/* Command input */}
              <div>
                <label
                  htmlFor="dev-command"
                  style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6A6A20', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}
                >
                  Dev server command
                </label>
                <input
                  id="dev-command"
                  type="text"
                  value={command}
                  onChange={(e) => { setCommand(e.target.value); setError(null) }}
                  placeholder="npm run dev"
                  disabled={isSaving}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #DDEC90',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    color: '#1A1A00',
                    background: '#FFFFFF',
                    outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    boxSizing: 'border-box',
                    opacity: isSaving ? 0.6 : 1,
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#BBCB64'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(187,203,100,0.12)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#DDEC90'; e.currentTarget.style.boxShadow = 'none' }}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !isSaving) handleSaveAndStart() }}
                />
                <p style={{ fontSize: '11px', color: '#9A9A60', marginTop: '4px' }}>
                  Allowed runners: npm, npx, pnpm, yarn, python, uvicorn, flask, poetry, cargo, go
                </p>
              </div>

              {/* Clear custom command */}
              {hasCustomCommand && (
                <button
                  onClick={handleClear}
                  disabled={isSaving}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', borderRadius: '8px',
                    border: '1px solid #DDEC90', background: 'transparent',
                    color: '#6A6A20', fontWeight: 600, fontSize: '12px',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    opacity: isSaving ? 0.5 : 1,
                    fontFamily: "'Inter', sans-serif", transition: 'all 0.15s',
                    alignSelf: 'flex-start',
                  }}
                  onMouseEnter={e => { if (!isSaving) (e.currentTarget as HTMLElement).style.background = '#F5F8D0' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <RotateCcw size={13} />
                  Clear custom command (use auto-detection)
                </button>
              )}

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      fontSize: '12px', color: '#A05A00', fontFamily: 'monospace',
                    }}
                  >
                    <AlertCircle size={13} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px',
              padding: '12px 20px',
              borderTop: '1px solid #DDEC90',
              background: '#FAFAF2',
            }}>
              <button
                onClick={onClose}
                disabled={isSaving}
                style={{
                  padding: '8px 18px', borderRadius: '8px',
                  border: '1px solid #DDEC90', background: 'transparent',
                  color: '#6A6A20', fontWeight: 600, fontSize: '14px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.5 : 1,
                  fontFamily: "'Inter', sans-serif", transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!isSaving) (e.currentTarget as HTMLElement).style.background = '#F5F8D0' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAndStart}
                disabled={isSaving}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '8px 18px', borderRadius: '8px', border: 'none',
                  background: '#BBCB64', color: '#1A1A00',
                  fontWeight: 700, fontSize: '14px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.6 : 1,
                  fontFamily: "'Inter', sans-serif", transition: 'opacity 0.15s',
                }}
              >
                {isSaving ? (
                  <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
                ) : autoStartOnSave ? 'Save & Start' : 'Save'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
