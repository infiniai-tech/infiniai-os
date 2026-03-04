import { useState, useId } from 'react'
import { X, Save, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUpdateFeature } from '../hooks/useProjects'
import type { Feature } from '../lib/types'

interface Step {
  id: string
  value: string
}

interface EditFeatureFormProps {
  feature: Feature
  projectName: string
  onClose: () => void
  onSaved: () => void
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
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

const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = '#BBCB64'
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(187,203,100,0.12)'
}

const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = '#DDEC90'
  e.currentTarget.style.boxShadow = 'none'
}

export function EditFeatureForm({ feature, projectName, onClose, onSaved }: EditFeatureFormProps) {
  const formId = useId()
  const [category, setCategory] = useState(feature.category)
  const [name, setName] = useState(feature.name)
  const [description, setDescription] = useState(feature.description)
  const [priority, setPriority] = useState(String(feature.priority))
  const [steps, setSteps] = useState<Step[]>(() =>
    feature.steps.length > 0
      ? feature.steps.map((step, i) => ({ id: `${formId}-step-${i}`, value: step }))
      : [{ id: `${formId}-step-0`, value: '' }]
  )
  const [error, setError] = useState<string | null>(null)
  const [stepCounter, setStepCounter] = useState(feature.steps.length || 1)

  const updateFeature = useUpdateFeature(projectName)

  const handleAddStep = () => {
    setSteps([...steps, { id: `${formId}-step-${stepCounter}`, value: '' }])
    setStepCounter(stepCounter + 1)
  }

  const handleRemoveStep = (id: string) => {
    setSteps(steps.filter(step => step.id !== id))
  }

  const handleStepChange = (id: string, value: string) => {
    setSteps(steps.map(step =>
      step.id === id ? { ...step, value } : step
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const filteredSteps = steps
      .map(s => s.value.trim())
      .filter(s => s.length > 0)

    try {
      await updateFeature.mutateAsync({
        featureId: feature.id,
        update: {
          category: category.trim(),
          name: name.trim(),
          description: description.trim(),
          steps: filteredSteps,
          priority: parseInt(priority, 10),
        },
      })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update feature')
    }
  }

  const isValid = category.trim() && name.trim() && description.trim()

  const currentSteps = steps.map(s => s.value.trim()).filter(s => s)
  const hasChanges =
    category.trim() !== feature.category ||
    name.trim() !== feature.name ||
    description.trim() !== feature.description ||
    parseInt(priority, 10) !== feature.priority ||
    JSON.stringify(currentSteps) !== JSON.stringify(feature.steps)

  return (
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
          width: '580px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ padding: '28px 28px 0' }}>
          <h2
            style={{
              fontFamily: "'Geist', 'Inter', sans-serif",
              fontSize: '20px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#1A1A00',
              margin: 0,
            }}
          >
            Edit Feature
          </h2>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #DDEC90', margin: '20px 28px' }} />

        {/* Scrollable form content */}
        <form
          onSubmit={handleSubmit}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 28px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
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
                  type="button"
                  onClick={() => setError(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    color: '#A05A00',
                    flexShrink: 0,
                  }}
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category & Priority Row */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label
                htmlFor="edit-category"
                style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1A1A00', marginBottom: '6px' }}
              >
                Category
              </label>
              <input
                id="edit-category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Authentication, UI, API"
                required
                style={inputStyle}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>
            <div style={{ width: '120px' }}>
              <label
                htmlFor="edit-priority"
                style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1A1A00', marginBottom: '6px' }}
              >
                Priority
              </label>
              <input
                id="edit-priority"
                type="number"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                min={1}
                required
                style={inputStyle}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label
              htmlFor="edit-name"
              style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1A1A00', marginBottom: '6px' }}
            >
              Feature Name
            </label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., User login form"
              required
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="edit-description"
              style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1A1A00', marginBottom: '6px' }}
            >
              Description
            </label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this feature should do..."
              required
              style={{
                ...inputStyle,
                minHeight: '100px',
                resize: 'vertical' as const,
              }}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>

          {/* Steps */}
          <div>
            <label
              style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1A1A00', marginBottom: '6px' }}
            >
              Test Steps
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                >
                  <span
                    style={{
                      width: '36px',
                      height: '36px',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Geist', 'Inter', sans-serif",
                      fontWeight: 700,
                      fontSize: '13px',
                      borderRadius: '8px',
                      border: '1px solid #DDEC90',
                      background: '#F5F8D0',
                      color: '#6A6A20',
                    }}
                  >
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={step.value}
                    onChange={(e) => handleStepChange(step.id, e.target.value)}
                    placeholder="Describe this step..."
                    style={{ ...inputStyle, flex: 1 }}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(step.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '6px',
                        color: '#6A6A20',
                        borderRadius: '6px',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#FFF0DC'
                        e.currentTarget.style.color = '#A05A00'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = '#6A6A20'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddStep}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#7A8A00',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 0',
                marginTop: '6px',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <Plus size={14} />
              Add Step
            </button>
          </div>

          {/* Divider above actions */}
          <hr style={{ border: 'none', borderTop: '1px solid #DDEC90', margin: '4px 0' }} />

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid #DDEC90',
                color: '#6A6A20',
                fontWeight: 600,
                fontSize: '14px',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F8D0' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || !hasChanges || updateFeature.isPending}
              style={{
                background: '#BBCB64',
                color: '#1A1A00',
                border: '1px solid #BBCB64',
                fontWeight: 700,
                fontSize: '14px',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: !isValid || !hasChanges || updateFeature.isPending ? 'not-allowed' : 'pointer',
                opacity: !isValid || !hasChanges || updateFeature.isPending ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: "'Inter', sans-serif",
                transition: 'opacity 0.15s',
              }}
            >
              {updateFeature.isPending ? (
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
