interface AnalyticsViewProps {
  projectCount?: number
}

/** Static data for KPI cards displayed at the top of the analytics view. */
const KPI_CARDS = [
  { label: 'Total Tokens (MTD)', value: '84M', sub: '\u2191 +18% vs last month', valueColor: '#7A8A00', valueFontSize: '36px' },
  { label: 'Monthly AI Cost', value: '$4,200', sub: '\u2193 \u221212% vs last month', valueColor: '#C07000', valueFontSize: '36px' },
  { label: 'Cost per Project', value: '$350 avg', sub: 'Range: $80 \u2013 $920', valueColor: '#7A8A00', valueFontSize: '29px' },
  { label: 'HITL Response Time', value: '14s avg', sub: '\u2193 \u221240% vs last quarter', valueColor: '#7A8A00', valueFontSize: '29px' },
]

/** Token usage breakdown by model. */
const MODEL_USAGE = [
  { label: 'Sonnet 4.6', pct: 67, fill: '#BBCB64', value: '56.3M', valueColor: '#7A8A00' },
  { label: 'Haiku 4.5', pct: 33, fill: '#FFE52A', value: '27.7M', valueColor: '#B8A000' },
]

/** Token usage breakdown by agent. */
const AGENT_USAGE = [
  { label: 'Athena', pct: 38, fill: '#BBCB64', value: '31.9M', valueColor: '#7A8A00' },
  { label: 'Zeus', pct: 24, fill: '#DDEC90', value: '20.2M', valueColor: '#7A8A00' },
  { label: 'Hephaestus', pct: 19, fill: '#DDEC90', value: '15.9M', valueColor: '#7A8A00' },
  { label: 'Ares', pct: 12, fill: '#F5F8D0', value: '10.1M', valueColor: '#6A6A20', hasBorder: true },
  { label: 'Others', pct: 7, fill: '#E0E0E0', value: '5.9M', valueColor: '#6A6A20' },
]

interface ProjectCostRow {
  name: string
  tokens: string
  cost: string
  costValue: number
  phase: string
  phaseStyle: { bg: string; color: string }
}

/** Cost breakdown by project for the table. */
const PROJECT_COSTS: ProjectCostRow[] = [
  { name: 'Alpha Rewrite', tokens: '22.4M', cost: '$920', costValue: 920, phase: 'Build', phaseStyle: { bg: '#F5F8D0', color: '#7A8A00' } },
  { name: 'Portal Modernization', tokens: '18.1M', cost: '$742', costValue: 742, phase: 'Review', phaseStyle: { bg: '#FFF0DC', color: '#A05A00' } },
  { name: 'Design Rebuild', tokens: '14.8M', cost: '$607', costValue: 607, phase: 'Deploy', phaseStyle: { bg: '#FFF0DC', color: '#A05A00' } },
  { name: 'Legacy API Migration', tokens: '11.2M', cost: '$459', costValue: 459, phase: 'Discovery', phaseStyle: { bg: '#F5F8D0', color: '#7A8A00' } },
  { name: 'Mobile Proto Rebuild', tokens: '9.6M', cost: '$394', costValue: 394, phase: 'Build', phaseStyle: { bg: '#F5F8D0', color: '#7A8A00' } },
  { name: 'CRM Integration', tokens: '5.1M', cost: '$209', costValue: 209, phase: 'Build', phaseStyle: { bg: '#F5F8D0', color: '#7A8A00' } },
  { name: 'Dashboard Overhaul', tokens: '2.8M', cost: '$115', costValue: 115, phase: 'Discovery', phaseStyle: { bg: '#F5F8D0', color: '#7A8A00' } },
]

/** Infrastructure spend breakdown for the summary section. */
const INFRA_ITEMS = [
  { label: 'AI Compute', value: '$3,840', desc: 'Claude API usage across all agents', isHighlight: false },
  { label: 'Storage & Infra', value: '$360', desc: 'File storage, vector DB, logging', isHighlight: false },
  { label: 'Total MTD', value: '$4,200', desc: 'Budget: $5,000 \u00b7 84% utilized', isHighlight: true },
  { label: 'Projected Month-End', value: '$4,650', desc: 'Within budget \u00b7 On pace', isHighlight: false },
]

/**
 * Reusable bar row component for the token usage chart.
 * Renders a label, a horizontal bar at the given percentage, and a value.
 */
function BarRow({ label, pct, fill, value, valueColor, hasBorder }: {
  label: string; pct: number; fill: string; value: string; valueColor: string; hasBorder?: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '13px', color: '#1A1A00', fontWeight: 600, width: '80px', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: '8px', background: '#F5F8D0', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '4px', width: `${pct}%`, background: fill,
          border: hasBorder ? '1px solid #DDEC90' : undefined,
          boxSizing: 'border-box',
        }} />
      </div>
      <span style={{ fontSize: '13px', fontWeight: 700, width: '50px', textAlign: 'right', color: valueColor, flexShrink: 0 }}>{value}</span>
    </div>
  )
}

export function AnalyticsView({ projectCount = 12 }: AnalyticsViewProps) {
  // Suppress unused variable warning -- projectCount is part of the public API
  void projectCount

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Page Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#7A8A00', marginBottom: '3px' }}>
          Operational Intelligence
        </div>
        <h1 style={{ fontSize: '31px', fontWeight: 700, color: '#1A1A00', margin: 0, lineHeight: 1.2 }}>
          Analytics & <span style={{ color: '#7A8A00' }}>Cost Governance</span>
        </h1>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
        {KPI_CARDS.map((kpi) => (
          <div key={kpi.label} style={{
            background: '#FFFFFF', border: '1px solid #DDEC90', borderRadius: '8px', padding: '16px',
          }}>
            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#7A8A00', marginBottom: '8px' }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: kpi.valueFontSize, fontWeight: 700, color: kpi.valueColor, marginBottom: '4px' }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: '13px', color: '#6A6A20' }}>
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Two-Column Section: Token Usage + Cost by Project */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        {/* Left: Token Usage by Model */}
        <div style={{ background: '#FFFFFF', border: '1px solid #DDEC90', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid #DDEC90', background: '#FAFAF2',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#7A8A00' }}>
              Token Usage by Model
            </span>
            <span style={{
              fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px',
              background: '#F5F8D0', color: '#7A8A00', border: '1px solid #DDEC90',
            }}>
              MTD
            </span>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {MODEL_USAGE.map((row) => (
              <BarRow key={row.label} {...row} />
            ))}

            {/* Divider */}
            <div style={{ height: '1px', background: '#F5F8D0', margin: '6px 0' }} />

            {/* By Agent sub-header */}
            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#7A8A00', marginBottom: '2px' }}>
              By Agent
            </div>
            {AGENT_USAGE.map((row) => (
              <BarRow key={row.label} {...row} />
            ))}
          </div>
        </div>

        {/* Right: Cost by Project */}
        <div style={{ background: '#FFFFFF', border: '1px solid #DDEC90', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid #DDEC90', background: '#FAFAF2',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#7A8A00' }}>
              Cost by Project
            </span>
            <span style={{
              fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px',
              background: '#F5F8D0', color: '#7A8A00', border: '1px solid #DDEC90',
            }}>
              MTD
            </span>
          </div>
          <div style={{ padding: '0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #DDEC90' }}>
                  {['Project', 'Tokens', 'Cost', 'Phase'].map((th) => (
                    <th key={th} style={{
                      textAlign: 'left', padding: '10px 14px', fontSize: '12px', fontWeight: 700,
                      letterSpacing: '1px', textTransform: 'uppercase', color: '#7A8A00',
                    }}>
                      {th}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PROJECT_COSTS.map((row, idx) => (
                  <tr key={row.name} style={{ background: idx % 2 === 1 ? '#F5F8D0' : 'transparent' }}>
                    <td style={{ padding: '8px 14px', fontWeight: 600, color: '#1A1A00' }}>{row.name}</td>
                    <td style={{ padding: '8px 14px', color: '#6A6A20' }}>{row.tokens}</td>
                    <td style={{ padding: '8px 14px', fontWeight: 700, color: row.costValue > 500 ? '#C07000' : '#7A8A00' }}>{row.cost}</td>
                    <td style={{ padding: '8px 14px' }}>
                      <span style={{
                        fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                        background: row.phaseStyle.bg, color: row.phaseStyle.color,
                      }}>
                        {row.phase}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom: Infrastructure & Spend Summary */}
      <div style={{ background: '#FFFFFF', border: '1px solid #DDEC90', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{
          padding: '12px 16px', borderBottom: '1px solid #DDEC90', background: '#FAFAF2',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#7A8A00' }}>
            Infrastructure & Spend Summary
          </span>
          <span style={{
            fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px',
            background: '#FFF0DC', color: '#A05A00', border: '1px solid #F0C880',
          }}>
            Feb 2026
          </span>
        </div>
        <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {INFRA_ITEMS.map((item) => (
            <div key={item.label} style={{
              background: '#FFFFFF', border: '1px solid #DDEC90', borderRadius: '6px',
              padding: '12px 14px', fontSize: '14px', color: '#1A1A00', lineHeight: 1.6,
            }}>
              <strong style={{ color: '#7A8A00' }}>{item.label}</strong>
              <br />
              <span style={{
                fontSize: item.isHighlight ? '23px' : '18px',
                fontWeight: 700,
                color: item.isHighlight ? '#C07000' : '#1A1A00',
              }}>
                {item.value}
              </span>
              <br />
              <span style={{ fontSize: '13px', color: '#6A6A20' }}>{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
