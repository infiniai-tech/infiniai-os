import { useState } from 'react'
import { Loader2, AlertCircle, Check, Moon, Sun, Eye, EyeOff, ShieldCheck, X } from 'lucide-react'
import { useSettings, useUpdateSettings, useAvailableModels, useAvailableProviders } from '../hooks/useProjects'
import { useTheme, THEMES } from '../hooks/useTheme'
import type { ProviderInfo } from '../lib/types'
import { motion, AnimatePresence } from 'framer-motion'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const PROVIDER_INFO_TEXT: Record<string, string> = {
  claude: 'Default provider. Uses your Claude CLI credentials.',
  kimi: 'Get an API key at kimi.com',
  glm: 'Get an API key at open.bigmodel.cn',
  ollama: 'Run models locally. Install from ollama.com',
  custom: 'Connect to any OpenAI-compatible API endpoint.',
}

type SettingsTab = 'appearance' | 'provider' | 'agent'

const TABS: { id: SettingsTab; label: string }[] = [
  { id: 'appearance', label: 'Appearance' },
  { id: 'provider', label: 'Provider' },
  { id: 'agent', label: 'Agent' },
]

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { data: settings, isLoading, isError, refetch } = useSettings()
  const { data: modelsData } = useAvailableModels()
  const { data: providersData } = useAvailableProviders()
  const updateSettings = useUpdateSettings()
  const { theme, setTheme, darkMode, toggleDarkMode } = useTheme()

  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance')
  const [showAuthToken, setShowAuthToken] = useState(false)
  const [authTokenInput, setAuthTokenInput] = useState('')
  const [customModelInput, setCustomModelInput] = useState('')
  const [customBaseUrlInput, setCustomBaseUrlInput] = useState('')

  const handleYoloToggle = () => {
    if (settings && !updateSettings.isPending) {
      updateSettings.mutate({ yolo_mode: !settings.yolo_mode })
    }
  }

  const handleModelChange = (modelId: string) => {
    if (!updateSettings.isPending) {
      updateSettings.mutate({ api_model: modelId })
    }
  }

  const handleTestingRatioChange = (ratio: number) => {
    if (!updateSettings.isPending) {
      updateSettings.mutate({ testing_agent_ratio: ratio })
    }
  }

  const handleBatchSizeChange = (size: number) => {
    if (!updateSettings.isPending) {
      updateSettings.mutate({ batch_size: size })
    }
  }

  const handleProviderChange = (providerId: string) => {
    if (!updateSettings.isPending) {
      updateSettings.mutate({ api_provider: providerId })
      // Reset local state
      setAuthTokenInput('')
      setShowAuthToken(false)
      setCustomModelInput('')
      setCustomBaseUrlInput('')
    }
  }

  const handleSaveAuthToken = () => {
    if (authTokenInput.trim() && !updateSettings.isPending) {
      updateSettings.mutate({ api_auth_token: authTokenInput.trim() })
      setAuthTokenInput('')
      setShowAuthToken(false)
    }
  }

  const handleSaveCustomBaseUrl = () => {
    if (customBaseUrlInput.trim() && !updateSettings.isPending) {
      updateSettings.mutate({ api_base_url: customBaseUrlInput.trim() })
      setCustomBaseUrlInput('')
    }
  }

  const handleSaveCustomModel = () => {
    if (customModelInput.trim() && !updateSettings.isPending) {
      updateSettings.mutate({ api_model: customModelInput.trim() })
      setCustomModelInput('')
    }
  }

  const providers = providersData?.providers ?? []
  const models = modelsData?.models ?? []
  const isSaving = updateSettings.isPending
  const currentProvider = settings?.api_provider ?? 'claude'
  const currentProviderInfo: ProviderInfo | undefined = providers.find(p => p.id === currentProvider)
  const isAlternativeProvider = currentProvider !== 'claude'
  const showAuthField = isAlternativeProvider && currentProviderInfo?.requires_auth
  const showBaseUrlField = currentProvider === 'custom' || currentProvider === 'azure'
  const showCustomModelInput = currentProvider === 'custom' || currentProvider === 'ollama'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(26,26,0,0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #DDEC90',
              boxShadow: '0 20px 60px rgba(26,26,0,0.15), 0 8px 24px rgba(26,26,0,0.08)',
              width: '520px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: "'Inter', sans-serif",
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 28px 0 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{
                  fontFamily: "'Geist', 'Inter', sans-serif",
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#1A1A00',
                  margin: 0,
                }}>
                  Settings
                </h2>
                {isSaving && <Loader2 size={16} style={{ color: '#7A8A00', animation: 'spin 1s linear infinite' }} />}
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px',
                  cursor: 'pointer',
                  color: '#6A6A20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F8D0' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0', padding: '16px 28px 0 28px', borderBottom: '1px solid #DDEC90' }}>
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid #BBCB64' : '2px solid transparent',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: activeTab === tab.id ? 600 : 500,
                    color: activeTab === tab.id ? '#1A1A00' : '#6A6A20',
                    fontFamily: "'Inter', sans-serif",
                    transition: 'color 0.15s, border-color 0.15s',
                    marginBottom: '-1px',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content area - scrollable */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px 28px 28px' }}>
              {/* Loading State */}
              {isLoading && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: '8px', color: '#6A6A20' }}>
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '14px' }}>Loading settings...</span>
                </div>
              )}

              {/* Error State */}
              {isError && (
                <div style={{
                  background: '#FFF0DC',
                  border: '1px solid #F0C880',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <AlertCircle size={16} style={{ color: '#F79A19', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: '#1A1A00', flex: 1 }}>Failed to load settings</span>
                  <button
                    onClick={() => refetch()}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#7A8A00',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                      textDecoration: 'underline',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Settings Content */}
              {settings && !isLoading && (
                <>
                  {/* === APPEARANCE TAB === */}
                  {activeTab === 'appearance' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {/* Theme Selection */}
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1A1A00', marginBottom: '10px' }}>Theme</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {THEMES.map((themeOption) => (
                            <button
                              key={themeOption.id}
                              onClick={() => setTheme(themeOption.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px',
                                borderRadius: '8px',
                                border: theme === themeOption.id ? '2px solid #BBCB64' : '1px solid #DDEC90',
                                background: theme === themeOption.id ? '#F5F8D0' : '#FFFFFF',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontFamily: "'Inter', sans-serif",
                                transition: 'background 0.15s, border-color 0.15s',
                              }}
                            >
                              {/* Color swatches */}
                              <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                                <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: '1px solid #DDEC90', backgroundColor: themeOption.previewColors.background }} />
                                <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: '1px solid #DDEC90', backgroundColor: themeOption.previewColors.primary }} />
                                <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: '1px solid #DDEC90', backgroundColor: themeOption.previewColors.accent }} />
                              </div>
                              {/* Theme info */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A00' }}>{themeOption.name}</div>
                                <div style={{ fontSize: '12px', color: '#6A6A20' }}>{themeOption.description}</div>
                              </div>
                              {/* Checkmark */}
                              {theme === themeOption.id && (
                                <Check size={18} style={{ color: '#7A8A00', flexShrink: 0 }} />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Dark Mode Toggle */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1A1A00' }}>Dark Mode</label>
                          <p style={{ fontSize: '12px', color: '#6A6A20', margin: '2px 0 0 0' }}>Switch between light and dark appearance</p>
                        </div>
                        <button
                          onClick={toggleDarkMode}
                          style={{
                            background: 'transparent',
                            color: '#7A8A00',
                            border: '1px solid #DDEC90',
                            borderRadius: '8px',
                            padding: '6px 14px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '13px',
                            fontWeight: 500,
                            fontFamily: "'Inter', sans-serif",
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F8D0' }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                        >
                          {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                          {darkMode ? 'Light' : 'Dark'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* === PROVIDER TAB === */}
                  {activeTab === 'provider' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {/* API Provider Selection */}
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1A1A00', marginBottom: '10px' }}>API Provider</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {providers.map((provider) => (
                            <button
                              key={provider.id}
                              onClick={() => handleProviderChange(provider.id)}
                              disabled={isSaving}
                              style={{
                                padding: '6px 14px',
                                fontSize: '13px',
                                fontWeight: 500,
                                borderRadius: '8px',
                                border: currentProvider === provider.id ? '1px solid #7A8A00' : '1px solid #DDEC90',
                                background: currentProvider === provider.id ? '#BBCB64' : '#FFFFFF',
                                color: currentProvider === provider.id ? '#1A1A00' : '#6A6A20',
                                cursor: isSaving ? 'not-allowed' : 'pointer',
                                opacity: isSaving ? 0.5 : 1,
                                fontFamily: "'Inter', sans-serif",
                                transition: 'background 0.15s, border-color 0.15s',
                              }}
                            >
                              {provider.name.split(' (')[0]}
                            </button>
                          ))}
                        </div>
                        <p style={{ fontSize: '12px', color: '#6A6A20', marginTop: '8px' }}>
                          {PROVIDER_INFO_TEXT[currentProvider] ?? ''}
                        </p>

                        {/* Auth Token Field */}
                        {showAuthField && (
                          <div style={{ marginTop: '12px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#1A1A00', marginBottom: '6px' }}>API Key</label>
                            {settings.api_has_auth_token && !authTokenInput && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6A6A20' }}>
                                <ShieldCheck size={14} style={{ color: '#7A8A00' }} />
                                <span>Configured</span>
                                <button
                                  onClick={() => setAuthTokenInput(' ')}
                                  style={{ background: 'transparent', border: 'none', color: '#7A8A00', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px', fontFamily: "'Inter', sans-serif" }}
                                >
                                  Change
                                </button>
                              </div>
                            )}
                            {(!settings.api_has_auth_token || authTokenInput) && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                  <input
                                    type={showAuthToken ? 'text' : 'password'}
                                    value={authTokenInput.trim()}
                                    onChange={(e) => setAuthTokenInput(e.target.value)}
                                    placeholder="Enter API key..."
                                    style={{
                                      width: '100%',
                                      padding: '8px 36px 8px 12px',
                                      fontSize: '13px',
                                      border: '1px solid #DDEC90',
                                      borderRadius: '8px',
                                      background: '#FFFFFF',
                                      color: '#1A1A00',
                                      outline: 'none',
                                      fontFamily: "'Inter', sans-serif",
                                      boxSizing: 'border-box',
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
                                    background: '#BBCB64',
                                    color: '#1A1A00',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 16px',
                                    cursor: (!authTokenInput.trim() || isSaving) ? 'not-allowed' : 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    fontFamily: "'Inter', sans-serif",
                                    opacity: (!authTokenInput.trim() || isSaving) ? 0.5 : 1,
                                    transition: 'opacity 0.15s',
                                  }}
                                >
                                  Save
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Custom Base URL Field */}
                        {showBaseUrlField && (
                          <div style={{ marginTop: '12px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#1A1A00', marginBottom: '6px' }}>Base URL</label>
                            {settings.api_base_url && !customBaseUrlInput && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6A6A20' }}>
                                <ShieldCheck size={14} style={{ color: '#7A8A00' }} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{settings.api_base_url}</span>
                                <button
                                  onClick={() => setCustomBaseUrlInput(settings.api_base_url || '')}
                                  style={{ background: 'transparent', border: 'none', color: '#7A8A00', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px', fontFamily: "'Inter', sans-serif", flexShrink: 0 }}
                                >
                                  Change
                                </button>
                              </div>
                            )}
                            {(!settings.api_base_url || customBaseUrlInput) && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                  type="text"
                                  value={customBaseUrlInput}
                                  onChange={(e) => setCustomBaseUrlInput(e.target.value)}
                                  placeholder={currentProvider === 'azure' ? 'https://your-resource.services.ai.azure.com/anthropic' : 'https://api.example.com/v1'}
                                  style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    fontSize: '13px',
                                    border: '1px solid #DDEC90',
                                    borderRadius: '8px',
                                    background: '#FFFFFF',
                                    color: '#1A1A00',
                                    outline: 'none',
                                    fontFamily: "'Inter', sans-serif",
                                  }}
                                  onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(187,203,100,0.12)' }}
                                  onBlur={(e) => { e.currentTarget.style.boxShadow = 'none' }}
                                />
                                <button
                                  onClick={handleSaveCustomBaseUrl}
                                  disabled={!customBaseUrlInput.trim() || isSaving}
                                  style={{
                                    background: '#BBCB64',
                                    color: '#1A1A00',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 16px',
                                    cursor: (!customBaseUrlInput.trim() || isSaving) ? 'not-allowed' : 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    fontFamily: "'Inter', sans-serif",
                                    opacity: (!customBaseUrlInput.trim() || isSaving) ? 0.5 : 1,
                                    transition: 'opacity 0.15s',
                                  }}
                                >
                                  Save
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Model Selection */}
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1A1A00', marginBottom: '10px' }}>Model</label>
                        {models.length > 0 && (
                          <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid #DDEC90' }}>
                            {models.map((model) => (
                              <button
                                key={model.id}
                                onClick={() => handleModelChange(model.id)}
                                disabled={isSaving}
                                style={{
                                  flex: 1,
                                  padding: '10px 12px',
                                  fontSize: '13px',
                                  fontWeight: 500,
                                  background: (settings.api_model ?? settings.model) === model.id ? '#BBCB64' : '#FFFFFF',
                                  color: (settings.api_model ?? settings.model) === model.id ? '#1A1A00' : '#6A6A20',
                                  border: 'none',
                                  cursor: isSaving ? 'not-allowed' : 'pointer',
                                  opacity: isSaving ? 0.5 : 1,
                                  fontFamily: "'Inter', sans-serif",
                                  transition: 'background 0.15s',
                                }}
                              >
                                <span style={{ display: 'block' }}>{model.name}</span>
                                <span style={{ display: 'block', fontSize: '11px', opacity: 0.6 }}>{model.id}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        {/* Custom model input for Ollama/Custom */}
                        {showCustomModelInput && (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <input
                              type="text"
                              value={customModelInput}
                              onChange={(e) => setCustomModelInput(e.target.value)}
                              placeholder="Custom model name..."
                              style={{
                                flex: 1,
                                padding: '8px 12px',
                                fontSize: '13px',
                                border: '1px solid #DDEC90',
                                borderRadius: '8px',
                                background: '#FFFFFF',
                                color: '#1A1A00',
                                outline: 'none',
                                fontFamily: "'Inter', sans-serif",
                              }}
                              onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(187,203,100,0.12)' }}
                              onBlur={(e) => { e.currentTarget.style.boxShadow = 'none' }}
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveCustomModel()}
                            />
                            <button
                              onClick={handleSaveCustomModel}
                              disabled={!customModelInput.trim() || isSaving}
                              style={{
                                background: '#BBCB64',
                                color: '#1A1A00',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                cursor: (!customModelInput.trim() || isSaving) ? 'not-allowed' : 'pointer',
                                fontSize: '13px',
                                fontWeight: 700,
                                fontFamily: "'Inter', sans-serif",
                                opacity: (!customModelInput.trim() || isSaving) ? 0.5 : 1,
                                transition: 'opacity 0.15s',
                              }}
                            >
                              Set
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* === AGENT TAB === */}
                  {activeTab === 'agent' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {/* YOLO Mode Toggle */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1A1A00' }}>YOLO Mode</label>
                          <p style={{ fontSize: '12px', color: '#6A6A20', margin: '2px 0 0 0' }}>Skip testing for rapid prototyping</p>
                        </div>
                        <button
                          onClick={handleYoloToggle}
                          disabled={isSaving}
                          style={{
                            width: '44px',
                            height: '24px',
                            borderRadius: '9999px',
                            border: 'none',
                            background: settings.yolo_mode ? '#BBCB64' : '#DDEC90',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            position: 'relative',
                            transition: 'background 0.2s',
                            opacity: isSaving ? 0.5 : 1,
                          }}
                        >
                          <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '9999px',
                            background: '#FFFFFF',
                            boxShadow: '0 1px 3px rgba(26,26,0,0.15)',
                            position: 'absolute',
                            top: '3px',
                            left: settings.yolo_mode ? '23px' : '3px',
                            transition: 'left 0.2s',
                          }} />
                        </button>
                      </div>

                      {/* Headless Browser Toggle */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1A1A00' }}>Headless Browser</label>
                          <p style={{ fontSize: '12px', color: '#6A6A20', margin: '2px 0 0 0' }}>Run browser without visible window (saves CPU)</p>
                        </div>
                        <button
                          onClick={() => updateSettings.mutate({ playwright_headless: !settings.playwright_headless })}
                          disabled={isSaving}
                          style={{
                            width: '44px',
                            height: '24px',
                            borderRadius: '9999px',
                            border: 'none',
                            background: settings.playwright_headless ? '#BBCB64' : '#DDEC90',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            position: 'relative',
                            transition: 'background 0.2s',
                            opacity: isSaving ? 0.5 : 1,
                          }}
                        >
                          <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '9999px',
                            background: '#FFFFFF',
                            boxShadow: '0 1px 3px rgba(26,26,0,0.15)',
                            position: 'absolute',
                            top: '3px',
                            left: settings.playwright_headless ? '23px' : '3px',
                            transition: 'left 0.2s',
                          }} />
                        </button>
                      </div>

                      <hr style={{ border: 'none', borderTop: '1px solid #DDEC90', margin: 0 }} />

                      {/* Regression Agents */}
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1A1A00' }}>Regression Agents</label>
                        <p style={{ fontSize: '12px', color: '#6A6A20', margin: '2px 0 10px 0' }}>Number of regression testing agents (0 = disabled)</p>
                        <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid #DDEC90' }}>
                          {[0, 1, 2, 3].map((ratio) => (
                            <button
                              key={ratio}
                              onClick={() => handleTestingRatioChange(ratio)}
                              disabled={isSaving}
                              style={{
                                flex: 1,
                                padding: '10px 12px',
                                fontSize: '13px',
                                fontWeight: 500,
                                background: settings.testing_agent_ratio === ratio ? '#BBCB64' : '#FFFFFF',
                                color: settings.testing_agent_ratio === ratio ? '#1A1A00' : '#6A6A20',
                                border: 'none',
                                cursor: isSaving ? 'not-allowed' : 'pointer',
                                opacity: isSaving ? 0.5 : 1,
                                fontFamily: "'Inter', sans-serif",
                                transition: 'background 0.15s',
                              }}
                            >
                              {ratio}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Features per Agent */}
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1A1A00' }}>Features per Agent</label>
                        <p style={{ fontSize: '12px', color: '#6A6A20', margin: '2px 0 10px 0' }}>Number of features assigned to each coding agent</p>
                        <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid #DDEC90' }}>
                          {[1, 2, 3].map((size) => (
                            <button
                              key={size}
                              onClick={() => handleBatchSizeChange(size)}
                              disabled={isSaving}
                              style={{
                                flex: 1,
                                padding: '10px 12px',
                                fontSize: '13px',
                                fontWeight: 500,
                                background: (settings.batch_size ?? 1) === size ? '#BBCB64' : '#FFFFFF',
                                color: (settings.batch_size ?? 1) === size ? '#1A1A00' : '#6A6A20',
                                border: 'none',
                                cursor: isSaving ? 'not-allowed' : 'pointer',
                                opacity: isSaving ? 0.5 : 1,
                                fontFamily: "'Inter', sans-serif",
                                transition: 'background 0.15s',
                              }}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Update Error */}
                  {updateSettings.isError && (
                    <div style={{
                      background: '#FFF0DC',
                      border: '1px solid #F0C880',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      marginTop: '20px',
                      fontSize: '13px',
                      color: '#1A1A00',
                    }}>
                      Failed to save settings. Please try again.
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
