import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  borderRadius: '8px',
  padding: '8px 16px',
  minHeight: '36px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: "'Geist', 'Inter', sans-serif",
  fontSize: '13px',
  fontWeight: 700,
  lineHeight: 1,
  transition: 'all 0.15s',
  border: 'none',
}

const btnStart: React.CSSProperties = {
  ...btnBase,
  background: 'linear-gradient(135deg, #BBCB64, #7A8A00)',
  color: '#FFFFFF',
  boxShadow: '0 2px 8px rgba(187,203,100,0.3)',
}

const btnStop: React.CSSProperties = {
  ...btnBase,
  background: '#CF0F0F',
  color: '#FFFFFF',
  boxShadow: '0 2px 8px rgba(207,15,15,0.2)',
}

const btnOutline: React.CSSProperties = {
  ...btnBase,
  background: 'transparent',
  color: '#7A8A00',
  border: '1px solid #DDEC90',
}

const badgeStyle: React.CSSProperties = {
  background: '#F5F8D0',
  color: '#7A8A00',
  border: '1px solid #DDEC90',
  borderRadius: '9999px',
  padding: '4px 12px',
  fontSize: '11px',
  fontWeight: 700,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  fontFamily: "'Geist', 'Inter', sans-serif",
  letterSpacing: '0.02em',
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
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: "'Inter', sans-serif",
          padding: '6px 10px',
          borderRadius: '12px',
          background: isRunning ? 'rgba(245,248,208,0.4)' : 'transparent',
          boxShadow: isRunning ? '0 1px 3px rgba(26,26,0,0.06), 0 1px 2px rgba(26,26,0,0.04)' : 'none',
          border: isRunning ? '1px solid #DDEC90' : '1px solid transparent',
          transition: 'all 0.2s',
        }}
      >
        {/* Running status dot */}
        {status === 'running' && (
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #BBCB64, #FFE52A)',
            boxShadow: '0 0 8px rgba(187,203,100,0.6)',
            animation: 'statusPulse 2s ease-in-out infinite',
            flexShrink: 0,
          }} />
        )}

        {/* Inline keyframes for statusPulse */}
        {status === 'running' && (
          <style>{`
            @keyframes statusPulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.6; transform: scale(0.85); }
            }
          `}</style>
        )}

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
            <span style={{
              fontSize: '12px',
              fontWeight: 700,
              minWidth: '1.5rem',
              textAlign: 'center',
              color: '#1A1A00',
              fontFamily: "'Geist', 'Inter', sans-serif",
            }}>
              {concurrency}x
            </span>
          </div>
        )}

        {/* Show concurrency indicator when running with multiple agents */}
        {isRunning && isParallel && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
            style={badgeStyle}
          >
            <GitBranch size={14} />
            {concurrency}x
          </motion.span>
        )}

        {/* Schedule status display */}
        <AnimatePresence mode="wait">
          {nextRun?.is_currently_running && nextRun.next_end && (
            <motion.span
              key="running-until"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15 }}
              style={badgeStyle}
            >
              <Clock size={14} />
              Running until {formatEndTime(nextRun.next_end)}
            </motion.span>
          )}

          {!nextRun?.is_currently_running && nextRun?.next_start && (
            <motion.span
              key="next-start"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15 }}
              style={badgeStyle}
            >
              <Clock size={14} />
              Next: {formatNextRun(nextRun.next_start)}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Start/Stop/Pause/Resume buttons */}
        {isLoadingStatus ? (
          <motion.button
            disabled
            style={{ ...btnOutline, opacity: 0.5, cursor: 'not-allowed' }}
            whileHover={{ scale: 1 }}
          >
            <Loader2 size={18} className="animate-spin" />
          </motion.button>
        ) : isStopped ? (
          <motion.button
            onClick={handleStart}
            disabled={isLoading}
            style={{ ...btnStart, opacity: disabledOpacity }}
            title={yoloMode ? 'Summon the Gods (YOLO Mode)' : 'Summon the Gods'}
            whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(187,203,100,0.4)' }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Play size={18} />
            )}
          </motion.button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Pausing indicator */}
            <AnimatePresence>
              {status === 'pausing' && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  style={{ ...badgeStyle, animation: 'pulse 2s infinite' }}
                >
                  <Loader2 size={12} className="animate-spin" />
                  Pausing...
                </motion.span>
              )}
            </AnimatePresence>

            {/* Paused indicator + Resume button */}
            {status === 'paused_graceful' && (
              <>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    ...badgeStyle,
                    background: 'transparent',
                    color: '#7A8A00',
                    border: '1px solid #DDEC90',
                  }}
                >
                  Paused
                </motion.span>
                <motion.button
                  onClick={() => gracefulResume.mutate()}
                  disabled={isLoading}
                  style={{ ...btnStart, opacity: disabledOpacity }}
                  title="Awaken the gods"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                >
                  {gracefulResume.isPending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <PlayCircle size={18} />
                  )}
                </motion.button>
              </>
            )}

            {/* Graceful pause button (only when running normally) */}
            {status === 'running' && (
              <motion.button
                onClick={() => gracefulPause.mutate()}
                disabled={isLoading}
                style={{ ...btnOutline, opacity: disabledOpacity }}
                title="Rest the gods (finish current work first)"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
              >
                {gracefulPause.isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Pause size={18} />
                )}
              </motion.button>
            )}

            {/* Stop button (always available) */}
            <motion.button
              onClick={handleStop}
              disabled={isLoading}
              style={{ ...btnStop, opacity: disabledOpacity }}
              title="Silence the Gods (immediate)"
              whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(207,15,15,0.3)' }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              {stopAgent.isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Square size={18} />
              )}
            </motion.button>
          </div>
        )}

        {/* Clock button to open schedule modal */}
        <motion.button
          onClick={() => setShowScheduleModal(true)}
          style={btnOutline}
          title="Manage schedules"
          whileHover={{ scale: 1.02, background: '#F5F8D0' }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
        >
          <Clock size={18} />
        </motion.button>
      </motion.div>

      {/* Schedule Modal */}
      <ScheduleModal
        projectName={projectName}
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />
    </>
  )
}
