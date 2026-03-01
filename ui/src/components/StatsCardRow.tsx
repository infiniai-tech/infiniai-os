interface StatsCardRowProps {
  projectCount: number
  totalFeatures?: number
  completedFeatures?: number
}

interface StatCard {
  label: string
  value: string | number
  delta: string
  deltaType: 'pos' | 'neg' | 'muted'
  borderColor: string
  valueColor: string
}

export function StatsCardRow({ projectCount }: StatsCardRowProps) {
  const cards: StatCard[] = [
    { label: 'Active Projects', value: projectCount, delta: '\u2191 +3 this week', deltaType: 'pos', borderColor: '#BBCB64', valueColor: '#7A8A00' },
    { label: 'Agents Deployed', value: 16, delta: '14 working \u00b7 2 idle', deltaType: 'muted', borderColor: '#FFE52A', valueColor: '#B8A000' },
    { label: 'HITL Checkpoints\nAwaiting Review', value: 3, delta: '\u2191 needs attention', deltaType: 'neg', borderColor: '#F79A19', valueColor: '#C07000' },
    { label: 'Monthly Spend', value: '$4.2k', delta: '\u2193 \u221212% vs last mo.', deltaType: 'pos', borderColor: '#BBCB64', valueColor: '#7A8A00' },
    { label: 'Tokens Used (MTD)', value: '84M', delta: 'Sonnet 67% \u00b7 Haiku 33%', deltaType: 'muted', borderColor: '#BBCB64', valueColor: '#7A8A00' },
  ]

  const deltaColor = { pos: '#7A8A00', neg: '#CF0F0F', muted: '#6A6A20' }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', fontFamily: 'Arial, sans-serif' }}>
      {cards.map((card) => (
        <div
          key={card.label}
          style={{
            background: '#FFFFFF',
            border: '1px solid #DDEC90',
            borderRadius: '8px',
            padding: '14px 14px 12px 18px',
            borderLeft: `4px solid ${card.borderColor}`,
          }}
        >
          <div style={{ fontSize: '34px', fontWeight: 700, color: card.valueColor, lineHeight: 1 }}>
            {card.value}
          </div>
          <div style={{ fontSize: '13px', color: '#6A6A20', marginTop: '4px', lineHeight: 1.3, whiteSpace: 'pre-line' }}>
            {card.label}
          </div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: deltaColor[card.deltaType], marginTop: '3px' }}>
            {card.delta}
          </div>
        </div>
      ))}
    </div>
  )
}
