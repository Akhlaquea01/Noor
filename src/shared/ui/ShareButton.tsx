import { useEffect, useRef, useState } from 'react'
import { Share2, Check, X } from 'lucide-react'
import './ShareButton.css'

interface ShareButtonProps {
  title: string
  text: string
  url?: string
  label?: string
  /** Icon-only, for dense action rows (e.g. alongside Listen/Bookmark) — the label still applies via aria-label. */
  iconOnly?: boolean
}

// Prefers the native share sheet (native/Android/iOS PWA install, most
// mobile browsers); falls back to copying share text to the clipboard for
// desktop browsers without navigator.share (e.g. Firefox, older Chromium).
export function ShareButton({ title, text, url, label = 'Share', iconOnly = false }: ShareButtonProps) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const showStatus = (next: 'copied' | 'error') => {
    setStatus(next)
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setStatus('idle'), 2000)
  }

  const copyToClipboard = async () => {
    const clipboardText = url ? `${text}\n\n${url}` : text
    try {
      await navigator.clipboard.writeText(clipboardText)
      showStatus('copied')
    } catch (err) {
      console.error('Copy to clipboard failed', err)
      showStatus('error')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
      } catch (err) {
        // AbortError just means the user dismissed the share sheet — not a
        // failure worth surfacing or falling back for.
        if (err instanceof Error && err.name === 'AbortError') return
        console.error('Share failed', err)
        // Anything else (permission denied, no share targets configured,
        // etc.) means the share sheet never went through — fall back to
        // clipboard rather than leaving the tap with no visible effect.
        await copyToClipboard()
      }
      return
    }

    await copyToClipboard()
  }

  const statusLabel = status === 'copied' ? 'Copied' : status === 'error' ? "Couldn't share" : label
  const StatusIcon = status === 'copied' ? Check : status === 'error' ? X : Share2

  return (
    <button
      type="button"
      className={`share-button${iconOnly ? ' share-button--icon-only' : ''}${status === 'error' ? ' share-button--error' : ''}`}
      onClick={() => void handleShare()}
      aria-label={iconOnly ? statusLabel : undefined}
    >
      <StatusIcon size={16} aria-hidden="true" />
      {!iconOnly && statusLabel}
    </button>
  )
}
