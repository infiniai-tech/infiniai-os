/**
 * Question Options Component
 *
 * Renders structured questions from AskUserQuestion tool.
 * Shows clickable option buttons.
 */

import { useState } from 'react'
import { Check } from 'lucide-react'
import type { SpecQuestion } from '../lib/types'

interface QuestionOptionsProps {
  questions: SpecQuestion[]
  onSubmit: (answers: Record<string, string | string[]>) => void
  disabled?: boolean
}

export function QuestionOptions({
  questions,
  onSubmit,
  disabled = false,
}: QuestionOptionsProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({})
  const [showCustomInput, setShowCustomInput] = useState<Record<string, boolean>>({})

  const handleOptionClick = (questionIdx: number, optionLabel: string, multiSelect: boolean) => {
    const key = String(questionIdx)

    if (optionLabel === 'Other') {
      setShowCustomInput((prev) => ({ ...prev, [key]: true }))
      return
    }

    setShowCustomInput((prev) => ({ ...prev, [key]: false }))

    setAnswers((prev) => {
      if (multiSelect) {
        const current = (prev[key] as string[]) || []
        if (current.includes(optionLabel)) {
          return { ...prev, [key]: current.filter((o) => o !== optionLabel) }
        } else {
          return { ...prev, [key]: [...current, optionLabel] }
        }
      } else {
        return { ...prev, [key]: optionLabel }
      }
    })
  }

  const handleCustomInputChange = (questionIdx: number, value: string) => {
    const key = String(questionIdx)
    setCustomInputs((prev) => ({ ...prev, [key]: value }))
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = () => {
    const finalAnswers: Record<string, string | string[]> = {}
    questions.forEach((_, idx) => {
      const key = String(idx)
      if (showCustomInput[key] && customInputs[key]) {
        finalAnswers[key] = customInputs[key]
      } else if (answers[key]) {
        finalAnswers[key] = answers[key]
      }
    })
    onSubmit(finalAnswers)
  }

  const isOptionSelected = (questionIdx: number, optionLabel: string, multiSelect: boolean) => {
    const key = String(questionIdx)
    const answer = answers[key]
    if (multiSelect) return Array.isArray(answer) && answer.includes(optionLabel)
    return answer === optionLabel
  }

  const hasAnswer = (questionIdx: number) => {
    const key = String(questionIdx)
    return !!(answers[key] || (showCustomInput[key] && customInputs[key]))
  }

  const allQuestionsAnswered = questions.every((_, idx) => hasAnswer(idx))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px', fontFamily: "'Inter', sans-serif" }}>
      {questions.map((q, questionIdx) => (
        <div
          key={questionIdx}
          style={{
            background: '#FFFFFF',
            border: '1px solid #DDEC90',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(26,26,0,0.06)',
          }}
        >
          {/* Question header */}
          <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #DDEC90', background: 'linear-gradient(to bottom, #FAFAF2, #FFFFFF)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 10px',
                borderRadius: '9999px',
                background: '#F5F8D0',
                color: '#7A8A00',
                border: '1px solid #DDEC90',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                {q.header}
              </span>
              <span style={{ fontWeight: 700, color: '#1A1A00', fontSize: '14px', flex: 1 }}>
                {q.question}
              </span>
              {q.multiSelect && (
                <span style={{ fontSize: '11px', color: '#6A6A20', fontFamily: 'monospace' }}>
                  (select multiple)
                </span>
              )}
            </div>
          </div>

          {/* Options grid */}
          <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
            {q.options.map((opt, optIdx) => {
              const isSelected = isOptionSelected(questionIdx, opt.label, q.multiSelect)
              return (
                <button
                  key={optIdx}
                  onClick={() => handleOptionClick(questionIdx, opt.label, q.multiSelect)}
                  disabled={disabled}
                  style={{
                    textAlign: 'left',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: isSelected ? '1px solid #BBCB64' : '1px solid #DDEC90',
                    background: isSelected ? '#F5F8D0' : '#FFFFFF',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.5 : 1,
                    transition: 'all 0.15s',
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    if (!disabled && !isSelected) {
                      e.currentTarget.style.borderColor = '#BBCB64'
                      e.currentTarget.style.background = '#FAFAF2'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!disabled && !isSelected) {
                      e.currentTarget.style.borderColor = '#DDEC90'
                      e.currentTarget.style.background = '#FFFFFF'
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      flexShrink: 0,
                      marginTop: '1px',
                      borderRadius: q.multiSelect ? '4px' : '9999px',
                      border: isSelected ? '2px solid #BBCB64' : '2px solid #DDEC90',
                      background: isSelected ? '#BBCB64' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                      {isSelected && <Check size={11} strokeWidth={3} style={{ color: '#1A1A00' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#1A1A00', marginBottom: '3px' }}>
                        {opt.label}
                      </div>
                      {opt.description && (
                        <div style={{ fontSize: '12px', color: '#6A6A20', lineHeight: 1.4 }}>
                          {opt.description}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}

            {/* "Other" option */}
            <button
              onClick={() => handleOptionClick(questionIdx, 'Other', q.multiSelect)}
              disabled={disabled}
              style={{
                textAlign: 'left',
                padding: '12px 14px',
                borderRadius: '8px',
                border: showCustomInput[String(questionIdx)] ? '1px solid #BBCB64' : '1px solid #DDEC90',
                background: showCustomInput[String(questionIdx)] ? '#F5F8D0' : '#FFFFFF',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                transition: 'all 0.15s',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{
                  width: '18px',
                  height: '18px',
                  flexShrink: 0,
                  marginTop: '1px',
                  borderRadius: q.multiSelect ? '4px' : '9999px',
                  border: showCustomInput[String(questionIdx)] ? '2px solid #BBCB64' : '2px solid #DDEC90',
                  background: showCustomInput[String(questionIdx)] ? '#BBCB64' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                  {showCustomInput[String(questionIdx)] && <Check size={11} strokeWidth={3} style={{ color: '#1A1A00' }} />}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#1A1A00', marginBottom: '3px' }}>Other</div>
                  <div style={{ fontSize: '12px', color: '#6A6A20' }}>Provide a custom answer</div>
                </div>
              </div>
            </button>
          </div>

          {/* Custom input field */}
          {showCustomInput[String(questionIdx)] && (
            <div style={{ padding: '0 16px 14px' }}>
              <input
                type="text"
                value={customInputs[String(questionIdx)] || ''}
                onChange={(e) => handleCustomInputChange(questionIdx, e.target.value)}
                placeholder="Type your answer..."
                autoFocus
                disabled={disabled}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #BBCB64',
                  fontSize: '14px',
                  fontFamily: "'Inter', sans-serif",
                  color: '#1A1A00',
                  background: '#FFFFFF',
                  outline: 'none',
                  boxSizing: 'border-box',
                  boxShadow: '0 0 0 3px rgba(187,203,100,0.12)',
                }}
              />
            </div>
          )}
        </div>
      ))}

      {/* Submit button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSubmit}
          disabled={disabled || !allQuestionsAnswered}
          style={{
            background: '#BBCB64',
            color: '#1A1A00',
            border: '1px solid #BBCB64',
            fontWeight: 700,
            fontSize: '14px',
            borderRadius: '8px',
            padding: '10px 24px',
            cursor: disabled || !allQuestionsAnswered ? 'not-allowed' : 'pointer',
            opacity: disabled || !allQuestionsAnswered ? 0.5 : 1,
            fontFamily: "'Inter', sans-serif",
            transition: 'opacity 0.15s',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
