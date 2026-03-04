import { useState, useEffect, useCallback } from 'react'
import { Eye, EyeOff, ShieldCheck, Code2, Server, Database, Palette } from 'lucide-react'
import {
  getGitHubAuthStatus,
  startGitHubDeviceFlow,
  pollGitHubDeviceFlow,
  disconnectGitHub,
} from '../lib/api'
import { useSettings, useUpdateSettings, useAvailableModels, useAvailableProviders } from '../hooks/useProjects'
import type { GitHubAuthStatus, ProviderInfo } from '../lib/types'

const PROVIDER_INFO_TEXT: Record<string, string> = {
  claude: 'Default provider. Uses your Claude CLI credentials.',
  kimi: 'Get an API key at kimi.com',
  glm: 'Get an API key at open.bigmodel.cn',
  ollama: 'Run models locally. Install from ollama.com',
  custom: 'Connect to any OpenAI-compatible API endpoint.',
}

// ---------------------------------------------------------------------------
// Toggle component
// ---------------------------------------------------------------------------

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: '38px', height: '20px',
        background: on ? '#BBCB64' : '#DDEC90',
        borderRadius: '10px', position: 'relative', cursor: 'pointer',
        border: 'none', flexShrink: 0, transition: 'background 0.15s',
      }}
    >
      <span style={{
        position: 'absolute', top: '3px', left: on ? '21px' : '3px',
        width: '14px', height: '14px', borderRadius: '50%', background: '#FFFFFF',
        transition: 'left 0.15s',
      }} />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const fieldLabelStyle: React.CSSProperties = {
  fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#6A6A20', marginBottom: '5px',
}
const fieldSubStyle: React.CSSProperties = {
  fontSize: '13px', color: '#6A6A20', marginBottom: '5px',
}
const selectStyle: React.CSSProperties = {
  width: '100%', fontSize: '16px', padding: '8px 10px', borderRadius: '6px',
  border: '1px solid #DDEC90', background: '#FAFAF2', color: '#1A1A00',
  outline: 'none', cursor: 'pointer',
}

// ---------------------------------------------------------------------------
// Toggle row helper
// ---------------------------------------------------------------------------

interface ToggleRowProps {
  name: string
  desc: string
  on: boolean
  onToggle: () => void
  isLast?: boolean
}

function ToggleRow({ name, desc, on, onToggle, isLast }: ToggleRowProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 0', borderBottom: isLast ? 'none' : '1px solid #F5F8D0',
    }}>
      <div>
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A00' }}>{name}</div>
        <div style={{ fontSize: '13px', color: '#6A6A20', marginTop: '2px' }}>{desc}</div>
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Select field helper
// ---------------------------------------------------------------------------

interface SelectFieldProps {
  label: string
  sub?: string
  options: string[]
  value: string
  onChange: (val: string) => void
}

function SelectField({ label, sub, options, value, onChange }: SelectFieldProps) {
  return (
    <div>
      <div style={fieldLabelStyle}>{label}</div>
      {sub && <div style={fieldSubStyle}>{sub}</div>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={selectStyle}
        onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#BBCB64' }}
        onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#DDEC90' }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

interface ConfigTab {
  id: string
  label: string
  icon: string
}

const CONFIG_TABS: ConfigTab[] = [
  { id: 'models', label: 'Models', icon: '⚙' },
  { id: 'framework', label: 'Framework', icon: '◈' },
  { id: 'hitl', label: 'HITL', icon: '⊘' },
  { id: 'budget', label: 'Budget', icon: '◉' },
  { id: 'connectors', label: 'Connectors', icon: '⬡' },
]

// ---------------------------------------------------------------------------
// Connector card
// ---------------------------------------------------------------------------

interface ConnectorDef {
  id: string
  name: string
  description: string
  icon: string
  color: string
  connected: boolean
  category: 'design' | 'communication' | 'devops' | 'storage'
}

const CONNECTORS: ConnectorDef[] = [
  { id: 'figma', name: 'Figma', description: 'Import designs, components, and design tokens directly from Figma files', icon: '✦', color: '#A259FF', connected: false, category: 'design' },
  { id: 'slack', name: 'Slack', description: 'Send notifications, HITL prompts, and agent updates to Slack channels', icon: '⊞', color: '#E01E5A', connected: false, category: 'communication' },
  { id: 'linear', name: 'Linear', description: 'Sync features with Linear issues and track sprint progress', icon: '◇', color: '#5E6AD2', connected: false, category: 'devops' },
  { id: 'notion', name: 'Notion', description: 'Pull requirements from Notion docs and sync project documentation', icon: '▣', color: '#000000', connected: false, category: 'storage' },
  { id: 'discord', name: 'Discord', description: 'Real-time agent updates and team notifications via Discord webhooks', icon: '⬡', color: '#5865F2', connected: false, category: 'communication' },
  { id: 'vercel', name: 'Vercel', description: 'Auto-deploy preview builds and manage production deployments', icon: '▲', color: '#000000', connected: false, category: 'devops' },
  { id: 'supabase', name: 'Supabase', description: 'Provision databases, manage migrations, and sync schema changes', icon: '⬢', color: '#3ECF8E', connected: false, category: 'storage' },
  { id: 'jira', name: 'Jira', description: 'Bi-directional sync between features and Jira tickets', icon: '◆', color: '#0052CC', connected: false, category: 'devops' },
  { id: 'sentry', name: 'Sentry', description: 'Auto-create features from error reports and track resolution', icon: '◎', color: '#362D59', connected: false, category: 'devops' },
]


// ---------------------------------------------------------------------------
// GitHub Connector Card (real OAuth device flow)
// ---------------------------------------------------------------------------

function GitHubConnectorCard({ authStatus, onConnect, onDisconnect, isPolling }: {
  authStatus: GitHubAuthStatus | null
  onConnect: () => void
  onDisconnect: () => void
  isPolling: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const connected = authStatus?.connected ?? false

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFFFF',
        border: connected ? '1px solid #BBCB64' : '1px solid #DDEC90',
        borderRadius: '10px',
        padding: '18px',
        display: 'flex', flexDirection: 'column', gap: '12px',
        transition: 'all 0.15s',
        boxShadow: hovered ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
        transform: hovered ? 'translateY(-1px)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: connected ? '#24292F18' : '#FAFAF2',
          border: `1px solid ${connected ? '#24292F40' : '#DDEC90'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', color: '#24292F', flexShrink: 0,
        }}>
          ⊛
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A00' }}>GitHub</div>
          {connected && authStatus?.username && (
            <div style={{ fontSize: '12px', color: '#6A6A20', marginTop: '2px' }}>
              @{authStatus.username}
            </div>
          )}
        </div>
        {connected && (
          <span style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
            background: '#F5F8D0', color: '#7A8A00', border: '1px solid #DDEC90',
            borderRadius: '20px', padding: '3px 10px', flexShrink: 0,
          }}>
            Connected
          </span>
        )}
        {isPolling && (
          <span style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
            background: '#FFF4D6', color: '#8A6D00', border: '1px solid #E8D48A',
            borderRadius: '20px', padding: '3px 10px', flexShrink: 0,
          }}>
            Waiting…
          </span>
        )}
      </div>

      <div style={{ fontSize: '13px', color: '#6A6A20', lineHeight: 1.5 }}>
        Push spec files to GitHub when all specs are approved. Connect repos per-project.
      </div>

      <button
        onClick={connected ? onDisconnect : onConnect}
        disabled={isPolling}
        style={{
          fontSize: '13px', fontWeight: 700,
          color: connected ? '#7A8A00' : '#1A1A00',
          background: connected ? 'transparent' : isPolling ? '#E5E5D8' : '#BBCB64',
          border: connected ? '1px solid #DDEC90' : 'none',
          borderRadius: '6px', padding: '8px 14px',
          cursor: isPolling ? 'not-allowed' : 'pointer',
          transition: 'all 0.12s',
          alignSelf: 'flex-start',
          opacity: isPolling ? 0.6 : 1,
        }}
      >
        {isPolling ? 'Authorizing…' : connected ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  )
}


// ---------------------------------------------------------------------------
// GitHub Device Flow Modal
// ---------------------------------------------------------------------------

function DeviceFlowModal({ userCode, verificationUri, onClose }: {
  userCode: string
  verificationUri: string
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(userCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [userCode])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#FFFFFF', border: '2px solid #DDEC90', borderRadius: '14px',
        padding: '32px', maxWidth: '420px', width: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A00', marginBottom: '8px' }}>
          Connect GitHub
        </div>
        <div style={{ fontSize: '14px', color: '#6A6A20', marginBottom: '20px', lineHeight: 1.5 }}>
          Copy the code below, then click the button to open GitHub and paste it.
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: '#FAFAF2', border: '2px solid #DDEC90', borderRadius: '10px',
          padding: '16px', marginBottom: '20px',
        }}>
          <code style={{
            fontSize: '28px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
            color: '#1A1A00', letterSpacing: '3px', flex: 1, textAlign: 'center',
          }}>
            {userCode}
          </code>
          <button
            onClick={copyCode}
            style={{
              fontSize: '12px', fontWeight: 700,
              background: copied ? '#D4EDDA' : '#BBCB64',
              color: copied ? '#155724' : '#1A1A00',
              border: 'none', borderRadius: '6px', padding: '8px 14px',
              cursor: 'pointer', transition: 'all 0.12s', flexShrink: 0,
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <a
          href={verificationUri}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block', textAlign: 'center',
            fontSize: '15px', fontWeight: 700,
            background: '#24292F', color: '#FFFFFF',
            borderRadius: '8px', padding: '12px 24px',
            textDecoration: 'none', transition: 'opacity 0.12s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Open GitHub →
        </a>

        <div style={{
          fontSize: '12px', color: '#6A6A20', textAlign: 'center',
          marginTop: '16px', lineHeight: 1.5,
        }}>
          Waiting for authorization… This dialog will close automatically.
        </div>
      </div>
    </div>
  )
}


function ConnectorCard({ connector, onToggle }: { connector: ConnectorDef; onToggle: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFFFF',
        border: connector.connected ? '1px solid #BBCB64' : '1px solid #DDEC90',
        borderRadius: '10px',
        padding: '18px',
        display: 'flex', flexDirection: 'column', gap: '12px',
        transition: 'all 0.15s',
        boxShadow: hovered ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
        transform: hovered ? 'translateY(-1px)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: connector.connected ? `${connector.color}18` : '#FAFAF2',
          border: `1px solid ${connector.connected ? connector.color + '40' : '#DDEC90'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', color: connector.color, flexShrink: 0,
        }}>
          {connector.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A00' }}>{connector.name}</div>
        </div>
        {connector.connected && (
          <span style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
            background: '#F5F8D0', color: '#7A8A00', border: '1px solid #DDEC90',
            borderRadius: '20px', padding: '3px 10px', flexShrink: 0,
          }}>
            Connected
          </span>
        )}
      </div>

      <div style={{ fontSize: '13px', color: '#6A6A20', lineHeight: 1.5 }}>
        {connector.description}
      </div>

      <button
        onClick={onToggle}
        style={{
          fontSize: '13px', fontWeight: 700,
          color: connector.connected ? '#7A8A00' : '#1A1A00',
          background: connector.connected ? 'transparent' : '#BBCB64',
          border: connector.connected ? '1px solid #DDEC90' : 'none',
          borderRadius: '6px', padding: '8px 14px',
          cursor: 'pointer', transition: 'all 0.12s',
          alignSelf: 'flex-start',
        }}
        onMouseEnter={(e) => {
          if (connector.connected) (e.currentTarget as HTMLElement).style.background = '#FFF0DC'
          else (e.currentTarget as HTMLElement).style.opacity = '0.9'
        }}
        onMouseLeave={(e) => {
          if (connector.connected) (e.currentTarget as HTMLElement).style.background = 'transparent'
          else (e.currentTarget as HTMLElement).style.opacity = '1'
        }}
      >
        {connector.connected ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ConfigView
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Segmented control
// ---------------------------------------------------------------------------

interface SegmentedControlProps {
  label: string
  sub?: string
  options: string[]
  value: string
  onChange: (val: string) => void
}

function SegmentedControl({ label, sub, options, value, onChange }: SegmentedControlProps) {
  return (
    <div>
      <div style={fieldLabelStyle}>{label}</div>
      {sub && <div style={fieldSubStyle}>{sub}</div>}
      <div style={{
        display: 'flex', borderRadius: '6px', overflow: 'hidden',
        border: '1px solid #DDEC90',
      }}>
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              flex: 1, padding: '9px 0', fontSize: '15px', fontWeight: 700,
              cursor: 'pointer', border: 'none',
              borderRight: '1px solid #DDEC90',
              background: value === opt ? '#BBCB64' : '#FAFAF2',
              color: value === opt ? '#1A1A00' : '#6A6A20',
              transition: 'all 0.12s',
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ConfigView types
// ---------------------------------------------------------------------------

interface ToggleState {
  schemaMigration: boolean
  architectureChanges: boolean
  downtimeOps: boolean
  autoApproveFormatting: boolean
  autoSwitchHaiku: boolean
  weeklyReports: boolean
  yoloMode: boolean
  headlessBrowser: boolean
}

const DEFAULT_TOGGLES: ToggleState = {
  schemaMigration: true,
  architectureChanges: true,
  downtimeOps: true,
  autoApproveFormatting: false,
  autoSwitchHaiku: true,
  weeklyReports: true,
  yoloMode: false,
  headlessBrowser: true,
}

interface StackCategory {
  key: 'frontend' | 'backend' | 'database' | 'styling'
  label: string
  icon: typeof Code2
  options: { id: string; label: string }[]
}

const STACK_CATEGORIES: StackCategory[] = [
  {
    key: 'frontend', label: 'Frontend Framework', icon: Code2,
    options: [
      { id: 'react', label: 'React' }, { id: 'angular', label: 'Angular' },
      { id: 'vue', label: 'Vue' }, { id: 'svelte', label: 'Svelte' },
      { id: 'nextjs', label: 'Next.js' }, { id: 'none', label: 'Keep Current / None' },
    ],
  },
  {
    key: 'backend', label: 'Backend Framework', icon: Server,
    options: [
      { id: 'fastapi', label: 'FastAPI (Python)' }, { id: 'express', label: 'Express (Node.js)' },
      { id: 'django', label: 'Django (Python)' }, { id: 'springboot', label: 'Spring Boot (Java)' },
      { id: 'nestjs', label: 'NestJS (Node.js)' }, { id: 'none', label: 'Keep Current / None' },
    ],
  },
  {
    key: 'database', label: 'Database', icon: Database,
    options: [
      { id: 'postgresql', label: 'PostgreSQL' }, { id: 'mongodb', label: 'MongoDB' },
      { id: 'mysql', label: 'MySQL' }, { id: 'sqlite', label: 'SQLite' },
      { id: 'none', label: 'Keep Current / None' },
    ],
  },
  {
    key: 'styling', label: 'Styling', icon: Palette,
    options: [
      { id: 'tailwind', label: 'Tailwind CSS' }, { id: 'css-modules', label: 'CSS Modules' },
      { id: 'styled-components', label: 'Styled Components' }, { id: 'material-ui', label: 'Material UI' },
      { id: 'none', label: 'Keep Current / None' },
    ],
  },
]

export function ConfigView() {
  const [activeTab, setActiveTab] = useState('models')
  const [toggles, setToggles] = useState<ToggleState>(DEFAULT_TOGGLES)
  const [connectors, setConnectors] = useState(CONNECTORS)

  const [primaryModel, setPrimaryModel] = useState('Claude Opus 4.6')
  const [secondaryModel, setSecondaryModel] = useState('Claude Haiku 4.5')
  const [maxTokens, setMaxTokens] = useState('200K')
  const [framework, setFramework] = useState('React + TypeScript (Vite)')
  const [stateManagement, setStateManagement] = useState('Zustand (recommended)')
  const [archPattern, setArchPattern] = useState('Feature-based monorepo')
  const [hitlMode, setHitlMode] = useState('Standard')
  const [budgetCap, setBudgetCap] = useState('$5,000')
  const [alertThreshold, setAlertThreshold] = useState('80%')
  const [connectorFilter, setConnectorFilter] = useState('all')
  const [regressionAgents, setRegressionAgents] = useState('1')
  const [featuresPerAgent, setFeaturesPerAgent] = useState('3')
  const [targetStack, setTargetStack] = useState<Record<string, string | null>>({
    frontend: 'react', backend: 'express', database: 'postgresql', styling: 'tailwind',
  })

  // Provider / model state (real API)
  const { data: settings } = useSettings()
  const updateSettings = useUpdateSettings()
  const { data: modelsData } = useAvailableModels()
  const { data: providersData } = useAvailableProviders()
  const [authTokenInput, setAuthTokenInput] = useState('')
  const [showAuthToken, setShowAuthToken] = useState(false)
  const [customBaseUrlInput, setCustomBaseUrlInput] = useState('')
  const [customModelInput, setCustomModelInput] = useState('')
  const isSaving = updateSettings.isPending

  const providers = providersData?.providers ?? []
  const models = modelsData?.models ?? []
  const currentProvider = settings?.api_provider ?? 'claude'
  const currentProviderInfo: ProviderInfo | undefined = providers.find(p => p.id === currentProvider)
  const isAlternativeProvider = currentProvider !== 'claude'
  const showAuthField = isAlternativeProvider && currentProviderInfo?.requires_auth
  const showBaseUrlField = currentProvider === 'custom' || currentProvider === 'azure'
  const showCustomModelInput = currentProvider === 'custom' || currentProvider === 'ollama'

  const handleProviderChange = (providerId: string) => {
    if (!isSaving) {
      updateSettings.mutate({ api_provider: providerId })
      setAuthTokenInput('')
      setCustomBaseUrlInput('')
      setCustomModelInput('')
    }
  }
  const handleModelChange = (modelId: string) => {
    if (!isSaving) updateSettings.mutate({ api_model: modelId })
  }
  const handleSaveAuthToken = () => {
    if (authTokenInput.trim() && !isSaving) {
      updateSettings.mutate({ api_auth_token: authTokenInput.trim() })
      setAuthTokenInput('')
    }
  }
  const handleSaveCustomBaseUrl = () => {
    if (customBaseUrlInput.trim() && !isSaving) {
      updateSettings.mutate({ api_base_url: customBaseUrlInput.trim() })
      setCustomBaseUrlInput('')
    }
  }
  const handleSaveCustomModel = () => {
    if (customModelInput.trim() && !isSaving) {
      updateSettings.mutate({ api_model: customModelInput.trim() })
      setCustomModelInput('')
    }
  }

  // GitHub auth state
  const [ghAuth, setGhAuth] = useState<GitHubAuthStatus | null>(null)
  const [ghDeviceFlow, setGhDeviceFlow] = useState<{ userCode: string; verificationUri: string } | null>(null)
  const [ghPolling, setGhPolling] = useState(false)
  const [ghError, setGhError] = useState<string | null>(null)

  useEffect(() => {
    getGitHubAuthStatus()
      .then(setGhAuth)
      .catch(() => setGhAuth({ connected: false }))
  }, [])

  const handleGhConnect = useCallback(async () => {
    setGhError(null)
    try {
      const flow = await startGitHubDeviceFlow()
      setGhDeviceFlow({ userCode: flow.userCode, verificationUri: flow.verificationUri })
      setGhPolling(true)

      const interval = (flow.interval || 5) * 1000
      const poll = async () => {
        try {
          const status = await pollGitHubDeviceFlow()
          if (status.status === 'authorized') {
            setGhAuth({ connected: true, username: status.username })
            setGhDeviceFlow(null)
            setGhPolling(false)
            return
          }
          if (status.status === 'expired' || status.status === 'error') {
            setGhError(status.error || 'Authorization expired. Please try again.')
            setGhDeviceFlow(null)
            setGhPolling(false)
            return
          }
          setTimeout(poll, status.interval ? status.interval * 1000 : interval)
        } catch {
          setGhError('Polling failed. Please try again.')
          setGhDeviceFlow(null)
          setGhPolling(false)
        }
      }
      setTimeout(poll, interval)
    } catch (e) {
      setGhError(e instanceof Error ? e.message : 'Failed to start device flow')
    }
  }, [])

  const handleGhDisconnect = useCallback(async () => {
    try {
      await disconnectGitHub()
      setGhAuth({ connected: false })
    } catch {
      setGhError('Failed to disconnect')
    }
  }, [])

  const toggle = (key: keyof ToggleState) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleConnector = (id: string) => {
    setConnectors((prev) =>
      prev.map((c) => c.id === id ? { ...c, connected: !c.connected } : c)
    )
  }

  const ghIsConnected = ghAuth?.connected ?? false

  const filteredConnectors = connectorFilter === 'all'
    ? connectors
    : connectorFilter === 'connected'
      ? connectors.filter((c) => c.connected)
      : connectors.filter((c) => c.category === connectorFilter)

  const showGitHubInFilter =
    connectorFilter === 'all' ||
    connectorFilter === 'devops' ||
    (connectorFilter === 'connected' && ghIsConnected)

  const connectedCount = connectors.filter((c) => c.connected).length + (ghIsConnected ? 1 : 0)

  const panelStyle: React.CSSProperties = {
    background: '#FFFFFF', border: '1px solid #DDEC90', borderRadius: '10px',
    padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px',
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", maxWidth: activeTab === 'connectors' ? '100%' : '50%', transition: 'max-width 0.2s ease' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#7A8A00', marginBottom: '3px' }}>
          Platform Control
        </div>
        <h1 style={{ fontSize: '31px', fontWeight: 700, color: '#1A1A00', margin: 0, lineHeight: 1.2 }}>
          Configuration & <span style={{ color: '#7A8A00' }}>Governance</span>
        </h1>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: '2px', marginBottom: '20px',
        borderBottom: '2px solid #DDEC90', paddingBottom: '0',
      }}>
        {CONFIG_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              fontSize: '14px', fontWeight: 700, letterSpacing: '0.5px',
              textTransform: 'uppercase',
              padding: '10px 20px',
              cursor: 'pointer', border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #BBCB64' : '2px solid transparent',
              marginBottom: '-2px',
              background: activeTab === tab.id ? '#F5F8D0' : 'transparent',
              color: activeTab === tab.id ? '#1A1A00' : '#6A6A20',
              borderRadius: '6px 6px 0 0',
              transition: 'all 0.12s',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) (e.currentTarget as HTMLElement).style.color = '#1A1A00'
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) (e.currentTarget as HTMLElement).style.color = '#6A6A20'
            }}
          >
            {tab.label}
            {tab.id === 'connectors' && connectedCount > 0 && (
              <span style={{
                fontSize: '11px', fontWeight: 700,
                background: '#BBCB64', color: '#1A1A00',
                borderRadius: '10px', padding: '1px 7px', marginLeft: '2px',
              }}>
                {connectedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'models' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* API Provider & Model (live settings) */}
          <div style={panelStyle}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A00', marginBottom: '2px' }}>API Provider</div>
            <div style={{ fontSize: '13px', color: '#6A6A20', marginBottom: '8px' }}>
              Select the AI provider and model for your coding agents.
            </div>

            {/* Provider pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleProviderChange(provider.id)}
                  disabled={isSaving}
                  style={{
                    padding: '7px 16px', fontSize: '14px', fontWeight: 600,
                    borderRadius: '8px',
                    border: currentProvider === provider.id ? '1px solid #7A8A00' : '1px solid #DDEC90',
                    background: currentProvider === provider.id ? '#BBCB64' : '#FFFFFF',
                    color: currentProvider === provider.id ? '#1A1A00' : '#6A6A20',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    opacity: isSaving ? 0.5 : 1,
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                >
                  {provider.name.split(' (')[0]}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: '#6A6A20', margin: '6px 0 0' }}>
              {PROVIDER_INFO_TEXT[currentProvider] ?? ''}
            </p>

            {/* Auth Token */}
            {showAuthField && settings && (
              <div style={{ marginTop: '8px' }}>
                <div style={fieldLabelStyle}>API Key</div>
                {settings.api_has_auth_token && !authTokenInput ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6A6A20' }}>
                    <ShieldCheck size={14} style={{ color: '#7A8A00' }} />
                    <span>Configured</span>
                    <button
                      onClick={() => setAuthTokenInput(' ')}
                      style={{ background: 'transparent', border: 'none', color: '#7A8A00', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px' }}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type={showAuthToken ? 'text' : 'password'}
                        value={authTokenInput.trim()}
                        onChange={(e) => setAuthTokenInput(e.target.value)}
                        placeholder="Enter API key..."
                        style={{
                          width: '100%', padding: '8px 36px 8px 12px', fontSize: '13px',
                          border: '1px solid #DDEC90', borderRadius: '8px',
                          background: '#FFFFFF', color: '#1A1A00', outline: 'none', boxSizing: 'border-box',
                        }}
                        onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(187,203,100,0.12)' }}
                        onBlur={(e) => { e.currentTarget.style.boxShadow = 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowAuthToken(!showAuthToken)}
                        style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#6A6A20', cursor: 'pointer', padding: '2px' }}
                      >
                        {showAuthToken ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <button
                      onClick={handleSaveAuthToken}
                      disabled={!authTokenInput.trim() || isSaving}
                      style={{
                        background: '#BBCB64', color: '#1A1A00', border: 'none', borderRadius: '8px',
                        padding: '8px 16px', cursor: (!authTokenInput.trim() || isSaving) ? 'not-allowed' : 'pointer',
                        fontSize: '13px', fontWeight: 700,
                        opacity: (!authTokenInput.trim() || isSaving) ? 0.5 : 1,
                      }}
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Custom Base URL */}
            {showBaseUrlField && settings && (
              <div style={{ marginTop: '8px' }}>
                <div style={fieldLabelStyle}>Base URL</div>
                {settings.api_base_url && !customBaseUrlInput ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6A6A20' }}>
                    <ShieldCheck size={14} style={{ color: '#7A8A00' }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{settings.api_base_url}</span>
                    <button
                      onClick={() => setCustomBaseUrlInput(settings.api_base_url || '')}
                      style={{ background: 'transparent', border: 'none', color: '#7A8A00', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px', flexShrink: 0 }}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={customBaseUrlInput}
                      onChange={(e) => setCustomBaseUrlInput(e.target.value)}
                      placeholder={currentProvider === 'azure' ? 'https://your-resource.services.ai.azure.com/anthropic' : 'https://api.example.com/v1'}
                      style={{
                        flex: 1, padding: '8px 12px', fontSize: '13px',
                        border: '1px solid #DDEC90', borderRadius: '8px',
                        background: '#FFFFFF', color: '#1A1A00', outline: 'none',
                      }}
                      onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(187,203,100,0.12)' }}
                      onBlur={(e) => { e.currentTarget.style.boxShadow = 'none' }}
                    />
                    <button
                      onClick={handleSaveCustomBaseUrl}
                      disabled={!customBaseUrlInput.trim() || isSaving}
                      style={{
                        background: '#BBCB64', color: '#1A1A00', border: 'none', borderRadius: '8px',
                        padding: '8px 16px', cursor: (!customBaseUrlInput.trim() || isSaving) ? 'not-allowed' : 'pointer',
                        fontSize: '13px', fontWeight: 700,
                        opacity: (!customBaseUrlInput.trim() || isSaving) ? 0.5 : 1,
                      }}
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Divider */}
            <div style={{ height: '1px', background: '#DDEC90', margin: '6px 0' }} />

            {/* Model selection */}
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A00', marginBottom: '4px' }}>Model</div>
            {models.length > 0 && (
              <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid #DDEC90' }}>
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelChange(model.id)}
                    disabled={isSaving}
                    style={{
                      flex: 1, padding: '12px 14px', fontSize: '14px', fontWeight: 600,
                      background: settings && (settings.api_model ?? settings.model) === model.id ? '#BBCB64' : '#FFFFFF',
                      color: settings && (settings.api_model ?? settings.model) === model.id ? '#1A1A00' : '#6A6A20',
                      border: 'none', borderRight: '1px solid #DDEC90',
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      opacity: isSaving ? 0.5 : 1,
                      transition: 'background 0.15s',
                    }}
                  >
                    <span style={{ display: 'block' }}>{model.name}</span>
                    <span style={{ display: 'block', fontSize: '11px', opacity: 0.6, marginTop: '2px' }}>{model.id}</span>
                  </button>
                ))}
              </div>
            )}
            {showCustomModelInput && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <input
                  type="text"
                  value={customModelInput}
                  onChange={(e) => setCustomModelInput(e.target.value)}
                  placeholder="Custom model name..."
                  style={{
                    flex: 1, padding: '8px 12px', fontSize: '13px',
                    border: '1px solid #DDEC90', borderRadius: '8px',
                    background: '#FFFFFF', color: '#1A1A00', outline: 'none',
                  }}
                  onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(187,203,100,0.12)' }}
                  onBlur={(e) => { e.currentTarget.style.boxShadow = 'none' }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveCustomModel()}
                />
                <button
                  onClick={handleSaveCustomModel}
                  disabled={!customModelInput.trim() || isSaving}
                  style={{
                    background: '#BBCB64', color: '#1A1A00', border: 'none', borderRadius: '8px',
                    padding: '8px 16px', cursor: (!customModelInput.trim() || isSaving) ? 'not-allowed' : 'pointer',
                    fontSize: '13px', fontWeight: 700,
                    opacity: (!customModelInput.trim() || isSaving) ? 0.5 : 1,
                  }}
                >
                  Set
                </button>
              </div>
            )}
          </div>

          {/* Agent configuration */}
          <div style={panelStyle}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A00', marginBottom: '2px' }}>Agent Settings</div>
            <div style={{ fontSize: '13px', color: '#6A6A20', marginBottom: '8px' }}>
              Configure agent behavior, concurrency, and testing preferences.
            </div>
            <ToggleRow
              name="YOLO Mode"
              desc="Skip testing for rapid prototyping"
              on={toggles.yoloMode}
              onToggle={() => toggle('yoloMode')}
            />
            <ToggleRow
              name="Headless Browser"
              desc="Run browser without visible window (saves CPU)"
              on={toggles.headlessBrowser}
              onToggle={() => toggle('headlessBrowser')}
              isLast
            />

            <SegmentedControl
              label="Regression Agents"
              sub="Number of regression testing agents (0 = disabled)"
              options={['0', '1', '2', '3']}
              value={regressionAgents}
              onChange={setRegressionAgents}
            />
            <SegmentedControl
              label="Features per Agent"
              sub="Number of features assigned to each coding agent"
              options={['1', '2', '3']}
              value={featuresPerAgent}
              onChange={setFeaturesPerAgent}
            />
          </div>
        </div>
      )}

      {activeTab === 'framework' && (
        <div style={panelStyle}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A00', marginBottom: '2px' }}>Target Stack</div>
          <div style={{ fontSize: '13px', color: '#6A6A20', marginBottom: '16px' }}>
            Select the default technologies for new projects. Leave unselected to keep current tech for that layer.
          </div>

          {STACK_CATEGORIES.map((category) => {
            const Icon = category.icon
            return (
              <div key={category.key} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Icon size={16} style={{ color: '#6A6A20' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px', color: '#1A1A00' }}>
                    {category.label}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {category.options.map((option) => {
                    const isSelected = targetStack[category.key] === option.id
                    return (
                      <button
                        key={option.id}
                        onClick={() => setTargetStack(prev => ({
                          ...prev,
                          [category.key]: isSelected ? null : option.id,
                        }))}
                        style={{
                          padding: '8px 16px', borderRadius: '8px',
                          fontSize: '13px', fontWeight: 600,
                          border: isSelected ? '1px solid #7A8A00' : '1px solid #DDEC90',
                          background: isSelected ? '#BBCB64' : '#FFFFFF',
                          color: '#1A1A00',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#F5F8D0' }}
                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = '#FFFFFF' }}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          <div style={{ height: '1px', background: '#DDEC90', margin: '4px 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <SelectField
              label="State Management"
              options={['Zustand (recommended)', 'Redux Toolkit', 'Jotai', 'Context API']}
              value={stateManagement}
              onChange={setStateManagement}
            />
            <SelectField
              label="Architectural Pattern"
              options={['Feature-based monorepo', 'Micro-frontends', 'Layered']}
              value={archPattern}
              onChange={setArchPattern}
            />
          </div>
        </div>
      )}

      {activeTab === 'hitl' && (
        <div style={panelStyle}>
          <div style={{ fontSize: '13px', color: '#6A6A20', marginBottom: '4px' }}>
            Control when agents pause for human review and approval.
          </div>
          <SelectField
            label="HITL Trigger Mode"
            options={['Standard', 'Verbose', 'Minimal']}
            value={hitlMode}
            onChange={setHitlMode}
          />
          <div>
            <ToggleRow
              name="Schema migration approvals"
              desc="Require human approval before any DB schema changes"
              on={toggles.schemaMigration}
              onToggle={() => toggle('schemaMigration')}
            />
            <ToggleRow
              name="Architecture pattern changes"
              desc="Escalate if agent recommends structural changes"
              on={toggles.architectureChanges}
              onToggle={() => toggle('architectureChanges')}
            />
            <ToggleRow
              name="Downtime-requiring operations"
              desc="Always require approval when downtime is predicted"
              on={toggles.downtimeOps}
              onToggle={() => toggle('downtimeOps')}
            />
            <ToggleRow
              name="Auto-approve formatting tasks"
              desc="Bypass HITL for linting, formatting, and docs"
              on={toggles.autoApproveFormatting}
              onToggle={() => toggle('autoApproveFormatting')}
              isLast
            />
          </div>
        </div>
      )}

      {activeTab === 'budget' && (
        <div style={panelStyle}>
          <div style={{ fontSize: '13px', color: '#6A6A20', marginBottom: '4px' }}>
            Set spending limits and cost optimization rules across all agents.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <SelectField
              label="Monthly Budget Cap"
              options={['$5,000', '$7,500', '$10,000', 'Custom']}
              value={budgetCap}
              onChange={setBudgetCap}
            />
            <SelectField
              label="Budget Alert Threshold"
              options={['80%', '90%', '100%']}
              value={alertThreshold}
              onChange={setAlertThreshold}
            />
          </div>
          <div>
            <ToggleRow
              name="Auto-switch to Haiku on budget alert"
              desc="Use cheaper model for routine tasks when near budget"
              on={toggles.autoSwitchHaiku}
              onToggle={() => toggle('autoSwitchHaiku')}
            />
            <ToggleRow
              name="Weekly cost reports via email"
              desc="Send governance reports to admins every Monday"
              on={toggles.weeklyReports}
              onToggle={() => toggle('weeklyReports')}
              isLast
            />
          </div>
        </div>
      )}

      {activeTab === 'connectors' && (
        <div style={panelStyle}>
          {/* Connector header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', color: '#6A6A20' }}>
              {connectedCount} of {connectors.length} integrations active
            </div>
            {/* Category filter pills */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { id: 'all', label: 'All' },
                { id: 'connected', label: 'Connected' },
                { id: 'design', label: 'Design' },
                { id: 'communication', label: 'Comms' },
                { id: 'devops', label: 'DevOps' },
                { id: 'storage', label: 'Data' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setConnectorFilter(f.id)}
                  style={{
                    fontSize: '12px', fontWeight: 700,
                    borderRadius: '20px', padding: '4px 12px',
                    cursor: 'pointer', transition: 'all 0.12s',
                    border: connectorFilter === f.id ? '1px solid #BBCB64' : '1px solid #DDEC90',
                    background: connectorFilter === f.id ? '#BBCB64' : 'transparent',
                    color: connectorFilter === f.id ? '#1A1A00' : '#6A6A20',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error banner */}
          {ghError && (
            <div style={{
              background: '#FFF0DC', border: '1px solid #E8C48A', borderRadius: '8px',
              padding: '10px 16px', fontSize: '13px', color: '#8A5D00',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span>{ghError}</span>
              <button
                onClick={() => setGhError(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#8A5D00' }}
              >
                ×
              </button>
            </div>
          )}

          {/* Connector grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {showGitHubInFilter && (
              <GitHubConnectorCard
                authStatus={ghAuth}
                onConnect={handleGhConnect}
                onDisconnect={handleGhDisconnect}
                isPolling={ghPolling}
              />
            )}
            {filteredConnectors.map((connector) => (
              <ConnectorCard
                key={connector.id}
                connector={connector}
                onToggle={() => toggleConnector(connector.id)}
              />
            ))}
          </div>

          {filteredConnectors.length === 0 && !showGitHubInFilter && (
            <div style={{
              textAlign: 'center', padding: '40px', color: '#6A6A20',
              background: '#FAFAF2', borderRadius: '10px', border: '1px solid #DDEC90',
            }}>
              No connectors match this filter.
            </div>
          )}
        </div>
      )}

      {/* GitHub Device Flow Modal */}
      {ghDeviceFlow && (
        <DeviceFlowModal
          userCode={ghDeviceFlow.userCode}
          verificationUri={ghDeviceFlow.verificationUri}
          onClose={() => {
            setGhDeviceFlow(null)
          }}
        />
      )}
    </div>
  )
}
