import { useState } from 'react'
import { Loader2, UserCircle, Send, AlertCircle } from 'lucide-react'
import type { HumanInputRequest } from '../lib/types'

interface HumanInputFormProps {
  request: HumanInputRequest
  onSubmit: (fields: Record<string, string | boolean | string[]>) => Promise<void>
  isLoading: boolean
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

const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = '#BBCB64'
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(187,203,100,0.12)'
}
const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = '#DDEC90'
  e.currentTarget.style.boxShadow = 'none'
}

export function HumanInputForm({ request, onSubmit, isLoading }: HumanInputFormProps) {
  const [values, setValues] = useState<Record<string, string | boolean | string[]>>(() => {
    const initial: Record<string, string | boolean | string[]> = {}
    for (const field of request.fields) {
      if (field.type === 'boolean') {
        initial[field.id] = false
      } else {
        initial[field.id] = ''
      }
    }
    return initial
  })

  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = async () => {
    for (const field of request.fields) {
      if (field.required) {
        const val = values[field.id]
        if (val === undefined || val === null || val === '') {
          setValidationError(`"${field.label}" is required`)
          return
        }
      }
    }
    setValidationError(null)
    await onSubmit(values)
  }

  return (
    <div style={{
      background: '#FFF8EC',
      border: '1px solid #F0C880',
      borderLeft: '4px solid #F79A19',
      borderRadius: '10px',
      padding: '16px',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
        <UserCircle size={20} style={{ color: '#F79A19', flexShrink: 0, marginTop: '1px' }} />
        <div>
          <h4 style={{ fontWeight: 700, color: '#A05A00', fontSize: '14px', margin: '0 0 4px' }}>
            Agent needs your help
          </h4>
          <p style={{ fontSize: '13px', color: '#A05A00', margin: 0, lineHeight: 1.5 }}>
            {request.prompt}
          </p>
        </div>
      </div>

      {/* Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {request.fields.map((field) => (
          <div key={field.id}>
            <label
              htmlFor={`human-input-${field.id}`}
              style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1A1A00', marginBottom: '5px' }}
            >
              {field.label}
              {field.required && <span style={{ color: '#F79A19', marginLeft: '3px' }}>*</span>}
            </label>

            {field.type === 'text' && (
              <input
                id={`human-input-${field.id}`}
                type="text"
                value={values[field.id] as string}
                onChange={(e) => setValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                placeholder={field.placeholder || ''}
                disabled={isLoading}
                style={{ ...inputStyle, opacity: isLoading ? 0.6 : 1 }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            )}

            {field.type === 'textarea' && (
              <textarea
                id={`human-input-${field.id}`}
                value={values[field.id] as string}
                onChange={(e) => setValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                placeholder={field.placeholder || ''}
                disabled={isLoading}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', opacity: isLoading ? 0.6 : 1 }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            )}

            {field.type === 'select' && field.options && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {field.options.map((option) => {
                  const isSelected = values[field.id] === option.value
                  return (
                    <label
                      key={option.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: isSelected ? '1px solid #BBCB64' : '1px solid #DDEC90',
                        background: isSelected ? '#F5F8D0' : '#FFFFFF',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s',
                        fontSize: '13px',
                        color: '#1A1A00',
                      }}
                    >
                      <input
                        type="radio"
                        name={`human-input-${field.id}`}
                        value={option.value}
                        checked={isSelected}
                        onChange={(e) => setValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                        disabled={isLoading}
                        style={{ accentColor: '#BBCB64' }}
                      />
                      {option.label}
                    </label>
                  )
                })}
              </div>
            )}

            {field.type === 'boolean' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Custom toggle */}
                <button
                  type="button"
                  id={`human-input-${field.id}`}
                  onClick={() => !isLoading && setValues(prev => ({ ...prev, [field.id]: !prev[field.id] }))}
                  disabled={isLoading}
                  style={{
                    width: '40px',
                    height: '22px',
                    borderRadius: '9999px',
                    border: 'none',
                    background: values[field.id] ? '#BBCB64' : '#DDEC90',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    position: 'relative',
                    transition: 'background 0.15s',
                    padding: 0,
                    flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    left: values[field.id] ? '20px' : '2px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '9999px',
                    background: '#FFFFFF',
                    transition: 'left 0.15s',
                    boxShadow: '0 1px 3px rgba(26,26,0,0.2)',
                  }} />
                </button>
                <span style={{ fontSize: '13px', color: '#6A6A20' }}>
                  {values[field.id] ? 'Yes' : 'No'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Validation error */}
      {validationError && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '10px',
          fontSize: '13px',
          color: '#A05A00',
        }}>
          <AlertCircle size={14} />
          {validationError}
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        style={{
          marginTop: '14px',
          width: '100%',
          background: '#BBCB64',
          color: '#1A1A00',
          border: '1px solid #BBCB64',
          fontWeight: 700,
          fontSize: '14px',
          borderRadius: '8px',
          padding: '10px 20px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.6 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontFamily: "'Inter', sans-serif",
          transition: 'opacity 0.15s',
        }}
      >
        {isLoading ? (
          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
        ) : (
          <>
            <Send size={16} />
            Submit Response
          </>
        )}
      </button>
    </div>
  )
}
