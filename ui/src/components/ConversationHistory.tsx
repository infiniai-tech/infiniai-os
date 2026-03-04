/**
 * Conversation History Dropdown Component
 *
 * Displays a list of past conversations for the assistant.
 * Allows selecting a conversation to resume or deleting old conversations.
 */

import { useState, useEffect } from 'react'
import { MessageSquare, Trash2, Loader2 } from 'lucide-react'
import { useConversations, useDeleteConversation } from '../hooks/useConversations'
import { ConfirmDialog } from './ConfirmDialog'
import type { AssistantConversation } from '../lib/types'

interface ConversationHistoryProps {
  projectName: string
  currentConversationId: number | null
  isOpen: boolean
  onClose: () => void
  onSelectConversation: (conversationId: number) => void
}

function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  if (diffSeconds < 60) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function ConversationHistory({
  projectName,
  currentConversationId,
  isOpen,
  onClose,
  onSelectConversation,
}: ConversationHistoryProps) {
  const [conversationToDelete, setConversationToDelete] = useState<AssistantConversation | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { data: conversations, isLoading } = useConversations(projectName)
  const deleteConversation = useDeleteConversation(projectName)

  useEffect(() => {
    if (!isOpen) setDeleteError(null)
  }, [isOpen])

  const handleDeleteClick = (e: React.MouseEvent, conversation: AssistantConversation) => {
    e.stopPropagation()
    setConversationToDelete(conversation)
  }

  const handleConfirmDelete = async () => {
    if (!conversationToDelete) return
    try {
      setDeleteError(null)
      await deleteConversation.mutateAsync(conversationToDelete.id)
      setConversationToDelete(null)
    } catch {
      setDeleteError('Failed to delete conversation. Please try again.')
    }
  }

  const handleCancelDelete = () => {
    setConversationToDelete(null)
    setDeleteError(null)
  }

  const handleSelectConversation = (conversationId: number) => {
    onSelectConversation(conversationId)
    onClose()
  }

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={onClose} />

      {/* Dropdown panel */}
      <div style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        left: 0,
        zIndex: 50,
        width: '320px',
        maxWidth: 'calc(100vw - 2rem)',
        background: '#FFFFFF',
        border: '1px solid #DDEC90',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(26,26,0,0.10), 0 2px 6px rgba(26,26,0,0.06)',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}>
        {/* Header */}
        <div style={{
          padding: '12px 14px',
          borderBottom: '1px solid #DDEC90',
          background: 'linear-gradient(to bottom, #FAFAF2, #FFFFFF)',
        }}>
          <h3 style={{ fontWeight: 700, fontSize: '13px', color: '#1A1A00', margin: 0 }}>
            Conversation History
          </h3>
        </div>

        {/* Content */}
        <div>
          {isLoading ? (
            <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={20} style={{ color: '#7A8A00', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : !conversations || conversations.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', color: '#6A6A20' }}>
              No conversations yet
            </div>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {conversations.map((conversation) => {
                const isCurrent = conversation.id === currentConversationId
                return (
                  <div
                    key={conversation.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: isCurrent ? '#F5F8D0' : 'transparent',
                      borderBottom: '1px solid #F5F8D0',
                    }}
                    onMouseEnter={e => {
                      if (!isCurrent) (e.currentTarget as HTMLElement).style.background = '#FAFAF2'
                    }}
                    onMouseLeave={e => {
                      if (!isCurrent) (e.currentTarget as HTMLElement).style.background = 'transparent'
                    }}
                  >
                    <button
                      onClick={() => handleSelectConversation(conversation.id)}
                      disabled={isCurrent}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        textAlign: 'left',
                        background: 'transparent',
                        border: 'none',
                        cursor: isCurrent ? 'default' : 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <MessageSquare size={15} style={{ color: '#7A8A00', flexShrink: 0, marginTop: '1px' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontWeight: 600,
                            fontSize: '13px',
                            color: '#1A1A00',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {conversation.title || 'Untitled conversation'}
                          </div>
                          <div style={{
                            fontSize: '11px',
                            color: '#6A6A20',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginTop: '2px',
                            fontFamily: 'monospace',
                          }}>
                            <span>{conversation.message_count} messages</span>
                            <span>·</span>
                            <span>{formatRelativeTime(conversation.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, conversation)}
                      title="Delete conversation"
                      style={{
                        width: '32px',
                        height: '32px',
                        marginRight: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: '#9A9A60',
                        opacity: isCurrent ? 0.6 : 0,
                        transition: 'opacity 0.15s, color 0.15s, background 0.15s',
                        flexShrink: 0,
                      }}
                      onMouseEnter={e => {
                        const btn = e.currentTarget as HTMLElement
                        btn.style.color = '#A05A00'
                        btn.style.background = '#FFF0DC'
                        btn.style.opacity = '1'
                      }}
                      onMouseLeave={e => {
                        const btn = e.currentTarget as HTMLElement
                        btn.style.color = '#9A9A60'
                        btn.style.background = 'transparent'
                        btn.style.opacity = isCurrent ? '0.6' : '0'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={conversationToDelete !== null}
        title="Delete Conversation"
        message={
          deleteError
            ? `Are you sure you want to delete "${conversationToDelete?.title || 'this conversation'}"? This action cannot be undone.\n\n${deleteError}`
            : `Are you sure you want to delete "${conversationToDelete?.title || 'this conversation'}"? This action cannot be undone.`
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={deleteConversation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  )
}
