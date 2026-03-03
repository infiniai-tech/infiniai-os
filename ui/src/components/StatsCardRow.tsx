import { motion } from 'framer-motion'

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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', fontFamily: "'Inter', sans-serif" }}>
      {cards.map((card) => (
        <motion.div
          key={card.label}
          whileHover={{
            y: -2,
            boxShadow: '0 6px 20px rgba(26,26,0,0.09), 0 2px 6px rgba(26,26,0,0.05)',
          }}
          transition={{ duration: 0.15 }}
          style={{
            background: '#FFFFFF',
            border: '1px solid #DDEC90',
            borderRadius: '12px',
            padding: '18px 16px 16px 20px',
            borderLeft: `4px solid ${card.borderColor}`,
            boxShadow: '0 1px 3px rgba(26,26,0,0.06), 0 1px 2px rgba(26,26,0,0.04)',
            overflow: 'hidden',
          }}
        >
          <div style={{
            fontFamily: "'Geist', 'Inter', sans-serif",
            fontSize: '36px',
            fontWeight: 700,
            color: card.valueColor,
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}>
            {card.value}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6A6A20',
            fontWeight: 500,
            lineHeight: 1.4,
            marginTop: '6px',
            whiteSpace: 'pre-line',
          }}>
            {card.label}
          </div>
          <div style={{
            fontSize: '12px',
            fontWeight: 600,
            color: deltaColor[card.deltaType],
            marginTop: '4px',
          }}>
            {card.delta}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
