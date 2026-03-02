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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

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

  // Folder step uses larger modal
  if (step === 'folder') {
    return (
      <Dialog open={true} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-center gap-3">
              <Folder size={24} className="text-primary" />
              <div>
                <DialogTitle>Select Legacy Codebase</DialogTitle>
                <DialogDescription>
                  Choose the existing codebase you want to modernize for odyssey <span className="font-semibold font-mono">{projectName}</span>.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <FolderBrowser
              onSelect={handleFolderSelect}
              onCancel={handleFolderCancel}
            />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Stack selection uses wider modal
  if (step === 'stack') {
    const hasAnySelection = Object.values(targetStack).some(v => v !== null)

    return (
      <Dialog open={true} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-center gap-3">
              <Scroll size={24} className="text-primary" />
              <div>
                <DialogTitle>Choose Target Stack</DialogTitle>
                <DialogDescription>
                  Select the modern technologies to transform your codebase into. Leave unselected to keep the current tech for that layer.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {STACK_CATEGORIES.map(category => {
              const Icon = category.icon
              return (
                <div key={category.key} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon size={18} className="text-muted-foreground" />
                    <Label className="text-sm font-semibold">{category.label}</Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.options.map(option => {
                      const isSelected = targetStack[category.key] === option.id
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleStackOptionSelect(
                            category.key,
                            isSelected ? null as unknown as string : option.id
                          )}
                          className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-all border
                            ${isSelected
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                              : 'bg-card hover:bg-accent border-border text-foreground'
                            }
                          `}
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

          {error && (
            <div className="px-6">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {createProject.isPending && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground py-2">
              <Loader2 size={16} className="animate-spin" />
              <span>Forging your odyssey...</span>
            </div>
          )}

          <DialogFooter className="p-6 pt-4 border-t flex-row justify-between sm:justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={createProject.isPending}
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            <Button
              onClick={handleStackSubmit}
              disabled={!hasAnySelection || createProject.isPending}
            >
              Begin Modernization
              <ArrowRight size={16} />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === 'name' && 'Begin New Odyssey'}
            {step === 'complete' && 'Odyssey Begun!'}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Project Name */}
        {step === 'name' && (
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <DialogDescription>
              Name your modernization odyssey. This will be used to track the transformation of your legacy codebase.
            </DialogDescription>

            <div className="space-y-2">
              <Label htmlFor="project-name">Odyssey Name</Label>
              <Input
                id="project-name"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="my-legacy-app"
                pattern="^[a-zA-Z0-9_\-]+$"
                autoFocus
              />
              <p className="text-sm text-muted-foreground">
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
              }}
            >
              <div style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px',
                textTransform: 'uppercase', color: '#7A8A00', marginBottom: '10px',
              }}>
                Supported Inputs
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { icon: FolderOpen, label: 'Code Folder', desc: 'Existing codebase directory' },
                  { icon: Figma, label: 'Figma File', desc: 'Design files & mockups' },
                  { icon: Layers, label: 'Prototype', desc: 'Interactive prototypes' },
                  { icon: FileText, label: 'Spec Document', desc: 'PRDs, requirements, docs' },
                  { icon: Globe, label: 'URL / API', desc: 'Live site or API endpoint' },
                  { icon: Code2, label: 'Git Repository', desc: 'Clone from remote repo' },
                ].map(item => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.label}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '8px 10px', borderRadius: '6px',
                        background: '#FFFFFF', border: '1px solid #F5F8D0',
                        transition: 'border-color 0.12s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#DDEC90' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#F5F8D0' }}
                    >
                      <div style={{
                        width: '30px', height: '30px', borderRadius: '6px',
                        background: '#F5F8D0', border: '1px solid #DDEC90',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Icon size={14} style={{ color: '#7A8A00' }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A00' }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: '10px', color: '#6A6A20', lineHeight: 1.3 }}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{
                marginTop: '10px', fontSize: '11px', color: '#7A8A00', fontWeight: 600,
                textAlign: 'center',
              }}>
                Mix multiple input types in a single project
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button type="submit" disabled={!projectName.trim()}>
                Next
                <ArrowRight size={16} />
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* Complete */}
        {step === 'complete' && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <CheckCircle2 size={32} className="text-primary" />
            </div>
            <h3 className="font-semibold text-xl mb-2">{projectName}</h3>
            <p className="text-muted-foreground">
              Your modernization odyssey has begun!
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm text-muted-foreground">Redirecting...</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
