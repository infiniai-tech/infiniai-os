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

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r} ${g} ${b}`
}

export function LiveOrchestration({ projectName }: LiveOrchestrationProps) {
  return (
    <div
      className="rounded-lg border border-[#DDEC90] bg-white dark:bg-[#1a1c14] p-6"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h2 className="text-base font-bold tracking-wider uppercase text-[#2a2f1a] dark:text-[#e8eada]">
          Live Orchestration — {projectName || 'ALPHA REWRITE'}
        </h2>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#BBCB64]/15 px-3 py-0.5 text-sm font-semibold text-[#BBCB64]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#BBCB64] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#BBCB64]" />
            </span>
            RUNNING
          </span>
          <span className="rounded-full bg-[#BBCB64]/15 px-3 py-0.5 text-sm font-semibold text-[#BBCB64]">
            6 AGENTS ACTIVE
          </span>
        </div>
      </div>

      {/* Pipeline */}
      <div className="overflow-x-auto">
        <div className="flex items-center justify-center gap-0 min-w-max py-2">
          {PIPELINE.map((node, idx) => {
            const Icon = node.icon
            const rgb = hexToRgb(node.color)

            return (
              <div key={node.label} className="flex items-center">
                {/* Node */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `rgb(${rgb} / 0.1)` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: node.color }} />
                  </div>
                  <span className="text-sm text-[#2a2f1a]/50 dark:text-[#e8eada]/50 text-center">{node.label}</span>
                </div>

                {/* Arrow connector */}
                {idx < PIPELINE.length - 1 && (
                  <div className="mx-1 mb-6 h-0.5 w-8 bg-[#BBCB64]/30" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
