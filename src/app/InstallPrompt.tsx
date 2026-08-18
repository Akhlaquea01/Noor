import { Download, X, Share } from 'lucide-react'
import { useInstallPrompt } from '../shared/hooks/useInstallPrompt'
import { detectCapabilities } from '../features/notifications/lib/capabilities'
import './InstallPrompt.css'

export function InstallPrompt() {
  const { canInstall, promptInstall, dismissed, dismiss } = useInstallPrompt()
  const { platformHint, isStandalonePwa } = detectCapabilities()

  if (dismissed || isStandalonePwa) return null

  const showIosInstructions = !canInstall && platformHint === 'ios-safari'
  if (!canInstall && !showIosInstructions) return null

  return (
    <div className="install-prompt" role="dialog" aria-label="Install Noor">
      <button type="button" className="install-prompt__dismiss" onClick={dismiss} aria-label="Dismiss install prompt">
        <X size={16} aria-hidden="true" />
      </button>
      <strong>Install Noor</strong>
      <p>Keep your Islamic resources, Quran progress, and daily tools available from your home screen.</p>
      {canInstall && (
        <button type="button" className="install-prompt__action" onClick={() => void promptInstall()}>
          <Download size={16} aria-hidden="true" /> Install
        </button>
      )}
      {showIosInstructions && (
        <p className="install-prompt__ios-hint">
          Tap <Share size={14} aria-hidden="true" className="install-prompt__share-icon" /> then "Add to Home Screen".
        </p>
      )}
    </div>
  )
}
