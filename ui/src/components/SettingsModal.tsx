import { useState } from 'react'
import { Loader2, AlertCircle, Check, Moon, Sun, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useSettings, useUpdateSettings, useAvailableModels, useAvailableProviders } from '../hooks/useProjects'
import { useTheme, THEMES } from '../hooks/useTheme'
import type { ProviderInfo } from '../lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

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

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { data: settings, isLoading, isError, refetch } = useSettings()
  const { data: modelsData } = useAvailableModels()
  const { data: providersData } = useAvailableProviders()
  const updateSettings = useUpdateSettings()
  const { theme, setTheme, darkMode, toggleDarkMode } = useTheme()

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-lg max-h-[90vh] overflow-y-auto" style={{ background: '#FFFFFF', color: '#1A1A00', border: '1px solid #DDEC90' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: '#1A1A00' }}>
            Settings
            {isSaving && <Loader2 className="animate-spin" size={16} />}
          </DialogTitle>
        </DialogHeader>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin" size={24} />
            <span className="ml-2">Loading settings...</span>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load settings
              <Button
                variant="link"
                onClick={() => refetch()}
                className="ml-2 p-0 h-auto"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Settings Content */}
        {settings && !isLoading && (
          <div className="space-y-6">
            {/* Theme Selection */}
            <div className="space-y-3">
              <Label className="font-medium" style={{ color: '#1A1A00' }}>Theme</Label>
              <div className="grid gap-2">
                {THEMES.map((themeOption) => (
                  <button
                    key={themeOption.id}
                    onClick={() => setTheme(themeOption.id)}
                    className="flex items-center gap-3 p-3 rounded-lg border-2 transition-colors text-left"
                    style={
                      theme === themeOption.id
                        ? { background: '#F5F8D0', borderColor: '#BBCB64' }
                        : { background: '#FFFFFF', borderColor: '#DDEC90' }
                    }
                  >
                    {/* Color swatches */}
                    <div className="flex gap-0.5 shrink-0">
                      <div
                        className="w-5 h-5 rounded-sm border border-border/50"
                        style={{ backgroundColor: themeOption.previewColors.background }}
                      />
                      <div
                        className="w-5 h-5 rounded-sm border border-border/50"
                        style={{ backgroundColor: themeOption.previewColors.primary }}
                      />
                      <div
                        className="w-5 h-5 rounded-sm border border-border/50"
                        style={{ backgroundColor: themeOption.previewColors.accent }}
                      />
                    </div>

                    {/* Theme info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm" style={{ color: '#1A1A00' }}>{themeOption.name}</div>
                      <div className="text-xs" style={{ color: '#6A6A20' }}>
                        {themeOption.description}
                      </div>
                    </div>

                    {/* Checkmark */}
                    {theme === themeOption.id && (
                      <Check size={18} className="shrink-0" style={{ color: '#7A8A00' }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="font-medium" style={{ color: '#1A1A00' }}>
                  Dark Mode
                </Label>
                <p className="text-sm" style={{ color: '#6A6A20' }}>
                  Switch between light and dark appearance
                </p>
              </div>
              <button
                id="dark-mode"
                onClick={toggleDarkMode}
                style={{ background: 'transparent', color: '#7A8A00', border: '1px solid #DDEC90', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500, fontFamily: "'Inter', sans-serif" }}
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                {darkMode ? 'Light' : 'Dark'}
              </button>
            </div>

            <hr style={{ borderColor: '#DDEC90' }} />

            {/* API Provider Selection */}
            <div className="space-y-3">
              <Label className="font-medium" style={{ color: '#1A1A00' }}>API Provider</Label>
              <div className="flex flex-wrap gap-1.5">
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => handleProviderChange(provider.id)}
                    disabled={isSaving}
                    className="py-1.5 px-3 text-sm font-medium rounded-md border transition-colors"
                    style={{
                      ...(currentProvider === provider.id
                        ? { background: '#BBCB64', color: '#1A1A00', borderColor: '#7A8A00' }
                        : { background: '#FFFFFF', color: '#6A6A20', borderColor: '#DDEC90' }),
                      ...(isSaving ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
                    }}
                  >
                    {provider.name.split(' (')[0]}
                  </button>
                ))}
              </div>
              <p className="text-xs" style={{ color: '#6A6A20' }}>
                {PROVIDER_INFO_TEXT[currentProvider] ?? ''}
              </p>

              {/* Auth Token Field */}
              {showAuthField && (
                <div className="space-y-2 pt-1">
                  <Label className="text-sm" style={{ color: '#1A1A00' }}>API Key</Label>
                  {settings.api_has_auth_token && !authTokenInput && (
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#6A6A20' }}>
                      <ShieldCheck size={14} style={{ color: '#7A8A00' }} />
                      <span>Configured</span>
                      <button
                        className="h-auto py-0.5 px-2 text-xs"
                        style={{ background: 'transparent', border: 'none', color: '#7A8A00', cursor: 'pointer', textDecoration: 'underline', fontFamily: "'Inter', sans-serif" }}
                        onClick={() => setAuthTokenInput(' ')}
                      >
                        Change
                      </button>
                    </div>
                  )}
                  {(!settings.api_has_auth_token || authTokenInput) && (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showAuthToken ? 'text' : 'password'}
                          value={authTokenInput.trim()}
                          onChange={(e) => setAuthTokenInput(e.target.value)}
                          placeholder="Enter API key..."
                          className="w-full py-1.5 px-3 pe-9 text-sm border rounded-md"
                          style={{ background: '#FFFFFF', color: '#1A1A00', borderColor: '#DDEC90' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowAuthToken(!showAuthToken)}
                          className="absolute end-2 top-1/2 -translate-y-1/2"
                          style={{ color: '#6A6A20', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        >
                          {showAuthToken ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      <button
                        onClick={handleSaveAuthToken}
                        disabled={!authTokenInput.trim() || isSaving}
                        style={{ background: '#BBCB64', color: '#1A1A00', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, fontFamily: "'Inter', sans-serif", opacity: (!authTokenInput.trim() || isSaving) ? 0.5 : 1 }}
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Custom Base URL Field */}
              {showBaseUrlField && (
                <div className="space-y-2 pt-1">
                  <Label className="text-sm" style={{ color: '#1A1A00' }}>Base URL</Label>
                  {settings.api_base_url && !customBaseUrlInput && (
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#6A6A20' }}>
                      <ShieldCheck size={14} style={{ color: '#7A8A00' }} />
                      <span className="truncate">{settings.api_base_url}</span>
                      <button
                        className="h-auto py-0.5 px-2 text-xs shrink-0"
                        style={{ background: 'transparent', border: 'none', color: '#7A8A00', cursor: 'pointer', textDecoration: 'underline', fontFamily: "'Inter', sans-serif" }}
                        onClick={() => setCustomBaseUrlInput(settings.api_base_url || '')}
                      >
                        Change
                      </button>
                    </div>
                  )}
                  {(!settings.api_base_url || customBaseUrlInput) && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customBaseUrlInput}
                        onChange={(e) => setCustomBaseUrlInput(e.target.value)}
                        placeholder={currentProvider === 'azure' ? 'https://your-resource.services.ai.azure.com/anthropic' : 'https://api.example.com/v1'}
                        className="flex-1 py-1.5 px-3 text-sm border rounded-md"
                        style={{ background: '#FFFFFF', color: '#1A1A00', borderColor: '#DDEC90' }}
                      />
                      <button
                        onClick={handleSaveCustomBaseUrl}
                        disabled={!customBaseUrlInput.trim() || isSaving}
                        style={{ background: '#BBCB64', color: '#1A1A00', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, fontFamily: "'Inter', sans-serif", opacity: (!customBaseUrlInput.trim() || isSaving) ? 0.5 : 1 }}
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <Label className="font-medium" style={{ color: '#1A1A00' }}>Model</Label>
              {models.length > 0 && (
                <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #DDEC90' }}>
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => handleModelChange(model.id)}
                      disabled={isSaving}
                      className="flex-1 py-2 px-3 text-sm font-medium transition-colors"
                      style={{
                        ...((settings.api_model ?? settings.model) === model.id
                          ? { background: '#BBCB64', color: '#1A1A00' }
                          : { background: '#FFFFFF', color: '#6A6A20' }),
                        ...(isSaving ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
                      }}
                    >
                      <span className="block">{model.name}</span>
                      <span className="block text-xs opacity-60">{model.id}</span>
                    </button>
                  ))}
                </div>
              )}
              {/* Custom model input for Ollama/Custom */}
              {showCustomModelInput && (
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={customModelInput}
                    onChange={(e) => setCustomModelInput(e.target.value)}
                    placeholder="Custom model name..."
                    className="flex-1 py-1.5 px-3 text-sm border rounded-md"
                    style={{ background: '#FFFFFF', color: '#1A1A00', borderColor: '#DDEC90' }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveCustomModel()}
                  />
                  <button
                    onClick={handleSaveCustomModel}
                    disabled={!customModelInput.trim() || isSaving}
                    style={{ background: '#BBCB64', color: '#1A1A00', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, fontFamily: "'Inter', sans-serif", opacity: (!customModelInput.trim() || isSaving) ? 0.5 : 1 }}
                  >
                    Set
                  </button>
                </div>
              )}
            </div>

            <hr style={{ borderColor: '#DDEC90' }} />

            {/* YOLO Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="yolo-mode" className="font-medium" style={{ color: '#1A1A00' }}>
                  YOLO Mode
                </Label>
                <p className="text-sm" style={{ color: '#6A6A20' }}>
                  Skip testing for rapid prototyping
                </p>
              </div>
              <Switch
                id="yolo-mode"
                checked={settings.yolo_mode}
                onCheckedChange={handleYoloToggle}
                disabled={isSaving}
              />
            </div>

            {/* Headless Browser Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="playwright-headless" className="font-medium" style={{ color: '#1A1A00' }}>
                  Headless Browser
                </Label>
                <p className="text-sm" style={{ color: '#6A6A20' }}>
                  Run browser without visible window (saves CPU)
                </p>
              </div>
              <Switch
                id="playwright-headless"
                checked={settings.playwright_headless}
                onCheckedChange={() => updateSettings.mutate({ playwright_headless: !settings.playwright_headless })}
                disabled={isSaving}
              />
            </div>

            {/* Regression Agents */}
            <div className="space-y-2">
              <Label className="font-medium" style={{ color: '#1A1A00' }}>Regression Agents</Label>
              <p className="text-sm" style={{ color: '#6A6A20' }}>
                Number of regression testing agents (0 = disabled)
              </p>
              <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #DDEC90' }}>
                {[0, 1, 2, 3].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => handleTestingRatioChange(ratio)}
                    disabled={isSaving}
                    className="flex-1 py-2 px-3 text-sm font-medium transition-colors"
                    style={{
                      ...(settings.testing_agent_ratio === ratio
                        ? { background: '#BBCB64', color: '#1A1A00' }
                        : { background: '#FFFFFF', color: '#6A6A20' }),
                      ...(isSaving ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
                    }}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Features per Agent */}
            <div className="space-y-2">
              <Label className="font-medium" style={{ color: '#1A1A00' }}>Features per Agent</Label>
              <p className="text-sm" style={{ color: '#6A6A20' }}>
                Number of features assigned to each coding agent
              </p>
              <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #DDEC90' }}>
                {[1, 2, 3].map((size) => (
                  <button
                    key={size}
                    onClick={() => handleBatchSizeChange(size)}
                    disabled={isSaving}
                    className="flex-1 py-2 px-3 text-sm font-medium transition-colors"
                    style={{
                      ...((settings.batch_size ?? 1) === size
                        ? { background: '#BBCB64', color: '#1A1A00' }
                        : { background: '#FFFFFF', color: '#6A6A20' }),
                      ...(isSaving ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Update Error */}
            {updateSettings.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  Failed to save settings. Please try again.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
