/**
 * ConfirmDialog Component
 *
 * A reusable confirmation dialog using framer-motion for animations.
 * Used to confirm destructive actions like deleting projects.
 */

import type { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
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
          onClick={onCancel}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: variant === 'danger' ? '#FFF0DC' : '#F5F8D0',
                  border:
                    variant === 'danger'
                      ? '1px solid #F0C880'
                      : '1px solid #DDEC90',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle
                  size={20}
                  style={{
                    color: variant === 'danger' ? '#F79A19' : '#7A8A00',
                  }}
                />
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
                {title}
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

            {/* Message */}
            <div
              style={{
                fontSize: '14px',
                lineHeight: 1.6,
                color: '#6A6A20',
              }}
            >
              {message}
            </div>

            {/* Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '24px',
              }}
            >
              <button
                onClick={onCancel}
                disabled={isLoading}
                style={{
                  background: 'transparent',
                  border: '1px solid #DDEC90',
                  color: '#6A6A20',
                  fontWeight: 600,
                  fontSize: '14px',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                  fontFamily: "'Inter', sans-serif",
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = '#F5F8D0'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                style={{
                  background: variant === 'danger' ? '#FFF0DC' : '#BBCB64',
                  color: variant === 'danger' ? '#A05A00' : '#1A1A00',
                  border:
                    variant === 'danger'
                      ? '1px solid #F0C880'
                      : '1px solid #BBCB64',
                  fontWeight: 700,
                  fontSize: '14px',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1,
                  fontFamily: "'Inter', sans-serif",
                  transition: 'background 0.15s, opacity 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.opacity = '0.85'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.opacity = '1'
                  }
                }}
              >
                {isLoading ? 'Deleting...' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
