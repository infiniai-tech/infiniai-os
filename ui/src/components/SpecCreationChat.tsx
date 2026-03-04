/**
 * Spec Creation Chat Component
 *
 * Full chat interface for interactive spec creation with Claude.
 * Handles the 7-phase conversation flow for creating app specifications.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { Send, X, CheckCircle2, AlertCircle, Wifi, WifiOff, RotateCcw, Loader2, ArrowRight, Zap, Paperclip, ExternalLink, FileText } from 'lucide-react'
import { useSpecChat } from '../hooks/useSpecChat'
import { ChatMessage } from './ChatMessage'
import { QuestionOptions } from './QuestionOptions'
import { TypingIndicator } from './TypingIndicator'
import type { ImageAttachment } from '../lib/types'
import { isSubmitEnter } from '../lib/keyboard'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png']

const SAMPLE_PROMPT = `Yes, that analysis looks correct. The main goal of this modernization is to move away from the legacy stack and adopt modern best practices. I want to preserve all the existing business logic and user flows. Let's go with the full rewrite approach — a clean implementation in the target stack. Keep it to around 35 features.`

type InitializerStatus = 'idle' | 'starting' | 'error'

interface SpecCreationChatProps {
  projectName: string
  onComplete: (specPath: string, yoloMode?: boolean) => void
  onCancel: () => void
  onExitToProject: () => void
  initializerStatus?: InitializerStatus
  initializerError?: string | null
  onRetryInitializer?: () => void
}

export function SpecCreationChat({
  projectName,
  onComplete,
  onCancel,
  onExitToProject,
  initializerStatus = 'idle',
  initializerError = null,
  onRetryInitializer,
}: SpecCreationChatProps) {
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [yoloEnabled, setYoloEnabled] = useState(false)
  const [pendingAttachments, setPendingAttachments] = useState<ImageAttachment[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { messages, isLoading, isComplete, connectionStatus, currentQuestions, start, sendMessage, sendAnswer, disconnect } =
    useSpecChat({ projectName, onComplete, onError: (err) => setError(err) })

  useEffect(() => {
    start()
    return () => { disconnect() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentQuestions, isLoading])

  useEffect(() => {
    if (!isLoading && !currentQuestions && inputRef.current) inputRef.current.focus()
  }, [isLoading, currentQuestions])

  const handleSendMessage = () => {
    const trimmed = input.trim()
    if ((!trimmed && pendingAttachments.length === 0) || isLoading) return
    if (/^\s*\/exit\s*$/i.test(trimmed)) { setInput(''); onExitToProject(); return }
    sendMessage(trimmed, pendingAttachments.length > 0 ? pendingAttachments : undefined)
    setInput('')
    setPendingAttachments([])
    if (inputRef.current) inputRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isSubmitEnter(e)) { e.preventDefault(); handleSendMessage() }
  }

  const handleAnswerSubmit = (answers: Record<string, string | string[]>) => {
    sendAnswer(answers)
  }

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) { setError(`Invalid file type: ${file.name}. Only JPEG and PNG supported.`); return }
      if (file.size > MAX_FILE_SIZE) { setError(`File too large: ${file.name}. Max 5 MB.`); return }
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        const attachment: ImageAttachment = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          filename: file.name, mimeType: file.type as 'image/jpeg' | 'image/png',
          base64Data: dataUrl.split(',')[1], previewUrl: dataUrl, size: file.size,
        }
        setPendingAttachments((prev) => [...prev, attachment])
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const handleRemoveAttachment = useCallback((id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault() }, [])

  const getConnectionColor = () => {
    if (connectionStatus === 'connected') return '#7A8A00'
    if (connectionStatus === 'connecting') return '#A05A00'
    if (connectionStatus === 'error') return '#CF0F0F'
    return '#9A9A60'
  }

  const ghostBtnStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '6px 12px', borderRadius: '8px',
    border: '1px solid #DDEC90', background: 'transparent',
    fontSize: '13px', fontWeight: 600, color: '#6A6A20',
    cursor: 'pointer', fontFamily: "'Inter', sans-serif",
    transition: 'all 0.15s',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#FAFAF2' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        borderBottom: '1px solid #DDEC90',
        background: '#FFFFFF',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '17px', color: '#1A1A00', margin: 0, fontFamily: "'Geist', 'Inter', sans-serif" }}>
            Modernization Oracle: {projectName}
          </h2>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '11px', fontWeight: 700,
            padding: '2px 10px', borderRadius: '9999px',
            background: connectionStatus === 'connected' ? '#F5F8D0' : '#FFF0DC',
            color: getConnectionColor(),
            border: `1px solid ${connectionStatus === 'connected' ? '#DDEC90' : '#F0C880'}`,
          }}>
            {connectionStatus === 'connected' ? <Wifi size={11} /> : <WifiOff size={11} />}
            {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'connecting' ? 'Connecting...' : connectionStatus === 'error' ? 'Error' : 'Disconnected'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isComplete && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 700, color: '#7A8A00' }}>
              <CheckCircle2 size={15} /> Complete
            </span>
          )}
          {/* Load sample */}
          <button
            style={ghostBtnStyle}
            title="Load sample prompt"
            onClick={() => {
              setInput(SAMPLE_PROMPT)
              if (inputRef.current) {
                inputRef.current.style.height = 'auto'
                inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`
              }
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F5F8D0' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <FileText size={14} />
            Load Sample
          </button>
          {/* Exit to project */}
          <button
            style={ghostBtnStyle}
            title="Exit chat and go to odyssey"
            onClick={onExitToProject}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F5F8D0' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <ExternalLink size={14} />
            Exit to Odyssey
          </button>
          <button
            onClick={onCancel}
            title="Cancel"
            style={{
              width: '32px', height: '32px', borderRadius: '8px',
              border: '1px solid #DDEC90', background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#6A6A20', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F5F8D0' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px',
          background: '#FFF0DC', borderBottom: '1px solid #F0C880',
          fontSize: '13px', color: '#A05A00', flexShrink: 0,
        }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#A05A00', padding: '2px' }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', minHeight: 0 }}>
        {messages.length === 0 && !isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '32px' }}>
            <div style={{
              background: '#FFFFFF', border: '1px solid #DDEC90',
              borderRadius: '12px', padding: '28px 32px', maxWidth: '420px',
              textAlign: 'center',
            }}>
              <h3 style={{ fontWeight: 700, fontSize: '16px', color: '#1A1A00', marginBottom: '8px', fontFamily: "'Geist', 'Inter', sans-serif" }}>
                Starting Spec Creation
              </h3>
              <p style={{ fontSize: '14px', color: '#6A6A20', margin: 0 }}>
                Connecting to Claude to help you create your app specification...
              </p>
              {connectionStatus === 'error' && (
                <button
                  onClick={start}
                  style={{
                    marginTop: '16px',
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', borderRadius: '8px',
                    background: '#BBCB64', border: 'none', color: '#1A1A00',
                    fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <RotateCcw size={14} />
                  Retry Connection
                </button>
              )}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {currentQuestions && currentQuestions.length > 0 && (
          <QuestionOptions questions={currentQuestions} onSubmit={handleAnswerSubmit} disabled={isLoading} />
        )}

        {isLoading && !currentQuestions && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {!isComplete && (
        <div
          style={{ padding: '14px 20px', borderTop: '1px solid #DDEC90', background: '#FFFFFF', flexShrink: 0 }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {/* Attachment previews */}
          {pendingAttachments.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              {pendingAttachments.map((attachment) => (
                <div key={attachment.id} style={{ position: 'relative', border: '1px solid #DDEC90', padding: '4px', background: '#FAFAF2', borderRadius: '8px' }}>
                  <img src={attachment.previewUrl} alt={attachment.filename} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '6px', display: 'block' }} />
                  <button onClick={() => handleRemoveAttachment(attachment.id)} title="Remove" style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', background: '#A05A00', color: '#FFFFFF', border: '2px solid #FFFFFF', borderRadius: '9999px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                    <X size={10} />
                  </button>
                  <span style={{ display: 'block', fontSize: '10px', color: '#6A6A20', maxWidth: '64px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center', marginTop: '2px' }}>
                    {attachment.filename.length > 10 ? `${attachment.filename.substring(0, 7)}...` : attachment.filename}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" multiple onChange={(e) => handleFileSelect(e.target.files)} style={{ display: 'none' }} />

            {/* Attach */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={connectionStatus !== 'connected'}
              title="Attach image (JPEG, PNG - max 5MB)"
              style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #DDEC90', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: connectionStatus !== 'connected' ? 'not-allowed' : 'pointer', color: '#7A8A00', transition: 'all 0.15s', flexShrink: 0 }}
              onMouseEnter={e => { if (connectionStatus === 'connected') (e.currentTarget as HTMLElement).style.background = '#F5F8D0' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <Paperclip size={16} />
            </button>

            {/* Textarea */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`
              }}
              onKeyDown={handleKeyDown}
              placeholder={currentQuestions ? 'Or type a custom response...' : pendingAttachments.length > 0 ? 'Add a message with your image(s)...' : 'Type your response... (or /exit to go to odyssey)'}
              disabled={(isLoading && !currentQuestions) || connectionStatus !== 'connected'}
              rows={1}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #DDEC90',
                fontSize: '14px',
                fontFamily: "'Inter', sans-serif",
                color: '#1A1A00',
                background: '#FFFFFF',
                outline: 'none',
                resize: 'none',
                minHeight: '46px',
                maxHeight: '200px',
                overflowY: 'auto',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                opacity: ((isLoading && !currentQuestions) || connectionStatus !== 'connected') ? 0.6 : 1,
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#BBCB64'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(187,203,100,0.12)' }}
              onBlur={e => { e.currentTarget.style.borderColor = '#DDEC90'; e.currentTarget.style.boxShadow = 'none' }}
            />

            {/* Send */}
            <button
              onClick={handleSendMessage}
              disabled={(!input.trim() && pendingAttachments.length === 0) || (isLoading && !currentQuestions) || connectionStatus !== 'connected'}
              style={{
                width: '36px', height: '36px', borderRadius: '8px', border: 'none',
                background: '#BBCB64',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: ((!input.trim() && pendingAttachments.length === 0) || (isLoading && !currentQuestions) || connectionStatus !== 'connected') ? 'not-allowed' : 'pointer',
                opacity: ((!input.trim() && pendingAttachments.length === 0) || (isLoading && !currentQuestions) || connectionStatus !== 'connected') ? 0.4 : 1,
                color: '#1A1A00', transition: 'opacity 0.15s', flexShrink: 0,
              }}
            >
              <Send size={16} />
            </button>
          </div>

          <p style={{ fontSize: '11px', color: '#9A9A60', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Press Enter to send, Shift+Enter for new line. Drag & drop or click <Paperclip size={11} style={{ display: 'inline' }} /> to attach images.
          </p>
        </div>
      )}

      {/* Completion footer */}
      {isComplete && (
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid #DDEC90',
          background: initializerStatus === 'error' ? '#FFF0DC' : '#F5F8D0',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: initializerStatus === 'error' ? '#A05A00' : '#7A8A00' }}>
              {initializerStatus === 'starting' ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Summoning the gods{yoloEnabled ? ' (YOLO mode)' : ''}...
                </>
              ) : initializerStatus === 'error' ? (
                <>
                  <AlertCircle size={18} />
                  {initializerError || 'The gods could not be summoned'}
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  The sacred texts have been inscribed!
                </>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {initializerStatus === 'error' && onRetryInitializer && (
                <button
                  onClick={onRetryInitializer}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', border: '1px solid #F0C880', background: '#FFFFFF', color: '#A05A00', fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
                >
                  <RotateCcw size={14} />
                  Retry
                </button>
              )}
              {initializerStatus === 'idle' && (
                <>
                  {/* YOLO toggle */}
                  <button
                    onClick={() => setYoloEnabled(!yoloEnabled)}
                    title="YOLO Mode: Skip testing for rapid prototyping"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '7px 14px', borderRadius: '8px',
                      border: yoloEnabled ? '1px solid #F0C880' : '1px solid #DDEC90',
                      background: yoloEnabled ? '#FFF0DC' : 'transparent',
                      color: yoloEnabled ? '#A05A00' : '#6A6A20',
                      fontWeight: yoloEnabled ? 700 : 600, fontSize: '13px', cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif", transition: 'all 0.15s',
                    }}
                  >
                    <Zap size={14} />
                    YOLO
                  </button>
                  <button
                    onClick={() => onComplete('', yoloEnabled)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '8px 18px', borderRadius: '8px', border: 'none',
                      background: '#BBCB64', color: '#1A1A00', fontWeight: 700, fontSize: '14px',
                      cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Begin the Odyssey
                    <ArrowRight size={15} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
