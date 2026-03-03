import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  getProjectGitStatus,
  connectProjectRepo,
  createProjectRepo,
  disconnectProjectRepo,
  getGitHubAuthStatus,
} from '../lib/api'
import type { GitRepoInfo } from '../lib/types'

// ---------------------------------------------------------------------------
// GitRepoLink — inline repo link/form shown in the project header
// ---------------------------------------------------------------------------

function GitRepoLink({ projectName }: { projectName: string }) {
  const [repoInfo, setRepoInfo] = useState<GitRepoInfo | null>(null)
  const [ghConnected, setGhConnected] = useState<boolean | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [mode, setMode] = useState<'connect' | 'create'>('connect')
  const [repoUrl, setRepoUrl] = useState('')
  const [newRepoName, setNewRepoName] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getProjectGitStatus(projectName)
      .then(setRepoInfo)
      .catch(() => setRepoInfo({ linked: false }))
    getGitHubAuthStatus()
      .then((s) => setGhConnected(s.connected))
      .catch(() => setGhConnected(false))
  }, [projectName])

  const handleConnect = useCallback(async () => {
    if (!repoUrl.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await connectProjectRepo(projectName, repoUrl.trim())
      setRepoInfo({
        linked: true,
        owner: res.gitRepo.owner,
        repo: res.gitRepo.repoName,
        branch: res.gitRepo.branch,
        url: res.gitRepo.url,
      })
      setShowForm(false)
      setRepoUrl('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to connect')
    } finally {
      setLoading(false)
    }
  }, [projectName, repoUrl])

  const handleCreate = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await createProjectRepo(projectName, newRepoName.trim() || undefined, isPrivate)
      setRepoInfo({
        linked: true,
        owner: res.gitRepo.owner,
        repo: res.gitRepo.repoName,
        branch: res.gitRepo.branch,
        url: res.gitRepo.url,
      })
      setShowForm(false)
      setNewRepoName('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create repo')
    } finally {
      setLoading(false)
    }
  }, [projectName, newRepoName, isPrivate])

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnectProjectRepo(projectName)
      setRepoInfo({ linked: false })
    } catch {
      // ignore
    }
  }, [projectName])

  if (repoInfo === null || ghConnected === null) return null

  if (!ghConnected) return null

  if (repoInfo.linked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
        <a
          href={repoInfo.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            fontSize: '12px', fontWeight: 600, color: '#6A6A20',
            background: '#F5F8D0', border: '1px solid #DDEC90',
            borderRadius: '20px', padding: '4px 12px',
            textDecoration: 'none', transition: 'all 0.12s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#EAEDCE' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#F5F8D0' }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          {repoInfo.owner}/{repoInfo.repo}
        </a>
        <button
          onClick={handleDisconnect}
          title="Unlink repository"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '14px', color: '#9A9A60', padding: '2px',
            lineHeight: 1, transition: 'color 0.12s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#E05050' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#9A9A60' }}
        >
          ×
        </button>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          fontSize: '12px', fontWeight: 600, color: '#6A6A20',
          background: 'transparent', border: '1px solid #DDEC90',
          borderRadius: '20px', padding: '4px 12px',
          cursor: 'pointer', transition: 'all 0.12s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F8D0' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        Link to GitHub
      </button>

      {showForm && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: '#FFFFFF', border: '1px solid #DDEC90', borderRadius: '10px',
          padding: '16px', width: '340px', zIndex: 100,
          boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
        }}>
          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: '2px', marginBottom: '14px' }}>
            {(['connect', 'create'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null) }}
                style={{
                  flex: 1, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase',
                  padding: '6px', border: 'none', borderRadius: '4px', cursor: 'pointer',
                  background: mode === m ? '#BBCB64' : '#FAFAF2',
                  color: mode === m ? '#1A1A00' : '#6A6A20',
                  transition: 'all 0.12s',
                }}
              >
                {m === 'connect' ? 'Existing Repo' : 'New Repo'}
              </button>
            ))}
          </div>

          {mode === 'connect' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                placeholder="https://github.com/owner/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                style={{
                  fontSize: '13px', padding: '8px 10px', borderRadius: '6px',
                  border: '1px solid #DDEC90', outline: 'none', width: '100%',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              />
              <button
                onClick={handleConnect}
                disabled={loading || !repoUrl.trim()}
                style={{
                  fontSize: '13px', fontWeight: 700, padding: '8px',
                  background: '#BBCB64', color: '#1A1A00', border: 'none',
                  borderRadius: '6px', cursor: loading ? 'wait' : 'pointer',
                  opacity: !repoUrl.trim() ? 0.5 : 1,
                }}
              >
                {loading ? 'Connecting…' : 'Connect'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                placeholder={`Repo name (default: ${projectName})`}
                value={newRepoName}
                onChange={(e) => setNewRepoName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                style={{
                  fontSize: '13px', padding: '8px 10px', borderRadius: '6px',
                  border: '1px solid #DDEC90', outline: 'none', width: '100%',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6A6A20', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  style={{ accentColor: '#BBCB64' }}
                />
                Private repository
              </label>
              <button
                onClick={handleCreate}
                disabled={loading}
                style={{
                  fontSize: '13px', fontWeight: 700, padding: '8px',
                  background: '#BBCB64', color: '#1A1A00', border: 'none',
                  borderRadius: '6px', cursor: loading ? 'wait' : 'pointer',
                }}
              >
                {loading ? 'Creating…' : 'Create & Link'}
              </button>
            </div>
          )}

          {error && (
            <div style={{ fontSize: '12px', color: '#C05050', marginTop: '8px' }}>
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}


// ---------------------------------------------------------------------------
// OlympusHeader
// ---------------------------------------------------------------------------

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

          {/* GitHub repo link on project pages */}
          {isProjectPage && projectName && (
            <GitRepoLink projectName={projectName} />
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
