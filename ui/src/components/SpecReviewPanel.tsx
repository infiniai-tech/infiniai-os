import { useEffect, useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  FileText,
  CheckCircle2,
  Clock,
  Loader2,
  Play,
  ScrollText,
  AlertTriangle,
  Sparkles,
} from 'lucide-react'
import {
  listSpecFiles,
  getModernizeStatus,
  startModernizeAnalysis,
  approveSpecFile,
  startAgent,
  type SpecFileInfo,
} from '../lib/api'
import { SpecEditorModal } from './SpecEditorModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

const FILE_DESCRIPTIONS: Record<string, { label: string; description: string }> = {
  'constitution.md': {
    label: 'Constitution',
    description: 'Governance principles and migration boundaries',
  },
  'spec.md': {
    label: 'Specification',
    description: 'Detailed technical architecture and data models',
  },
  'plan.md': {
    label: 'Plan',
    description: 'Phased migration execution plan',
  },
  'tasks.md': {
    label: 'Tasks',
    description: 'Detailed task breakdown for coding agents',
  },
  'app_spec.txt': {
    label: 'App Spec',
    description: 'Machine-readable spec for the initializer agent',
  },
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

  // Poll modernize status — always fetch fresh on mount to avoid stale cache from previous project runs
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

  // Poll spec files list while analysis is running or complete
  const { data: specList, refetch: refetchSpecs } = useQuery({
    queryKey: ['spec-files', projectName],
    queryFn: () => listSpecFiles(projectName),
    refetchInterval: (query) => {
      const analysisStatus = query.state.data?.analysis_status
      return analysisStatus === 'running' ? 5000 : false
    },
    enabled: !!projectName,
  })

  // Auto-start analysis when not started, or when cached status is stale
  // (e.g. modernizeStatus says 'complete' from a previous run but specList shows 'not_started')
  const staleCache =
    modernizeStatus?.status === 'complete' && specList?.analysis_status === 'not_started'

  useEffect(() => {
    const needsStart =
      modernizeStatus?.status === 'not_started' ||
      modernizeStatus?.status === 'idle' ||
      staleCache
    if (!needsStart) return

    setAnalysisStartError(null)
    startModernizeAnalysis(projectName)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['modernize-status', projectName] })
        queryClient.invalidateQueries({ queryKey: ['spec-files', projectName] })
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : String(err)
        setAnalysisStartError(msg)
      })
  }, [modernizeStatus?.status, staleCache, projectName, queryClient])

  const handleEditorClose = useCallback(() => {
    setSelectedFile(null)
    refetchSpecs()
  }, [refetchSpecs])

  const handleApproved = useCallback(() => {
    refetchSpecs()
  }, [refetchSpecs])

  const handleApproveAll = async () => {
    if (!specList) return
    const pending = specList.files.filter(f => f.status !== 'approved')
    for (const file of pending) {
      await approveSpecFile(projectName, file.filename)
    }
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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <ScrollText size={28} className="text-primary" />
          <h2 className="text-2xl font-display font-bold text-foreground">
            Modernization Specs
          </h2>
        </div>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Zeus has analyzed your codebase and generated spec files.
          Review, edit, and approve each spec before the coding agents begin.
        </p>
      </div>

      {/* Starting / queued state */}
      {isNotStarted && !analysisStartError && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center gap-4 p-6">
            <Loader2 size={32} className="animate-spin text-primary" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Summoning Zeus...</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Starting codebase analysis, please wait.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis start error */}
      {analysisStartError && (
        <Alert variant="destructive">
          <AlertTriangle size={16} />
          <AlertDescription>
            Failed to start analysis: {analysisStartError}
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={() => {
                setAnalysisStartError(null)
                startModernizeAnalysis(projectName).catch((err) => {
                  setAnalysisStartError(err instanceof Error ? err.message : String(err))
                })
              }}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Analysis Progress */}
      {isAnalyzing && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="relative">
              <Loader2 size={32} className="animate-spin text-primary" />
              <Sparkles
                size={14}
                className="absolute -top-1 -right-1 text-primary animate-pulse"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Zeus is analyzing your codebase...</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {modernizeStatus?.progress_messages?.slice(-1)[0] ||
                  'Scanning files, understanding architecture, and generating specs'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {isError && (
        <Alert variant="destructive">
          <AlertTriangle size={16} />
          <AlertDescription>
            Analysis failed: {modernizeStatus?.error || 'Unknown error'}
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={() => {
                startModernizeAnalysis(projectName).then(() => {
                  queryClient.invalidateQueries({ queryKey: ['modernize-status', projectName] })
                  queryClient.invalidateQueries({ queryKey: ['spec-files', projectName] })
                }).catch(console.error)
              }}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Spec Files List — only show once analysis is done to avoid stale data */}
      {isComplete && specList && specList.files.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {approvedCount} of {totalFiles} approved
            </div>
            {!allApproved && totalFiles > 0 && approvedCount < totalFiles && (
              <Button variant="outline" size="sm" onClick={handleApproveAll}>
                <CheckCircle2 size={14} />
                Approve All
              </Button>
            )}
          </div>

          <div className="grid gap-3">
            {specList?.files.map((file: SpecFileInfo) => {
              const meta = FILE_DESCRIPTIONS[file.filename] || {
                label: file.filename,
                description: 'Spec file',
              }
              const isApproved = file.status === 'approved'

              return (
                <Card
                  key={file.filename}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    isApproved ? 'border-primary/30 bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedFile(file.filename)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div
                      className={`rounded-lg p-2 ${
                        isApproved ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{meta.label}</span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {file.filename}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{meta.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                      <Badge variant={isApproved ? 'default' : 'secondary'}>
                        {isApproved ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 size={12} /> Approved
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> Pending
                          </span>
                        )}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}

      {/* Begin Coding Button */}
      {allApproved && totalFiles > 0 && (
        <Card className="border-primary bg-gradient-to-r from-primary/10 to-primary/5">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-display text-lg">
              All Specs Approved
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Your modernization plan is ready. Start the coding agents to begin transforming the codebase.
            </p>
            {startError && (
              <Alert variant="destructive" className="text-left">
                <AlertDescription>{startError}</AlertDescription>
              </Alert>
            )}
            <Button
              size="lg"
              onClick={handleBeginCoding}
              disabled={startingAgent}
              className="font-display"
            >
              {startingAgent ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Play size={18} />
              )}
              Begin the Odyssey
            </Button>
          </CardContent>
        </Card>
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
