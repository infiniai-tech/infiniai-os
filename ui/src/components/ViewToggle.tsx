import { LayoutGrid, GitBranch } from 'lucide-react'

export type ViewMode = 'kanban' | 'graph'

interface ViewToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  const btnBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '13px', fontWeight: 700, padding: '7px 14px',
    cursor: 'pointer', border: 'none', transition: 'background 0.12s',
  }

  return (
    <div style={{
      display: 'inline-flex', borderRadius: '8px', overflow: 'hidden',
      border: '1px solid #DDEC90', background: '#FFFFFF',
    }}>
      <button
        onClick={() => onViewModeChange('kanban')}
        title="Kanban View"
        style={{
          ...btnBase,
          borderRight: '1px solid #DDEC90',
          background: viewMode === 'kanban' ? '#F5F8D0' : 'transparent',
          color: viewMode === 'kanban' ? '#7A8A00' : '#6A6A20',
        }}
      >
        <LayoutGrid size={16} />
        Kanban
      </button>
      <button
        onClick={() => onViewModeChange('graph')}
        title="Dependency Graph View"
        style={{
          ...btnBase,
          background: viewMode === 'graph' ? '#F5F8D0' : 'transparent',
          color: viewMode === 'graph' ? '#7A8A00' : '#6A6A20',
        }}
      >
        <GitBranch size={16} />
        Graph
      </button>
    </div>
  )
}
