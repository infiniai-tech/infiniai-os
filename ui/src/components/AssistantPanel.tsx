/**
 * Assistant Panel Component
 *
 * Slide-in panel container for the project assistant chat.
 * Slides in from the right side of the screen with framer-motion.
 * Manages conversation state with localStorage persistence.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { X, Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AssistantChat } from './AssistantChat'
import { useConversation } from '../hooks/useConversations'
import type { ChatMessage } from '../lib/types'

interface AssistantPanelProps {
  projectName: string
  isOpen: boolean
  onClose: () => void
}

const STORAGE_KEY_PREFIX = 'assistant-conversation-'
const WIDTH_STORAGE_KEY = 'assistant-panel-width'
const DEFAULT_WIDTH = 400
const MIN_WIDTH = 300
const MAX_WIDTH_VW = 90

function getStoredConversationId(projectName: string): number | null {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${projectName}`)
    if (stored) {
      const data = JSON.parse(stored)
      return data.conversationId || null
    }
  } catch {
    // Invalid stored data, ignore
  }
  return null
}

function setStoredConversationId(projectName: string, conversationId: number | null) {
  const key = `${STORAGE_KEY_PREFIX}${projectName}`
  if (conversationId) {
    localStorage.setItem(key, JSON.stringify({ conversationId }))
  } else {
    localStorage.removeItem(key)
  }
}

export function AssistantPanel({ projectName, isOpen, onClose }: AssistantPanelProps) {
  // Load initial conversation ID from localStorage
  const [conversationId, setConversationId] = useState<number | null>(() =>
    getStoredConversationId(projectName)
  )

  // Fetch conversation details when we have an ID
  const { data: conversationDetail, isLoading: isLoadingConversation, error: conversationError } = useConversation(
    projectName,
    conversationId
  )

  // Clear stored conversation ID if it no longer exists (404 error)
  useEffect(() => {
    if (conversationError && conversationId) {
      const message = conversationError.message.toLowerCase()
      // Only clear for 404 errors, not transient network issues
      if (message.includes('not found') || message.includes('404')) {
        console.warn(`Conversation ${conversationId} not found, clearing stored ID`)
        setConversationId(null)
      }
    }
  }, [conversationError, conversationId])

  // Convert API messages to ChatMessage format for the chat component
  const initialMessages: ChatMessage[] | undefined = conversationDetail?.messages.map((msg) => ({
    id: `db-${msg.id}`,
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
  }))

  // Persist conversation ID changes to localStorage
  useEffect(() => {
    setStoredConversationId(projectName, conversationId)
  }, [projectName, conversationId])

  // Reset conversation ID when project changes
  useEffect(() => {
    setConversationId(getStoredConversationId(projectName))
  }, [projectName])

  // Handle starting a new chat
  const handleNewChat = useCallback(() => {
    setConversationId(null)
  }, [])

  // Handle selecting a conversation from history
  const handleSelectConversation = useCallback((id: number) => {
    setConversationId(id)
  }, [])

  // Handle when a new conversation is created (from WebSocket)
  const handleConversationCreated = useCallback((id: number) => {
    setConversationId(id)
  }, [])

  // Resizable panel width
  const [panelWidth, setPanelWidth] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(WIDTH_STORAGE_KEY)
      if (stored) return Math.max(MIN_WIDTH, parseInt(stored, 10))
    } catch { /* ignore */ }
    return DEFAULT_WIDTH
  })
  const isResizing = useRef(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isResizing.current = true
    const startX = e.clientX
    const startWidth = panelWidth
    const maxWidth = window.innerWidth * (MAX_WIDTH_VW / 100)

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return
      const delta = startX - e.clientX
      const newWidth = Math.min(maxWidth, Math.max(MIN_WIDTH, startWidth + delta))
      setPanelWidth(newWidth)
    }

    const handleMouseUp = () => {
      isResizing.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      // Persist width
      setPanelWidth((w) => {
        localStorage.setItem(WIDTH_STORAGE_KEY, String(w))
        return w
      })
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [panelWidth])

  return (
    <>
      {/* Backdrop - click to close */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(26, 26, 0, 0.15)',
              zIndex: 40,
            }}
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              bottom: 0,
              zIndex: 50,
              width: `${panelWidth}px`,
              maxWidth: `${MAX_WIDTH_VW}vw`,
              background: '#FFFFFF',
              borderLeft: '1px solid #DDEC90',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 16px 48px rgba(26, 26, 0, 0.12), 0 4px 12px rgba(26, 26, 0, 0.08)',
            }}
            role="dialog"
            aria-label="Oracle Assistant"
          >
            {/* Resize handle */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '6px',
                cursor: 'col-resize',
                zIndex: 10,
              }}
              onMouseDown={handleMouseDown}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: '0',
                  left: 0,
                  width: '2px',
                  background: '#DDEC90',
                  transition: 'background 150ms',
                }}
              />
            </div>

            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid #DDEC90',
                background: 'linear-gradient(to bottom, #FAFAF2, #FFFFFF)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    background: 'linear-gradient(135deg, #BBCB64, #FFE52A)',
                    padding: '6px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Bot size={18} style={{ color: '#1A1A00' }} />
                </div>
                <div>
                  <h2
                    style={{
                      fontFamily: "'Geist', 'Inter', sans-serif",
                      fontWeight: 600,
                      fontSize: '15px',
                      color: '#1A1A00',
                      margin: 0,
                      lineHeight: 1.3,
                    }}
                  >
                    Oracle
                  </h2>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '12px',
                      color: '#6A6A20',
                      margin: 0,
                      lineHeight: 1.3,
                    }}
                  >
                    {projectName}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                title="Close Oracle (Press A)"
                aria-label="Close Oracle"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '1px solid #DDEC90',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6A6A20',
                  transition: 'background 150ms',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F5F8D0' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
              >
                <X size={16} />
              </motion.button>
            </div>

            {/* Chat area */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <AssistantChat
                projectName={projectName}
                conversationId={conversationId}
                initialMessages={initialMessages}
                isLoadingConversation={isLoadingConversation}
                onNewChat={handleNewChat}
                onSelectConversation={handleSelectConversation}
                onConversationCreated={handleConversationCreated}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
