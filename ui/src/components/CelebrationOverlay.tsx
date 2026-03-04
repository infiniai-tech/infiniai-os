import { useCallback, useEffect, useState } from 'react'
import { Sparkles, PartyPopper } from 'lucide-react'
import { AgentAvatar } from './AgentAvatar'
import type { AgentMascot } from '../lib/types'

interface CelebrationOverlayProps {
  agentName: AgentMascot | 'Unknown'
  featureName: string
  onComplete?: () => void
}

function generateConfetti(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1,
    color: ['#BBCB64', '#FFE52A', '#F79A19', '#7A8A00', '#DDEC90'][Math.floor(Math.random() * 5)],
    rotation: Math.random() * 360,
  }))
}

export function CelebrationOverlay({ agentName, featureName, onComplete }: CelebrationOverlayProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [confetti] = useState(() => generateConfetti(30))

  const dismiss = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => onComplete?.(), 300)
  }, [onComplete])

  useEffect(() => {
    const timer = setTimeout(dismiss, 3000)
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss() }
    window.addEventListener('keydown', handleKeyDown)
    return () => { clearTimeout(timer); window.removeEventListener('keydown', handleKeyDown) }
  }, [dismiss])

  if (!isVisible) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none',
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.3s',
    }}>
      {/* Confetti */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {confetti.map((particle) => (
          <div
            key={particle.id}
            className="animate-confetti"
            style={{
              position: 'absolute',
              width: '12px', height: '12px',
              left: `${particle.x}%`,
              top: '-20px',
              background: particle.color,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              transform: `rotate(${particle.rotation}deg)`,
              borderRadius: '2px',
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div
        onClick={dismiss}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') dismiss() }}
        style={{
          pointerEvents: 'auto',
          cursor: 'pointer',
          background: 'linear-gradient(135deg, #F5F8D0, #FFFFFF)',
          border: '2px solid #BBCB64',
          borderRadius: '16px',
          padding: '28px 32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
          boxShadow: '0 24px 64px rgba(26,26,0,0.15), 0 0 0 4px rgba(187,203,100,0.2)',
          fontFamily: "'Inter', sans-serif",
          textAlign: 'center',
          animation: 'bounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          maxWidth: '280px',
        }}
      >
        {/* Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={22} className="animate-pulse" style={{ color: '#F79A19' }} />
          <PartyPopper size={28} style={{ color: '#7A8A00' }} />
          <Sparkles size={22} className="animate-pulse" style={{ color: '#F79A19' }} />
        </div>

        {/* Avatar */}
        <AgentAvatar name={agentName} state="success" size="lg" />

        {/* Message */}
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '18px', color: '#1A1A00', margin: '0 0 6px', fontFamily: "'Geist', 'Inter', sans-serif" }}>
            Feature Complete!
          </h3>
          <p style={{ fontSize: '13px', color: '#6A6A20', margin: '0 0 4px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {featureName}
          </p>
          <p style={{ fontSize: '12px', color: '#9A9A60', margin: 0 }}>
            Great job, {agentName}!
          </p>
        </div>

        <p style={{ fontSize: '11px', color: '#9A9A60', margin: 0 }}>
          Click or press Esc to dismiss
        </p>
      </div>
    </div>
  )
}
