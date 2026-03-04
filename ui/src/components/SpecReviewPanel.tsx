import { useEffect, useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FileText, CheckCircle2, Clock, Loader2, Play, ScrollText, AlertTriangle, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  listSpecFiles,
  getModernizeStatus,
  startModernizeAnalysis,
  approveSpecFile,
  startAgent,
  type SpecFileInfo,
} from '../lib/api'
import { SpecEditorModal } from './SpecEditorModal'

const FILE_DESCRIPTIONS: Record<string, { label: string; description: string }> = {
  'constitution.md': { label: 'Constitution', description: 'Governance principles and migration boundaries' },
  'spec.md': { label: 'Specification', description: 'Detailed technical architecture and data models' },
  'plan.md': { label: 'Plan', description: 'Phased migration execution plan' },
  'tasks.md': { label: 'Tasks', description: 'Detailed task breakdown for coding agents' },
  'app_spec.txt': { label: 'App Spec', description: 'Machine-readable spec for the initializer agent' },
}

interface SpecReviewPanelProps {
  projectName: string
  onComplete: () => void
}

export function SpecReviewPanel({ projectName, onComplete }: SpecReviewPanelProps) {
  const queryClient = useQueryClient()
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [startingAgent, setStartingAgent] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)
  const [analysisStartError, setAnalysisStartError] = useState<string | null>(null)

  const { data: modernizeStatus } = useQuery({
    queryKey: ['modernize-status', projectName],
    queryFn: () => getModernizeStatus(projectName),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'complete' || status === 'error' ? false : 3000
    },
  })

  const { data: specList, refetch: refetchSpecs } = useQuery({
    queryKey: ['spec-files', projectName],
    queryFn: () => listSpecFiles(projectName),
    refetchInterval: (query) => {
      const analysisStatus = query.state.data?.analysis_status
      return analysisStatus === 'running' ? 5000 : false
    },
    enabled: !!projectName,
  })

  const staleCache = modernizeStatus?.status === 'complete' && specList?.analysis_status === 'not_started'

  useEffect(() => {
    const needsStart = modernizeStatus?.status === 'not_started' || modernizeStatus?.status === 'idle' || staleCache
    if (!needsStart) return
    setAnalysisStartError(null)
    startModernizeAnalysis(projectName)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['modernize-status', projectName] })
        queryClient.invalidateQueries({ queryKey: ['spec-files', projectName] })
      })
      .catch((err) => setAnalysisStartError(err instanceof Error ? err.message : String(err)))
  }, [modernizeStatus?.status, staleCache, projectName, queryClient])

  const handleEditorClose = useCallback(() => { setSelectedFile(null); refetchSpecs() }, [refetchSpecs])
  const handleApproved = useCallback(() => { refetchSpecs() }, [refetchSpecs])

  const handleApproveAll = async () => {
    if (!specList) return
    const pending = specList.files.filter(f => f.status !== 'approved')
    for (const file of pending) { await approveSpecFile(projectName, file.filename) }
    refetchSpecs()
  }

  const handleBeginCoding = async () => {
    setStartingAgent(true)
    setStartError(null)
    try {
      await startAgent(projectName, { yoloMode: true, maxConcurrency: 3 })
      queryClient.invalidateQueries({ queryKey: ['agentStatus', projectName] })
      onComplete()
    } catch (err: unknown) {
      setStartError(err instanceof Error ? err.message : 'Failed to start agent')
    } finally {
      setStartingAgent(false)
    }
  }

  const isNotStarted = !modernizeStatus || modernizeStatus.status === 'not_started' || modernizeStatus.status === 'idle' || staleCache
  const isAnalyzing = modernizeStatus?.status === 'running'
  const isComplete = modernizeStatus?.status === 'complete' && specList?.analysis_status === 'complete'
  const isError = modernizeStatus?.status === 'error'
  const allApproved = specList?.all_approved ?? false
  const totalFiles = specList?.files.length ?? 0
  const approvedCount = specList?.files.filter(f => f.status === 'approved').length ?? 0

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
          <ScrollText size={28} style={{ color: '#7A8A00' }} />
          <h2 style={{ fontWeight: 700, fontSize: '24px', color: '#1A1A00', fontFamily: "'Geist', 'Inter', sans-serif", margin: 0 }}>
            Modernization Specs
          </h2>
        </div>
        <p style={{ fontSize: '14px', color: '#6A6A20', maxWidth: '480px', margin: '0 auto' }}>
          Zeus has analyzed your codebase and generated spec files.
          Review, edit, and approve each spec before the coding agents begin.
        </p>
      </div>

      {/* Not started / queuing */}
      {isNotStarted && !analysisStartError && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          padding: '20px 24px',
          background: '#F5F8D0', border: '1px solid #DDEC90',
          borderRadius: '12px',
        }}>
          <Loader2 size={28} style={{ color: '#7A8A00', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
          <div>
            <h3 style={{ fontWeight: 700, color: '#1A1A00', fontSize: '15px', margin: '0 0 4px' }}>Summoning Zeus...</h3>
            <p style={{ fontSize: '13px', color: '#6A6A20', margin: 0 }}>Starting codebase analysis, please wait.</p>
          </div>
        </div>
      )}

      {/* Analysis start error */}
      <AnimatePresence>
        {analysisStartError && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 16px',
              background: '#FFF0DC', border: '1px solid #F0C880',
              borderLeft: '4px solid #F79A19', borderRadius: '8px',
              fontSize: '13px', color: '#A05A00',
            }}
          >
            <AlertTriangle size={14} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>Failed to start analysis: {analysisStartError}</span>
            <button
              onClick={() => { setAnalysisStartError(null); startModernizeAnalysis(projectName).catch(err => setAnalysisStartError(err instanceof Error ? err.message : String(err))) }}
              style={{ padding: '4px 12px', borderRadius: '6px', border: '1px solid #F0C880', background: '#FFFFFF', color: '#A05A00', fontWeight: 600, fontSize: '12px', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
            >
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analyzing progress */}
      {isAnalyzing && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          padding: '20px 24px',
          background: '#F5F8D0', border: '1px solid #DDEC90',
          borderRadius: '12px',
        }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Loader2 size={28} style={{ color: '#7A8A00', animation: 'spin 1s linear infinite' }} />
            <Sparkles size={12} className="animate-pulse" style={{ position: 'absolute', top: '-4px', right: '-4px', color: '#F79A19' }} />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, color: '#1A1A00', fontSize: '15px', margin: '0 0 4px' }}>Zeus is analyzing your codebase...</h3>
            <p style={{ fontSize: '13px', color: '#6A6A20', margin: 0 }}>
              {modernizeStatus?.progress_messages?.slice(-1)[0] || 'Scanning files, understanding architecture, and generating specs'}
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '12px 16px',
          background: '#FFF0DC', border: '1px solid #F0C880',
          borderLeft: '4px solid #F79A19', borderRadius: '8px',
          fontSize: '13px', color: '#A05A00',
        }}>
          <AlertTriangle size={14} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>Analysis failed: {modernizeStatus?.error || 'Unknown error'}</span>
          <button
            onClick={() => { startModernizeAnalysis(projectName).then(() => { queryClient.invalidateQueries({ queryKey: ['modernize-status', projectName] }); queryClient.invalidateQueries({ queryKey: ['spec-files', projectName] }) }).catch(console.error) }}
            style={{ padding: '4px 12px', borderRadius: '6px', border: '1px solid #F0C880', background: '#FFFFFF', color: '#A05A00', fontWeight: 600, fontSize: '12px', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Spec files list */}
      {isComplete && specList && specList.files.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: '#6A6A20' }}>
              {approvedCount} of {totalFiles} approved
            </span>
            {!allApproved && totalFiles > 0 && approvedCount < totalFiles && (
              <button
                onClick={handleApproveAll}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', borderRadius: '8px',
                  border: '1px solid #DDEC90', background: 'transparent',
                  color: '#6A6A20', fontWeight: 600, fontSize: '13px',
                  cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F5F8D0' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <CheckCircle2 size={14} />
                Approve All
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {specList.files.map((file: SpecFileInfo) => {
              const meta = FILE_DESCRIPTIONS[file.filename] || { label: file.filename, description: 'Spec file' }
              const fileApproved = file.status === 'approved'
              return (
                <motion.div
                  key={file.filename}
                  whileHover={{ y: -1, boxShadow: '0 4px 12px rgba(26,26,0,0.08)' }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setSelectedFile(file.filename)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '14px 16px',
                    background: fileApproved ? '#F5F8D0' : '#FFFFFF',
                    border: fileApproved ? '1px solid #BBCB64' : '1px solid #DDEC90',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s',
                  }}
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '8px', flexShrink: 0,
                    background: fileApproved ? 'linear-gradient(135deg, #BBCB64, #7A8A00)' : '#F5F8D0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FileText size={20} style={{ color: fileApproved ? '#FFFFFF' : '#7A8A00' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: '#1A1A00' }}>{meta.label}</span>
                      <span style={{ fontSize: '11px', color: '#9A9A60', fontFamily: 'monospace' }}>{file.filename}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#6A6A20', margin: 0 }}>{meta.description}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <span style={{ fontSize: '11px', color: '#9A9A60', fontFamily: 'monospace' }}>
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      fontSize: '11px', fontWeight: 700,
                      padding: '3px 10px', borderRadius: '9999px',
                      background: fileApproved ? '#BBCB64' : 'transparent',
                      color: fileApproved ? '#1A1A00' : '#6A6A20',
                      border: fileApproved ? '1px solid #7A8A00' : '1px solid #DDEC90',
                    }}>
                      {fileApproved ? <><CheckCircle2 size={11} /> Approved</> : <><Clock size={11} /> Pending</>}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </>
      )}

      {/* Begin coding CTA */}
      {allApproved && totalFiles > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, #F5F8D0, #FFFFFF)',
            border: '1px solid #BBCB64',
            borderRadius: '12px',
            padding: '28px 24px',
            textAlign: 'center',
          }}
        >
          <h3 style={{ fontWeight: 700, fontSize: '18px', color: '#1A1A00', marginBottom: '8px', fontFamily: "'Geist', 'Inter', sans-serif" }}>
            All Specs Approved
          </h3>
          <p style={{ fontSize: '14px', color: '#6A6A20', marginBottom: '20px' }}>
            Your modernization plan is ready. Start the coding agents to begin transforming the codebase.
          </p>
          {startError && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 14px', marginBottom: '16px',
              background: '#FFF0DC', border: '1px solid #F0C880',
              borderLeft: '4px solid #F79A19', borderRadius: '8px',
              fontSize: '13px', color: '#A05A00', textAlign: 'left',
            }}>
              <AlertTriangle size={14} style={{ flexShrink: 0 }} />
              {startError}
            </div>
          )}
          <button
            onClick={handleBeginCoding}
            disabled={startingAgent}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 28px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #BBCB64, #7A8A00)',
              color: '#FFFFFF', fontWeight: 700, fontSize: '16px',
              cursor: startingAgent ? 'not-allowed' : 'pointer',
              opacity: startingAgent ? 0.7 : 1,
              fontFamily: "'Geist', 'Inter', sans-serif",
              transition: 'opacity 0.15s',
            }}
          >
            {startingAgent ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={18} />}
            Begin the Odyssey
          </button>
        </motion.div>
      )}

      {/* Spec Editor Modal */}
      {selectedFile && (
        <SpecEditorModal
          projectName={projectName}
          filename={selectedFile}
          isOpen={!!selectedFile}
          onClose={handleEditorClose}
          onApproved={handleApproved}
        />
      )}
    </div>
  )
}
