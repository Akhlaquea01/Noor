import { useEffect, useRef, useState } from 'react'
import { Download, Trash2, Play, Loader2 } from 'lucide-react'
import { GlassCard } from '../../shared/ui/GlassCard'
import { Skeleton } from '../../shared/ui/Skeleton'
import { getQuranMeta } from '../quran/api/quranContent'
import { useDownloadsStore } from './state/downloadsStore'
import { getCachedAudioUrl } from './lib/downloadEngine'
import { RECITER_LABEL } from './lib/audioSource'
import type { QuranMeta } from '../quran/types'
import './DownloadsPage.css'

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DownloadsPage() {
  const [meta, setMeta] = useState<QuranMeta | null>(null)
  const [playingUrl, setPlayingUrl] = useState<string | null>(null)
  const playingUrlRef = useRef<string | null>(null)
  const downloads = useDownloadsStore((s) => s.downloads)
  const hydrate = useDownloadsStore((s) => s.hydrate)
  const startDownload = useDownloadsStore((s) => s.startDownload)
  const removeDownload = useDownloadsStore((s) => s.removeDownload)

  useEffect(() => {
    void getQuranMeta().then(setMeta)
    void hydrate()
  }, [hydrate])

  // Object URLs created by getCachedAudioUrl() must be revoked or they leak
  // for the rest of the page's lifetime — every play() call here used to
  // create a new one without ever releasing the previous surah's.
  useEffect(() => {
    return () => {
      if (playingUrlRef.current) URL.revokeObjectURL(playingUrlRef.current)
    }
  }, [])

  const play = async (surah: number) => {
    const record = downloads.get(`quran-audio:${surah}`)
    if (!record?.cacheStorageKey) return
    if (playingUrlRef.current) URL.revokeObjectURL(playingUrlRef.current)
    const url = await getCachedAudioUrl(record.cacheStorageKey)
    playingUrlRef.current = url
    setPlayingUrl(url)
  }

  const stopPlaying = () => {
    if (playingUrlRef.current) {
      URL.revokeObjectURL(playingUrlRef.current)
      playingUrlRef.current = null
    }
    setPlayingUrl(null)
  }

  return (
    <section className="downloads-page">
      <h1>Offline Library</h1>
      <p className="downloads-page__note">Quran recitation by {RECITER_LABEL}, downloaded per surah for offline listening.</p>

      {playingUrl && (
        <audio className="downloads-page__player" src={playingUrl} controls autoPlay onEnded={stopPlaying} />
      )}

      {!meta && (
        <div className="downloads-page__skeletons">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} height="3.5rem" radius="var(--radius-lg)" />
          ))}
        </div>
      )}

      {meta && (
        <ul className="downloads-page__list">
          {meta.surahs.map((s) => {
            const record = downloads.get(`quran-audio:${s.number}`)
            return (
              <li key={s.number}>
                <GlassCard className="downloads-page__row">
                  <div className="downloads-page__row-label">
                    <strong>
                      {s.number}. {s.nameTransliteration}
                    </strong>
                    {record?.status === 'complete' && (
                      <span className="downloads-page__size">{formatBytes(record.sizeBytes)}</span>
                    )}
                    {record?.status === 'downloading' && (
                      <span className="downloads-page__progress">{record.progressPct}%</span>
                    )}
                    {record?.status === 'error' && <span className="downloads-page__error">Failed</span>}
                  </div>
                  <div className="downloads-page__row-actions">
                    {record?.status === 'complete' && (
                      <>
                        <button type="button" onClick={() => void play(s.number)} aria-label={`Play ${s.nameTransliteration}`}>
                          <Play size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void removeDownload(s.number)}
                          aria-label={`Remove ${s.nameTransliteration} download`}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </>
                    )}
                    {record?.status === 'downloading' && <Loader2 size={16} className="downloads-page__spin" aria-hidden="true" />}
                    {(!record || record.status === 'error') && (
                      <button
                        type="button"
                        onClick={() => void startDownload(s.number)}
                        aria-label={`Download ${s.nameTransliteration} audio`}
                      >
                        <Download size={16} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </GlassCard>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
