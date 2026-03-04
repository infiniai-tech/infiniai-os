/**
 * Folder Browser Component
 *
 * Server-side filesystem browser for selecting project directories.
 * Cross-platform support for Windows, macOS, and Linux.
 */

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Folder, FolderOpen, ChevronRight, HardDrive, Loader2, AlertCircle, FolderPlus, ArrowLeft } from 'lucide-react'
import * as api from '../lib/api'
import { isSubmitEnter } from '../lib/keyboard'
import type { DirectoryEntry, DriveInfo } from '../lib/types'

interface FolderBrowserProps {
  onSelect: (path: string) => void
  onCancel: () => void
  initialPath?: string
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '7px 10px',
  borderRadius: '8px',
  border: '1px solid #DDEC90',
  fontSize: '13px',
  fontFamily: "'Inter', sans-serif",
  color: '#1A1A00',
  background: '#FFFFFF',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
}

export function FolderBrowser({ onSelect, onCancel, initialPath }: FolderBrowserProps) {
  const [currentPath, setCurrentPath] = useState<string | undefined>(initialPath)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)

  const { data: directoryData, isLoading, error, refetch } = useQuery({
    queryKey: ['filesystem', 'list', currentPath],
    queryFn: () => api.listDirectory(currentPath),
  })

  useEffect(() => {
    if (directoryData?.current_path) setSelectedPath(directoryData.current_path)
  }, [directoryData?.current_path])

  const handleNavigate = (path: string) => {
    setCurrentPath(path)
    setSelectedPath(path)
    setIsCreatingFolder(false)
    setNewFolderName('')
    setCreateError(null)
  }

  const handleNavigateUp = () => {
    if (directoryData?.parent_path) handleNavigate(directoryData.parent_path)
  }

  const handleDriveSelect = (drive: DriveInfo) => { handleNavigate(`${drive.letter}:/`) }

  const handleEntryClick = (entry: DirectoryEntry) => {
    if (entry.is_directory) handleNavigate(entry.path)
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) { setCreateError('Folder name is required'); return }
    if (!/^[a-zA-Z0-9_\-. ]+$/.test(newFolderName)) { setCreateError('Invalid folder name'); return }
    const newPath = `${directoryData?.current_path}/${newFolderName.trim()}`
    try {
      await api.createDirectory(newPath)
      await refetch()
      handleNavigate(newPath)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create folder')
    }
  }

  const handleSelect = () => { if (selectedPath) onSelect(selectedPath) }

  const getBreadcrumbs = (path: string): { name: string; path: string }[] => {
    if (!path) return []
    const segments: { name: string; path: string }[] = []
    if (/^[A-Za-z]:/.test(path)) {
      const drive = path.slice(0, 2)
      segments.push({ name: drive, path: `${drive}/` })
      path = path.slice(3)
    } else if (path.startsWith('/')) {
      segments.push({ name: '/', path: '/' })
      path = path.slice(1)
    }
    const parts = path.split('/').filter(Boolean)
    let cp = segments.length > 0 ? segments[0].path : ''
    for (const part of parts) {
      cp = cp.endsWith('/') ? cp + part : cp + '/' + part
      segments.push({ name: part, path: cp })
    }
    return segments
  }

  const breadcrumbs = directoryData?.current_path ? getBreadcrumbs(directoryData.current_path) : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '70vh', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{
        flexShrink: 0, padding: '14px 16px',
        borderBottom: '1px solid #DDEC90',
        background: 'linear-gradient(to bottom, #FAFAF2, #FFFFFF)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Folder size={18} style={{ color: '#7A8A00' }} />
          <span style={{ fontWeight: 700, fontSize: '14px', color: '#1A1A00' }}>Select Project Folder</span>
        </div>

        {/* Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
          {directoryData?.parent_path && (
            <button
              onClick={handleNavigateUp}
              title="Go up"
              style={{
                width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '6px', border: '1px solid #DDEC90', background: 'transparent',
                cursor: 'pointer', color: '#7A8A00', transition: 'all 0.12s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F5F8D0' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <ArrowLeft size={14} />
            </button>
          )}
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.path} style={{ display: 'flex', alignItems: 'center' }}>
              {index > 0 && <ChevronRight size={13} style={{ color: '#9A9A60', margin: '0 2px' }} />}
              <button
                onClick={() => handleNavigate(crumb.path)}
                style={{
                  padding: '3px 8px', borderRadius: '6px',
                  border: 'none', background: 'transparent',
                  fontSize: '12px',
                  fontWeight: index === breadcrumbs.length - 1 ? 700 : 400,
                  color: index === breadcrumbs.length - 1 ? '#1A1A00' : '#6A6A20',
                  cursor: 'pointer', fontFamily: 'monospace',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F5F8D0' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Drive selector (Windows) */}
      {directoryData?.drives && directoryData.drives.length > 0 && (
        <div style={{
          flexShrink: 0, padding: '8px 16px',
          borderBottom: '1px solid #DDEC90',
          background: '#FAFAF2',
          display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#6A6A20' }}>Drives:</span>
          {directoryData.drives.map((drive) => (
            <button
              key={drive.letter}
              onClick={() => handleDriveSelect(drive)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '4px 10px', borderRadius: '9999px',
                border: currentPath?.startsWith(drive.letter) ? '1px solid #BBCB64' : '1px solid #DDEC90',
                background: currentPath?.startsWith(drive.letter) ? '#F5F8D0' : 'transparent',
                color: currentPath?.startsWith(drive.letter) ? '#7A8A00' : '#6A6A20',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'monospace', transition: 'all 0.12s',
              }}
            >
              <HardDrive size={12} />
              {drive.letter}: {drive.label && `(${drive.label})`}
            </button>
          ))}
        </div>
      )}

      {/* Directory listing */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', background: '#FFFFFF', padding: '8px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
            <Loader2 size={24} style={{ color: '#7A8A00', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : error ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <AlertCircle size={28} style={{ color: '#A05A00', margin: '0 auto 8px' }} />
            <p style={{ color: '#A05A00', fontSize: '13px', marginBottom: '10px' }}>
              {error instanceof Error ? error.message : 'Failed to load directory'}
            </p>
            <button
              onClick={() => refetch()}
              style={{ padding: '5px 14px', borderRadius: '8px', border: '1px solid #DDEC90', background: '#FFFFFF', color: '#6A6A20', fontWeight: 600, fontSize: '12px', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
            >
              Retry
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {directoryData?.entries.filter((entry) => entry.is_directory).map((entry) => {
              const isSelected = selectedPath === entry.path
              return (
                <button
                  key={entry.path}
                  onClick={() => handleEntryClick(entry)}
                  onDoubleClick={() => handleNavigate(entry.path)}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '7px 10px',
                    borderRadius: '7px',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    border: isSelected ? '1px solid #BBCB64' : '1px solid transparent',
                    background: isSelected ? '#F5F8D0' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#FAFAF2' }}
                  onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  {isSelected
                    ? <FolderOpen size={16} style={{ color: '#7A8A00', flexShrink: 0 }} />
                    : <Folder size={16} style={{ color: '#9A9A60', flexShrink: 0 }} />
                  }
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px', color: '#1A1A00' }}>
                    {entry.name}
                  </span>
                  {entry.has_children && (
                    <ChevronRight size={13} style={{ color: '#9A9A60', flexShrink: 0 }} />
                  )}
                </button>
              )
            })}

            {directoryData?.entries.filter((e) => e.is_directory).length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <Folder size={28} style={{ color: '#DDEC90', margin: '0 auto 8px' }} />
                <p style={{ fontSize: '13px', color: '#6A6A20', margin: '0 0 4px' }}>No subfolders</p>
                <p style={{ fontSize: '12px', color: '#9A9A60', margin: 0 }}>You can create a new folder or select this directory.</p>
              </div>
            )}
          </div>
        )}

        {/* New folder input */}
        {isCreatingFolder && (
          <div style={{
            marginTop: '8px',
            padding: '10px 12px',
            background: '#FAFAF2',
            border: '1px solid #DDEC90',
            borderRadius: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: createError ? '6px' : 0 }}>
              <FolderPlus size={15} style={{ color: '#7A8A00', flexShrink: 0 }} />
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="New folder name"
                autoFocus
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = '#BBCB64'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(187,203,100,0.12)' }}
                onBlur={e => { e.currentTarget.style.borderColor = '#DDEC90'; e.currentTarget.style.boxShadow = 'none' }}
                onKeyDown={(e) => {
                  if (isSubmitEnter(e, false)) handleCreateFolder()
                  if (e.key === 'Escape') { setIsCreatingFolder(false); setNewFolderName(''); setCreateError(null) }
                }}
              />
              <button
                onClick={handleCreateFolder}
                style={{ padding: '6px 12px', borderRadius: '7px', border: 'none', background: '#BBCB64', color: '#1A1A00', fontWeight: 700, fontSize: '12px', cursor: 'pointer', fontFamily: "'Inter', sans-serif", flexShrink: 0 }}
              >
                Create
              </button>
              <button
                onClick={() => { setIsCreatingFolder(false); setNewFolderName(''); setCreateError(null) }}
                style={{ padding: '6px 12px', borderRadius: '7px', border: '1px solid #DDEC90', background: 'transparent', color: '#6A6A20', fontWeight: 600, fontSize: '12px', cursor: 'pointer', fontFamily: "'Inter', sans-serif", flexShrink: 0 }}
              >
                Cancel
              </button>
            </div>
            {createError && (
              <p style={{ fontSize: '12px', color: '#A05A00', margin: 0 }}>{createError}</p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        flexShrink: 0, padding: '12px 16px',
        borderTop: '1px solid #DDEC90',
        background: '#FAFAF2',
      }}>
        {/* Selected path */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #DDEC90',
          borderRadius: '8px',
          padding: '8px 12px',
          marginBottom: '10px',
        }}>
          <div style={{ fontSize: '11px', color: '#9A9A60', marginBottom: '3px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Selected path:
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#1A1A00', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedPath || 'No folder selected'}
          </div>
          {selectedPath && (
            <div style={{ fontSize: '11px', color: '#6A6A20', marginTop: '4px', fontStyle: 'italic' }}>
              This folder will contain all project files
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => setIsCreatingFolder(true)}
            disabled={isCreatingFolder}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '8px',
              border: '1px solid #DDEC90', background: 'transparent',
              color: '#6A6A20', fontWeight: 600, fontSize: '13px',
              cursor: isCreatingFolder ? 'not-allowed' : 'pointer',
              opacity: isCreatingFolder ? 0.5 : 1,
              fontFamily: "'Inter', sans-serif", transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (!isCreatingFolder) (e.currentTarget as HTMLElement).style.background = '#F5F8D0' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <FolderPlus size={14} />
            New Folder
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onCancel}
              style={{
                padding: '7px 16px', borderRadius: '8px',
                border: '1px solid #DDEC90', background: 'transparent',
                color: '#6A6A20', fontWeight: 600, fontSize: '13px',
                cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F5F8D0' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedPath}
              style={{
                padding: '7px 16px', borderRadius: '8px', border: 'none',
                background: '#BBCB64', color: '#1A1A00',
                fontWeight: 700, fontSize: '13px',
                cursor: selectedPath ? 'pointer' : 'not-allowed',
                opacity: selectedPath ? 1 : 0.5,
                fontFamily: "'Inter', sans-serif", transition: 'opacity 0.15s',
              }}
            >
              Select This Folder
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
