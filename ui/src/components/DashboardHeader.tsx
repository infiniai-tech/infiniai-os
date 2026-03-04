import React from 'react'

interface DashboardHeaderProps {
  projectCount: number
  onNewProject: () => void
  themeControls?: React.ReactNode
  activeTab?: string
  onTabChange?: (tab: string) => void
}

const NAV_TABS = ['DASHBOARD', 'AGENTS', 'PATHWAYS', 'ANALYTICS', 'CONFIG'] as const

export function DashboardHeader({ projectCount, activeTab = 'DASHBOARD', onTabChange }: DashboardHeaderProps) {
  return (
    <header
      className="flex items-center h-[52px] px-6 gap-0 sticky top-0 z-50 shrink-0"
      style={{
        background: 'linear-gradient(to bottom, #1A1A00, #131100)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Logo */}
      <div
        className="text-[22px] font-bold text-white tracking-[-0.3px] shrink-0 mr-8"
        style={{ fontFamily: "'Geist', 'Inter', sans-serif" }}
      >
        Infini<span style={{ color: '#FFE52A' }}>AI</span>
        <sup
          className="text-[10px] font-normal tracking-[2px] uppercase ml-[3px]"
          style={{ color: 'rgba(187,203,100,0.5)' }}
        >
          OS
        </sup>
      </div>

      {/* Nav tabs */}
      <nav className="flex gap-[2px]">
        {NAV_TABS.map((tab) => {
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => onTabChange?.(tab)}
              className="header-nav-tab"
              style={{
                fontSize: '13px',
                fontWeight: isActive ? 700 : 600,
                letterSpacing: '0.5px',
                textTransform: 'uppercase' as const,
                padding: '4px 14px',
                border: 'none',
                cursor: 'pointer',
                background: 'transparent',
                color: isActive ? '#BBCB64' : 'rgba(187,203,100,0.45)',
                transition: 'color 0.15s ease',
              }}
            >
              {tab}
            </button>
          )
        })}
      </nav>

      <div className="ml-auto flex items-center gap-2.5">
        {/* Active badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0px',
            background: 'rgba(187,203,100,0.12)',
            color: '#BBCB64',
            border: '1px solid rgba(187,203,100,0.25)',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 700,
            padding: '4px 10px',
            letterSpacing: '1px',
            textTransform: 'uppercase' as const,
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#BBCB64',
              display: 'inline-block',
              marginRight: '5px',
              animation: 'dashboardPulse 2s ease-in-out infinite',
            }}
          />
          {projectCount} Active
        </div>

        {/* HITL badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0px',
            background: 'rgba(247,154,25,0.12)',
            color: '#F79A19',
            border: '1px solid rgba(247,154,25,0.3)',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 700,
            padding: '4px 10px',
            letterSpacing: '1px',
            textTransform: 'uppercase' as const,
          }}
        >
          &#9889; 3 HITL Pending
        </div>

        {/* Avatar */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 700,
            flexShrink: 0,
            background: '#BBCB64',
            color: '#1A1A00',
            boxShadow: '0 0 0 2px rgba(187,203,100,0.3)',
          }}
        >
          BK
        </div>
      </div>

      {/* Keyframe for pulsing dot animation */}
      <style>{`
        @keyframes dashboardPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .header-nav-tab:hover {
          color: #BBCB64 !important;
        }
      `}</style>
    </header>
  )
}
