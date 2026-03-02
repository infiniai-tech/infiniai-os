import { KanbanColumn } from './KanbanColumn'
import type { Feature, FeatureListResponse, ActiveAgent } from '../lib/types'

/** File description metadata for spec review cards */
const FILE_DESCRIPTIONS: Record<string, { label: string; description: string }> = {
  'constitution.md': { label: 'Constitution', description: 'Governance principles and migration boundaries' },
  'spec.md': { label: 'Specification', description: 'Detailed technical architecture and data models' },
  'plan.md': { label: 'Plan', description: 'Phased migration execution plan' },
  'tasks.md': { label: 'Tasks', description: 'Detailed task breakdown for coding agents' },
  'app_spec.txt': { label: 'App Spec', description: 'Machine-readable spec for the initializer agent' },
}

interface SpecFileInfo {
  filename: string
  status: string
  size: number
}

interface SpecListData {
  files: SpecFileInfo[]
  all_approved: boolean
  analysis_status: string
}

interface KanbanBoardProps {
  features: FeatureListResponse | undefined
  onFeatureClick: (feature: Feature) => void
  onAddFeature?: () => void
  onExpandProject?: () => void
  activeAgents?: ActiveAgent[]
  onCreateSpec?: () => void
  hasSpec?: boolean
  // Spec review props (for brownfield projects)
  specList?: SpecListData | null
  isBrownfield?: boolean
  isAnalyzingSpecs?: boolean
  onSpecFileClick?: (filename: string) => void
  onSpecApproved?: () => void
  onBeginCoding?: () => void
}

/** Renders inline spec review cards for the HITL column */
function SpecReviewCards({
  specList,
  isAnalyzing,
  onSpecFileClick,
  onBeginCoding,
}: {
  specList: SpecListData
  isAnalyzing?: boolean
  onSpecFileClick?: (filename: string) => void
  onBeginCoding?: () => void
}) {
  if (isAnalyzing) {
    return (
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #F79A19',
          borderLeft: '4px solid #F79A19',
          borderRadius: '6px',
          padding: '10px',
          fontFamily: "'Inter', sans-serif",
          marginBottom: '4px',
        }}
      >
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#A05A00', marginBottom: '4px' }}>
          Analyzing codebase...
        </div>
        <div style={{ fontSize: '12px', color: '#6A6A20' }}>
          Generating spec files for review. This may take a moment.
        </div>
      </div>
    )
  }

  const allApproved = specList.all_approved && specList.analysis_status === 'complete'

  return (
    <>
      {specList.files.map((file) => {
        const meta = FILE_DESCRIPTIONS[file.filename] || { label: file.filename, description: 'Spec file' }
        const isApproved = file.status === 'approved'

        return (
          <div
            key={file.filename}
            style={{
              background: '#FFFFFF',
              border: '1px solid #DDEC90',
              borderLeft: `4px solid ${isApproved ? '#BBCB64' : '#F79A19'}`,
              borderRadius: '6px',
              padding: '10px',
              fontFamily: "'Inter', sans-serif",
              marginBottom: '4px',
              cursor: 'pointer',
              transition: 'box-shadow 0.12s',
            }}
            onClick={() => onSpecFileClick?.(file.filename)}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(187,203,100,0.15)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A00' }}>{meta.label}</span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '10px',
                  background: isApproved ? '#F5F8D0' : '#FFF0DC',
                  color: isApproved ? '#7A8A00' : '#A05A00',
                  border: `1px solid ${isApproved ? '#DDEC90' : '#F0C880'}`,
                }}
              >
                {isApproved ? 'Approved' : 'Pending'}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#6A6A20', marginBottom: '4px' }}>{meta.description}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: '#6A6A20' }}>{(file.size / 1024).toFixed(1)} KB</span>
              <button
                onClick={(e) => { e.stopPropagation(); onSpecFileClick?.(file.filename) }}
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#7A8A00',
                  border: '1px solid #DDEC90',
                  background: 'transparent',
                  borderRadius: '4px',
                  padding: '3px 10px',
                  cursor: 'pointer',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F5F8D0' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                View
              </button>
            </div>
          </div>
        )
      })}

      {/* Begin Coding card when all approved */}
      {allApproved && specList.files.length > 0 && onBeginCoding && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #BBCB64',
            borderLeft: '4px solid #BBCB64',
            borderRadius: '6px',
            padding: '12px',
            fontFamily: "'Inter', sans-serif",
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#7A8A00', marginBottom: '6px' }}>
            All Specs Approved
          </div>
          <div style={{ fontSize: '12px', color: '#6A6A20', marginBottom: '8px' }}>
            Ready to start coding agents
          </div>
          <button
            onClick={onBeginCoding}
            style={{
              padding: '6px 16px',
              borderRadius: '4px',
              background: '#BBCB64',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.12s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.9' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
          >
            Begin Coding
          </button>
        </div>
      )}
    </>
  )
}

export function KanbanBoard({
  features,
  onFeatureClick,
  onAddFeature,
  onExpandProject,
  activeAgents = [],
  onCreateSpec,
  hasSpec = true,
  specList,
  isBrownfield,
  isAnalyzingSpecs,
  onSpecFileClick,
  onBeginCoding,
}: KanbanBoardProps) {
  const hasFeatures = features && (features.pending.length + features.in_progress.length + features.done.length + (features.needs_human_input?.length || 0)) > 0

  // Combine all features for dependency status calculation
  const allFeatures = features
    ? [...features.pending, ...features.in_progress, ...features.done, ...(features.needs_human_input || [])]
    : []

  const needsInputCount = features?.needs_human_input?.length || 0

  // Loading skeleton
  if (!features) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', fontFamily: "'Inter', sans-serif" }}>
        {['Backlog', 'In Progress', 'Review', 'Human-in-Loop', 'Done'].map(title => (
          <div key={title} style={{ background: '#FAFAF2', border: '1px solid #DDEC90', borderRadius: '6px', padding: '12px' }}>
            <div style={{ height: '8px', background: '#DDEC90', borderRadius: '4px', marginBottom: '16px', opacity: 0.5 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: '60px', background: '#F5F8D0', borderRadius: '4px', opacity: 0.3 }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Build spec review content for the HITL column
  const specReviewContent = isBrownfield && specList && (specList.files.length > 0 || isAnalyzingSpecs) ? (
    <SpecReviewCards
      specList={specList}
      isAnalyzing={isAnalyzingSpecs}
      onSpecFileClick={onSpecFileClick}
      onBeginCoding={onBeginCoding}
    />
  ) : null

  // Combine spec file count with feature count for HITL column header
  const specPendingCount = specList?.files.filter(f => f.status !== 'approved').length ?? 0
  const hitlTotalCount = needsInputCount + (isBrownfield ? specPendingCount : 0)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
      <KanbanColumn
        title="Backlog"
        count={features.pending.length}
        features={features.pending}
        allFeatures={allFeatures}
        activeAgents={activeAgents}
        color="pending"
        onFeatureClick={onFeatureClick}
        onAddFeature={onAddFeature}
        onExpandProject={onExpandProject}
        showExpandButton={hasFeatures && hasSpec}
        onCreateSpec={onCreateSpec}
        showCreateSpec={!hasSpec && !hasFeatures}
      />
      <KanbanColumn
        title="In Progress"
        count={features.in_progress.length}
        features={features.in_progress}
        allFeatures={allFeatures}
        activeAgents={activeAgents}
        color="progress"
        onFeatureClick={onFeatureClick}
      />
      <KanbanColumn
        title="Review"
        count={0}
        features={[]}
        allFeatures={allFeatures}
        activeAgents={activeAgents}
        color="review"
        onFeatureClick={onFeatureClick}
      />
      <KanbanColumn
        title={'\u26A1 Human-in-Loop'}
        count={hitlTotalCount}
        features={features.needs_human_input || []}
        allFeatures={allFeatures}
        activeAgents={activeAgents}
        color="human_input"
        onFeatureClick={onFeatureClick}
        specReviewContent={specReviewContent}
      />
      <KanbanColumn
        title="Done"
        count={features.done.length}
        features={features.done}
        allFeatures={allFeatures}
        activeAgents={activeAgents}
        color="done"
        onFeatureClick={onFeatureClick}
      />
    </div>
  )
}
