import { motion } from 'framer-motion'
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
    cursor: 'pointer', border: 'none',
    fontFamily: "'Geist', 'Inter', sans-serif",
    position: 'relative',
    zIndex: 1,
    background: 'transparent',
    transition: 'color 0.15s',
  }

  return (
    <div style={{
      display: 'inline-flex', borderRadius: '8px', overflow: 'hidden',
      border: '1px solid #DDEC90', background: '#FFFFFF',
      position: 'relative',
      boxShadow: '0 1px 3px rgba(26,26,0,0.06), 0 1px 2px rgba(26,26,0,0.04)',
    }}>
      {/* Kanban button */}
      <motion.button
        onClick={() => onViewModeChange('kanban')}
        title="Kanban View"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
        style={{
          ...btnBase,
          borderRight: '1px solid #DDEC90',
          background: viewMode === 'kanban' ? '#F5F8D0' : 'transparent',
          color: viewMode === 'kanban' ? '#7A8A00' : '#6A6A20',
        }}
      >
        <LayoutGrid size={16} />
        Kanban
      </motion.button>

      {/* Graph button */}
      <motion.button
        onClick={() => onViewModeChange('graph')}
        title="Dependency Graph View"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
        style={{
          ...btnBase,
          background: viewMode === 'graph' ? '#F5F8D0' : 'transparent',
          color: viewMode === 'graph' ? '#7A8A00' : '#6A6A20',
        }}
      >
        <GitBranch size={16} />
        Graph
      </motion.button>
    </div>
  )
}
