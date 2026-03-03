import { useEffect, useCallback } from 'react'
import { Keyboard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Shortcut {
  key: string
  description: string
  context?: string
}

const shortcuts: Shortcut[] = [
  { key: '?', description: 'Show keyboard shortcuts' },
  { key: 'D', description: 'Toggle debug panel' },
  { key: 'T', description: 'Toggle terminal tab' },
  { key: 'N', description: 'Add new feature', context: 'in odyssey' },
  { key: 'E', description: 'Expand odyssey with divine power', context: 'with spec & features' },
  { key: 'A', description: 'Toggle oracle assistant', context: 'in odyssey' },
  { key: 'G', description: 'Toggle Kanban/Graph view', context: 'in odyssey' },
  { key: ',', description: 'Open settings' },
  { key: 'Esc', description: 'Close modal/panel' },
]

interface KeyboardShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === '?') {
        e.preventDefault()
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

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
          }}
          onClick={onClose}
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
              boxShadow:
                '0 20px 60px rgba(26,26,0,0.15), 0 8px 24px rgba(26,26,0,0.08)',
              width: '440px',
              maxWidth: '90vw',
              padding: '28px',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: '#F5F8D0',
                  border: '1px solid #DDEC90',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Keyboard size={18} style={{ color: '#7A8A00' }} />
              </div>
              <h2
                style={{
                  fontFamily: "'Geist', 'Inter', sans-serif",
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#1A1A00',
                  margin: 0,
                }}
              >
                Keyboard Shortcuts
              </h2>
            </div>

            {/* Divider */}
            <hr
              style={{
                border: 'none',
                borderTop: '1px solid #DDEC90',
                margin: '20px 0',
              }}
            />

            {/* Shortcuts list */}
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {shortcuts.map((shortcut) => (
                <li
                  key={shortcut.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(221,236,144,0.5)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <kbd
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '28px',
                        padding: '2px 8px',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#1A1A00',
                        background: '#F5F8D0',
                        border: '1px solid #DDEC90',
                        borderRadius: '6px',
                      }}
                    >
                      {shortcut.key}
                    </kbd>
                    <span
                      style={{
                        fontSize: '14px',
                        color: '#1A1A00',
                      }}
                    >
                      {shortcut.description}
                    </span>
                  </div>
                  {shortcut.context && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#7A8A00',
                        background: '#F5F8D0',
                        border: '1px solid #DDEC90',
                        borderRadius: '9999px',
                        padding: '2px 10px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {shortcut.context}
                    </span>
                  )}
                </li>
              ))}
            </ul>

            {/* Footer hint */}
            <p
              style={{
                textAlign: 'center',
                fontSize: '12px',
                color: '#6A6A20',
                marginTop: '16px',
                marginBottom: 0,
              }}
            >
              Press{' '}
              <kbd
                style={{
                  padding: '1px 6px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px',
                  background: '#F5F8D0',
                  border: '1px solid #DDEC90',
                  borderRadius: '4px',
                }}
              >
                ?
              </kbd>{' '}
              or{' '}
              <kbd
                style={{
                  padding: '1px 6px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px',
                  background: '#F5F8D0',
                  border: '1px solid #DDEC90',
                  borderRadius: '4px',
                }}
              >
                Esc
              </kbd>{' '}
              to close
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
