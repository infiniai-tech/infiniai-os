/**
 * Schedule Modal Component
 *
 * Modal for managing agent schedules (create, edit, delete).
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, GitBranch, Trash2, X, AlertCircle, Plus } from 'lucide-react'
import {
  useSchedules,
  useCreateSchedule,
  useDeleteSchedule,
  useToggleSchedule,
} from '../hooks/useSchedules'
import {
  utcToLocalWithDayShift,
  localToUTCWithDayShift,
  adjustDaysForDayShift,
  formatDuration,
  DAYS,
  isDayActive,
  toggleDay,
} from '../lib/timeUtils'
import type { ScheduleCreate } from '../lib/types'

interface ScheduleModalProps {
  projectName: string
  isOpen: boolean
  onClose: () => void
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: '8px',
  border: '1px solid #DDEC90',
  fontSize: '14px',
  fontFamily: "'Inter', sans-serif",
  color: '#1A1A00',
  background: '#FFFFFF',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  boxSizing: 'border-box' as const,
}

const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = '#BBCB64'
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(187,203,100,0.12)'
}
const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = '#DDEC90'
  e.currentTarget.style.boxShadow = 'none'
}

export function ScheduleModal({ projectName, isOpen, onClose }: ScheduleModalProps) {
  const { data: schedulesData, isLoading } = useSchedules(projectName)
  const createSchedule = useCreateSchedule(projectName)
  const deleteSchedule = useDeleteSchedule(projectName)
  const toggleSchedule = useToggleSchedule(projectName)

  const [newSchedule, setNewSchedule] = useState<ScheduleCreate>({
    start_time: '22:00',
    duration_minutes: 240,
    days_of_week: 31,
    enabled: true,
    yolo_mode: false,
    model: null,
    max_concurrency: 3,
  })

  const [error, setError] = useState<string | null>(null)

  const schedules = schedulesData?.schedules || []

  // Escape key
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const handleCreateSchedule = async () => {
    try {
      setError(null)
      if (newSchedule.days_of_week === 0) { setError('Please select at least one day'); return }
      if (newSchedule.duration_minutes < 1 || newSchedule.duration_minutes > 1440) {
        setError('Duration must be between 1 and 1440 minutes'); return
      }
      const { time: utcTime, dayShift } = localToUTCWithDayShift(newSchedule.start_time)
      const adjustedDays = adjustDaysForDayShift(newSchedule.days_of_week, dayShift)
      await createSchedule.mutateAsync({ ...newSchedule, start_time: utcTime, days_of_week: adjustedDays })
      setNewSchedule({ start_time: '22:00', duration_minutes: 240, days_of_week: 31, enabled: true, yolo_mode: false, model: null, max_concurrency: 3 })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create schedule')
    }
  }

  const handleToggleSchedule = async (scheduleId: number, enabled: boolean) => {
    try {
      setError(null)
      await toggleSchedule.mutateAsync({ scheduleId, enabled: !enabled })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle schedule')
    }
  }

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return
    try {
      setError(null)
      await deleteSchedule.mutateAsync(scheduleId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete schedule')
    }
  }

  const handleToggleDay = (dayBit: number) => {
    setNewSchedule((prev) => ({ ...prev, days_of_week: toggleDay(prev.days_of_week, dayBit) }))
  }

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
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 51,
              width: '650px',
              maxWidth: 'calc(100vw - 2rem)',
              maxHeight: '80vh',
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px 16px',
              borderBottom: '1px solid #DDEC90',
              background: 'linear-gradient(to bottom, #FAFAF2, #FFFFFF)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={22} style={{ color: '#7A8A00' }} />
                <span style={{ fontWeight: 700, fontSize: '18px', color: '#1A1A00', fontFamily: "'Geist', 'Inter', sans-serif" }}>
                  Agent Schedules
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

            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '10px 14px', marginBottom: '16px',
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

              {/* Loading */}
              {isLoading && (
                <div style={{ textAlign: 'center', padding: '32px', color: '#6A6A20', fontSize: '14px' }}>
                  Loading schedules...
                </div>
              )}

              {/* Existing schedules */}
              {!isLoading && schedules.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  {schedules.map((schedule) => {
                    const { time: localTime, dayShift } = utcToLocalWithDayShift(schedule.start_time)
                    const duration = formatDuration(schedule.duration_minutes)
                    const displayDays = adjustDaysForDayShift(schedule.days_of_week, dayShift)
                    return (
                      <div
                        key={schedule.id}
                        style={{
                          background: '#FAFAF2',
                          border: '1px solid #DDEC90',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          opacity: schedule.enabled ? 1 : 0.6,
                          transition: 'opacity 0.15s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                          <div style={{ flex: 1 }}>
                            {/* Time */}
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                              <span style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A00', fontFamily: "'Geist', monospace" }}>
                                {localTime}
                              </span>
                              <span style={{ fontSize: '13px', color: '#6A6A20' }}>for {duration}</span>
                            </div>

                            {/* Day pills */}
                            <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
                              {DAYS.map((day) => {
                                const isActive = isDayActive(displayDays, day.bit)
                                return (
                                  <span
                                    key={day.label}
                                    style={{
                                      fontSize: '11px',
                                      padding: '2px 8px',
                                      borderRadius: '9999px',
                                      fontWeight: 700,
                                      border: isActive ? '1px solid #BBCB64' : '1px solid #DDEC90',
                                      background: isActive ? '#BBCB64' : 'transparent',
                                      color: isActive ? '#1A1A00' : '#9A9A60',
                                    }}
                                  >
                                    {day.label}
                                  </span>
                                )
                              })}
                            </div>

                            {/* Metadata pills */}
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                              {schedule.yolo_mode && (
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#A05A00', background: '#FFF0DC', border: '1px solid #F0C880', borderRadius: '9999px', padding: '2px 8px' }}>
                                  YOLO
                                </span>
                              )}
                              <span style={{ fontSize: '11px', color: '#6A6A20', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <GitBranch size={11} />
                                {schedule.max_concurrency}x
                              </span>
                              {schedule.model && (
                                <span style={{ fontSize: '11px', color: '#6A6A20', fontFamily: 'monospace' }}>
                                  {schedule.model}
                                </span>
                              )}
                              {schedule.crash_count > 0 && (
                                <span style={{ fontSize: '11px', color: '#A05A00', fontWeight: 600 }}>
                                  {schedule.crash_count} crash{schedule.crash_count !== 1 ? 'es' : ''}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            <button
                              onClick={() => handleToggleSchedule(schedule.id, schedule.enabled)}
                              disabled={toggleSchedule.isPending}
                              style={{
                                fontSize: '12px',
                                fontWeight: 700,
                                padding: '5px 12px',
                                borderRadius: '9999px',
                                border: schedule.enabled ? '1px solid #BBCB64' : '1px solid #DDEC90',
                                background: schedule.enabled ? '#F5F8D0' : 'transparent',
                                color: schedule.enabled ? '#7A8A00' : '#6A6A20',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                fontFamily: "'Inter', sans-serif",
                              }}
                            >
                              {schedule.enabled ? 'Enabled' : 'Disabled'}
                            </button>
                            <button
                              onClick={() => handleDeleteSchedule(schedule.id)}
                              disabled={deleteSchedule.isPending}
                              title="Delete schedule"
                              style={{
                                width: '32px', height: '32px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'transparent', border: '1px solid #DDEC90',
                                borderRadius: '8px', cursor: 'pointer',
                                color: '#9A9A60', transition: 'all 0.15s',
                              }}
                              onMouseEnter={e => {
                                const el = e.currentTarget as HTMLElement
                                el.style.color = '#A05A00'
                                el.style.background = '#FFF0DC'
                                el.style.borderColor = '#F0C880'
                              }}
                              onMouseLeave={e => {
                                const el = e.currentTarget as HTMLElement
                                el.style.color = '#9A9A60'
                                el.style.background = 'transparent'
                                el.style.borderColor = '#DDEC90'
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Empty state */}
              {!isLoading && schedules.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 16px', marginBottom: '16px' }}>
                  <Clock size={40} style={{ color: '#DDEC90', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '14px', color: '#6A6A20', margin: 0 }}>No schedules configured yet</p>
                </div>
              )}

              {/* Divider */}
              <div style={{ height: '1px', background: '#DDEC90', margin: '8px 0 20px' }} />

              {/* Add new schedule form */}
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '15px', color: '#1A1A00', marginBottom: '16px', fontFamily: "'Geist', 'Inter', sans-serif" }}>
                  Add New Schedule
                </h3>

                {/* Time + Duration */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6A6A20', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Start Time (Local)
                    </label>
                    <input
                      type="time"
                      value={newSchedule.start_time}
                      onChange={(e) => setNewSchedule((prev) => ({ ...prev, start_time: e.target.value }))}
                      style={inputStyle}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6A6A20', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1440"
                      value={newSchedule.duration_minutes}
                      onChange={(e) => {
                        const parsed = parseInt(e.target.value, 10)
                        const value = isNaN(parsed) ? 1 : Math.max(1, Math.min(1440, parsed))
                        setNewSchedule((prev) => ({ ...prev, duration_minutes: value }))
                      }}
                      style={inputStyle}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    />
                    <p style={{ fontSize: '11px', color: '#6A6A20', marginTop: '4px' }}>
                      {formatDuration(newSchedule.duration_minutes)}
                    </p>
                  </div>
                </div>

                {/* Days of week */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6A6A20', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Days
                  </label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {DAYS.map((day) => {
                      const isActive = isDayActive(newSchedule.days_of_week, day.bit)
                      return (
                        <button
                          key={day.label}
                          onClick={() => handleToggleDay(day.bit)}
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            padding: '5px 12px',
                            borderRadius: '9999px',
                            border: isActive ? '1px solid #BBCB64' : '1px solid #DDEC90',
                            background: isActive ? '#BBCB64' : 'transparent',
                            color: isActive ? '#1A1A00' : '#6A6A20',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          {day.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* YOLO mode toggle */}
                <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setNewSchedule(prev => ({ ...prev, yolo_mode: !prev.yolo_mode }))}
                    style={{
                      width: '40px', height: '22px', borderRadius: '9999px', border: 'none',
                      background: newSchedule.yolo_mode ? '#BBCB64' : '#DDEC90',
                      cursor: 'pointer', position: 'relative', transition: 'background 0.15s', padding: 0, flexShrink: 0,
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: '2px',
                      left: newSchedule.yolo_mode ? '20px' : '2px',
                      width: '18px', height: '18px', borderRadius: '9999px',
                      background: '#FFFFFF', transition: 'left 0.15s',
                      boxShadow: '0 1px 3px rgba(26,26,0,0.2)',
                    }} />
                  </button>
                  <label style={{ fontSize: '13px', color: '#1A1A00', cursor: 'pointer' }}
                    onClick={() => setNewSchedule(prev => ({ ...prev, yolo_mode: !prev.yolo_mode }))}>
                    YOLO Mode <span style={{ color: '#6A6A20', fontWeight: 400 }}>(skip testing)</span>
                  </label>
                </div>

                {/* Concurrency slider */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6A6A20', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Concurrent Agents (1–5)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <GitBranch size={16} style={{ color: newSchedule.max_concurrency > 1 ? '#7A8A00' : '#9A9A60', flexShrink: 0 }} />
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={newSchedule.max_concurrency}
                      onChange={(e) => setNewSchedule((prev) => ({ ...prev, max_concurrency: Number(e.target.value) }))}
                      style={{ flex: 1, height: '4px', accentColor: '#BBCB64', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A00', minWidth: '32px', textAlign: 'center', fontFamily: 'monospace' }}>
                      {newSchedule.max_concurrency}x
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#6A6A20', marginTop: '4px' }}>
                    Run {newSchedule.max_concurrency} agent{newSchedule.max_concurrency > 1 ? 's' : ''} in parallel for faster feature completion
                  </p>
                </div>

                {/* Model (optional) */}
                <div style={{ marginBottom: '4px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6A6A20', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Model <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., claude-3-5-sonnet-20241022"
                    value={newSchedule.model || ''}
                    onChange={(e) => setNewSchedule((prev) => ({ ...prev, model: e.target.value || null }))}
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
              padding: '14px 24px',
              borderTop: '1px solid #DDEC90',
              background: '#FAFAF2',
              flexShrink: 0,
            }}>
              <button
                onClick={onClose}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  border: '1px solid #DDEC90',
                  background: 'transparent',
                  color: '#6A6A20',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F5F8D0' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                Close
              </button>
              <button
                onClick={handleCreateSchedule}
                disabled={createSchedule.isPending || newSchedule.days_of_week === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '9px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#BBCB64',
                  color: '#1A1A00',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: createSchedule.isPending || newSchedule.days_of_week === 0 ? 'not-allowed' : 'pointer',
                  opacity: createSchedule.isPending || newSchedule.days_of_week === 0 ? 0.5 : 1,
                  fontFamily: "'Inter', sans-serif",
                  transition: 'opacity 0.15s',
                }}
              >
                <Plus size={16} />
                {createSchedule.isPending ? 'Creating...' : 'Create Schedule'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
