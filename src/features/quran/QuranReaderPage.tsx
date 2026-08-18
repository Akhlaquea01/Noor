import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react'
import { GlassCard } from '../../shared/ui/GlassCard'
import { Skeleton } from '../../shared/ui/Skeleton'
import { BookmarkButton } from '../bookmarks-favorites/BookmarkButton'
import { QuranAudioPlayer } from './QuranAudioPlayer'
import { getQuranMeta, getSurahVerses } from './api/quranContent'
import { recordReadingProgress } from './lib/quranProgress'
import { quranProgressRepo } from '../../shared/db/repositories'
import type { QuranMeta, CombinedVerse, SurahMeta } from './types'
import './QuranReaderPage.css'

export function QuranReaderPage() {
  const { surahId } = useParams()
  const surahNumber = Number(surahId)

  const [meta, setMeta] = useState<QuranMeta | null>(null)
  const [verses, setVerses] = useState<CombinedVerse[] | null>(null)
  const [showTranslation, setShowTranslation] = useState(true)
  const [showTransliteration, setShowTransliteration] = useState(true)

  const sessionStartRef = useRef(Date.now())
  const ayahStartRef = useRef(1)
  const maxAyahSeenRef = useRef(0)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    sessionStartRef.current = Date.now()
    maxAyahSeenRef.current = 0
    ayahStartRef.current = 1
    setVerses(null)

    let cancelled = false

    void Promise.all([getQuranMeta(), getSurahVerses(surahNumber), quranProgressRepo.get()]).then(
      ([m, v, progress]) => {
        if (cancelled) return
        setMeta(m)
        setVerses(v)
        if (progress.lastSurah === surahNumber && progress.lastAyah) {
          ayahStartRef.current = progress.lastAyah
        }
      }
    )

    return () => {
      cancelled = true
    }
  }, [surahNumber])

  useEffect(() => {
    if (!verses) return

    observerRef.current?.disconnect()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const ayah = Number((entry.target as HTMLElement).dataset.ayah)
          if (ayah > maxAyahSeenRef.current) maxAyahSeenRef.current = ayah
        }
      },
      { threshold: 0.6 }
    )
    document.querySelectorAll('[data-ayah]').forEach((el) => observer.observe(el))
    observerRef.current = observer

    return () => observer.disconnect()
  }, [verses])

  useEffect(() => {
    // Shared by the visibility listener (tab closed/backgrounded mid-read)
    // and the unmount cleanup (in-app navigation away). Idempotent: after a
    // save, the "unsaved segment" resets to start at the furthest ayah seen,
    // so a later save (e.g. unmount right after a visibility save) doesn't
    // double-count ayahs or write an empty/duplicate session.
    const saveProgress = () => {
      if (!meta || maxAyahSeenRef.current === 0 || maxAyahSeenRef.current < ayahStartRef.current) return
      void recordReadingProgress({
        meta,
        surah: surahNumber,
        ayahStart: ayahStartRef.current,
        ayahEnd: maxAyahSeenRef.current,
        startedAt: sessionStartRef.current,
      })
      ayahStartRef.current = maxAyahSeenRef.current
      sessionStartRef.current = Date.now()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') saveProgress()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      saveProgress()
    }
  }, [meta, surahNumber])

  const surahMeta: SurahMeta | undefined = meta?.surahs.find((s) => s.number === surahNumber)
  const prevSurah = surahNumber > 1 ? surahNumber - 1 : null
  const nextSurah = surahNumber < 114 ? surahNumber + 1 : null

  return (
    <section className="quran-reader-page">
      <header className="quran-reader-page__header">
        <Link to="/quran" className="quran-reader-page__back">
          <ChevronLeft size={18} aria-hidden="true" /> Surahs
        </Link>
        {surahMeta && (
          <div className="quran-reader-page__title">
            <h1>{surahMeta.nameTransliteration}</h1>
            <span className="arabic-text" lang="ar">
              {surahMeta.nameArabic}
            </span>
          </div>
        )}
      </header>

      <QuranAudioPlayer surahNumber={surahNumber} />

      <div className="quran-reader-page__toggles">
        <button type="button" onClick={() => setShowTranslation((v) => !v)} aria-pressed={showTranslation}>
          {showTranslation ? <Eye size={14} aria-hidden="true" /> : <EyeOff size={14} aria-hidden="true" />}
          Translation
        </button>
        <button type="button" onClick={() => setShowTransliteration((v) => !v)} aria-pressed={showTransliteration}>
          {showTransliteration ? <Eye size={14} aria-hidden="true" /> : <EyeOff size={14} aria-hidden="true" />}
          Transliteration
        </button>
      </div>

      {!verses && (
        <div className="quran-reader-page__skeletons">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height="5rem" radius="var(--radius-lg)" />
          ))}
        </div>
      )}

      {verses && (
        <ol className="quran-reader-page__verses">
          {verses.map((v) => (
            <li key={v.ayah} data-ayah={v.ayah}>
              <GlassCard className="quran-reader-page__verse">
                <div className="quran-reader-page__verse-number">{v.ayah}</div>
                <p className="quran-reader-page__arabic arabic-text" lang="ar">
                  {v.text}
                </p>
                {showTransliteration && <p className="quran-reader-page__transliteration">{v.transliteration}</p>}
                {showTranslation && <p className="quran-reader-page__translation">{v.translation}</p>}
                <BookmarkButton
                  contentType="ayah"
                  refId={`${surahNumber}-${v.ayah}`}
                  extra={{ surah: surahNumber, ayah: v.ayah }}
                  label="Bookmark ayah"
                />
              </GlassCard>
            </li>
          ))}
        </ol>
      )}

      <nav className="quran-reader-page__surah-nav" aria-label="Surah navigation">
        {prevSurah ? (
          <Link to={`/quran/${prevSurah}`} viewTransition>
            <ChevronLeft size={16} aria-hidden="true" /> Previous
          </Link>
        ) : (
          <span />
        )}
        {nextSurah && (
          <Link to={`/quran/${nextSurah}`} viewTransition>
            Next <ChevronRight size={16} aria-hidden="true" />
          </Link>
        )}
      </nav>
    </section>
  )
}
