import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects, useDeleteProject } from '../hooks/useProjects'
import { NewProjectModal } from '../components/NewProjectModal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { DashboardSidebar } from '../components/DashboardSidebar'
import { DashboardHeader } from '../components/DashboardHeader'
import { StatsCardRow } from '../components/StatsCardRow'
import { ProjectTable } from '../components/ProjectTable'
import { AgentRoster } from '../components/AgentRoster'
import { TokenUsagePanel } from '../components/TokenUsagePanel'
import { LiveOrchestration } from '../components/LiveOrchestration'
import { AgentsView } from '../components/AgentsView'
import { AnalyticsView } from '../components/AnalyticsView'
import { ConfigView } from '../components/ConfigView'

export function HomePage() {
  const { data: projects, isLoading } = useProjects()
  const [showNewProject, setShowNewProject] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('DASHBOARD')
  const deleteProject = useDeleteProject()
  const navigate = useNavigate()

  // Phase filter state
  const [activePhase, setActivePhase] = useState('All')
  // Input type filter state
  const [activeInputType, setActiveInputType] = useState('All')
  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  const projectList = projects ?? []
  const totalFeatures = projectList.reduce((sum, p) => sum + p.stats.total, 0)
  const completedFeatures = projectList.reduce((sum, p) => sum + p.stats.passing, 0)

  const handleProjectCreated = (projectName: string) => {
    navigate(`/odyssey/${encodeURIComponent(projectName)}`)
  }

  const handleOpenProject = (name: string) => {
    navigate(`/odyssey/${encodeURIComponent(name)}`)
  }

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return
    try {
      await deleteProject.mutateAsync(projectToDelete)
      setProjectToDelete(null)
    } catch (error) {
      console.error('Failed to delete project:', error)
      setProjectToDelete(null)
    }
  }

  const firstProject = projectList[0]

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })

  const phases = ['All', 'Discovery', 'Build', 'Review', 'Deploy']
  const inputTypes = ['All', 'Folder', 'Figma', 'Prototype']

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#FAFAF2' }}>
      <DashboardHeader
        projectCount={projectList.length}
        onNewProject={() => setShowNewProject(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex flex-1 min-h-0">
        <DashboardSidebar
          projects={projectList}
          onNewProject={() => setShowNewProject(true)}
        />

        <div className="flex-1 flex flex-col min-w-0">

        <main className="flex-1 overflow-y-auto" style={{ padding: '24px', fontFamily: "'Inter', sans-serif" }}>
          {activeTab === 'AGENTS' && <AgentsView />}
          {activeTab === 'ANALYTICS' && <AnalyticsView projectCount={projectList.length} />}
          {activeTab === 'CONFIG' && <ConfigView />}
          {activeTab === 'DASHBOARD' && (
            <>
              {/* Command Center Title + Actions */}
              <div className="flex items-start justify-between" style={{ marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#7A8A00', marginBottom: '6px' }}>
                    Command Center
                  </div>
                  <h1 style={{ fontFamily: "'Geist', 'Inter', sans-serif", fontSize: '28px', fontWeight: 700, color: '#1A1A00', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                    Project <span style={{ color: '#7A8A00' }}>Overview</span>
                  </h1>
                  <p style={{ fontSize: '13px', color: '#6A6A20', marginTop: '4px' }}>
                    Multi-agent orchestration across {projectList.length} active workstreams &middot; {dateStr}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    style={{
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#7A8A00',
                      border: '1px solid #DDEC90',
                      background: 'transparent',
                      padding: '8px 14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = '#F5F8D0';
                      (e.currentTarget as HTMLElement).style.borderColor = '#BBCB64';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.borderColor = '#DDEC90';
                    }}
                  >
                    &darr; Export Report
                  </button>
                  <button
                    onClick={() => setShowNewProject(true)}
                    style={{
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#1A1A00',
                      background: '#BBCB64',
                      border: 'none',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(187,203,100,0.3)',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(187,203,100,0.4)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(187,203,100,0.3)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    }}
                  >
                    + New Project
                  </button>
                </div>
              </div>

              {/* Filter Bar */}
              <div
                style={{
                  borderRadius: '10px',
                  border: '1px solid #DDEC90',
                  background: '#FFFFFF',
                  padding: '10px 16px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  boxShadow: '0 1px 3px rgba(26,26,0,0.04)',
                }}
              >
                {/* Phase group */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#7A8A00', marginRight: '6px' }}>
                    Phase
                  </span>
                  {phases.map((pill) => (
                    <button
                      key={pill}
                      onClick={() => setActivePhase(pill)}
                      style={{
                        borderRadius: '9999px',
                        background: activePhase === pill ? '#BBCB64' : 'transparent',
                        border: activePhase === pill ? '1px solid #BBCB64' : '1px solid #DDEC90',
                        color: activePhase === pill ? '#1A1A00' : '#6A6A20',
                        fontWeight: activePhase === pill ? 700 : 600,
                        fontSize: '12px',
                        padding: '4px 12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {pill}
                    </button>
                  ))}
                </div>

                {/* Vertical divider */}
                <div style={{ width: '1px', height: '18px', background: '#DDEC90' }} />

                {/* Input type group */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#7A8A00', marginRight: '6px' }}>
                    Input
                  </span>
                  {inputTypes.map((pill) => (
                    <button
                      key={pill}
                      onClick={() => setActiveInputType(pill)}
                      style={{
                        borderRadius: '9999px',
                        background: activeInputType === pill ? '#BBCB64' : 'transparent',
                        border: activeInputType === pill ? '1px solid #BBCB64' : '1px solid #DDEC90',
                        color: activeInputType === pill ? '#1A1A00' : '#6A6A20',
                        fontWeight: activeInputType === pill ? 700 : 600,
                        fontSize: '12px',
                        padding: '4px 12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {pill}
                    </button>
                  ))}
                </div>

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Search */}
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #DDEC90',
                    fontSize: '13px',
                    padding: '7px 12px',
                    background: '#FAFAF2',
                    color: '#1A1A00',
                    outline: 'none',
                    width: '180px',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#BBCB64';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(187,203,100,0.12)';
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#DDEC90';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Stats Row */}
              {isLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{ height: '94px', borderRadius: '12px', background: 'linear-gradient(90deg, #F5F8D0 25%, #FAFAF2 50%, #F5F8D0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }} />
                  ))}
                </div>
              ) : (
                <div style={{ marginBottom: '20px' }}>
                  <StatsCardRow
                    projectCount={projectList.length}
                    totalFeatures={totalFeatures}
                    completedFeatures={completedFeatures}
                  />
                </div>
              )}

              {/* Two-Column: Table + Roster */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '18px', marginBottom: '20px' }}>
                <div>
                  {isLoading ? (
                    <div style={{ background: '#FFFFFF', border: '1px solid #DDEC90', borderRadius: '12px', padding: '24px' }}>
                      <div style={{ height: '24px', width: '200px', background: 'linear-gradient(90deg, #F5F8D0 25%, #FAFAF2 50%, #F5F8D0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite', borderRadius: '6px', marginBottom: '16px' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[1, 2, 3].map(i => (
                          <div key={i} style={{ height: '56px', background: 'linear-gradient(90deg, #F5F8D0 25%, #FAFAF2 50%, #F5F8D0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite', borderRadius: '6px' }} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <ProjectTable
                      projects={projectList}
                      onOpenProject={handleOpenProject}
                      onDeleteProject={(name) => setProjectToDelete(name)}
                    />
                  )}
                </div>
                <div>
                  <AgentRoster />
                </div>
              </div>

              {/* Token Usage */}
              <div style={{ marginBottom: '20px' }}>
                <TokenUsagePanel />
              </div>

              {/* Live Orchestration */}
              <div style={{ marginBottom: '20px' }}>
                <LiveOrchestration projectName={firstProject?.name} />
              </div>
            </>
          )}
        </main>
        </div>
      </div>

      {/* Modals */}
      <NewProjectModal
        isOpen={showNewProject}
        onClose={() => setShowNewProject(false)}
        onProjectCreated={handleProjectCreated}
      />

      <ConfirmDialog
        isOpen={projectToDelete !== null}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete}"? This will unregister the project but preserve its files on disk.`}
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
