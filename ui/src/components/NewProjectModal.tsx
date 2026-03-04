/**
 * New Project Modal Component
 *
 * Multi-step modal for brownfield modernization:
 * 1. Enter odyssey name
 * 2. Select existing legacy codebase folder
 * 3. Choose target tech stack
 * → Navigate to project page for spec review (Zeus auto-analyzes)
 */

import { useState } from 'react'
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2, Folder, Code2, Server, Database, Palette, Scroll, FolderOpen, Figma, Layers, FileText, Globe } from 'lucide-react'
import { useCreateProject } from '../hooks/useProjects'
import { FolderBrowser } from './FolderBrowser'
import { motion } from 'framer-motion'

type Step = 'name' | 'folder' | 'stack' | 'complete'

export interface TargetStack {
  frontend: string | null
  backend: string | null
  database: string | null
  styling: string | null
}

const STACK_CATEGORIES: {
  key: keyof TargetStack
  label: string
  icon: typeof Code2
  options: { id: string; label: string }[]
}[] = [
  {
    key: 'frontend',
    label: 'Frontend Framework',
    icon: Code2,
    options: [
      { id: 'react', label: 'React' },
      { id: 'angular', label: 'Angular' },
      { id: 'vue', label: 'Vue' },
      { id: 'svelte', label: 'Svelte' },
      { id: 'nextjs', label: 'Next.js' },
      { id: 'none', label: 'Keep Current / None' },
    ],
  },
  {
    key: 'backend',
    label: 'Backend Framework',
    icon: Server,
    options: [
      { id: 'fastapi', label: 'FastAPI (Python)' },
      { id: 'express', label: 'Express (Node.js)' },
      { id: 'django', label: 'Django (Python)' },
      { id: 'springboot', label: 'Spring Boot (Java)' },
      { id: 'nestjs', label: 'NestJS (Node.js)' },
      { id: 'none', label: 'Keep Current / None' },
    ],
  },
  {
    key: 'database',
    label: 'Database',
    icon: Database,
    options: [
      { id: 'postgresql', label: 'PostgreSQL' },
      { id: 'mongodb', label: 'MongoDB' },
      { id: 'mysql', label: 'MySQL' },
      { id: 'sqlite', label: 'SQLite' },
      { id: 'none', label: 'Keep Current / None' },
    ],
  },
  {
    key: 'styling',
    label: 'Styling',
    icon: Palette,
    options: [
      { id: 'tailwind', label: 'Tailwind CSS' },
      { id: 'css-modules', label: 'CSS Modules' },
      { id: 'styled-components', label: 'Styled Components' },
      { id: 'material-ui', label: 'Material UI' },
      { id: 'none', label: 'Keep Current / None' },
    ],
  },
]

interface NewProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onProjectCreated: (projectName: string) => void
  onStepChange?: (step: Step) => void
}

export function NewProjectModal({
  isOpen,
  onClose,
  onProjectCreated,
  onStepChange,
}: NewProjectModalProps) {
  const [step, setStep] = useState<Step>('name')
  const [projectName, setProjectName] = useState('')
  const [projectPath, setProjectPath] = useState<string | null>(null)
  const [targetStack, setTargetStack] = useState<TargetStack>({
    frontend: null,
    backend: null,
    database: null,
    styling: null,
  })
  const [error, setError] = useState<string | null>(null)

  const createProject = useCreateProject()

  const changeStep = (newStep: Step) => {
    setStep(newStep)
    onStepChange?.(newStep)
  }

  if (!isOpen) return null

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = projectName.trim()

    if (!trimmed) {
      setError('Please enter a project name')
      return
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setError('Project name can only contain letters, numbers, hyphens, and underscores')
      return
    }

    setError(null)
    changeStep('folder')
  }

  const handleFolderSelect = (path: string) => {
    setProjectPath(path)
    changeStep('stack')
  }

  const handleFolderCancel = () => {
    changeStep('name')
  }

  const handleStackOptionSelect = (category: keyof TargetStack, optionId: string) => {
    setTargetStack(prev => ({ ...prev, [category]: optionId }))
  }

  const handleStackSubmit = async () => {
    if (!projectPath) {
      setError('Please select a project folder first')
      changeStep('folder')
      return
    }

    setError(null)

    try {
      await createProject.mutateAsync({
        name: projectName.trim(),
        path: projectPath,
        specMethod: 'claude',
        targetStack,
      })
      // Navigate directly to the project page — Zeus will auto-analyze
      changeStep('complete')
      setTimeout(() => {
        onProjectCreated(projectName.trim())
        handleClose()
      }, 1500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create odyssey')
    }
  }

  const handleClose = () => {
    changeStep('name')
    setProjectName('')
    setProjectPath(null)
    setTargetStack({ frontend: null, backend: null, database: null, styling: null })
    setError(null)
    onClose()
  }

  const handleBack = () => {
    if (step === 'stack') {
      changeStep('folder')
      setTargetStack({ frontend: null, backend: null, database: null, styling: null })
    } else if (step === 'folder') {
      changeStep('name')
      setProjectPath(null)
    }
  }

  // Shared overlay styles
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(26,26,0,0.45)',
    backdropFilter: 'blur(4px)',
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const panelBase: React.CSSProperties = {
    background: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #DDEC90',
    boxShadow: '0 20px 60px rgba(26,26,0,0.15), 0 8px 24px rgba(26,26,0,0.08)',
    maxWidth: '90vw',
    fontFamily: "'Inter', sans-serif",
    display: 'flex',
    flexDirection: 'column',
  }

  // Folder step uses a larger panel
  if (step === 'folder') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={overlayStyle}
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 4 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          style={{
            ...panelBase,
            width: '720px',
            maxHeight: '85vh',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '24px 28px 16px',
              borderBottom: '1px solid #DDEC90',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#F5F8D0',
                border: '1px solid #DDEC90',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Folder size={20} style={{ color: '#7A8A00' }} />
            </div>
            <div>
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
                Select Legacy Codebase
              </h2>
              <p
                style={{
                  fontSize: '13px',
                  color: '#6A6A20',
                  margin: '4px 0 0',
                }}
              >
                Choose the existing codebase you want to modernize for odyssey{' '}
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontWeight: 600,
                  }}
                >
                  {projectName}
                </span>
                .
              </p>
            </div>
          </div>

          {/* Folder browser */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <FolderBrowser
              onSelect={handleFolderSelect}
              onCancel={handleFolderCancel}
            />
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // Stack selection step
  if (step === 'stack') {
    const hasAnySelection = Object.values(targetStack).some(v => v !== null)

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={overlayStyle}
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 4 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          style={{
            ...panelBase,
            width: '620px',
            maxHeight: '85vh',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '24px 28px 16px',
              borderBottom: '1px solid #DDEC90',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#F5F8D0',
                border: '1px solid #DDEC90',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Scroll size={20} style={{ color: '#7A8A00' }} />
            </div>
            <div>
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
                Choose Target Stack
              </h2>
              <p
                style={{
                  fontSize: '13px',
                  color: '#6A6A20',
                  margin: '4px 0 0',
                }}
              >
                Select the modern technologies to transform your codebase into. Leave unselected to keep the current tech for that layer.
              </p>
            </div>
          </div>

          {/* Stack categories */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {STACK_CATEGORIES.map(category => {
              const Icon = category.icon
              return (
                <div key={category.key}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '10px',
                    }}
                  >
                    <Icon size={16} style={{ color: '#6A6A20' }} />
                    <label
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#1A1A00',
                      }}
                    >
                      {category.label}
                    </label>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {category.options.map(option => {
                      const isSelected = targetStack[category.key] === option.id
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() =>
                            handleStackOptionSelect(
                              category.key,
                              isSelected ? (null as unknown as string) : option.id
                            )
                          }
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            border: isSelected
                              ? '1px solid #BBCB64'
                              : '1px solid #DDEC90',
                            background: isSelected ? '#BBCB64' : '#FFFFFF',
                            color: isSelected ? '#1A1A00' : '#1A1A00',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            fontFamily: "'Inter', sans-serif",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background = '#F5F8D0'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background = '#FFFFFF'
                            }
                          }}
                        >
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: '0 28px 12px' }}>
              <div
                style={{
                  background: '#FFF0DC',
                  border: '1px solid #F0C880',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '13px',
                  color: '#A05A00',
                }}
              >
                {error}
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {createProject.isPending && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '8px 0',
                color: '#6A6A20',
                fontSize: '13px',
              }}
            >
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Forging your odyssey...</span>
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              padding: '16px 28px',
              borderTop: '1px solid #DDEC90',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <button
              onClick={handleBack}
              disabled={createProject.isPending}
              style={{
                background: 'transparent',
                border: '1px solid #DDEC90',
                color: '#6A6A20',
                fontWeight: 600,
                fontSize: '14px',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: createProject.isPending ? 'not-allowed' : 'pointer',
                opacity: createProject.isPending ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: "'Inter', sans-serif",
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!createProject.isPending) {
                  e.currentTarget.style.background = '#F5F8D0'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <button
              onClick={handleStackSubmit}
              disabled={!hasAnySelection || createProject.isPending}
              style={{
                background: '#BBCB64',
                color: '#1A1A00',
                border: '1px solid #BBCB64',
                fontWeight: 700,
                fontSize: '14px',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor:
                  !hasAnySelection || createProject.isPending
                    ? 'not-allowed'
                    : 'pointer',
                opacity: !hasAnySelection || createProject.isPending ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: "'Inter', sans-serif",
                transition: 'opacity 0.15s',
              }}
            >
              Begin Modernization
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // Name step and Complete step share the same modal shell
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={overlayStyle}
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 4 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        style={{
          ...panelBase,
          width: '520px',
          padding: '28px',
        }}
      >
        {/* Step 1: Project Name */}
        {step === 'name' && (
          <form onSubmit={handleNameSubmit}>
            <h2
              style={{
                fontFamily: "'Geist', 'Inter', sans-serif",
                fontSize: '20px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#1A1A00',
                margin: '0 0 6px',
              }}
            >
              Begin New Odyssey
            </h2>
            <p
              style={{
                fontSize: '13px',
                color: '#6A6A20',
                margin: '0 0 20px',
                lineHeight: 1.5,
              }}
            >
              Name your modernization odyssey. This will be used to track the transformation of your legacy codebase.
            </p>

            {/* Label + Input */}
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="project-name"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#1A1A00',
                  marginBottom: '6px',
                }}
              >
                Odyssey Name
              </label>
              <input
                id="project-name"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="my-legacy-app"
                autoFocus
                style={{
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
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#BBCB64'
                  e.currentTarget.style.boxShadow =
                    '0 0 0 3px rgba(187,203,100,0.12)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#DDEC90'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              <p
                style={{
                  fontSize: '12px',
                  color: '#6A6A20',
                  margin: '6px 0 0',
                }}
              >
                Use letters, numbers, hyphens, and underscores only.
              </p>
            </div>

            {/* Supported input types */}
            <div
              style={{
                background: '#FAFAF2',
                border: '1px solid #DDEC90',
                borderRadius: '8px',
                padding: '14px 16px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  color: '#7A8A00',
                  marginBottom: '10px',
                }}
              >
                Supported Inputs
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                }}
              >
                {[
                  { icon: FolderOpen, label: 'Code Folder', desc: 'Existing codebase directory' },
                  { icon: Figma, label: 'Figma File', desc: 'Design files & mockups' },
                  { icon: Layers, label: 'Prototype', desc: 'Interactive prototypes' },
                  { icon: FileText, label: 'Spec Document', desc: 'PRDs, requirements, docs' },
                  { icon: Globe, label: 'URL / API', desc: 'Live site or API endpoint' },
                  { icon: Code2, label: 'Git Repository', desc: 'Clone from remote repo' },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        background: '#FFFFFF',
                        border: '1px solid #F5F8D0',
                        transition: 'border-color 0.12s',
                      }}
                      onMouseEnter={(e) => {
                        ;(e.currentTarget as HTMLElement).style.borderColor =
                          '#DDEC90'
                      }}
                      onMouseLeave={(e) => {
                        ;(e.currentTarget as HTMLElement).style.borderColor =
                          '#F5F8D0'
                      }}
                    >
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '6px',
                          background: '#F5F8D0',
                          border: '1px solid #DDEC90',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={14} style={{ color: '#7A8A00' }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#1A1A00',
                          }}
                        >
                          {item.label}
                        </div>
                        <div
                          style={{
                            fontSize: '10px',
                            color: '#6A6A20',
                            lineHeight: 1.3,
                          }}
                        >
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div
                style={{
                  marginTop: '10px',
                  fontSize: '11px',
                  color: '#7A8A00',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                Mix multiple input types in a single project
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: '#FFF0DC',
                  border: '1px solid #F0C880',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '13px',
                  color: '#A05A00',
                  marginBottom: '16px',
                }}
              >
                {error}
              </div>
            )}

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                paddingTop: '4px',
              }}
            >
              <button
                type="submit"
                disabled={!projectName.trim()}
                style={{
                  background: '#BBCB64',
                  color: '#1A1A00',
                  border: '1px solid #BBCB64',
                  fontWeight: 700,
                  fontSize: '14px',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  cursor: !projectName.trim() ? 'not-allowed' : 'pointer',
                  opacity: !projectName.trim() ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'opacity 0.15s',
                }}
              >
                Next
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* Complete */}
        {step === 'complete' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#F5F8D0',
                border: '1px solid #DDEC90',
                marginBottom: '16px',
              }}
            >
              <CheckCircle2 size={32} style={{ color: '#7A8A00' }} />
            </div>
            <h3
              style={{
                fontFamily: "'Geist', 'Inter', sans-serif",
                fontSize: '20px',
                fontWeight: 700,
                color: '#1A1A00',
                margin: '0 0 8px',
              }}
            >
              {projectName}
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: '#6A6A20',
                margin: 0,
              }}
            >
              Your modernization odyssey has begun!
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '16px',
                fontSize: '13px',
                color: '#6A6A20',
              }}
            >
              <Loader2
                size={16}
                style={{ animation: 'spin 1s linear infinite' }}
              />
              <span>Redirecting...</span>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
