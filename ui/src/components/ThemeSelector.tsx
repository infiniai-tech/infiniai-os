import { useState, useRef, useEffect } from 'react'
import { Palette, Check } from 'lucide-react'
import type { ThemeId, ThemeOption } from '../hooks/useTheme'

interface ThemeSelectorProps {
  themes: ThemeOption[]
  currentTheme: ThemeId
  onThemeChange: (theme: ThemeId) => void
}

export function ThemeSelector({ themes, currentTheme, onThemeChange }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [previewTheme, setPreviewTheme] = useState<ThemeId | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setPreviewTheme(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Apply preview theme
  useEffect(() => {
    if (previewTheme) {
      const root = document.documentElement
      root.classList.remove('theme-claude', 'theme-neo-brutalism', 'theme-retro-arcade', 'theme-aurora', 'theme-business')
      if (previewTheme === 'claude') root.classList.add('theme-claude')
      else if (previewTheme === 'neo-brutalism') root.classList.add('theme-neo-brutalism')
      else if (previewTheme === 'retro-arcade') root.classList.add('theme-retro-arcade')
      else if (previewTheme === 'aurora') root.classList.add('theme-aurora')
      else if (previewTheme === 'business') root.classList.add('theme-business')
    }
    return () => {
      if (previewTheme) {
        const root = document.documentElement
        root.classList.remove('theme-claude', 'theme-neo-brutalism', 'theme-retro-arcade', 'theme-aurora', 'theme-business')
        if (currentTheme === 'claude') root.classList.add('theme-claude')
        else if (currentTheme === 'neo-brutalism') root.classList.add('theme-neo-brutalism')
        else if (currentTheme === 'retro-arcade') root.classList.add('theme-retro-arcade')
        else if (currentTheme === 'aurora') root.classList.add('theme-aurora')
        else if (currentTheme === 'business') root.classList.add('theme-business')
      }
    }
  }, [previewTheme, currentTheme])

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => { setIsOpen(false); setPreviewTheme(null) }, 150)
  }

  const handleThemeClick = (themeId: ThemeId) => {
    onThemeChange(themeId)
    setPreviewTheme(null)
    setIsOpen(false)
  }

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger button */}
      <button
        aria-label="Select theme"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Theme"
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '32px', height: '32px',
          borderRadius: '8px',
          border: '1px solid #DDEC90',
          background: 'transparent',
          color: '#7A8A00',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F5F8D0' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      >
        <Palette size={16} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 6px)',
            width: '220px',
            background: '#FFFFFF',
            border: '1px solid #DDEC90',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(26,26,0,0.10), 0 2px 6px rgba(26,26,0,0.06)',
            zIndex: 50,
            overflow: 'hidden',
            padding: '6px',
          }}
        >
          {themes.map((theme) => {
            const isActive = currentTheme === theme.id
            return (
              <button
                key={theme.id}
                onClick={() => handleThemeClick(theme.id)}
                onMouseEnter={() => setPreviewTheme(theme.id)}
                onMouseLeave={() => setPreviewTheme(null)}
                role="menuitem"
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 10px',
                  borderRadius: '7px',
                  border: 'none',
                  background: isActive ? '#F5F8D0' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.12s',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {/* Color swatches */}
                <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                  {[theme.previewColors.background, theme.previewColors.primary, theme.previewColors.accent].map((color, i) => (
                    <div key={i} style={{
                      width: '14px', height: '14px',
                      borderRadius: '3px',
                      border: '1px solid rgba(26,26,0,0.12)',
                      background: color,
                    }} />
                  ))}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#1A1A00' }}>{theme.name}</div>
                  <div style={{ fontSize: '11px', color: '#6A6A20', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {theme.description}
                  </div>
                </div>

                {isActive && (
                  <Check size={14} style={{ color: '#7A8A00', flexShrink: 0 }} />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
