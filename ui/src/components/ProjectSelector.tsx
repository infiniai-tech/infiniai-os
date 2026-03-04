import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Plus, FolderOpen, Loader2, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ProjectSummary } from '../lib/types'
import { NewProjectModal } from './NewProjectModal'
import { ConfirmDialog } from './ConfirmDialog'
import { useDeleteProject } from '../hooks/useProjects'

interface ProjectSelectorProps {
  projects: ProjectSummary[]
  selectedProject: string | null
  onSelectProject: (name: string | null) => void
  isLoading: boolean
  onSpecCreatingChange?: (isCreating: boolean) => void
}

export function ProjectSelector({
  projects,
  selectedProject,
  onSelectProject,
  isLoading,
  onSpecCreatingChange,
}: ProjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const deleteProject = useDeleteProject()

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  const handleProjectCreated = (projectName: string) => {
    onSelectProject(projectName)
    setIsOpen(false)
  }

  const handleDeleteClick = (e: React.MouseEvent, projectName: string) => {
    e.stopPropagation()
    e.preventDefault()
    setProjectToDelete(projectName)
    setIsOpen(false)
  }

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return
    try {
      await deleteProject.mutateAsync(projectToDelete)
      if (selectedProject === projectToDelete) onSelectProject(null)
      setProjectToDelete(null)
    } catch (error) {
      console.error('Failed to delete project:', error)
      setProjectToDelete(null)
    }
  }

  const selectedProjectData = projects.find(p => p.name === selectedProject)

  return (
    <div ref={containerRef} style={{ position: 'relative', fontFamily: "'Inter', sans-serif" }}>
      {/* Trigger */}
      <button
        onClick={() => !isLoading && setIsOpen(!isOpen)}
        disabled={isLoading}
        title={selectedProjectData?.path}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
          minWidth: '140px',
          padding: '7px 12px',
          borderRadius: '9px',
          border: '1px solid #DDEC90',
          background: '#FFFFFF',
          color: '#1A1A00',
          fontWeight: 600, fontSize: '14px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.6 : 1,
          transition: 'all 0.15s',
          fontFamily: "'Inter', sans-serif",
        }}
        onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = '#FAFAF2' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FFFFFF' }}
      >
        {isLoading ? (
          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: '#7A8A00' }} />
        ) : selectedProject ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
            <FolderOpen size={16} style={{ color: '#7A8A00', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
              {selectedProject}
            </span>
            {selectedProjectData && selectedProjectData.stats.total > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                fontSize: '11px', fontWeight: 700, color: '#7A8A00',
                background: '#F5F8D0', border: '1px solid #DDEC90',
                borderRadius: '9999px', padding: '1px 7px',
                flexShrink: 0,
              }}>
                {selectedProjectData.stats.percentage}%
              </span>
            )}
          </span>
        ) : (
          <span style={{ color: '#6A6A20' }}>Select Odyssey</span>
        )}
        <ChevronDown
          size={15}
          style={{ color: '#6A6A20', flexShrink: 0, transition: 'transform 0.15s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              zIndex: 50,
              width: '280px',
              background: '#FFFFFF',
              border: '1px solid #DDEC90',
              borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(26,26,0,0.10), 0 2px 6px rgba(26,26,0,0.06)',
              overflow: 'hidden',
            }}
          >
            {/* Projects list */}
            {projects.length > 0 ? (
              <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '4px' }}>
                {projects.map(project => (
                  <div
                    key={project.name}
                    title={project.path}
                    style={{
                      display: 'flex', alignItems: 'center',
                      borderRadius: '7px',
                      background: project.name === selectedProject ? '#F5F8D0' : 'transparent',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => { if (project.name !== selectedProject) (e.currentTarget as HTMLElement).style.background = '#FAFAF2' }}
                    onMouseLeave={e => { if (project.name !== selectedProject) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <button
                      onClick={() => { onSelectProject(project.name); setIsOpen(false) }}
                      style={{
                        flex: 1,
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 10px',
                        background: 'transparent', border: 'none',
                        cursor: 'pointer', textAlign: 'left',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      <FolderOpen size={15} style={{ color: project.name === selectedProject ? '#7A8A00' : '#9A9A60', flexShrink: 0 }} />
                      <span style={{
                        flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        fontSize: '13px', fontWeight: project.name === selectedProject ? 700 : 400,
                        color: '#1A1A00',
                      }}>
                        {project.name}
                      </span>
                      {project.stats.total > 0 && (
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#6A6A20', flexShrink: 0 }}>
                          {project.stats.passing}/{project.stats.total}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, project.name)}
                      title="Delete project"
                      style={{
                        width: '30px', height: '30px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'transparent', border: 'none',
                        borderRadius: '6px', cursor: 'pointer',
                        color: '#9A9A60', marginRight: '4px',
                        transition: 'all 0.12s',
                      }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = '#A05A00'; el.style.background = '#FFF0DC' }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = '#9A9A60'; el.style.background = 'transparent' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', color: '#6A6A20' }}>
                No odysseys yet
              </div>
            )}

            {/* Divider */}
            <div style={{ height: '1px', background: '#DDEC90', margin: '2px 0' }} />

            {/* New project */}
            <div style={{ padding: '4px' }}>
              <button
                onClick={() => { setShowNewProjectModal(true); setIsOpen(false) }}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '7px',
                  border: 'none', background: 'transparent',
                  fontSize: '13px', fontWeight: 700, color: '#7A8A00',
                  cursor: 'pointer', textAlign: 'left',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F5F8D0' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <Plus size={15} />
                New Odyssey
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onProjectCreated={handleProjectCreated}
        onStepChange={() => onSpecCreatingChange?.(false)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={projectToDelete !== null}
        title="End Odyssey"
        message={`Are you sure you wish to end the odyssey "${projectToDelete}"? This will unregister the project and delete AutoForge metadata. Your source code will not be affected.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={deleteProject.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setProjectToDelete(null)}
      />
    </div>
  )
}
