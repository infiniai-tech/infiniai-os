import { useState } from 'react'

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

const cardStyle: React.CSSProperties = {
  background: '#FFFFFF', border: '1px solid #DDEC90', borderRadius: '8px', overflow: 'hidden',
}
const cardHeadStyle: React.CSSProperties = {
  padding: '12px 16px', borderBottom: '1px solid #DDEC90', background: '#FAFAF2',
}
const cardHeadTitle: React.CSSProperties = {
  fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#7A8A00',
}
const cardBodyStyle: React.CSSProperties = {
  padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px',
}
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
// ConfigView
// ---------------------------------------------------------------------------

/** Toggle state keys used across all config cards. */
interface ToggleState {
  schemaMigration: boolean
  architectureChanges: boolean
  downtimeOps: boolean
  autoApproveFormatting: boolean
  autoSwitchHaiku: boolean
  weeklyReports: boolean
}

const DEFAULT_TOGGLES: ToggleState = {
  schemaMigration: true,
  architectureChanges: true,
  downtimeOps: true,
  autoApproveFormatting: false,
  autoSwitchHaiku: true,
  weeklyReports: true,
}

export function ConfigView() {
  const [toggles, setToggles] = useState<ToggleState>(DEFAULT_TOGGLES)

  // Select field state
  const [primaryModel, setPrimaryModel] = useState('Claude Opus 4.6')
  const [secondaryModel, setSecondaryModel] = useState('Claude Haiku 4.5')
  const [maxTokens, setMaxTokens] = useState('200K')
  const [framework, setFramework] = useState('React + TypeScript (Vite)')
  const [stateManagement, setStateManagement] = useState('Zustand (recommended)')
  const [archPattern, setArchPattern] = useState('Feature-based monorepo')
  const [hitlMode, setHitlMode] = useState('Standard')
  const [budgetCap, setBudgetCap] = useState('$5,000')
  const [alertThreshold, setAlertThreshold] = useState('80%')

  /** Helper to toggle a specific boolean flag. */
  const toggle = (key: keyof ToggleState) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#7A8A00', marginBottom: '3px' }}>
          Platform Control
        </div>
        <h1 style={{ fontSize: '31px', fontWeight: 700, color: '#1A1A00', margin: 0, lineHeight: 1.2 }}>
          Configuration & <span style={{ color: '#7A8A00' }}>Governance</span>
        </h1>
      </div>

      {/* 2x2 Grid of Config Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Card 1: Model Provider Settings */}
        <div style={cardStyle}>
          <div style={cardHeadStyle}>
            <span style={cardHeadTitle}>Model Provider Settings</span>
          </div>
          <div style={cardBodyStyle}>
            <SelectField
              label="Primary Model"
              sub="Used for complex reasoning, architecture decisions, and code generation"
              options={['Claude Opus 4.6', 'Claude Sonnet 4.5', 'Claude Sonnet 4.0', 'GPT-4o']}
              value={primaryModel}
              onChange={setPrimaryModel}
            />
            <SelectField
              label="Secondary Model"
              sub="Used for routine tasks, formatting, and simple queries"
              options={['Claude Haiku 4.5', 'Claude Haiku 3.5', 'Claude Sonnet 4.5', 'GPT-4o Mini']}
              value={secondaryModel}
              onChange={setSecondaryModel}
            />
            <SelectField
              label="Max Tokens per Task"
              options={['100K', '150K', '200K', '250K']}
              value={maxTokens}
              onChange={setMaxTokens}
            />
          </div>
        </div>

        {/* Card 2: Framework & Architecture */}
        <div style={cardStyle}>
          <div style={cardHeadStyle}>
            <span style={cardHeadTitle}>Framework & Architecture</span>
          </div>
          <div style={cardBodyStyle}>
            <SelectField
              label="Default Output Framework"
              options={['React + TypeScript (Vite)', 'Next.js', 'Vue 3', 'Angular']}
              value={framework}
              onChange={setFramework}
            />
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

        {/* Card 3: Human-in-Loop (HITL) Settings */}
        <div style={cardStyle}>
          <div style={cardHeadStyle}>
            <span style={cardHeadTitle}>Human-in-Loop (HITL) Settings</span>
          </div>
          <div style={cardBodyStyle}>
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
        </div>

        {/* Card 4: Budget & Cost Controls */}
        <div style={cardStyle}>
          <div style={cardHeadStyle}>
            <span style={cardHeadTitle}>Budget & Cost Controls</span>
          </div>
          <div style={cardBodyStyle}>
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
        </div>
      </div>
    </div>
  )
}
