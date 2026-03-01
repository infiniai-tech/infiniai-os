import { useEffect, useState } from 'react'
import { Loader2, Save, CheckCircle2, FileText } from 'lucide-react'
import { readSpecFile, writeSpecFile, approveSpecFile } from '../lib/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface SpecEditorModalProps {
  projectName: string
  filename: string
  isOpen: boolean
  onClose: () => void
  onApproved: () => void
}

export function SpecEditorModal({
  projectName,
  filename,
  isOpen,
  onClose,
  onApproved,
}: SpecEditorModalProps) {
  const [content, setContent] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [status, setStatus] = useState<string>('pending')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [approving, setApproving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (!isOpen || !filename) return

    setLoading(true)
    setError(null)
    setSaveSuccess(false)

    readSpecFile(projectName, filename)
      .then(data => {
        setContent(data.content)
        setOriginalContent(data.content)
        setStatus(data.status)
      })
      .catch(err => setError(err.message || 'Failed to load file'))
      .finally(() => setLoading(false))
  }, [isOpen, filename, projectName])

  const hasChanges = content !== originalContent

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaveSuccess(false)
    try {
      const result = await writeSpecFile(projectName, filename, content)
      setOriginalContent(content)
      setStatus(result.status)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async () => {
    if (hasChanges) {
      await handleSave()
    }
    setApproving(true)
    setError(null)
    try {
      const result = await approveSpecFile(projectName, filename)
      setStatus(result.status)
      onApproved()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to approve')
    } finally {
      setApproving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-primary" />
              <DialogTitle className="font-display">{filename}</DialogTitle>
            </div>
            <Badge variant={status === 'approved' ? 'default' : 'secondary'}>
              {status === 'approved' ? 'Approved' : 'Pending Review'}
            </Badge>
          </div>
        </DialogHeader>

        <Separator />

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden p-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full min-h-[50vh] resize-none rounded-lg border border-border bg-muted/30 p-4 font-mono text-sm leading-relaxed text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              spellCheck={false}
            />
          </div>
        )}

        {error && (
          <div className="px-6">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <Separator />

        <DialogFooter className="p-4 flex-row justify-between sm:justify-between">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-sm text-primary flex items-center gap-1">
                <CheckCircle2 size={14} /> Saved
              </span>
            )}
            {hasChanges && !saveSuccess && (
              <span className="text-sm text-muted-foreground">Unsaved changes</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={!hasChanges || saving || loading}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approving || loading || status === 'approved'}
            >
              {approving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              {status === 'approved' ? 'Approved' : 'Approve'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
