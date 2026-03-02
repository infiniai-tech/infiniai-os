import { Link, useLocation } from 'react-router-dom'

interface OlympusHeaderProps {
  projectName?: string | null
  rightContent?: React.ReactNode
}

export function OlympusHeader({ projectName, rightContent }: OlympusHeaderProps) {
  const location = useLocation()
  const isProjectPage = location.pathname.startsWith('/odyssey/')

  return (
    <header
      className="sticky top-0 z-50 shrink-0"
      style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #DDEC90',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Back button on project pages */}
          {isProjectPage && (
            <Link
              to="/"
              style={{
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: '#7A8A00',
                border: '1px solid #DDEC90',
                borderRadius: '4px',
                padding: '6px 12px',
                textDecoration: 'none',
                transition: 'background 0.12s',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F5F8D0' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              &larr; Dashboard
            </Link>
          )}

          {/* Project name */}
          {isProjectPage && projectName && (
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A00', margin: 0, marginLeft: '4px' }}>
              {projectName}
            </h1>
          )}

          {/* Logo when not on project page */}
          {!isProjectPage && (
            <Link to="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A00' }}>
                Infini<span style={{ color: '#BBCB64' }}>AI</span> <span style={{ fontSize: '10px', fontWeight: 600, color: '#9A9A60', letterSpacing: '1.5px', textTransform: 'uppercase' as const }}>OS</span>
              </span>
            </Link>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right side content (page-specific controls) */}
          {rightContent}
        </div>
      </div>
    </header>
  )
}
