import { useState } from 'react'
import { X, CheckCircle2, Circle, SkipForward, Trash2, Loader2, AlertCircle, Pencil, Link2, AlertTriangle, UserCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSkipFeature, useDeleteFeature, useFeatures, useResolveHumanInput } from '../hooks/useProjects'
import { EditFeatureForm } from './EditFeatureForm'
import { HumanInputForm } from './HumanInputForm'
import type { Feature } from '../lib/types'

// Generate consistent color from palette for category
function getCategoryColor(category: string): { bg: string; color: string; border: string } {
  const palette = [
    { bg: '#F5F8D0', color: '#7A8A00', border: '#DDEC90' },
    { bg: '#FFF0DC', color: '#A05A00', border: '#F0C880' },
    { bg: '#FAFAF2', color: '#6A6A20', border: '#DDEC90' },
    { bg: '#F0F4E0', color: '#5A6A00', border: '#C8D870' },
    { bg: '#FFF8EC', color: '#8A6000', border: '#E8C870' },
    { bg: '#F5F0E0', color: '#6A5A00', border: '#D0C060' },
    { bg: '#F0F8D0', color: '#4A7A00', border: '#B0D060' },
  ]
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash)
  }
  return palette[Math.abs(hash) % palette.length]
}


interface FeatureModalProps {
  feature: Feature
  projectName: string
  onClose: () => void
}

export function FeatureModal({ feature, projectName, onClose }: FeatureModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const skipFeature = useSkipFeature(projectName)
  const deleteFeature = useDeleteFeature(projectName)
  const { data: allFeatures } = useFeatures(projectName)
  const resolveHumanInput = useResolveHumanInput(projectName)

  const featureMap = new Map<number, Feature>()
  if (allFeatures) {
    ;[...allFeatures.pending, ...allFeatures.in_progress, ...allFeatures.done, ...(allFeatures.needs_human_input || [])].forEach(f => {
      featureMap.set(f.id, f)
    })
  }

  const dependencies = (feature.dependencies || [])
    .map(id => featureMap.get(id))
    .filter((f): f is Feature => f !== undefined)

  const blockingDeps = (feature.blocking_dependencies || [])
    .map(id => featureMap.get(id))
    .filter((f): f is Feature => f !== undefined)

  const handleSkip = async () => {
    setError(null)
    try {
      await skipFeature.mutateAsync(feature.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to skip feature')
    }
  }

  const handleDelete = async () => {
    setError(null)
    try {
      await deleteFeature.mutateAsync(feature.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete feature')
    }
  }

  if (showEdit) {
    return (
      <EditFeatureForm
        feature={feature}
        projectName={projectName}
        onClose={() => setShowEdit(false)}
        onSaved={onClose}
      />
    )
  }

  const catColors = getCategoryColor(feature.category)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(26,26,0,0.45)',
          backdropFilter: 'blur(4px)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 4 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #DDEC90',
            boxShadow: '0 20px 60px rgba(26,26,0,0.15), 0 8px 24px rgba(26,26,0,0.08)',
            width: '640px',
            maxWidth: '90vw',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'Inter', sans-serif",
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '24px 28px 16px',
            borderBottom: '1px solid #DDEC90',
            background: 'linear-gradient(to bottom, #FAFAF2, #FFFFFF)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  background: catColors.bg,
                  color: catColors.color,
                  border: `1px solid ${catColors.border}`,
                  marginBottom: '10px',
                  letterSpacing: '0.02em',
                }}>
                  {feature.category}
                </span>
                <h2 style={{
                  fontFamily: "'Geist', 'Inter', sans-serif",
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#1A1A00',
                  margin: 0,
                  lineHeight: 1.3,
                }}>
                  {feature.name}
                </h2>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, background: '#F5F8D0' }}
                whileTap={{ scale: 0.9 }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6A6A20',
                  padding: '4px',
                  borderRadius: '8px',
                  flexShrink: 0,
                }}
              >
                <X size={20} />
              </motion.button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    style={{
                      background: '#FFF0DC',
                      border: '1px solid #F0C880',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontSize: '13px',
                      color: '#A05A00',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={16} style={{ flexShrink: 0 }} />
                      <span>{error}</span>
                    </div>
                    <button
                      onClick={() => setError(null)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A05A00', padding: '2px' }}
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: '#FAFAF2',
                border: '1px solid #DDEC90',
              }}>
                {feature.passes ? (
                  <>
                    <CheckCircle2 size={22} style={{ color: '#7A8A00' }} />
                    <span style={{ fontWeight: 700, color: '#7A8A00', fontSize: '13px' }}>COMPLETE</span>
                  </>
                ) : feature.needs_human_input ? (
                  <>
                    <UserCircle size={22} style={{ color: '#F79A19' }} />
                    <span style={{ fontWeight: 700, color: '#F79A19', fontSize: '13px' }}>NEEDS YOUR INPUT</span>
                  </>
                ) : (
                  <>
                    <Circle size={22} style={{ color: '#6A6A20' }} />
                    <span style={{ fontWeight: 700, color: '#6A6A20', fontSize: '13px' }}>PENDING</span>
                  </>
                )}
                <span style={{
                  marginLeft: 'auto',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                  color: '#6A6A20',
                }}>
                  Priority: #{feature.priority}
                </span>
              </div>

              {/* Human Input Request */}
              {feature.needs_human_input && feature.human_input_request && (
                <HumanInputForm
                  request={feature.human_input_request}
                  onSubmit={async (fields) => {
                    setError(null)
                    try {
                      await resolveHumanInput.mutateAsync({ featureId: feature.id, fields })
                      onClose()
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Failed to submit response')
                    }
                  }}
                  isLoading={resolveHumanInput.isPending}
                />
              )}

              {/* Previous Human Input Response */}
              {feature.human_input_response && !feature.needs_human_input && (
                <div style={{
                  background: '#F5F8D0',
                  border: '1px solid #BBCB64',
                  borderRadius: '10px',
                  padding: '12px 16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <CheckCircle2 size={16} style={{ color: '#7A8A00' }} />
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#7A8A00' }}>Human Input Provided</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6A6A20', margin: 0 }}>
                    Response submitted{feature.human_input_response.responded_at
                      ? ` at ${new Date(feature.human_input_response.responded_at).toLocaleString()}`
                      : ''}.
                  </p>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  color: '#7A8A00',
                  margin: '0 0 8px',
                }}>
                  Description
                </h3>
                <p style={{ fontSize: '14px', color: '#1A1A00', lineHeight: 1.6, margin: 0 }}>
                  {feature.description}
                </p>
              </div>

              {/* Blocked By Warning */}
              {blockingDeps.length > 0 && (
                <div style={{
                  background: '#FFF0DC',
                  border: '1px solid #F0C880',
                  borderLeft: '4px solid #F79A19',
                  borderRadius: '8px',
                  padding: '12px 16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <AlertTriangle size={16} style={{ color: '#F79A19' }} />
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#A05A00' }}>Blocked By</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#A05A00', margin: '0 0 8px' }}>
                    This feature cannot start until the following dependencies are complete:
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {blockingDeps.map(dep => (
                      <li key={dep.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#A05A00' }}>
                        <Circle size={12} />
                        <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>#{dep.id}</span>
                        <span>{dep.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Dependencies */}
              {dependencies.length > 0 && (
                <div>
                  <h3 style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    color: '#7A8A00',
                    margin: '0 0 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <Link2 size={14} />
                    Depends On
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {dependencies.map(dep => (
                      <li
                        key={dep.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          background: '#FAFAF2',
                          border: '1px solid #DDEC90',
                          fontSize: '13px',
                        }}
                      >
                        {dep.passes ? (
                          <CheckCircle2 size={16} style={{ color: '#7A8A00', flexShrink: 0 }} />
                        ) : (
                          <Circle size={16} style={{ color: '#6A6A20', flexShrink: 0 }} />
                        )}
                        <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6A6A20' }}>#{dep.id}</span>
                        <span style={{ color: dep.passes ? '#7A8A00' : '#1A1A00' }}>{dep.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Test Steps */}
              {feature.steps.length > 0 && (
                <div>
                  <h3 style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    color: '#7A8A00',
                    margin: '0 0 8px',
                  }}>
                    Test Steps
                  </h3>
                  <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {feature.steps.map((step, index) => (
                      <li
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: '#FAFAF2',
                          border: '1px solid #DDEC90',
                          fontSize: '13px',
                          color: '#1A1A00',
                          lineHeight: 1.5,
                        }}
                      >
                        <span style={{
                          width: '20px',
                          height: '20px',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          background: '#DDEC90',
                          color: '#7A8A00',
                          fontSize: '11px',
                          fontWeight: 700,
                          fontFamily: "'Geist', 'Inter', sans-serif",
                        }}>
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          {!feature.passes && (
            <div style={{
              padding: '16px 28px',
              borderTop: '1px solid #DDEC90',
              background: '#FAFAF2',
            }}>
              <AnimatePresence mode="wait">
                {showDeleteConfirm ? (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                  >
                    <p style={{ fontWeight: 600, textAlign: 'center', fontSize: '14px', color: '#1A1A00', margin: 0 }}>
                      Are you sure you want to delete this feature?
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={handleDelete}
                        disabled={deleteFeature.isPending}
                        style={{
                          flex: 1,
                          background: '#FFF0DC',
                          color: '#A05A00',
                          border: '1px solid #F0C880',
                          fontWeight: 700,
                          fontSize: '14px',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          cursor: deleteFeature.isPending ? 'not-allowed' : 'pointer',
                          opacity: deleteFeature.isPending ? 0.6 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {deleteFeature.isPending ? (
                          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        ) : (
                          'Yes, Delete'
                        )}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={deleteFeature.isPending}
                        style={{
                          flex: 1,
                          background: 'transparent',
                          color: '#6A6A20',
                          border: '1px solid #DDEC90',
                          fontWeight: 600,
                          fontSize: '14px',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          cursor: 'pointer',
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="actions"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    style={{ display: 'flex', gap: '10px' }}
                  >
                    <motion.button
                      onClick={() => setShowEdit(true)}
                      disabled={skipFeature.isPending}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        flex: 1,
                        background: '#BBCB64',
                        color: '#1A1A00',
                        border: '1px solid #BBCB64',
                        fontWeight: 700,
                        fontSize: '14px',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        cursor: skipFeature.isPending ? 'not-allowed' : 'pointer',
                        opacity: skipFeature.isPending ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      <Pencil size={16} />
                      Edit
                    </motion.button>
                    <motion.button
                      onClick={handleSkip}
                      disabled={skipFeature.isPending}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        flex: 1,
                        background: 'transparent',
                        color: '#7A8A00',
                        border: '1px solid #DDEC90',
                        fontWeight: 600,
                        fontSize: '14px',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        cursor: skipFeature.isPending ? 'not-allowed' : 'pointer',
                        opacity: skipFeature.isPending ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {skipFeature.isPending ? (
                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <>
                          <SkipForward size={16} />
                          Skip
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={skipFeature.isPending}
                      whileHover={{ scale: 1.05, background: '#FFF0DC' }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        background: 'transparent',
                        color: '#A05A00',
                        border: '1px solid #F0C880',
                        fontWeight: 600,
                        fontSize: '14px',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        cursor: skipFeature.isPending ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
