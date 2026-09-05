import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Trash2, Sparkles, Download, Upload } from 'lucide-react'
import { GlassCard } from '../../shared/ui/GlassCard'
import { getStorageStats, clearOrphanedCache, deleteAllOfflineContent } from './lib/storageStats'
import { useDownloadsStore } from '../downloads/state/downloadsStore'
import { exportBackup, restoreBackup, isNoorBackup } from '../../shared/db/backup'
import type { StorageStats } from './lib/storageStats'
import './SettingsStoragePage.css'

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function SettingsStoragePage() {
  const [stats, setStats] = useState<StorageStats | null>(null)
  const [busy, setBusy] = useState(false)
  const [backupMessage, setBackupMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const refresh = () => void getStorageStats().then(setStats)

  useEffect(refresh, [])

  const handleDownloadBackup = async () => {
    setBusy(true)
    setBackupMessage(null)
    try {
      const backup = await exportBackup()
      const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `noor-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setBackupMessage({ kind: 'success', text: 'Backup downloaded.' })
    } catch (err) {
      setBackupMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Could not create backup.' })
    } finally {
      setBusy(false)
    }
  }

  const handleRestoreFileSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setBackupMessage(null)

    let parsed: unknown
    try {
      parsed = JSON.parse(await file.text())
    } catch {
      setBackupMessage({ kind: 'error', text: 'Could not read that file — is it a valid Noor backup?' })
      return
    }
    if (!isNoorBackup(parsed)) {
      setBackupMessage({ kind: 'error', text: 'This file is not a Noor backup.' })
      return
    }

    const confirmed = window.confirm(
      'Restoring will replace your current progress, streaks, bookmarks, and settings with the contents of this backup. This cannot be undone. Continue?'
    )
    if (!confirmed) return

    setBusy(true)
    try {
      await restoreBackup(parsed)
      // Every store on screen is read via zustand stores and hooks that
      // hydrated at mount from the (now-replaced) IndexedDB data — a full
      // reload is the simplest way to get every one of them consistent
      // with the restored data, rather than reaching into each store.
      window.location.reload()
    } catch (err) {
      // The file itself was already validated above — a failure here is a
      // write-side problem (e.g. storage quota), not a bad file, so it gets
      // its own message rather than telling the user their backup is invalid.
      setBackupMessage({
        kind: 'error',
        text: err instanceof Error ? `Restore failed: ${err.message}` : 'Restore failed. Please try again.',
      })
      setBusy(false)
    }
  }

  const handleClearTemp = async () => {
    setBusy(true)
    const removed = await clearOrphanedCache()
    refresh()
    setBusy(false)
    return removed
  }

  const handleDeleteAll = async () => {
    setBusy(true)
    await deleteAllOfflineContent()
    await useDownloadsStore.getState().hydrate()
    refresh()
    setBusy(false)
  }

  return (
    <section className="settings-storage-page">
      <h1>Storage Manager</h1>

      {stats && (
        <GlassCard glow="teal" className="settings-storage-page__summary">
          <div className="settings-storage-page__row">
            <span>Downloaded Quran audio</span>
            <strong>{formatBytes(stats.audioBytes)}</strong>
          </div>
          <div className="settings-storage-page__row">
            <span>Downloads</span>
            <strong>{stats.downloadCount}</strong>
          </div>
          {stats.usageBytes !== null && stats.quotaBytes !== null && (
            <div className="settings-storage-page__row">
              <span>Total device storage used</span>
              <strong>
                {formatBytes(stats.usageBytes)} / {formatBytes(stats.quotaBytes)}
              </strong>
            </div>
          )}
        </GlassCard>
      )}

      <GlassCard as="section" className="settings-storage-page__section">
        <h2>Backup &amp; Restore</h2>
        <p className="settings-storage-page__note">
          Your progress, streaks, bookmarks, favorites, and settings live only on this device. Download a backup
          before reinstalling the app or switching devices — downloaded audio isn't included and can be
          re-downloaded afterward.
        </p>

        {backupMessage && (
          <p
            className={`settings-storage-page__backup-message settings-storage-page__backup-message--${backupMessage.kind}`}
            role="status"
          >
            {backupMessage.text}
          </p>
        )}

        <button type="button" className="settings-storage-page__action" disabled={busy} onClick={() => void handleDownloadBackup()}>
          <Download size={16} aria-hidden="true" /> Download backup
        </button>
        <button
          type="button"
          className="settings-storage-page__action"
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={16} aria-hidden="true" /> Restore from backup
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="settings-storage-page__file-input"
          onChange={(e) => void handleRestoreFileSelected(e)}
        />
      </GlassCard>

      <p className="settings-storage-page__note">
        Your Quran progress, bookmarks, and learning progress are never affected by the actions below — they're
        stored separately and only downloaded audio is removed.
      </p>

      <button type="button" className="settings-storage-page__action" disabled={busy} onClick={() => void handleClearTemp()}>
        <Sparkles size={16} aria-hidden="true" /> Clear temporary cache
      </button>
      <button
        type="button"
        className="settings-storage-page__action settings-storage-page__action--danger"
        disabled={busy}
        onClick={() => void handleDeleteAll()}
      >
        <Trash2 size={16} aria-hidden="true" /> Delete all offline audio
      </button>
    </section>
  )
}
