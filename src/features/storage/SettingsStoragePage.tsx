import { useEffect, useState } from 'react'
import { Trash2, Sparkles } from 'lucide-react'
import { GlassCard } from '../../shared/ui/GlassCard'
import { getStorageStats, clearOrphanedCache, deleteAllOfflineContent } from './lib/storageStats'
import { useDownloadsStore } from '../downloads/state/downloadsStore'
import type { StorageStats } from './lib/storageStats'
import './SettingsStoragePage.css'

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function SettingsStoragePage() {
  const [stats, setStats] = useState<StorageStats | null>(null)
  const [busy, setBusy] = useState(false)

  const refresh = () => void getStorageStats().then(setStats)

  useEffect(refresh, [])

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
