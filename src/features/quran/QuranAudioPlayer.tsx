import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Play, Pause, Repeat, Download } from 'lucide-react'
import { GlassCard } from '../../shared/ui/GlassCard'
import { useDownloadsStore } from '../downloads/state/downloadsStore'
import { getCachedAudioUrl } from '../downloads/lib/downloadEngine'
import { RECITER_LABEL } from '../downloads/lib/audioSource'
import { usePreferencesStore } from '../../shared/state/preferencesStore'
import './QuranAudioPlayer.css'

interface QuranAudioPlayerProps {
  surahNumber: number
}

// Fixes "where's the autoplay option?" — audio previously only lived on the
// separate Offline Library screen with no toggle at all. This puts a
// player, with a clearly visible Autoplay switch, directly on the page
// where someone is actually reading. Autoplay covers two things: starting
// playback as soon as a surah with downloaded audio opens, and continuing
// into the next surah's audio (if it's also downloaded) when one ends.
export function QuranAudioPlayer({ surahNumber }: QuranAudioPlayerProps) {
  const navigate = useNavigate()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const autoplayAudio = usePreferencesStore((s) => s.preferences.autoplayAudio)
  const setAutoplay = usePreferencesStore((s) => s.update)
  const downloads = useDownloadsStore((s) => s.downloads)
  const hydrate = useDownloadsStore((s) => s.hydrate)
  const record = downloads.get(`quran-audio:${surahNumber}`)
  const nextRecord = downloads.get(`quran-audio:${surahNumber + 1}`)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null
    setAudioUrl(null)
    setIsPlaying(false)

    if (record?.status === 'complete' && record.cacheStorageKey) {
      void getCachedAudioUrl(record.cacheStorageKey).then((url) => {
        if (cancelled || !url) return
        objectUrl = url
        setAudioUrl(url)
      })
    }

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [record?.cacheStorageKey, record?.status])

  useEffect(() => {
    if (audioUrl && autoplayAudio && audioRef.current) {
      void audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
    }
  }, [audioUrl, autoplayAudio])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      void audioRef.current.play()
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    if (autoplayAudio && nextRecord?.status === 'complete' && surahNumber < 114) {
      navigate(`/quran/${surahNumber + 1}`)
    }
  }

  if (!record || record.status !== 'complete') {
    return (
      <GlassCard as={Link} to="/downloads" viewTransition interactive className="quran-audio-player quran-audio-player--empty">
        <Download size={16} aria-hidden="true" />
        <span>Download this surah's recitation to listen while you read</span>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="quran-audio-player">
      <button
        type="button"
        className="quran-audio-player__toggle"
        onClick={togglePlay}
        disabled={!audioUrl}
        aria-label={isPlaying ? 'Pause recitation' : 'Play recitation'}
      >
        {isPlaying ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
      </button>
      <span className="quran-audio-player__label">{RECITER_LABEL}</span>
      <button
        type="button"
        className={`quran-audio-player__autoplay${autoplayAudio ? ' quran-audio-player__autoplay--active' : ''}`}
        onClick={() => void setAutoplay({ autoplayAudio: !autoplayAudio })}
        aria-pressed={autoplayAudio}
      >
        <Repeat size={14} aria-hidden="true" /> Autoplay
      </button>
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={handleEnded}
        />
      )}
    </GlassCard>
  )
}
