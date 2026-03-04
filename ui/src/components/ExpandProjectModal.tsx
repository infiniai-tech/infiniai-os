/**
 * Expand Project Modal
 *
 * Full-screen modal wrapper for the ExpandProjectChat component.
 * Allows users to add multiple features to an existing project via AI.
 */

import { ExpandProjectChat } from './ExpandProjectChat'

interface ExpandProjectModalProps {
  isOpen: boolean
  projectName: string
  onClose: () => void
  onFeaturesAdded: () => void
}

export function ExpandProjectModal({
  isOpen,
  projectName,
  onClose,
  onFeaturesAdded,
}: ExpandProjectModalProps) {
  if (!isOpen) return null

  const handleComplete = (featuresAdded: number) => {
    if (featuresAdded > 0) onFeaturesAdded()
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: '#FAFAF2',
      fontFamily: "'Inter', sans-serif",
    }}>
      <ExpandProjectChat
        projectName={projectName}
        onComplete={handleComplete}
        onCancel={onClose}
      />
    </div>
  )
}
