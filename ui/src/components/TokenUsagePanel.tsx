import { motion } from 'framer-motion'

export function TokenUsagePanel() {
  return (
    <motion.div
      whileHover={{ y: -1, boxShadow: '0 4px 16px rgba(26,26,0,0.08)' }}
      transition={{ duration: 0.2 }}
      style={{
        borderRadius: '12px',
        border: '1px solid #DDEC90',
        background: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(26,26,0,0.06), 0 1px 2px rgba(26,26,0,0.04)',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(to bottom, #FAFAF2, #FFFFFF)',
          padding: '14px 16px',
          borderBottom: '1px solid #DDEC90',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
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
          Token Usage &amp; Cost · MTD
        </h2>
        <span
          style={{
            borderRadius: '9999px',
            background: '#F5F8D0',
            border: '1px solid #DDEC90',
            padding: '3px 10px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#7A8A00',
          }}
        >
          84M TOKENS
        </span>
      </div>

      {/* Content: model usage + cost breakdown */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* Left: Model usage (60%) */}
          <div style={{ flex: 3, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Section label */}
            <div
              style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                color: '#7A8A00',
              }}
            >
              Model Breakdown
            </div>

            {/* Sonnet 4.6 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span
                    style={{
                      fontFamily: "'Geist', 'Inter', sans-serif",
                      fontSize: '32px',
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      color: '#7A8A00',
                    }}
                  >
                    67%
                  </span>
                  <span
                    style={{
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: '#F5F8D0',
                      color: '#7A8A00',
                      border: '1px solid #DDEC90',
                      padding: '2px 8px',
                    }}
                  >
                    Sonnet 4.6
                  </span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#6A6A20', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  56.3M tokens
                </span>
              </div>
              <div
                style={{
                  height: '6px',
                  width: '100%',
                  borderRadius: '9999px',
                  background: '#F5F8D0',
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '67%' }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    borderRadius: '9999px',
                    background: 'linear-gradient(to right, #BBCB64, #FFE52A)',
                  }}
                />
              </div>
            </div>

            {/* Haiku 4.5 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span
                    style={{
                      fontFamily: "'Geist', 'Inter', sans-serif",
                      fontSize: '32px',
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      color: '#7A8A00',
                    }}
                  >
                    33%
                  </span>
                  <span
                    style={{
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: '#F5F8D0',
                      color: '#7A8A00',
                      border: '1px solid #DDEC90',
                      padding: '2px 8px',
                    }}
                  >
                    Haiku 4.5
                  </span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#6A6A20', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  27.7M tokens
                </span>
              </div>
              <div
                style={{
                  height: '6px',
                  width: '100%',
                  borderRadius: '9999px',
                  background: '#F5F8D0',
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '33%' }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                  style={{
                    height: '100%',
                    borderRadius: '9999px',
                    background: 'linear-gradient(to right, #BBCB64, #FFE52A)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right: Cost breakdown (40%) */}
          <div style={{ flex: 2, minWidth: '180px' }}>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                color: '#7A8A00',
                marginBottom: '12px',
              }}
            >
              Cost Breakdown
            </div>
            <table style={{ width: '100%', fontSize: '13px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 0', color: '#6A6A20', fontSize: '13px' }}>Compute Cost</td>
                  <td
                    style={{
                      padding: '6px 0',
                      textAlign: 'right',
                      fontFamily: "'Geist', 'Inter', sans-serif",
                      fontWeight: 700,
                      fontSize: '15px',
                      color: '#1A1A00',
                    }}
                  >
                    $3,840
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0', color: '#6A6A20', fontSize: '13px' }}>Infra &amp; Storage</td>
                  <td
                    style={{
                      padding: '6px 0',
                      textAlign: 'right',
                      fontFamily: "'Geist', 'Inter', sans-serif",
                      fontWeight: 700,
                      fontSize: '15px',
                      color: '#1A1A00',
                    }}
                  >
                    $360
                  </td>
                </tr>
                <tr>
                  <td colSpan={2}>
                    <div style={{ margin: '6px 0', height: '1px', background: '#DDEC90' }} />
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', fontSize: '11px', fontWeight: 600, color: '#6A6A20', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Total MTD
                  </td>
                  <td
                    style={{
                      padding: '4px 0',
                      textAlign: 'right',
                      fontFamily: "'Geist', 'Inter', sans-serif",
                      fontSize: '22px',
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      color: '#1A1A00',
                    }}
                  >
                    $4,200
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
