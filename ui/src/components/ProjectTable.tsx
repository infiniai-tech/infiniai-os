import { useState } from 'react'
import { FolderOpen } from 'lucide-react'
import type { ProjectSummary } from '../lib/types'

interface ProjectTableProps {
  projects: ProjectSummary[]
  onOpenProject: (name: string) => void
  onDeleteProject: (name: string) => void
}

function getPhaseLabel(pct: number): string {
  if (pct >= 100) return 'Complete'
  if (pct >= 80) return 'Deploy phase'
  if (pct >= 50) return 'Review phase'
  if (pct >= 20) return 'Build phase'
  return 'Discovery phase'
}

function getStackLabel(project: ProjectSummary): string {
  if (!project.target_stack) return 'FOLDER'
  const parts: string[] = []
  if (project.target_stack.frontend) parts.push(project.target_stack.frontend)
  if (project.target_stack.backend) parts.push(project.target_stack.backend)
  return parts.length > 0 ? parts.join(' + ') : 'FOLDER'
}

/** Input type pill color mapping */
function getInputTypePill(label: string): { bg: string; color: string; border: string } {
  const lower = label.toLowerCase()
  if (lower.includes('figma')) return { bg: '#FFF0DC', color: '#A05A00', border: '#F0C880' }
  return { bg: '#F5F8D0', color: '#7A8A00', border: '#DDEC90' }
}

const AGENT_CIRCLES = [
  { bg: '#BBCB64', initials: 'SP', active: true },
  { bg: '#F5F8D0', initials: 'FZ', active: false },
  { bg: '#BBCB64', initials: 'OC', active: true },
]

export function ProjectTable({ projects, onOpenProject }: ProjectTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)

  const totalCount = projects.length
  const pendingCount = projects.filter(
    (p) => p.stats.total > 0 && p.stats.passing < p.stats.total,
  ).length

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #DDEC90',
        borderRadius: '8px',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Card header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #DDEC90',
          background: '#FAFAF2',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#7A8A00' }}>
          All Projects
        </span>
        <span
          style={{
            fontSize: '12px', fontWeight: 700,
            background: '#F5F8D0', color: '#7A8A00',
            border: '1px solid #DDEC90', borderRadius: '10px', padding: '1px 7px',
          }}
        >
          {totalCount} Total
        </span>
        {pendingCount > 0 && (
          <span
            style={{
              fontSize: '12px', fontWeight: 700,
              background: '#FFF0DC', color: '#A05A00',
              border: '1px solid #F0C880', borderRadius: '10px', padding: '1px 7px',
            }}
          >
            {pendingCount} HITL Pending
          </span>
        )}
      </div>

      {/* Table */}
      {projects.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', color: '#6A6A20' }}>
          <FolderOpen size={48} strokeWidth={1.5} style={{ marginBottom: '12px', color: '#DDEC90' }} />
          <p style={{ fontSize: '17px', fontWeight: 600 }}>No projects yet</p>
          <p style={{ fontSize: '13px', marginTop: '4px', color: '#9A9A50' }}>Create your first project to get started</p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '16px' }}>
          <thead>
            <tr>
              {['Project', 'Input Type', 'Phase & Progress', 'Agents', 'HITL Status', 'Action'].map((th, idx) => (
                <th
                  key={th}
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    color: '#6A6A20',
                    padding: '8px 12px',
                    borderBottom: '2px solid #DDEC90',
                    background: '#FAFAF2',
                    textAlign: idx === 5 ? 'right' : 'left',
                    minWidth: idx === 2 ? '200px' : undefined,
                  }}
                >
                  {th}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const pct = project.stats.percentage
              const phase = getPhaseLabel(pct)
              const stackLabel = getStackLabel(project)
              const hasPending = project.stats.in_progress > 0
              const pill = getInputTypePill(stackLabel)
              const progressFill = pct >= 50 ? '#BBCB64' : '#FFE52A'

              return (
                <tr
                  key={project.name}
                  style={{
                    borderBottom: '1px solid #F5F8D0',
                    background: hoveredRow === project.name ? '#F5F8D0' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={() => setHoveredRow(project.name)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => onOpenProject(project.name)}
                >
                  {/* PROJECT */}
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: '#1A1A00' }}>{project.name}</div>
                    <div style={{ fontSize: '13px', color: '#6A6A20', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>
                      {project.path}
                    </div>
                  </td>

                  {/* INPUT TYPE */}
                  <td style={{ padding: '10px 12px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        borderRadius: '10px',
                        padding: '3px 8px',
                        background: pill.bg,
                        color: pill.color,
                        border: `1px solid ${pill.border}`,
                      }}
                    >
                      {stackLabel}
                    </span>
                  </td>

                  {/* PHASE & PROGRESS */}
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <div style={{ flex: 1, height: '5px', background: '#F5F8D0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            borderRadius: '3px',
                            background: progressFill,
                            width: `${Math.min(pct, 100)}%`,
                            transition: 'width 0.5s',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#6A6A20', minWidth: '32px', textAlign: 'right' }}>
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6A6A20' }}>{phase}</div>
                  </td>

                  {/* AGENTS */}
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex' }}>
                      {AGENT_CIRCLES.map((agent, idx) => (
                        <div
                          key={agent.initials}
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: agent.active ? '#BBCB64' : '#F5F8D0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 700,
                            color: agent.active ? '#1A1A00' : '#7A8A00',
                            marginLeft: idx > 0 ? '-5px' : '0',
                            border: '2px solid #FFFFFF',
                            position: 'relative',
                            zIndex: AGENT_CIRCLES.length - idx,
                          }}
                        >
                          {agent.initials}
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* HITL STATUS */}
                  <td style={{ padding: '10px 12px' }}>
                    {hasPending ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#F79A19' }} />
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: '#FFF0DC',
                            color: '#A05A00',
                            border: '1px solid #F0C880',
                          }}
                        >
                          Pending
                        </span>
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22C55E' }} />
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: '#F5F8D0',
                            color: '#7A8A00',
                            border: '1px solid #DDEC90',
                          }}
                        >
                          Clear
                        </span>
                      </span>
                    )}
                  </td>

                  {/* ACTION */}
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); onOpenProject(project.name) }}
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#7A8A00',
                        border: '1px solid #DDEC90',
                        background: hoveredBtn === project.name ? '#F5F8D0' : 'transparent',
                        borderRadius: '4px',
                        padding: '4px 9px',
                        cursor: 'pointer',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={() => setHoveredBtn(project.name)}
                      onMouseLeave={() => setHoveredBtn(null)}
                    >
                      Open
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {/* Footer */}
      {projects.length > 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '10px',
            borderTop: '1px solid #F5F8D0',
          }}
        >
          <button
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#7A8A00',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
              transition: 'background 0.12s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F5F8D0' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            View all {projects.length} projects
          </button>
        </div>
      )}
    </div>
  )
}
