import { motion } from 'framer-motion'
import {
  FolderOpen,
  Search,
  Hammer,
  TestTube,
  AlertTriangle,
  Rocket,
  ShieldCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface LiveOrchestrationProps {
  projectName?: string
}

interface PipelineNode {
  icon: LucideIcon
  label: string
  color: string
}

const PIPELINE: PipelineNode[] = [
  { icon: FolderOpen, label: 'Source', color: '#BBCB64' },
  { icon: Search, label: 'Discover', color: '#BBCB64' },
  { icon: Hammer, label: 'Build', color: '#F79A19' },
  { icon: TestTube, label: 'Test', color: '#BBCB64' },
  { icon: AlertTriangle, label: 'Review', color: '#F79A19' },
  { icon: Rocket, label: 'Deploy', color: '#BBCB64' },
  { icon: ShieldCheck, label: 'Verify', color: '#BBCB64' },
]

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function LiveOrchestration({ projectName }: LiveOrchestrationProps) {
  return (
    <motion.div
      whileHover={{ y: -1, boxShadow: '0 4px 16px rgba(26,26,0,0.08)' }}
      transition={{ duration: 0.2 }}
      style={{
        borderRadius: '12px',
        border: '1px solid #DDEC90',
        background: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(26,26,0,0.06), 0 1px 2px rgba(26,26,0,0.04)',
        padding: '24px',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <h2
          style={{
            fontFamily: "'Geist', 'Inter', sans-serif",
            fontWeight: 700,
            fontSize: '13px',
            color: '#1A1A00',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          Live Orchestration — {projectName || 'ALPHA REWRITE'}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '9999px',
              background: hexToRgba('#BBCB64', 0.15),
              padding: '3px 12px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#7A8A00',
            }}
          >
            <span style={{ position: 'relative', display: 'inline-flex', width: '8px', height: '8px' }}>
              <span
                style={{
                  position: 'absolute',
                  display: 'inline-flex',
                  width: '100%',
                  height: '100%',
                  borderRadius: '9999px',
                  background: '#BBCB64',
                  opacity: 0.75,
                  animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
                }}
              />
              <span
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  width: '8px',
                  height: '8px',
                  borderRadius: '9999px',
                  background: '#BBCB64',
                }}
              />
            </span>
            RUNNING
          </span>
          <span
            style={{
              borderRadius: '9999px',
              background: hexToRgba('#BBCB64', 0.15),
              padding: '3px 12px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#7A8A00',
            }}
          >
            6 AGENTS ACTIVE
          </span>
        </div>
      </div>

      {/* Pipeline */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, minWidth: 'max-content', padding: '8px 0' }}>
          {PIPELINE.map((node, idx) => {
            const Icon = node.icon

            return (
              <div key={node.label} style={{ display: 'flex', alignItems: 'center' }}>
                {/* Node */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.07 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      width: '48px',
                      height: '48px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '12px',
                      backgroundColor: hexToRgba(node.color, 0.1),
                    }}
                  >
                    <Icon size={20} style={{ color: node.color }} />
                  </div>
                  <span style={{ fontSize: '12px', color: '#6A6A20', textAlign: 'center' }}>{node.label}</span>
                </motion.div>

                {/* Arrow connector */}
                {idx < PIPELINE.length - 1 && (
                  <div style={{ margin: '0 4px', marginBottom: '24px', height: '2px', width: '32px', background: hexToRgba('#BBCB64', 0.3) }} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
