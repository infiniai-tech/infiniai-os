import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Save, CheckCircle2, FileText, X, AlertCircle } from 'lucide-react'
import { readSpecFile, writeSpecFile, approveSpecFile } from '../lib/api'

interface SpecEditorModalProps {
  projectName: string
  filename: string
  isOpen: boolean
  onClose: () => void
  onApproved: () => void
}

export function SpecEditorModal({ projectName, filename, isOpen, onClose, onApproved }: SpecEditorModalProps) {
  const [content, setContent] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [status, setStatus] = useState<string>('pending')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [approving, setApproving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (!isOpen || !filename) return
    setLoading(true)
    setError(null)
    setSaveSuccess(false)
    readSpecFile(projectName, filename)
      .then(data => { setContent(data.content); setOriginalContent(data.content); setStatus(data.status) })
      .catch(err => setError(err.message || 'Failed to load file'))
      .finally(() => setLoading(false))
  }, [isOpen, filename, projectName])

  const hasChanges = content !== originalContent

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaveSuccess(false)
    try {
      const result = await writeSpecFile(projectName, filename, content)
      setOriginalContent(content)
      setStatus(result.status)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async () => {
    if (hasChanges) await handleSave()
    setApproving(true)
    setError(null)
    try {
      const result = await approveSpecFile(projectName, filename)
      setStatus(result.status)
      onApproved()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to approve')
    } finally {
      setApproving(false)
    }
  }

  const isApproved = status === 'approved'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: 'rgba(26,26,0,0.45)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 51,
              width: '900px',
              maxWidth: 'calc(100vw - 2rem)',
              maxHeight: '90vh',
              background: '#FFFFFF',
              border: '1px solid #DDEC90',
              borderRadius: '14px',
              boxShadow: '0 20px 60px rgba(26,26,0,0.15), 0 4px 16px rgba(26,26,0,0.08)',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: "'Inter', sans-serif",
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 24px',
              borderBottom: '1px solid #DDEC90',
              background: 'linear-gradient(to bottom, #FAFAF2, #FFFFFF)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={20} style={{ color: '#7A8A00' }} />
                <span style={{ fontWeight: 700, fontSize: '16px', color: '#1A1A00', fontFamily: "'Geist', 'Inter', sans-serif" }}>
                  {filename}
                </span>
                <span style={{
                  fontSize: '11px', fontWeight: 700,
                  padding: '2px 10px', borderRadius: '9999px',
                  background: isApproved ? '#F5F8D0' : '#FFF0DC',
                  color: isApproved ? '#7A8A00' : '#A05A00',
                  border: `1px solid ${isApproved ? '#DDEC90' : '#F0C880'}`,
                }}>
                  {isApproved ? 'Approved' : 'Pending Review'}
                </span>
              </div>
              <button
                onClick={onClose}
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

            {/* Body */}
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px', flex: 1 }}>
                <Loader2 size={24} style={{ color: '#7A8A00', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : (
              <div style={{ flex: 1, overflow: 'hidden', padding: '16px' }}>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  spellCheck={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '50vh',
                    resize: 'none',
                    borderRadius: '8px',
                    border: '1px solid #DDEC90',
                    background: '#FAFAF2',
                    padding: '16px',
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    fontSize: '13px',
                    lineHeight: 1.6,
                    color: '#1A1A00',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#BBCB64'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(187,203,100,0.12)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#DDEC90'; e.currentTarget.style.boxShadow = 'none' }}
                />
              </div>
            )}

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    margin: '0 16px 8px',
                    padding: '10px 14px',
                    background: '#FFF0DC', border: '1px solid #F0C880',
                    borderLeft: '4px solid #F79A19', borderRadius: '8px',
                    fontSize: '13px', color: '#A05A00',
                  }}
                >
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 24px',
              borderTop: '1px solid #DDEC90',
              background: '#FAFAF2',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                {saveSuccess && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#7A8A00', fontWeight: 600 }}>
                    <CheckCircle2 size={14} /> Saved
                  </span>
                )}
                {hasChanges && !saveSuccess && (
                  <span style={{ color: '#6A6A20' }}>Unsaved changes</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || saving || loading}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '8px 18px', borderRadius: '8px',
                    border: '1px solid #DDEC90', background: 'transparent',
                    color: '#6A6A20', fontWeight: 600, fontSize: '14px',
                    cursor: (!hasChanges || saving || loading) ? 'not-allowed' : 'pointer',
                    opacity: (!hasChanges || saving || loading) ? 0.5 : 1,
                    fontFamily: "'Inter', sans-serif", transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (hasChanges && !saving && !loading) (e.currentTarget as HTMLElement).style.background = '#F5F8D0' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                  Save
                </button>
                <button
                  onClick={handleApprove}
                  disabled={approving || loading || isApproved}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '8px 18px', borderRadius: '8px',
                    border: 'none',
                    background: isApproved ? '#F5F8D0' : '#BBCB64',
                    color: '#1A1A00', fontWeight: 700, fontSize: '14px',
                    cursor: (approving || loading || isApproved) ? 'not-allowed' : 'pointer',
                    opacity: (approving || loading || isApproved) ? 0.6 : 1,
                    fontFamily: "'Inter', sans-serif", transition: 'opacity 0.15s',
                  }}
                >
                  {approving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={14} />}
                  {isApproved ? 'Approved' : 'Approve'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
