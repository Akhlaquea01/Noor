import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Droplets,
  PersonStanding,
  BookOpen,
  HandHeart,
  CircleDot,
  Compass,
  Check,
  Flame,
  CalendarDays,
  Download,
  Bookmark,
  Newspaper,
  ChevronRight,
  BookMarked,
  ListOrdered,
  ScrollText,
  Mountain,
} from 'lucide-react'
import { GlassCard } from '../../shared/ui/GlassCard'
import { usePreferencesStore } from '../../shared/state/preferencesStore'
import { useQuranProgressStore } from '../../shared/state/quranProgressStore'
import { getQuranMeta } from '../quran/api/quranContent'
import { getVerseOfTheDay } from '../duas/api/duaContent'
import { getAllArticles } from '../articles/api/articleContent'
import { articleProgressRepo } from '../../shared/db/repositories'
import { localDateKey } from '../../shared/lib/dateKey'
import { findCurrentJuz, toGlobalAyahId } from '../quran/lib/quranProgress'
import { useNextPrayer, formatCountdown } from '../prayer-times/hooks/useNextPrayer'
import { formatPrayerTime } from '../prayer-times/lib/formatPrayerTime'
import { PRAYER_LABELS } from '../prayer-times/lib/calculatePrayerTimes'
import type { QuranMeta } from '../quran/types'
import type { PrayerName } from '../prayer-times/lib/calculatePrayerTimes'
import type { Dua } from '../duas/types'
import type { Article, ArticleKind } from '../articles/types'
import './HomePage.css'

interface RecentArticle {
  kind: ArticleKind
  article: Article
}

// articleProgress records don't carry which list (blog vs story) they came
// from, so the most-recently-read one is resolved by checking both —
// avoids a schema change (and the backfill risk that comes with one, see
// singletonRepo's defaults-merge) just to store a field derivable at read
// time from data that's already loaded.
async function findMostRecentArticle(): Promise<RecentArticle | null> {
  const progress = await articleProgressRepo.list()
  const sorted = [...progress].sort((a, b) => b.lastReadAt - a.lastReadAt)
  const [blogs, stories] = await Promise.all([getAllArticles('blog'), getAllArticles('story')])
  for (const p of sorted) {
    const blog = blogs.find((a) => a.id === p.articleId)
    if (blog) return { kind: 'blog', article: blog }
    const story = stories.find((a) => a.id === p.articleId)
    if (story) return { kind: 'story', article: story }
  }
  return null
}

const QUICK_ACTIONS = [
  { to: '/wudu', label: 'Wudu', detail: 'Purify before prayer', Icon: Droplets },
  { to: '/salah', label: 'Salah', detail: 'Learn the prayer', Icon: PersonStanding },
  { to: '/rakat-guide', label: "Rak'ahs Guide", detail: 'Sequence & timing', Icon: ListOrdered },
  { to: '/kalimas', label: 'The 6 Kalimas', detail: 'Learn & memorize', Icon: ScrollText },
  { to: '/hajj-umrah', label: 'Hajj & Umrah', detail: 'Interactive step-by-step guide', Icon: Mountain },
  { to: '/quran', label: 'Quran', detail: 'Read & reflect', Icon: BookOpen },
  { to: '/duas', label: 'Duas', detail: 'Daily collection', Icon: HandHeart },
  { to: '/tasbih', label: 'Tasbih', detail: 'Keep count', Icon: CircleDot },
  { to: '/qibla', label: 'Qibla', detail: 'Find direction', Icon: Compass },
  { to: '/calendar', label: 'Calendar', detail: 'Hijri dates', Icon: CalendarDays },
  { to: '/blogs', label: 'Blogs & Stories', detail: 'Read & learn', Icon: Newspaper },
  { to: '/downloads', label: 'Offline Library', detail: 'Downloads', Icon: Download },
  { to: '/bookmarks', label: 'Bookmarks', detail: 'Saved for later', Icon: Bookmark },
]

const dateLabelFormatter = new Intl.DateTimeFormat('en', { weekday: 'long', day: 'numeric', month: 'long' })
const timeFormatter = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' })

// "Continue Quran" and the prayer pills subscribe to reactive stores/hooks
// (not one-off fetches) so they update immediately rather than racing async
// saves. Quick access covers every section of the app — including Calendar,
// which previously had a working route but no menu entry point anywhere.
export function HomePage() {
  const progress = useQuranProgressStore((s) => s.progress)
  const streakEnabled = usePreferencesStore((s) => s.preferences.streakEnabled)
  const [meta, setMeta] = useState<QuranMeta | null>(null)
  const [verse, setVerse] = useState<Dua | null>(null)
  const [recentArticle, setRecentArticle] = useState<RecentArticle | null>(null)
  const { todayTimes, nextPrayer, loading: prayerLoading, error: prayerError, now, utcOffsetHours } = useNextPrayer()

  // `today` ticks forward on its own timer (independent of useNextPrayer's
  // `now`, which is only defined once a location is available) so that a
  // PWA left open across midnight — a normal thing for an installed app,
  // not an edge case — gets the correct date label and verse of the day
  // instead of being frozen on whatever day it happened to load.
  const [today, setToday] = useState(() => new Date())
  useEffect(() => {
    const interval = setInterval(() => setToday(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])
  const todayKey = localDateKey(today)
  const todayLabel = dateLabelFormatter.format(today)

  useEffect(() => {
    void getQuranMeta().then(setMeta)
    void findMostRecentArticle().then(setRecentArticle)
  }, [])

  // Keyed on the day-string so this only refetches once the calendar day
  // actually changes, not on every 60s tick — `getVerseOfTheDay()` reads the
  // real current instant itself, so nothing here needs to depend on `today`.
  useEffect(() => {
    void getVerseOfTheDay().then(setVerse)
  }, [todayKey])

  const surah = meta && progress.lastSurah ? meta.surahs.find((s) => s.number === progress.lastSurah) : undefined
  let juzLabel: string | null = null
  if (meta && progress.lastSurah && progress.lastAyah) {
    const globalId = toGlobalAyahId(meta, progress.lastSurah, progress.lastAyah)
    const percent = Math.round((globalId / meta.totalAyahs) * 100)
    juzLabel = `Juz ${findCurrentJuz(meta, globalId)} · ${percent}%`
  }

  return (
    <section className="home-page">
      <header className="home-page__greeting">
        <p className="home-page__eyebrow">Assalamu Alaikum</p>
        <h1>A moment to reconnect.</h1>
        <p className="home-page__subhead">{todayLabel}</p>
      </header>

      <div className="home-page__hero-grid">
        <GlassCard as={Link} to="/prayer-times" viewTransition interactive hero className="home-page__prayer-card">
          <div className="home-page__panel-label">
            <span>Up next</span>
          </div>
          {nextPrayer && now ? (
            <>
              <div className="home-page__prayer-main">
                <strong>{PRAYER_LABELS[nextPrayer.name]}</strong>
                <span className="home-page__prayer-time">{formatPrayerTime(nextPrayer.time, utcOffsetHours)}</span>
              </div>
              <p className="home-page__prayer-countdown">
                Prayer begins in <strong>{formatCountdown(nextPrayer.time, now)}</strong>
              </p>
            </>
          ) : (
            <p className="home-page__prayer-countdown">
              {prayerLoading ? 'Getting location…' : (prayerError ?? 'Set your location to see prayer times')}
            </p>
          )}
        </GlassCard>

        <GlassCard accent className="home-page__verse-card">
          <div className="home-page__panel-label home-page__panel-label--accent">
            <span>Verse of the day</span>
            <BookOpen size={15} aria-hidden="true" />
          </div>
          {verse && (
            <>
              <p className="home-page__verse-arabic arabic-text" lang="ar">
                {verse.arabic}
              </p>
              <p className="home-page__verse-translation">&ldquo;{verse.translation}&rdquo;</p>
              <p className="home-page__verse-source">{verse.reference}</p>
              <Link to={`/quran/${verse.surah}`} viewTransition className="home-page__verse-link">
                Read in context <ChevronRight size={14} aria-hidden="true" />
              </Link>
            </>
          )}
        </GlassCard>
      </div>

      <section className="home-page__section">
        <div className="home-page__section-heading">
          <p className="home-page__eyebrow">Your day</p>
          <Link to="/prayer-times" className="home-page__text-link">
            View times <ChevronRight size={14} aria-hidden="true" />
          </Link>
        </div>
        {todayTimes && now && (
          <div className="home-page__prayer-row">
            {(Object.keys(PRAYER_LABELS) as PrayerName[]).map((name) => {
              const time = todayTimes[name]
              const state = time < now ? 'completed' : nextPrayer?.name === name ? 'next' : 'upcoming'
              return (
                <div key={name} className={`home-page__prayer-pill home-page__prayer-pill--${state}`}>
                  <span className="home-page__prayer-pill-status">
                    {state === 'completed' ? <Check size={12} aria-hidden="true" /> : <i />}
                  </span>
                  <div>
                    <strong>{PRAYER_LABELS[name]}</strong>
                    <small>{timeFormatter.format(time)}</small>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {streakEnabled && progress.currentStreakCount > 0 && (
        <GlassCard glow="gold" className="home-page__streak-card">
          <Flame size={18} aria-hidden="true" className="home-page__streak-icon" />
          <span>
            Quran reading &mdash; <strong>{progress.currentStreakCount}-day</strong> streak
          </span>
        </GlassCard>
      )}

      <GlassCard
        as={Link}
        to={progress.lastSurah ? `/quran/${progress.lastSurah}` : '/quran'}
        viewTransition
        interactive
        className="home-page__continue-card"
      >
        <BookMarked size={18} aria-hidden="true" className="home-page__continue-icon" />
        <div>
          <strong>{surah ? `Continue: ${surah.nameTransliteration}` : 'Continue reading'}</strong>
          <p>{progress.lastSurah ? `Verse ${progress.lastAyah} · ${juzLabel ?? ''}` : 'Start your Quran journey →'}</p>
        </div>
      </GlassCard>

      {recentArticle && (
        <GlassCard
          as={Link}
          to={`/${recentArticle.kind === 'blog' ? 'blogs' : 'stories'}/${recentArticle.article.id}`}
          viewTransition
          interactive
          className="home-page__continue-card"
        >
          <Newspaper size={18} aria-hidden="true" className="home-page__continue-icon" />
          <div>
            <strong>Continue: {recentArticle.article.title}</strong>
            <p>{recentArticle.kind === 'blog' ? 'Blog article' : 'Islamic story'}</p>
          </div>
        </GlassCard>
      )}

      <section className="home-page__section">
        <p className="home-page__eyebrow">Explore</p>
        <nav className="home-page__quick-actions" aria-label="Quick access">
          {QUICK_ACTIONS.map(({ to, label, detail, Icon }) => (
            <GlassCard key={to} as={Link} to={to} viewTransition interactive className="home-page__quick-action">
              <span className="home-page__quick-icon">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className="home-page__quick-text">
                <strong>{label}</strong>
                <small>{detail}</small>
              </span>
            </GlassCard>
          ))}
        </nav>
      </section>
    </section>
  )
}
