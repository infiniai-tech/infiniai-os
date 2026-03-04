/**
 * Assistant Chat Component
 *
 * Main chat interface for the project assistant.
 * Displays messages and handles user input.
 * Supports conversation history with resume functionality.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Send, Loader2, Wifi, WifiOff, Plus, History } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAssistantChat } from '../hooks/useAssistantChat'
import { ChatMessage as ChatMessageComponent } from './ChatMessage'
import { ConversationHistory } from './ConversationHistory'
import { QuestionOptions } from './QuestionOptions'
import { TypingIndicator } from './TypingIndicator'
import type { ChatMessage } from '../lib/types'
import { isSubmitEnter } from '../lib/keyboard'

interface AssistantChatProps {
  projectName: string
  conversationId?: number | null
  initialMessages?: ChatMessage[]
  isLoadingConversation?: boolean
  onNewChat?: () => void
  onSelectConversation?: (id: number) => void
  onConversationCreated?: (id: number) => void
}

export function AssistantChat({
  projectName,
  conversationId,
  initialMessages,
  isLoadingConversation,
  onNewChat,
  onSelectConversation,
  onConversationCreated,
}: AssistantChatProps) {
  const [inputValue, setInputValue] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const hasStartedRef = useRef(false)
  const lastConversationIdRef = useRef<number | null | undefined>(undefined)

  // Memoize the error handler to prevent infinite re-renders
  const handleError = useCallback((error: string) => {
    console.error('Assistant error:', error)
  }, [])

  const {
    messages,
    isLoading,
    connectionStatus,
    conversationId: activeConversationId,
    currentQuestions,
    start,
    sendMessage,
    sendAnswer,
    clearMessages,
  } = useAssistantChat({
    projectName,
    onError: handleError,
  })

  // Notify parent when a NEW conversation is created (not when switching to existing)
  // Track activeConversationId to fire callback only once when it transitions from null to a value
  const previousActiveConversationIdRef = useRef<number | null>(activeConversationId)
  useEffect(() => {
    const hadNoConversation = previousActiveConversationIdRef.current === null
    const nowHasConversation = activeConversationId !== null

    if (hadNoConversation && nowHasConversation && onConversationCreated) {
      onConversationCreated(activeConversationId)
    }

    previousActiveConversationIdRef.current = activeConversationId
  }, [activeConversationId, onConversationCreated])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Start or resume the chat session when component mounts or conversationId changes
  useEffect(() => {
    // Skip if we're loading conversation details
    if (isLoadingConversation) {
      return
    }

    // Only start if conversationId has actually changed
    if (lastConversationIdRef.current === conversationId && hasStartedRef.current) {
      return
    }

    // Check if we're switching to a different conversation (not initial mount)
    const isSwitching = lastConversationIdRef.current !== undefined &&
                        lastConversationIdRef.current !== conversationId

    lastConversationIdRef.current = conversationId
    hasStartedRef.current = true

    // Clear existing messages when switching conversations
    if (isSwitching) {
      clearMessages()
    }

    // Start the session with the conversation ID (or null for new)
    start(conversationId)
  }, [conversationId, isLoadingConversation, start, clearMessages])

  // Handle starting a new chat
  const handleNewChat = useCallback(() => {
    clearMessages()
    onNewChat?.()
  }, [clearMessages, onNewChat])

  // Handle selecting a conversation from history
  const handleSelectConversation = useCallback((id: number) => {
    setShowHistory(false)
    onSelectConversation?.(id)
  }, [onSelectConversation])

  // Focus input when not loading
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus()
    }
  }, [isLoading])

  const handleSend = () => {
    const content = inputValue.trim()
    if (!content || isLoading || isLoadingConversation) return

    sendMessage(content)
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isSubmitEnter(e)) {
      e.preventDefault()
      handleSend()
    }
  }

  // Combine initial messages (from resumed conversation) with live messages
  // Merge both arrays with deduplication by message ID to prevent history loss
  const displayMessages = useMemo(() => {
    const isConversationSynced = lastConversationIdRef.current === conversationId && !isLoadingConversation

    // If not synced yet, show only initialMessages (or empty)
    if (!isConversationSynced) {
      return initialMessages ?? []
    }

    // If no initial messages, just show live messages
    if (!initialMessages || initialMessages.length === 0) {
      return messages
    }

    // Merge both arrays, deduplicating by ID (live messages take precedence)
    const messageMap = new Map<string, ChatMessage>()
    for (const msg of initialMessages) {
      messageMap.set(msg.id, msg)
    }
    for (const msg of messages) {
      messageMap.set(msg.id, msg)
    }
    return Array.from(messageMap.values())
  }, [initialMessages, messages, conversationId, isLoadingConversation])

  const isInputDisabled = isLoading || isLoadingConversation || connectionStatus !== 'connected' || !!currentQuestions
  const isSendDisabled = !inputValue.trim() || isInputDisabled

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header with actions and connection status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          borderBottom: '1px solid #DDEC90',
          background: '#FAFAF2',
        }}
      >
        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
          <ActionButton
            onClick={handleNewChat}
            title="New conversation"
            disabled={isLoading}
          >
            <Plus size={15} />
          </ActionButton>
          <ActionButton
            onClick={() => setShowHistory(!showHistory)}
            title="Conversation history"
            isActive={showHistory}
          >
            <History size={15} />
          </ActionButton>

          {/* History dropdown */}
          <ConversationHistory
            projectName={projectName}
            currentConversationId={conversationId ?? activeConversationId}
            isOpen={showHistory}
            onClose={() => setShowHistory(false)}
            onSelectConversation={handleSelectConversation}
          />
        </div>

        {/* Connection status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {connectionStatus === 'connected' ? (
            <>
              <Wifi size={13} style={{ color: '#7A8A00' }} />
              <span style={{ fontSize: '12px', color: '#6A6A20', fontFamily: "'Inter', sans-serif" }}>Connected</span>
            </>
          ) : connectionStatus === 'connecting' ? (
            <>
              <Loader2 size={13} style={{ color: '#F79A19', animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '12px', color: '#6A6A20', fontFamily: "'Inter', sans-serif" }}>Connecting...</span>
            </>
          ) : (
            <>
              <WifiOff size={13} style={{ color: '#F79A19' }} />
              <span style={{ fontSize: '12px', color: '#6A6A20', fontFamily: "'Inter', sans-serif" }}>Disconnected</span>
            </>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          background: '#FAFAF2',
        }}
      >
        {isLoadingConversation ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#6A6A20',
              fontSize: '14px',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: '#BBCB64' }} />
              <span>Loading conversation...</span>
            </div>
          </div>
        ) : displayMessages.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#6A6A20',
              fontSize: '14px',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: '#BBCB64' }} />
                <span>Connecting to assistant...</span>
              </div>
            ) : (
              <span>Ask me anything about the codebase</span>
            )}
          </div>
        ) : (
          <div style={{ padding: '16px 0' }}>
            {displayMessages.map((message) => (
              <ChatMessageComponent key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Loading indicator */}
      <AnimatePresence>
        {isLoading && displayMessages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              borderTop: '1px solid #DDEC90',
              background: '#FAFAF2',
            }}
          >
            <TypingIndicator />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Structured questions from assistant */}
      {currentQuestions && (
        <div style={{ borderTop: '1px solid #DDEC90', background: '#FFFFFF' }}>
          <QuestionOptions
            questions={currentQuestions}
            onSubmit={sendAnswer}
          />
        </div>
      )}

      {/* Input area */}
      <div
        style={{
          borderTop: '1px solid #DDEC90',
          padding: '12px 16px',
          background: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the codebase..."
            disabled={isInputDisabled}
            rows={1}
            style={{
              flex: 1,
              resize: 'none',
              minHeight: '44px',
              maxHeight: '120px',
              borderRadius: '24px',
              border: '1px solid #DDEC90',
              padding: '10px 16px',
              fontSize: '14px',
              fontFamily: "'Inter', sans-serif",
              color: '#1A1A00',
              background: isInputDisabled ? '#F5F8D0' : '#FFFFFF',
              outline: 'none',
              lineHeight: '1.5',
              transition: 'border-color 150ms, box-shadow 150ms',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#BBCB64'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(187, 203, 100, 0.2)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#DDEC90'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
          <motion.button
            whileHover={isSendDisabled ? {} : { scale: 1.05 }}
            whileTap={isSendDisabled ? {} : { scale: 0.95 }}
            onClick={handleSend}
            disabled={isSendDisabled}
            title="Send message"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '9999px',
              border: 'none',
              background: isSendDisabled ? '#DDEC90' : '#BBCB64',
              color: '#1A1A00',
              cursor: isSendDisabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              opacity: isSendDisabled ? 0.5 : 1,
              transition: 'background 150ms, opacity 150ms',
            }}
          >
            {isLoading ? (
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Send size={18} />
            )}
          </motion.button>
        </div>
        <p
          style={{
            fontSize: '12px',
            color: '#6A6A20',
            marginTop: '8px',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {currentQuestions ? 'Select an option above to continue' : 'Press Enter to send, Shift+Enter for new line'}
        </p>
      </div>
    </div>
  )
}

/**
 * Small action button used in the chat sub-header (New, History).
 */
function ActionButton({
  onClick,
  title,
  disabled,
  isActive,
  children,
}: {
  onClick: () => void
  title: string
  disabled?: boolean
  isActive?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        width: '30px',
        height: '30px',
        borderRadius: '8px',
        border: '1px solid ' + (isActive ? '#BBCB64' : 'transparent'),
        background: isActive ? '#F5F8D0' : 'transparent',
        color: '#1A1A00',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : 1,
        transition: 'background 150ms, border-color 150ms',
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isActive) {
          (e.currentTarget as HTMLButtonElement).style.background = '#F5F8D0'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
        }
      }}
    >
      {children}
    </button>
  )
}
