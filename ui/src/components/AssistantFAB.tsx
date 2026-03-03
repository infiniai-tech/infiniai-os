/**
 * Floating Action Button for toggling the Assistant panel
 *
 * Circular FAB with lime/yellow gradient, framer-motion hover/tap animations,
 * and animated icon transition between open and closed states.
 */

import { MessageCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AssistantFABProps {
  onClick: () => void
  isOpen: boolean
}

export function AssistantFAB({ onClick, isOpen }: AssistantFABProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      title={isOpen ? 'Close Assistant (Press A)' : 'Open Assistant (Press A)'}
      aria-label={isOpen ? 'Close Assistant' : 'Open Assistant'}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 50,
        width: '52px',
        height: '52px',
        borderRadius: '9999px',
        background: 'linear-gradient(135deg, #BBCB64, #FFE52A)',
        boxShadow: '0 4px 16px rgba(187,203,100,0.4)',
        color: '#1A1A00',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isOpen ? (
          <motion.span
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={22} />
          </motion.span>
        ) : (
          <motion.span
            key="open"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <MessageCircle size={22} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
