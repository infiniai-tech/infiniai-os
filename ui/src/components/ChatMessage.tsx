/**
 * Chat Message Component
 *
 * Displays a single message in the spec creation chat.
 * Supports user, assistant, and system messages with clean styling.
 */

import { memo } from 'react'
import { Bot, User, Info } from 'lucide-react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ChatMessage as ChatMessageType } from '../lib/types'

interface ChatMessageProps {
  message: ChatMessageType
}

// Stable references for memo — avoids re-renders
const remarkPlugins = [remarkGfm]

const markdownComponents: Components = {
  a: ({ children, href, ...props }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#7A8A00', textDecoration: 'underline' }} {...props}>
      {children}
    </a>
  ),
}

export const ChatMessage = memo(function ChatMessage({ message }: ChatMessageProps) {
  const { role, content, attachments, timestamp, isStreaming } = message

  const timeString = timestamp.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  // System messages
  if (role === 'system') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 16px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: '#F5F8D0',
          border: '1px solid #DDEC90',
          borderRadius: '8px',
          padding: '6px 14px',
          fontSize: '13px',
          fontFamily: 'monospace',
          color: '#6A6A20',
        }}>
          <Info size={14} style={{ color: '#7A8A00' }} />
          {content}
        </div>
      </div>
    )
  }

  const isUser = role === 'user'

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      padding: '8px 16px',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '80%',
        gap: '4px',
      }}>
        {/* Bubble row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          {/* Assistant avatar */}
          {!isUser && (
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #F5F8D0, #DDEC90)',
              border: '1px solid #DDEC90',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Bot size={16} style={{ color: '#7A8A00' }} />
            </div>
          )}

          {/* Message bubble */}
          <div style={{
            background: isUser ? '#F5F8D0' : '#FFFFFF',
            border: isUser ? '1px solid #BBCB64' : '1px solid #DDEC90',
            borderRadius: isUser ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
            padding: '10px 14px',
            fontSize: '14px',
            lineHeight: 1.6,
            color: '#1A1A00',
            fontFamily: "'Inter', sans-serif",
            opacity: isStreaming ? 0.8 : 1,
            transition: 'opacity 0.2s',
          }}>
            {content && (
              <div className={`chat-prose${isUser ? ' chat-prose-user' : ''}`}>
                <ReactMarkdown remarkPlugins={remarkPlugins} components={markdownComponents}>
                  {content}
                </ReactMarkdown>
              </div>
            )}

            {/* Image attachments */}
            {attachments && attachments.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginTop: content ? '12px' : '0',
              }}>
                {attachments.map((attachment) => (
                  <div key={attachment.id} style={{
                    border: '1px solid #DDEC90',
                    borderRadius: '8px',
                    padding: '4px',
                    background: '#FAFAF2',
                  }}>
                    <img
                      src={attachment.previewUrl}
                      alt={attachment.filename}
                      style={{
                        maxWidth: '192px',
                        maxHeight: '192px',
                        objectFit: 'contain',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        transition: 'opacity 0.15s',
                      }}
                      onClick={() => window.open(attachment.previewUrl, '_blank')}
                      title={`${attachment.filename} (click to enlarge)`}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                    />
                    <span style={{
                      display: 'block',
                      fontSize: '11px',
                      color: '#6A6A20',
                      textAlign: 'center',
                      marginTop: '4px',
                      fontFamily: 'monospace',
                    }}>
                      {attachment.filename}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Streaming cursor */}
            {isStreaming && (
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '16px',
                background: '#BBCB64',
                marginLeft: '4px',
                borderRadius: '2px',
                verticalAlign: 'middle',
                animation: 'pulse 1s ease-in-out infinite',
              }} />
            )}
          </div>

          {/* User avatar */}
          {isUser && (
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: '#BBCB64',
              border: '1px solid #7A8A00',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <User size={16} style={{ color: '#1A1A00' }} />
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span style={{
          fontSize: '11px',
          color: '#9A9A60',
          fontFamily: 'monospace',
          padding: '0 4px',
        }}>
          {timeString}
        </span>
      </div>
    </div>
  )
})
