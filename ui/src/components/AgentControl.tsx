import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Square, Loader2, GitBranch, Clock, Pause, PlayCircle } from 'lucide-react'
import {
  useStartAgent,
  useStopAgent,
  useGracefulPauseAgent,
  useGracefulResumeAgent,
  useSettings,
  useUpdateProjectSettings,
} from '../hooks/useProjects'
import { useNextScheduledRun } from '../hooks/useSchedules'
import { formatNextRun, formatEndTime } from '../lib/timeUtils'
import { ScheduleModal } from './ScheduleModal'
import type { AgentStatus } from '../lib/types'

const btnBase: React.CSSProperties = {
  borderRadius: '6px',
  padding: '6px 10px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  fontWeight: 500,
  lineHeight: 1,
}

const btnStart: React.CSSProperties = { ...btnBase, background: '#BBCB64', color: '#1A1A00', border: 'none' }
const btnStop: React.CSSProperties = { ...btnBase, background: '#CF0F0F', color: '#FFFFFF', border: 'none' }
const btnOutline: React.CSSProperties = { ...btnBase, background: 'transparent', color: '#7A8A00', border: '1px solid #DDEC90' }

const badgeStyle: React.CSSProperties = {
  background: '#F5F8D0',
  color: '#7A8A00',
  border: '1px solid #DDEC90',
  borderRadius: '20px',
  padding: '3px 10px',
  fontSize: '11px',
  fontWeight: 700,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontFamily: "'Inter', sans-serif",
}

interface AgentControlProps {
  projectName: string
  status: AgentStatus
  defaultConcurrency?: number
}

export function AgentControl({ projectName, status, defaultConcurrency = 3 }: AgentControlProps) {
  const { data: settings } = useSettings()
  const yoloMode = settings?.yolo_mode ?? false

  const [concurrency, setConcurrency] = useState(defaultConcurrency)

  useEffect(() => {
    setConcurrency(defaultConcurrency)
  }, [defaultConcurrency])

  const updateProjectSettings = useUpdateProjectSettings(projectName)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleConcurrencyChange = useCallback((newConcurrency: number) => {
    setConcurrency(newConcurrency)

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      updateProjectSettings.mutate({ default_concurrency: newConcurrency })
    }, 500)
  }, [updateProjectSettings])

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const startAgent = useStartAgent(projectName)
  const stopAgent = useStopAgent(projectName)
  const gracefulPause = useGracefulPauseAgent(projectName)
  const gracefulResume = useGracefulResumeAgent(projectName)
  const { data: nextRun } = useNextScheduledRun(projectName)

  const [showScheduleModal, setShowScheduleModal] = useState(false)

  const isLoading = startAgent.isPending || stopAgent.isPending || gracefulPause.isPending || gracefulResume.isPending
  const isRunning = status === 'running' || status === 'paused' || status === 'pausing' || status === 'paused_graceful'
  const isLoadingStatus = status === 'loading'
  const isParallel = concurrency > 1

  const handleStart = () => startAgent.mutate({
    yoloMode,
    parallelMode: isParallel,
    maxConcurrency: concurrency,
    testingAgentRatio: settings?.testing_agent_ratio,
  })
  const handleStop = () => stopAgent.mutate()

  const isStopped = status === 'stopped' || status === 'crashed'

  const disabledOpacity = isLoading ? 0.5 : 1

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Inter', sans-serif" }}>
        {/* Concurrency slider - visible when stopped */}
        {isStopped && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GitBranch size={16} style={{ color: isParallel ? '#7A8A00' : '#6A6A20' }} />
            <input
              type="range"
              min={1}
              max={5}
              value={concurrency}
              onChange={(e) => handleConcurrencyChange(Number(e.target.value))}
              disabled={isLoading}
              style={{ width: '64px', height: '8px', accentColor: '#BBCB64', cursor: 'pointer' }}
              title={`${concurrency} concurrent agent${concurrency > 1 ? 's' : ''}`}
              aria-label="Set number of concurrent agents"
            />
            <span style={{ fontSize: '12px', fontWeight: 600, minWidth: '1.5rem', textAlign: 'center', color: '#1A1A00' }}>
              {concurrency}x
            </span>
          </div>
        )}

        {/* Show concurrency indicator when running with multiple agents */}
        {isRunning && isParallel && (
          <span style={badgeStyle}>
            <GitBranch size={14} />
            {concurrency}x
          </span>
        )}

        {/* Schedule status display */}
        {nextRun?.is_currently_running && nextRun.next_end && (
          <span style={badgeStyle}>
            <Clock size={14} />
            Running until {formatEndTime(nextRun.next_end)}
          </span>
        )}

        {!nextRun?.is_currently_running && nextRun?.next_start && (
          <span style={badgeStyle}>
            <Clock size={14} />
            Next: {formatNextRun(nextRun.next_start)}
          </span>
        )}

        {/* Start/Stop/Pause/Resume buttons */}
        {isLoadingStatus ? (
          <button disabled style={{ ...btnOutline, opacity: 0.5, cursor: 'not-allowed' }}>
            <Loader2 size={18} className="animate-spin" />
          </button>
        ) : isStopped ? (
          <button
            onClick={handleStart}
            disabled={isLoading}
            style={{ ...btnStart, opacity: disabledOpacity }}
            title={yoloMode ? 'Summon the Gods (YOLO Mode)' : 'Summon the Gods'}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Play size={18} />
            )}
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Pausing indicator */}
            {status === 'pausing' && (
              <span style={{ ...badgeStyle, animation: 'pulse 2s infinite' }}>
                <Loader2 size={12} className="animate-spin" />
                Pausing...
              </span>
            )}

            {/* Paused indicator + Resume button */}
            {status === 'paused_graceful' && (
              <>
                <span style={{ ...badgeStyle, background: 'transparent', color: '#7A8A00' }}>
                  Paused
                </span>
                <button
                  onClick={() => gracefulResume.mutate()}
                  disabled={isLoading}
                  style={{ ...btnStart, opacity: disabledOpacity }}
                  title="Awaken the gods"
                >
                  {gracefulResume.isPending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <PlayCircle size={18} />
                  )}
                </button>
              </>
            )}

            {/* Graceful pause button (only when running normally) */}
            {status === 'running' && (
              <button
                onClick={() => gracefulPause.mutate()}
                disabled={isLoading}
                style={{ ...btnOutline, opacity: disabledOpacity }}
                title="Rest the gods (finish current work first)"
              >
                {gracefulPause.isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Pause size={18} />
                )}
              </button>
            )}

            {/* Stop button (always available) */}
            <button
              onClick={handleStop}
              disabled={isLoading}
              style={{ ...btnStop, opacity: disabledOpacity }}
              title="Silence the Gods (immediate)"
            >
              {stopAgent.isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Square size={18} />
              )}
            </button>
          </div>
        )}

        {/* Clock button to open schedule modal */}
        <button
          onClick={() => setShowScheduleModal(true)}
          style={btnOutline}
          title="Manage schedules"
        >
          <Clock size={18} />
        </button>
      </div>

      {/* Schedule Modal */}
      <ScheduleModal
        projectName={projectName}
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />
    </>
  )
}
