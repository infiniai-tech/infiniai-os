import { useState } from 'react'
import { Loader2, AlertTriangle, RotateCcw, Trash2, Check, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useResetProject } from '../hooks/useProjects'

interface ResetProjectModalProps {
  isOpen: boolean
  projectName: string
  onClose: () => void
  onResetComplete?: (wasFullReset: boolean) => void
}

export function ResetProjectModal({
  isOpen,
  projectName,
  onClose,
  onResetComplete,
}: ResetProjectModalProps) {
  const [resetType, setResetType] = useState<'quick' | 'full'>('quick')
  const resetProject = useResetProject(projectName)

  const handleReset = async () => {
    const isFullReset = resetType === 'full'
    try {
      await resetProject.mutateAsync(isFullReset)
      onResetComplete?.(isFullReset)
      onClose()
    } catch {
      // Error handled by mutation state
    }
  }

  const handleClose = () => {
    if (!resetProject.isPending) {
      resetProject.reset()
      setResetType('quick')
      onClose()
    }
  }

  const isFull = resetType === 'full'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(26,26,0,0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #DDEC90',
              boxShadow: '0 20px 60px rgba(26,26,0,0.15), 0 8px 24px rgba(26,26,0,0.08)',
              width: '480px',
              maxWidth: '90vw',
              padding: '28px',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isFull ? '#FFF0DC' : '#F5F8D0',
                border: isFull ? '1px solid #F0C880' : '1px solid #DDEC90',
                flexShrink: 0,
              }}>
                <RotateCcw size={20} style={{ color: isFull ? '#F79A19' : '#7A8A00' }} />
              </div>
              <div>
                <h2 style={{
                  fontFamily: "'Geist', 'Inter', sans-serif",
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#1A1A00',
                  margin: 0,
                }}>
                  Reset Odyssey
                </h2>
                <p style={{ fontSize: '13px', color: '#6A6A20', margin: '2px 0 0' }}>
                  Reset <span style={{ fontWeight: 600, color: '#1A1A00' }}>{projectName}</span> and begin anew
                </p>
              </div>
            </div>

            {/* Divider */}
            <hr style={{ border: 'none', borderTop: '1px solid #DDEC90', margin: '20px 0' }} />

            {/* Reset Type Toggle */}
            <div style={{
              display: 'flex',
              borderRadius: '10px',
              border: '1px solid #DDEC90',
              overflow: 'hidden',
              marginBottom: '20px',
            }}>
              <button
                onClick={() => setResetType('quick')}
                disabled={resetProject.isPending}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: resetProject.isPending ? 'not-allowed' : 'pointer',
                  border: 'none',
                  borderRight: '1px solid #DDEC90',
                  background: resetType === 'quick' ? '#BBCB64' : '#FFFFFF',
                  color: resetType === 'quick' ? '#1A1A00' : '#6A6A20',
                  transition: 'all 0.15s',
                  opacity: resetProject.isPending ? 0.5 : 1,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <RotateCcw size={15} />
                Quick Reset
              </button>
              <button
                onClick={() => setResetType('full')}
                disabled={resetProject.isPending}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: resetProject.isPending ? 'not-allowed' : 'pointer',
                  border: 'none',
                  background: resetType === 'full' ? '#FFF0DC' : '#FFFFFF',
                  color: resetType === 'full' ? '#A05A00' : '#6A6A20',
                  transition: 'all 0.15s',
                  opacity: resetProject.isPending ? 0.5 : 1,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <Trash2 size={15} />
                Full Reset
              </button>
            </div>

            {/* Warning Box */}
            <div style={{
              background: isFull ? '#FFF0DC' : '#FFF8EC',
              border: `1px solid ${isFull ? '#F0C880' : '#F0C880'}`,
              borderLeft: '4px solid #F79A19',
              borderRadius: '8px',
              padding: '14px 16px',
              marginBottom: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <AlertTriangle size={15} style={{ color: '#F79A19' }} />
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#A05A00' }}>What will be deleted:</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {['All features and progress', 'Assistant chat history', 'Agent settings',
                  ...(isFull ? ['App spec and prompts'] : [])
                ].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#A05A00' }}>
                    <X size={13} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* What will be preserved */}
            <div style={{
              background: '#F5F8D0',
              border: '1px solid #DDEC90',
              borderRadius: '8px',
              padding: '14px 16px',
              marginBottom: '20px',
            }}>
              <span style={{ fontWeight: 700, fontSize: '13px', color: '#7A8A00', display: 'block', marginBottom: '10px' }}>
                What will be preserved:
              </span>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {resetType === 'quick' ? (
                  <>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6A6A20' }}>
                      <Check size={13} style={{ color: '#7A8A00' }} />
                      App spec and prompts
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6A6A20' }}>
                      <Check size={13} style={{ color: '#7A8A00' }} />
                      Project code and files
                    </li>
                  </>
                ) : (
                  <>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6A6A20' }}>
                      <Check size={13} style={{ color: '#7A8A00' }} />
                      Project code and files
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#9A9A60' }}>
                      <AlertTriangle size={13} />
                      Setup wizard will appear
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Error */}
            <AnimatePresence>
              {resetProject.isError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    background: '#FFF0DC',
                    border: '1px solid #F0C880',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '13px',
                    color: '#A05A00',
                    marginBottom: '16px',
                  }}
                >
                  {resetProject.error instanceof Error
                    ? resetProject.error.message
                    : 'Failed to reset project. Please try again.'}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <motion.button
                onClick={handleClose}
                disabled={resetProject.isPending}
                whileHover={{ background: '#F5F8D0' }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: 'transparent',
                  border: '1px solid #DDEC90',
                  color: '#6A6A20',
                  fontWeight: 600,
                  fontSize: '14px',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  cursor: resetProject.isPending ? 'not-allowed' : 'pointer',
                  opacity: resetProject.isPending ? 0.5 : 1,
                  fontFamily: "'Inter', sans-serif",
                  transition: 'background 0.15s',
                }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleReset}
                disabled={resetProject.isPending}
                whileHover={{ opacity: 0.9 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: isFull ? '#FFF0DC' : '#BBCB64',
                  color: isFull ? '#A05A00' : '#1A1A00',
                  border: isFull ? '1px solid #F0C880' : '1px solid #BBCB64',
                  fontWeight: 700,
                  fontSize: '14px',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  cursor: resetProject.isPending ? 'not-allowed' : 'pointer',
                  opacity: resetProject.isPending ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'opacity 0.15s',
                }}
              >
                {resetProject.isPending ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Resetting...
                  </>
                ) : (
                  `${resetType === 'quick' ? 'Quick' : 'Full'} Reset`
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
