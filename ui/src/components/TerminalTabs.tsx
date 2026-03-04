/**
 * Terminal Tabs Component
 *
 * Manages multiple terminal tabs with add, rename, and close functionality.
 * Supports inline rename via double-click and context menu.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Plus, X } from 'lucide-react'
import type { TerminalInfo } from '@/lib/types'
import { isSubmitEnter } from '@/lib/keyboard'

interface TerminalTabsProps {
  terminals: TerminalInfo[]
  activeTerminalId: string | null
  onSelect: (terminalId: string) => void
  onCreate: () => void
  onRename: (terminalId: string, newName: string) => void
  onClose: (terminalId: string) => void
}

interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  terminalId: string | null
}

export function TerminalTabs({ terminals, activeTerminalId, onSelect, onCreate, onRename, onClose }: TerminalTabsProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ visible: false, x: 0, y: 0, terminalId: null })
  const inputRef = useRef<HTMLInputElement>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editingId && inputRef.current) { inputRef.current.focus(); inputRef.current.select() }
  }, [editingId])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu((prev) => ({ ...prev, visible: false }))
      }
    }
    if (contextMenu.visible) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [contextMenu.visible])

  const startEditing = useCallback((terminal: TerminalInfo) => {
    setEditingId(terminal.id)
    setEditValue(terminal.name)
    setContextMenu((prev) => ({ ...prev, visible: false }))
  }, [])

  const submitEdit = useCallback(() => {
    if (editingId && editValue.trim()) onRename(editingId, editValue.trim())
    setEditingId(null)
    setEditValue('')
  }, [editingId, editValue, onRename])

  const cancelEdit = useCallback(() => { setEditingId(null); setEditValue('') }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isSubmitEnter(e, false)) { e.preventDefault(); submitEdit() }
    else if (e.key === 'Escape') { e.preventDefault(); cancelEdit() }
  }, [submitEdit, cancelEdit])

  const handleDoubleClick = useCallback((terminal: TerminalInfo) => { startEditing(terminal) }, [startEditing])

  const handleContextMenu = useCallback((e: React.MouseEvent, terminalId: string) => {
    e.preventDefault()
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, terminalId })
  }, [])

  const handleContextMenuRename = useCallback(() => {
    if (contextMenu.terminalId) {
      const terminal = terminals.find((t) => t.id === contextMenu.terminalId)
      if (terminal) startEditing(terminal)
    }
  }, [contextMenu.terminalId, terminals, startEditing])

  const handleContextMenuClose = useCallback(() => {
    if (contextMenu.terminalId) onClose(contextMenu.terminalId)
    setContextMenu((prev) => ({ ...prev, visible: false }))
  }, [contextMenu.terminalId, onClose])

  const handleClose = useCallback((e: React.MouseEvent, terminalId: string) => {
    e.stopPropagation()
    onClose(terminalId)
  }, [onClose])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '4px',
      padding: '4px 8px',
      background: '#18181A',
      borderBottom: '1px solid #2E2E30',
      overflowX: 'auto',
      flexShrink: 0,
    }}>
      {/* Terminal tabs */}
      {terminals.map((terminal) => {
        const isActive = activeTerminalId === terminal.id
        return (
          <div
            key={terminal.id}
            onClick={() => onSelect(terminal.id)}
            onDoubleClick={() => handleDoubleClick(terminal)}
            onContextMenu={(e) => handleContextMenu(e, terminal.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '4px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              userSelect: 'none',
              minWidth: 0,
              flexShrink: 0,
              background: isActive ? '#BBCB64' : '#2A2A2C',
              color: isActive ? '#1A1A00' : '#A0A0A8',
              transition: 'background 0.12s, color 0.12s',
            }}
            onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#323234' }}
            onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#2A2A2C' }}
          >
            {editingId === terminal.id ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={submitEdit}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                style={{
                  height: '22px',
                  padding: '0 4px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  width: '96px',
                  background: '#1A1A1C',
                  border: '1px solid #BBCB64',
                  borderRadius: '4px',
                  color: '#E0E0E0',
                  outline: 'none',
                }}
              />
            ) : (
              <span style={{
                fontSize: '12px',
                fontFamily: 'monospace',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '120px',
              }}>
                {terminal.name}
              </span>
            )}

            {/* Close button */}
            {terminals.length > 1 && (
              <button
                onClick={(e) => handleClose(e, terminal.id)}
                title="Close terminal"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '16px', height: '16px',
                  background: 'transparent', border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  color: isActive ? '#1A1A00' : '#606068',
                  opacity: 0,
                  transition: 'opacity 0.1s, background 0.1s',
                  padding: 0,
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.opacity = '1'
                  el.style.background = isActive ? 'rgba(26,26,0,0.2)' : 'rgba(255,255,255,0.15)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.opacity = '0'
                  el.style.background = 'transparent'
                }}
              >
                <X size={10} />
              </button>
            )}
          </div>
        )
      })}

      {/* Add new terminal */}
      <button
        onClick={onCreate}
        title="New terminal"
        style={{
          width: '28px', height: '28px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#2A2A2C', border: 'none',
          borderRadius: '6px', cursor: 'pointer',
          color: '#A0A0A8', transition: 'background 0.12s',
          flexShrink: 0,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#323234' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#2A2A2C' }}
      >
        <Plus size={14} />
      </button>

      {/* Context menu */}
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          style={{
            position: 'fixed',
            zIndex: 100,
            left: contextMenu.x,
            top: contextMenu.y,
            background: '#1E1E20',
            border: '1px solid #3A3A3C',
            borderRadius: '8px',
            padding: '4px',
            minWidth: '120px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          <button
            onClick={handleContextMenuRename}
            style={{
              width: '100%', textAlign: 'left',
              padding: '6px 12px',
              background: 'transparent', border: 'none',
              borderRadius: '4px',
              fontSize: '12px', fontFamily: 'monospace',
              color: '#E0E0E0', cursor: 'pointer',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#2A2A2C' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            Rename
          </button>
          {terminals.length > 1 && (
            <button
              onClick={handleContextMenuClose}
              style={{
                width: '100%', textAlign: 'left',
                padding: '6px 12px',
                background: 'transparent', border: 'none',
                borderRadius: '4px',
                fontSize: '12px', fontFamily: 'monospace',
                color: '#F0A060', cursor: 'pointer',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(240,96,60,0.15)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              Close
            </button>
          )}
        </div>
      )}
    </div>
  )
}
