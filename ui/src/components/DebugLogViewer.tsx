/**
 * Debug Log Viewer Component
 *
 * Collapsible panel at the bottom of the screen showing real-time
 * agent output (tool calls, results, steps). Similar to browser DevTools.
 * Features a resizable height via drag handle and tabs for different log sources.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { ChevronUp, ChevronDown, Trash2, Terminal as TerminalIcon, GripHorizontal, Cpu, Server } from 'lucide-react'
import { Terminal } from './Terminal'
import { TerminalTabs } from './TerminalTabs'
import { listTerminals, createTerminal, renameTerminal, deleteTerminal } from '@/lib/api'
import type { TerminalInfo } from '@/lib/types'

const MIN_HEIGHT = 150
const MAX_HEIGHT = 600
const DEFAULT_HEIGHT = 288
const STORAGE_KEY = 'debug-panel-height'
const TAB_STORAGE_KEY = 'debug-panel-tab'

type TabType = 'agent' | 'devserver' | 'terminal'

interface DebugLogViewerProps {
  logs: Array<{ line: string; timestamp: string }>
  devLogs: Array<{ line: string; timestamp: string }>
  isOpen: boolean
  onToggle: () => void
  onClear: () => void
  onClearDevLogs: () => void
  onHeightChange?: (height: number) => void
  projectName: string
  activeTab?: TabType
  onTabChange?: (tab: TabType) => void
}

type LogLevel = 'error' | 'warn' | 'debug' | 'info'

export function DebugLogViewer({
  logs,
  devLogs,
  isOpen,
  onToggle,
  onClear,
  onClearDevLogs,
  onHeightChange,
  projectName,
  activeTab: controlledActiveTab,
  onTabChange,
}: DebugLogViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const devScrollRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [devAutoScroll, setDevAutoScroll] = useState(true)
  const [isResizing, setIsResizing] = useState(false)
  const [panelHeight, setPanelHeight] = useState(() => {
    // Load saved height from localStorage
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? Math.min(Math.max(parseInt(saved, 10), MIN_HEIGHT), MAX_HEIGHT) : DEFAULT_HEIGHT
  })
  const [internalActiveTab, setInternalActiveTab] = useState<TabType>(() => {
    // Load saved tab from localStorage
    const saved = localStorage.getItem(TAB_STORAGE_KEY)
    return (saved as TabType) || 'agent'
  })

  // Terminal management state
  const [terminals, setTerminals] = useState<TerminalInfo[]>([])
  const [activeTerminalId, setActiveTerminalId] = useState<string | null>(null)
  const [isLoadingTerminals, setIsLoadingTerminals] = useState(false)

  // Use controlled tab if provided, otherwise use internal state
  const activeTab = controlledActiveTab ?? internalActiveTab
  const setActiveTab = (tab: TabType) => {
    setInternalActiveTab(tab)
    localStorage.setItem(TAB_STORAGE_KEY, tab)
    onTabChange?.(tab)
  }

  // Fetch terminals for the project
  const fetchTerminals = useCallback(async () => {
    if (!projectName) return

    setIsLoadingTerminals(true)
    try {
      const terminalList = await listTerminals(projectName)
      setTerminals(terminalList)

      // Set active terminal to first one if not set or current one doesn't exist
      if (terminalList.length > 0) {
        if (!activeTerminalId || !terminalList.find((t) => t.id === activeTerminalId)) {
          setActiveTerminalId(terminalList[0].id)
        }
      }
    } catch (err) {
      console.error('Failed to fetch terminals:', err)
    } finally {
      setIsLoadingTerminals(false)
    }
  }, [projectName, activeTerminalId])

  // Handle creating a new terminal
  const handleCreateTerminal = useCallback(async () => {
    if (!projectName) return

    try {
      const newTerminal = await createTerminal(projectName)
      setTerminals((prev) => [...prev, newTerminal])
      setActiveTerminalId(newTerminal.id)
    } catch (err) {
      console.error('Failed to create terminal:', err)
    }
  }, [projectName])

  // Handle renaming a terminal
  const handleRenameTerminal = useCallback(
    async (terminalId: string, newName: string) => {
      if (!projectName) return

      try {
        const updated = await renameTerminal(projectName, terminalId, newName)
        setTerminals((prev) =>
          prev.map((t) => (t.id === terminalId ? updated : t))
        )
      } catch (err) {
        console.error('Failed to rename terminal:', err)
      }
    },
    [projectName]
  )

  // Handle closing a terminal
  const handleCloseTerminal = useCallback(
    async (terminalId: string) => {
      if (!projectName || terminals.length <= 1) return

      try {
        await deleteTerminal(projectName, terminalId)
        setTerminals((prev) => prev.filter((t) => t.id !== terminalId))

        // If we closed the active terminal, switch to another one
        if (activeTerminalId === terminalId) {
          const remaining = terminals.filter((t) => t.id !== terminalId)
          if (remaining.length > 0) {
            setActiveTerminalId(remaining[0].id)
          }
        }
      } catch (err) {
        console.error('Failed to close terminal:', err)
      }
    },
    [projectName, terminals, activeTerminalId]
  )

  // Fetch terminals when project changes
  useEffect(() => {
    if (projectName) {
      fetchTerminals()
    } else {
      setTerminals([])
      setActiveTerminalId(null)
    }
  }, [projectName]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom when new agent logs arrive (if user hasn't scrolled up)
  useEffect(() => {
    if (autoScroll && scrollRef.current && isOpen && activeTab === 'agent') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs, autoScroll, isOpen, activeTab])

  // Auto-scroll to bottom when new dev logs arrive (if user hasn't scrolled up)
  useEffect(() => {
    if (devAutoScroll && devScrollRef.current && isOpen && activeTab === 'devserver') {
      devScrollRef.current.scrollTop = devScrollRef.current.scrollHeight
    }
  }, [devLogs, devAutoScroll, isOpen, activeTab])

  // Notify parent of height changes
  useEffect(() => {
    if (onHeightChange && isOpen) {
      onHeightChange(panelHeight)
    }
  }, [panelHeight, isOpen, onHeightChange])

  // Handle mouse move during resize
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const newHeight = window.innerHeight - e.clientY
    const clampedHeight = Math.min(Math.max(newHeight, MIN_HEIGHT), MAX_HEIGHT)
    setPanelHeight(clampedHeight)
  }, [])

  // Handle mouse up to stop resizing
  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, panelHeight.toString())
  }, [panelHeight])

  // Set up global mouse event listeners during resize
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'ns-resize'
      document.body.style.userSelect = 'none'
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  // Start resizing
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
  }

  // Detect if user scrolled up (agent logs)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 50
    setAutoScroll(isAtBottom)
  }

  // Detect if user scrolled up (dev logs)
  const handleDevScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 50
    setDevAutoScroll(isAtBottom)
  }

  // Handle clear button based on active tab
  const handleClear = () => {
    if (activeTab === 'agent') {
      onClear()
    } else if (activeTab === 'devserver') {
      onClearDevLogs()
    }
    // Terminal has no clear button (it's managed internally)
  }

  // Get the current log count based on active tab
  const getCurrentLogCount = () => {
    if (activeTab === 'agent') return logs.length
    if (activeTab === 'devserver') return devLogs.length
    return 0
  }

  // Check if current tab has auto-scroll paused
  const isAutoScrollPaused = () => {
    if (activeTab === 'agent') return !autoScroll
    if (activeTab === 'devserver') return !devAutoScroll
    return false
  }

  // Parse log level from line content
  const getLogLevel = (line: string): LogLevel => {
    const lowerLine = line.toLowerCase()
    if (lowerLine.includes('error') || lowerLine.includes('exception') || lowerLine.includes('traceback')) {
      return 'error'
    }
    if (lowerLine.includes('warn') || lowerLine.includes('warning')) {
      return 'warn'
    }
    if (lowerLine.includes('debug')) {
      return 'debug'
    }
    return 'info'
  }

  // Get inline style color for log level using design palette
  const getLogColor = (level: LogLevel): string => {
    switch (level) {
      case 'error':
        return '#F79A19'
      case 'warn':
        return '#FFE52A'
      case 'debug':
        return '#6A6A20'
      case 'info':
      default:
        return '#BBCB64'
    }
  }

  // Format timestamp to HH:MM:SS
  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } catch {
      return ''
    }
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 ${
        isResizing ? '' : 'transition-all duration-200'
      }`}
      style={{ height: isOpen ? panelHeight : 40 }}
    >
      {/* Resize handle - only visible when open */}
      {isOpen && (
        <div
          className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize group flex items-center justify-center -translate-y-1/2 z-50"
          onMouseDown={handleResizeStart}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: '64px',
              height: '6px',
              background: '#DDEC90',
              borderRadius: '9999px',
              transition: 'background 150ms ease',
            }}
          >
            <GripHorizontal size={12} style={{ color: '#6A6A20' }} />
          </div>
        </div>
      )}

      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '40px',
          padding: '0 16px',
          background: '#1A1A00',
          borderTop: '1px solid #DDEC90',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Collapse/expand toggle */}
          <button
            onClick={onToggle}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 8px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(187,203,100,0.12)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <TerminalIcon size={16} style={{ color: '#BBCB64' }} />
            <span style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: '13px',
              color: '#BBCB64',
              fontWeight: 700,
            }}>
              Debug
            </span>
            <span style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: '10px',
              color: '#6A6A20',
              background: 'rgba(187,203,100,0.12)',
              padding: '1px 6px',
              borderRadius: '9999px',
            }}>
              D
            </span>
          </button>

          {/* Tabs - only visible when open */}
          {isOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '16px' }}>
              {/* Agent tab */}
              <button
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  setActiveTab('agent')
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '28px',
                  padding: '0 10px',
                  borderRadius: '8px',
                  border: 'none',
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'background 150ms ease',
                  background: activeTab === 'agent' ? 'rgba(187,203,100,0.2)' : 'transparent',
                  color: activeTab === 'agent' ? '#BBCB64' : '#6A6A20',
                }}
              >
                <Cpu size={12} />
                Agent
                {logs.length > 0 && (
                  <span style={{
                    height: '16px',
                    padding: '0 6px',
                    fontSize: '10px',
                    borderRadius: '9999px',
                    background: '#BBCB64',
                    color: '#1A1A00',
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontWeight: 600,
                  }}>
                    {logs.length}
                  </span>
                )}
              </button>

              {/* Dev Server tab */}
              <button
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  setActiveTab('devserver')
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '28px',
                  padding: '0 10px',
                  borderRadius: '8px',
                  border: 'none',
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'background 150ms ease',
                  background: activeTab === 'devserver' ? 'rgba(187,203,100,0.2)' : 'transparent',
                  color: activeTab === 'devserver' ? '#BBCB64' : '#6A6A20',
                }}
              >
                <Server size={12} />
                Dev Server
                {devLogs.length > 0 && (
                  <span style={{
                    height: '16px',
                    padding: '0 6px',
                    fontSize: '10px',
                    borderRadius: '9999px',
                    background: '#BBCB64',
                    color: '#1A1A00',
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontWeight: 600,
                  }}>
                    {devLogs.length}
                  </span>
                )}
              </button>

              {/* Terminal tab */}
              <button
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  setActiveTab('terminal')
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '28px',
                  padding: '0 10px',
                  borderRadius: '8px',
                  border: 'none',
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'background 150ms ease',
                  background: activeTab === 'terminal' ? 'rgba(187,203,100,0.2)' : 'transparent',
                  color: activeTab === 'terminal' ? '#BBCB64' : '#6A6A20',
                }}
              >
                <TerminalIcon size={12} />
                Terminal
                <span style={{
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontSize: '10px',
                  color: '#6A6A20',
                  border: '1px solid rgba(106,106,32,0.3)',
                  padding: '0 5px',
                  borderRadius: '9999px',
                  lineHeight: '16px',
                }}>
                  T
                </span>
              </button>
            </div>
          )}

          {/* Log count and status - only for log tabs */}
          {isOpen && activeTab !== 'terminal' && (
            <>
              {getCurrentLogCount() > 0 && (
                <span style={{
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontSize: '11px',
                  color: '#6A6A20',
                  marginLeft: '8px',
                }}>
                  {getCurrentLogCount()}
                </span>
              )}
              {isAutoScrollPaused() && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: '#1A1A00',
                  background: '#FFE52A',
                  padding: '1px 8px',
                  borderRadius: '9999px',
                }}>
                  Paused
                </span>
              )}
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Clear button - only for log tabs */}
          {isOpen && activeTab !== 'terminal' && (
            <button
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                handleClear()
              }}
              title="Clear logs"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(187,203,100,0.12)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <Trash2 size={14} style={{ color: '#6A6A20' }} />
            </button>
          )}
          <div style={{ padding: '4px' }}>
            {isOpen ? (
              <ChevronDown size={16} style={{ color: '#6A6A20' }} />
            ) : (
              <ChevronUp size={16} style={{ color: '#6A6A20' }} />
            )}
          </div>
        </div>
      </div>

      {/* Content area */}
      {isOpen && (
        <div
          style={{
            height: 'calc(100% - 40px)',
            background: '#1A1A00',
            borderRadius: '0',
          }}
        >
          {/* Agent Logs Tab */}
          {activeTab === 'agent' && (
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              style={{
                height: '100%',
                overflowY: 'auto',
                padding: '8px',
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: '13px',
              }}
            >
              {logs.length === 0 ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#6A6A20',
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                }}>
                  No logs yet. Start the agent to see output.
                </div>
              ) : (
                <div>
                  {logs.map((log, index) => {
                    const level = getLogLevel(log.line)
                    const logColor = getLogColor(level)
                    const timestamp = formatTimestamp(log.timestamp)

                    return (
                      <div
                        key={`${log.timestamp}-${index}`}
                        style={{
                          display: 'flex',
                          gap: '8px',
                          padding: '2px 4px',
                          borderRadius: '4px',
                          transition: 'background 100ms ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(187,203,100,0.06)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                      >
                        <span style={{
                          color: '#6A6A20',
                          userSelect: 'none',
                          flexShrink: 0,
                          fontSize: '12px',
                        }}>
                          {timestamp}
                        </span>
                        <span style={{
                          color: logColor,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                        }}>
                          {log.line}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Dev Server Logs Tab */}
          {activeTab === 'devserver' && (
            <div
              ref={devScrollRef}
              onScroll={handleDevScroll}
              style={{
                height: '100%',
                overflowY: 'auto',
                padding: '8px',
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: '13px',
              }}
            >
              {devLogs.length === 0 ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#6A6A20',
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                }}>
                  No dev server logs yet.
                </div>
              ) : (
                <div>
                  {devLogs.map((log, index) => {
                    const level = getLogLevel(log.line)
                    const logColor = getLogColor(level)
                    const timestamp = formatTimestamp(log.timestamp)

                    return (
                      <div
                        key={`${log.timestamp}-${index}`}
                        style={{
                          display: 'flex',
                          gap: '8px',
                          padding: '2px 4px',
                          borderRadius: '4px',
                          transition: 'background 100ms ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(187,203,100,0.06)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                      >
                        <span style={{
                          color: '#6A6A20',
                          userSelect: 'none',
                          flexShrink: 0,
                          fontSize: '12px',
                        }}>
                          {timestamp}
                        </span>
                        <span style={{
                          color: logColor,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                        }}>
                          {log.line}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Terminal Tab */}
          {activeTab === 'terminal' && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Terminal tabs bar */}
              {terminals.length > 0 && (
                <TerminalTabs
                  terminals={terminals}
                  activeTerminalId={activeTerminalId}
                  onSelect={setActiveTerminalId}
                  onCreate={handleCreateTerminal}
                  onRename={handleRenameTerminal}
                  onClose={handleCloseTerminal}
                />
              )}

              {/* Terminal content - render all terminals and show/hide to preserve buffers */}
              <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                {isLoadingTerminals ? (
                  <div style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6A6A20',
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    fontSize: '13px',
                  }}>
                    Loading terminals...
                  </div>
                ) : terminals.length === 0 ? (
                  <div style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6A6A20',
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    fontSize: '13px',
                  }}>
                    No terminal available
                  </div>
                ) : (
                  /* Render all terminals stacked on top of each other.
                   * Active terminal is visible and receives input.
                   * Inactive terminals are moved off-screen with transform to:
                   * 1. Trigger IntersectionObserver (xterm.js pauses rendering)
                   * 2. Preserve terminal buffer content
                   * 3. Allow proper dimension calculation when becoming visible
                   * Using transform instead of opacity/display:none for best xterm.js compatibility.
                   */
                  terminals.map((terminal) => {
                    const isActiveTerminal = terminal.id === activeTerminalId
                    return (
                      <div
                        key={terminal.id}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          zIndex: isActiveTerminal ? 10 : 1,
                          transform: isActiveTerminal ? 'none' : 'translateX(-200%)',
                          pointerEvents: isActiveTerminal ? 'auto' : 'none',
                        }}
                      >
                        <Terminal
                          projectName={projectName}
                          terminalId={terminal.id}
                          isActive={activeTab === 'terminal' && isActiveTerminal}
                        />
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Export the TabType for use in parent components
export type { TabType }
